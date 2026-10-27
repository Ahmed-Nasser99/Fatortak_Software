using BidiReshapeSharp;
using fatortak.Context;
using fatortak.Entities;
using iText.Commons.Utils;
using iText.IO.Font;
using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Font;
using iText.Layout.Properties;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Reflection;
using ITextBorder = iText.Layout.Borders.Border;
using ITextSolidBorder = iText.Layout.Borders.SolidBorder;

namespace fatortak.Services.ProjectService
{
    public class ProjectExportService : IProjectExportService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<ProjectExportService> _logger;
        private readonly IWebHostEnvironment _env;

        public ProjectExportService(
            ApplicationDbContext context,
            IHttpContextAccessor httpContextAccessor,
            IWebHostEnvironment env,
            ILogger<ProjectExportService> logger)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _env = env;
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        private Guid TenantId =>
            ((Tenant)_httpContextAccessor.HttpContext.Items["CurrentTenant"]).Id;

        private static bool ContainsArabic(string? text)
        {
            if (string.IsNullOrEmpty(text)) return false;
            foreach (var ch in text)
            {
                if ((ch >= '\u0600' && ch <= '\u06FF') ||
                    (ch >= '\u0750' && ch <= '\u077F') ||
                    (ch >= '\u08A0' && ch <= '\u08FF') ||
                    (ch >= '\uFB50' && ch <= '\uFDFF') ||
                    (ch >= '\uFE70' && ch <= '\uFEFF'))
                    return true;
            }
            return false;
        }

        private static byte[] LoadEmbeddedFontBytes(string fileName)
        {
            var asm = Assembly.GetExecutingAssembly();
            var resName = asm.GetManifestResourceNames()
                .FirstOrDefault(n => n.EndsWith(fileName, StringComparison.OrdinalIgnoreCase));
            if (string.IsNullOrWhiteSpace(resName))
                throw new FileNotFoundException("Embedded font resource not found: " + fileName);
            using var s = asm.GetManifestResourceStream(resName)!;
            using var ms = new MemoryStream();
            s.CopyTo(ms);
            return ms.ToArray();
        }

        // ✅ KEY FIX: CreateParagraph now sets BaseDirection.RIGHT_TO_LEFT
        // unconditionally when isRtl=true, and sets it on the Paragraph via
        // SetProperty so iText's BiDi algorithm reorders words correctly.
        private static Paragraph CreateParagraph(
            string? text,
            PdfFont arabicFont,
            PdfFont latinFont,
            float? fontSize = null,
            bool bold = false)
        {
            var useArabic = ContainsArabic(text);
            var font = useArabic ? arabicFont : latinFont;

            var original = text ?? string.Empty;
            // Final fallback: reshape + reorder Arabic into visual order so it won't appear reversed in any viewer.
            // This avoids relying on BiDi handling inside the PDF renderer/viewer.
            var displayText = useArabic ? BidiReshape.ProcessString(original) : original;

            var run = new Text(displayText).SetFont(font);
            // When we reshape ourselves, we must not rely on engine shaping again.
            // Keep it for non-Arabic or in case it doesn't double-shape in your viewer.
            if (useArabic)
                run.SetFontScript(UnicodeScript.ARABIC);

            var p = new Paragraph()
                .Add(run)
                // After preprocessing (visual-order), treat it as LTR for rendering.
                .SetBaseDirection(BaseDirection.LEFT_TO_RIGHT)
                .SetTextAlignment(useArabic ? TextAlignment.RIGHT : TextAlignment.LEFT);

            if (fontSize.HasValue) p.SetFontSize(fontSize.Value);
            if (bold) p.SetBold();

            return p;
        }

        // ✅ Helper: create a Cell with RTL forced at the cell level
        private static Cell RtlCell(int colspan = 1)
        {
            var cell = colspan > 1 ? new Cell(1, colspan) : new Cell();
            cell.SetBaseDirection(BaseDirection.RIGHT_TO_LEFT);
            return cell;
        }

        public async Task<byte[]> ExportProjectToPdfAsync(Guid projectId)
        {
            var project = await GetProjectDataAsync(projectId);
            if (project == null) return null!;

            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.TenantId == TenantId);

