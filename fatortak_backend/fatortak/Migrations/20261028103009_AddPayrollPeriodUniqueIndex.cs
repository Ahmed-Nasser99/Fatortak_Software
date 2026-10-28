using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace fatortak.Migrations
{
    /// <inheritdoc />
    public partial class AddPayrollPeriodUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Payrolls_TenantId",
                schema: "dbo",
                table: "Payrolls");

            // Keep the newest payroll per period before adding the unique index.
            migrationBuilder.Sql(@"
;WITH ranked AS (
    SELECT Id,
           ROW_NUMBER() OVER (PARTITION BY TenantId, Year, Month ORDER BY Id DESC) AS rn
    FROM dbo.Payrolls
)
DELETE FROM dbo.PayrollItems
WHERE PayrollId IN (SELECT Id FROM ranked WHERE rn > 1);

;WITH ranked AS (
    SELECT Id,
           ROW_NUMBER() OVER (PARTITION BY TenantId, Year, Month ORDER BY Id DESC) AS rn
    FROM dbo.Payrolls
)
DELETE FROM dbo.Payrolls
WHERE Id IN (SELECT Id FROM ranked WHERE rn > 1);
");

            migrationBuilder.CreateIndex(
                name: "IX_Payrolls_TenantId_Year_Month",
                schema: "dbo",
                table: "Payrolls",
                columns: new[] { "TenantId", "Year", "Month" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Payrolls_TenantId_Year_Month",
                schema: "dbo",
                table: "Payrolls");

            migrationBuilder.CreateIndex(
                name: "IX_Payrolls_TenantId",
                schema: "dbo",
                table: "Payrolls",
                column: "TenantId");
        }
    }
}
