using iText.Kernel.Font;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using OfficeOpenXml;

namespace fatortak.Tests;

public class DependencyRuntimeTests
{
    [Fact]
    public void IText9_Can_Create_A_Pdf()
    {
        using var stream = new MemoryStream();
        var writer = new PdfWriter(stream);
        writer.SetCloseStream(false);
        using (var pdf = new PdfDocument(writer))
        using (var document = new Document(pdf))
        {
            document.Add(new Paragraph("Fatortak PDF smoke test")
                .SetFont(PdfFontFactory.CreateFont(iText.IO.Font.Constants.StandardFonts.HELVETICA)));
        }

        Assert.True(stream.Length > 100);
    }

    [Fact]
    public void EPPlus8_License_Can_Be_Configured()
    {
        ExcelPackage.License.SetNonCommercialOrganization("Fatortak tests");

        using var package = new ExcelPackage();
        var sheet = package.Workbook.Worksheets.Add("Test");
        sheet.Cells["A1"].Value = "Fatortak";

        Assert.NotNull(package.Workbook.Worksheets["Test"]);
    }
}