            using var stream = new MemoryStream();
            var writer = new PdfWriter(stream);
            var pdf = new PdfDocument(writer);
            var document = new Document(pdf);

            // ----------------------------------------------------------------
            // Fatortak Theme
            // ----------------------------------------------------------------
            var fatortakPrimary = new DeviceRgb(243, 239, 250);
            var fatortakPrimarySoft = new DeviceRgb(243, 239, 250);
            var slate900 = new DeviceRgb(15, 23, 42);
            var slate600 = new DeviceRgb(71, 85, 105);
            var borderLight = new DeviceRgb(226, 232, 240);
            var surface = new DeviceRgb(248, 250, 252);

            // ✅ Set RTL on document — cascades to all elements
            document.SetBaseDirection(BaseDirection.RIGHT_TO_LEFT);
            document.SetTextAlignment(TextAlignment.RIGHT);

            pdf.GetCatalog().SetViewerPreferences(
                new PdfViewerPreferences()
                    .SetDirection(PdfViewerPreferences.PdfViewerPreferencesConstants.RIGHT_TO_LEFT));

            // Load font bytes
            var arabicBytes = LoadEmbeddedFontBytes("NotoNaskhArabic-Regular.ttf");
            var latinBytes = LoadEmbeddedFontBytes("NotoSans-Variable.ttf");

            var arabicFontProgram = FontProgramFactory.CreateFont(arabicBytes);
            var latinFontProgram = FontProgramFactory.CreateFont(latinBytes);

            var arabicFont = PdfFontFactory.CreateFont(arabicFontProgram, PdfEncodings.IDENTITY_H,
                PdfFontFactory.EmbeddingStrategy.FORCE_EMBEDDED);
            var latinFont = PdfFontFactory.CreateFont(latinFontProgram, PdfEncodings.IDENTITY_H,
                PdfFontFactory.EmbeddingStrategy.FORCE_EMBEDDED);

            // ✅ FontProvider with raw bytes — required for pdfCalligraph to activate shaping
            var fontProvider = new FontProvider();
            fontProvider.AddFont(arabicBytes);
            fontProvider.AddFont(latinBytes);
            document.SetFontProvider(fontProvider);
            document.SetFont(arabicFont);


            // ----------------------------------------------------------------
            // 1. HEADER
            // ----------------------------------------------------------------
            // Header layout: 40% logo, 20% spacer, 40% company info
            var headerTable = new Table(UnitValue.CreatePercentArray(new float[] { 45, 10, 45 }))
                .UseAllAvailableWidth()
                .SetMarginBottom(20)
                .SetBaseDirection(BaseDirection.RIGHT_TO_LEFT)
                .SetBorder(ITextBorder.NO_BORDER);

            // Logo cell
            var logoCell = RtlCell()
                .SetBorder(ITextBorder.NO_BORDER)
                .SetVerticalAlignment(VerticalAlignment.MIDDLE)
                // Visual spacing between logo and info block
                .SetPaddingLeft(8)
                .SetPaddingRight(18);

