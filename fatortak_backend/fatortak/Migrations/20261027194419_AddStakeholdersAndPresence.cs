using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace fatortak.Migrations
{
    /// <inheritdoc />
    public partial class AddStakeholdersAndPresence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Invoices_TenantId",
                schema: "dbo",
                table: "Invoices");

            migrationBuilder.Sql(@"
UPDATE dbo.Invoices
SET InvoiceNumber = 'INV-' + CONVERT(nvarchar(36), Id)
WHERE InvoiceNumber IS NULL OR LTRIM(RTRIM(InvoiceNumber)) = '';
");

            migrationBuilder.AlterColumn<string>(
                name: "InvoiceNumber",
                schema: "dbo",
                table: "Invoices",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSeenAt",
                schema: "dbo",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Stakeholders",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OwnershipPercent = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stakeholders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Stakeholders_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalSchema: "dbo",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Stakeholders_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "dbo",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StakeholderTransactions",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StakeholderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    PaymentAccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    JournalEntryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Reference = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StakeholderTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StakeholderTransactions_Accounts_PaymentAccountId",
                        column: x => x.PaymentAccountId,
                        principalSchema: "dbo",
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StakeholderTransactions_JournalEntries_JournalEntryId",
                        column: x => x.JournalEntryId,
                        principalSchema: "dbo",
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StakeholderTransactions_Stakeholders_StakeholderId",
                        column: x => x.StakeholderId,
                        principalSchema: "dbo",
                        principalTable: "Stakeholders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Make existing data safe before adding the unique invoice number index.
            migrationBuilder.Sql(@"
;WITH ranked AS (
    SELECT Id,
           ROW_NUMBER() OVER (PARTITION BY TenantId, InvoiceNumber ORDER BY CreatedAt, Id) AS rn
    FROM dbo.Invoices
)
UPDATE i
SET InvoiceNumber = i.InvoiceNumber + '-D' + CAST(r.rn AS nvarchar(10))
FROM dbo.Invoices i
JOIN ranked r ON r.Id = i.Id
WHERE r.rn > 1;
");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId_InvoiceNumber",
                schema: "dbo",
                table: "Invoices",
                columns: new[] { "TenantId", "InvoiceNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Stakeholders_AccountId",
                schema: "dbo",
                table: "Stakeholders",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Stakeholders_TenantId",
                schema: "dbo",
                table: "Stakeholders",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_StakeholderTransactions_JournalEntryId",
                schema: "dbo",
                table: "StakeholderTransactions",
                column: "JournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_StakeholderTransactions_PaymentAccountId",
                schema: "dbo",
                table: "StakeholderTransactions",
                column: "PaymentAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_StakeholderTransactions_StakeholderId",
                schema: "dbo",
                table: "StakeholderTransactions",
                column: "StakeholderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StakeholderTransactions",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Stakeholders",
                schema: "dbo");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_TenantId_InvoiceNumber",
                schema: "dbo",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "LastSeenAt",
                schema: "dbo",
                table: "AspNetUsers");

            migrationBuilder.AlterColumn<string>(
                name: "InvoiceNumber",
                schema: "dbo",
                table: "Invoices",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId",
                schema: "dbo",
                table: "Invoices",
                column: "TenantId");
        }
    }
}