            if (!string.IsNullOrEmpty(company?.LogoUrl))
            {
                try
                {
                    string logoPath = company.LogoUrl.Replace("\\", "/").TrimStart('/');
                    if (logoPath.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                        logoPath = new Uri(logoPath).AbsolutePath.TrimStart('/');

                    string fullPath = new[] { _env.WebRootPath,
                            Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
                            _env.ContentRootPath }
                        .Where(r => !string.IsNullOrEmpty(r))
                        .Select(r => Path.Combine(r!, logoPath))
                        .FirstOrDefault(System.IO.File.Exists) ?? "";

                    if (!string.IsNullOrEmpty(fullPath))
                    {
                        var img = new iText.Layout.Element.Image(
                            iText.IO.Image.ImageDataFactory.Create(fullPath));
                        img.SetMaxWidth(120)
                           .SetHorizontalAlignment(HorizontalAlignment.CENTER);
                        logoCell.Add(img);
                    }
                }
                catch (Exception ex) { _logger.LogError(ex, "Logo load error"); }
            }

            if (logoCell.IsEmpty())
                logoCell.Add(CreateParagraph("LOGO", arabicFont, latinFont, 24, bold: true)
                    .SetFontColor(ColorConstants.GRAY)
                    .SetTextAlignment(TextAlignment.CENTER));

            headerTable.AddCell(logoCell);

            // Spacer cell (no border, no content)
            headerTable.AddCell(RtlCell()
                .SetBorder(ITextBorder.NO_BORDER)
                .SetPadding(0));

            // Company info block as Label | Value rows (like your screenshot)
            var companyInfoCell = RtlCell()
                .SetBorder(ITextBorder.NO_BORDER)
                .SetVerticalAlignment(VerticalAlignment.MIDDLE)
                .SetPaddingLeft(18)
                .SetPaddingRight(8);

            var infoBlock = new Table(UnitValue.CreatePercentArray(new float[] { 32, 68 }))
                .UseAllAvailableWidth()
                .SetBorder(ITextBorder.NO_BORDER)
                // This is a "details list" — keep it LTR for consistent label/value reading
                .SetBaseDirection(BaseDirection.LEFT_TO_RIGHT);

            void AddRow(string label, string? value)
            {
                if (string.IsNullOrWhiteSpace(value)) return;

                var labelCell = new Cell()
                    .SetBorder(ITextBorder.NO_BORDER)
                    .SetPaddingBottom(1)
                    .Add(CreateParagraph(label, arabicFont, latinFont, 7, bold: true)
                        .SetFontColor(slate600))
                    .SetTextAlignment(TextAlignment.LEFT);

                var valueCell = new Cell()
                    .SetBorder(ITextBorder.NO_BORDER)
                    .SetPaddingBottom(1)
                    .Add(CreateParagraph(value, arabicFont, latinFont, 8, bold: false)
                        .SetFontColor(slate900))
                    .SetTextAlignment(TextAlignment.LEFT);

                infoBlock.AddCell(labelCell);
                infoBlock.AddCell(valueCell);
            }

            AddRow("Document Type", "Project Quotation");
            AddRow("Date", project?.CreatedAt.Date.ToString() ?? DateTime.Now.Date.ToString());
            AddRow("Client Name", project?.Customer.Name);
            AddRow("Project", project?.Name);
            AddRow("Email", company?.Email);

            companyInfoCell.Add(infoBlock);
            headerTable.AddCell(companyInfoCell);
            document.Add(headerTable);

            // ----------------------------------------------------------------
            // 4. LINE ITEMS TABLE
            // ----------------------------------------------------------------
            var itemTable = new Table(UnitValue.CreatePercentArray(new float[] { 5, 50, 15, 15, 15 }))
                .UseAllAvailableWidth()
                .SetBaseDirection(BaseDirection.RIGHT_TO_LEFT);

            foreach (var h in new[] { "م", "التوصيف", "الوحدة", "الكمية", "الإجمالي" })
            {
                itemTable.AddHeaderCell(RtlCell()
                    .Add(CreateParagraph(h, arabicFont, latinFont))
                    .SetBackgroundColor(fatortakPrimarySoft)
                    .SetFontColor(ColorConstants.BLACK)
                    .SetBold()
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetPaddingTop(10)
                    .SetPaddingBottom(10)
                    .SetBorder(new ITextSolidBorder(new DeviceRgb(48, 23, 107), 1)));
            }

            // Group project lines by section, similar to frontend behavior
            int idx = 1;
            var groups = project.ProjectLines
                .OrderBy(l => l.SectionName)
                .ThenBy(l => l.CreatedAt)
                .GroupBy(l => l.SectionName ?? string.Empty);

            foreach (var group in groups)
            {
                var sectionName = group.Key.Trim();
                if (!string.IsNullOrEmpty(sectionName))
                {
                    // Section header row spanning all columns
                    itemTable.AddCell(RtlCell(5)
                        .Add(CreateParagraph(sectionName, arabicFont, latinFont, 11, bold: true))
                        .SetBackgroundColor(fatortakPrimarySoft)
                        .SetFontColor(slate900)
                        .SetBorder(new ITextSolidBorder(borderLight, 1))
                        .SetPadding(8));
                }

                foreach (var line in group)
                {
                    var bg = idx % 2 == 0 ? surface : ColorConstants.WHITE;

                    itemTable.AddCell(RtlCell()
                        .Add(CreateParagraph(idx.ToString(), arabicFont, latinFont))
                        .SetTextAlignment(TextAlignment.CENTER)
                        .SetBackgroundColor(bg)
                        .SetBorder(new ITextSolidBorder(borderLight, 1))
                        .SetPadding(10));

                    itemTable.AddCell(RtlCell()
                        .Add(CreateParagraph(line.Description, arabicFont, latinFont))
                        .SetBackgroundColor(bg)
                        .SetBorder(new ITextSolidBorder(borderLight, 1))
                        .SetPadding(10));

                    itemTable.AddCell(RtlCell()
                        .Add(CreateParagraph(line.Unit ?? "", arabicFont, latinFont))
                        .SetTextAlignment(TextAlignment.CENTER)
                        .SetBackgroundColor(bg)
                        .SetBorder(new ITextSolidBorder(borderLight, 1))
                        .SetPadding(10));

                    itemTable.AddCell(RtlCell()
                        .Add(CreateParagraph(line.Quantity.ToString("N2"), arabicFont, latinFont))
                        .SetTextAlignment(TextAlignment.CENTER)
                        .SetBackgroundColor(bg)
                        .SetBorder(new ITextSolidBorder(borderLight, 1))
                        .SetPadding(10));

                    itemTable.AddCell(RtlCell()
                        .Add(CreateParagraph(line.LineTotal.ToString("N2"), arabicFont, latinFont))
                        .SetTextAlignment(TextAlignment.RIGHT)
                        .SetBackgroundColor(bg)
                        .SetBorder(new ITextSolidBorder(borderLight, 1))
                        .SetPadding(10));

                    idx++;
                }
            }
            document.Add(itemTable);

            // ----------------------------------------------------------------
            // 5. TOTALS
            // ----------------------------------------------------------------
            var totalsTable = new Table(UnitValue.CreatePercentArray(new float[] { 70, 30 }))
                .UseAllAvailableWidth()
                .SetMarginTop(10)
                .SetBaseDirection(BaseDirection.RIGHT_TO_LEFT);

            totalsTable.SetBorder(new ITextSolidBorder(borderLight, 1));

            AddTotalRow(totalsTable, "الإجمالي قبل الخصم", project.ContractValue, arabicFont, latinFont);
            if (project.Discount > 0)
                AddTotalRow(totalsTable, "الخصم", project.Discount, arabicFont, latinFont);
            AddTotalRow(totalsTable, "الصافي النهائي",
                project.ContractValue - project.Discount, arabicFont, latinFont, true);
            document.Add(totalsTable);

            // ----------------------------------------------------------------
            // 6. TERMS & NOTES
            // ----------------------------------------------------------------
            if (!string.IsNullOrEmpty(project.PaymentTerms) || !string.IsNullOrEmpty(project.Notes))
            {
                document.Add(new Paragraph("\n"));
                document.Add(CreateParagraph("الشروط والملاحظات", arabicFont, latinFont, 12, bold: true)
                    .SetFontColor(fatortakPrimary));

                if (!string.IsNullOrEmpty(project.PaymentTerms))
                    document.Add(CreateParagraph(project.PaymentTerms, arabicFont, latinFont, 9)
                        .SetItalic().SetFontColor(slate600));

                if (!string.IsNullOrEmpty(project.Notes))
                    document.Add(CreateParagraph(project.Notes, arabicFont, latinFont, 9)
                        .SetFontColor(slate600));
            }

            document.Close();
            return stream.ToArray();
        }

        private void AddTotalRow(Table table, string label, decimal value,
            PdfFont arabicFont, PdfFont latinFont, bool isBold = false)
        {
            var labelCell = RtlCell()
                .Add(CreateParagraph(label, arabicFont, latinFont))
                .SetTextAlignment(TextAlignment.RIGHT)
                .SetBorder(ITextBorder.NO_BORDER)
                .SetPadding(5);

            var valueCell = RtlCell()
                .Add(CreateParagraph(value.ToString("N2") + " EGP", arabicFont, latinFont))
                .SetTextAlignment(TextAlignment.RIGHT)
                .SetPadding(5);

            if (isBold)
            {
                labelCell.SetFontSize(13).SetBold();
                valueCell.SetFontSize(13).SetBold()
                    .SetBackgroundColor(new DeviceRgb(243, 239, 250))
                    .SetBorder(new ITextSolidBorder(new DeviceRgb(48, 23, 107), 1));
            }
            else
            {
                valueCell.SetBorder(new ITextSolidBorder(new DeviceRgb(226, 232, 240), 1));
            }

            table.AddCell(labelCell);
            table.AddCell(valueCell);
        }

        public async Task<byte[]> ExportProjectToExcelAsync(Guid projectId)
        {
            var project = await GetProjectDataAsync(projectId);
            if (project == null) return null!;

            using var package = new ExcelPackage();
            var ws = package.Workbook.Worksheets.Add("Project Details");
            ws.View.RightToLeft = true;

            int row = 1;
            ws.Cells[row, 1, row, 6].Merge = true;
            ws.Cells[row, 1].Value = "تفاصيل عرض السعر / المشروع";
            ws.Cells[row, 1].Style.Font.Size = 16;
            ws.Cells[row, 1].Style.Font.Bold = true;
            ws.Cells[row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            row += 2;

            ws.Cells[row, 1].Value = "اسم المشروع:";
            ws.Cells[row, 2].Value = project.Name;
            row++;
            ws.Cells[row, 1].Value = "العميل:";
            ws.Cells[row, 2].Value = project.Customer?.Name;
            row += 2;

            string[] headers = { "م", "التوصيف", "الكمية", "الوحدة", "سعر الوحدة", "الإجمالي" };
            for (int i = 0; i < headers.Length; i++)
            {
                ws.Cells[row, i + 1].Value = headers[i];
                ws.Cells[row, i + 1].Style.Font.Bold = true;
                ws.Cells[row, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                ws.Cells[row, i + 1].Style.Fill.BackgroundColor
                    .SetColor(System.Drawing.Color.LightGray);
                ws.Cells[row, i + 1].Style.Border.BorderAround(ExcelBorderStyle.Thin);
            }
            row++;

            int index = 1;
            foreach (var line in project.ProjectLines)
            {
                ws.Cells[row, 1].Value = index++;
                ws.Cells[row, 2].Value = line.Description;
                ws.Cells[row, 3].Value = line.Quantity;
                ws.Cells[row, 4].Value = line.Unit;
                ws.Cells[row, 5].Value = line.UnitPrice;
                ws.Cells[row, 6].Value = line.LineTotal;
                ws.Cells[row, 3, row, 6].Style.Numberformat.Format = "#,##0.00";
                ws.Cells[row, 1, row, 6].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                row++;
            }

            row++;
            ws.Cells[row, 5].Value = "الإجمالي قبل الخصم:";
            ws.Cells[row, 6].Value = project.ContractValue;
            ws.Cells[row, 6].Style.Font.Bold = true;
            row++;
            ws.Cells[row, 5].Value = "الخصم:";
            ws.Cells[row, 6].Value = project.Discount;
            row++;
            ws.Cells[row, 5].Value = "الصافي:";
            ws.Cells[row, 6].Value = project.ContractValue - project.Discount;
            ws.Cells[row, 6].Style.Font.Bold = true;
            ws.Cells[row, 6].Style.Fill.PatternType = ExcelFillStyle.Solid;
            ws.Cells[row, 6].Style.Fill.BackgroundColor
                .SetColor(System.Drawing.Color.Yellow);

            ws.Cells[ws.Dimension.Address].AutoFitColumns();
            return package.GetAsByteArray();
        }

        private async Task<Project> GetProjectDataAsync(Guid projectId)
        {
            return await _context.Projects
                .Include(p => p.Customer)
                .Include(p => p.ProjectLines)
                .FirstOrDefaultAsync(p => p.Id == projectId && p.TenantId == TenantId);
        }
    }
}