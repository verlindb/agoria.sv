using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Agoria.SV.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTechnicalBusinessUnits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TechnicalBusinessUnits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NumberOfEmployees = table.Column<int>(type: "int", nullable: false),
                    Manager = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Location_Street = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Location_Number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Location_PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Location_City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Location_Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    PcWorkers = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PcClerks = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FodDossierBase = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FodDossierSuffix = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    ElectionBodies_Cpbw = table.Column<bool>(type: "bit", nullable: false),
                    ElectionBodies_Or = table.Column<bool>(type: "bit", nullable: false),
                    ElectionBodies_SdWorkers = table.Column<bool>(type: "bit", nullable: false),
                    ElectionBodies_SdClerks = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TechnicalBusinessUnits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TechnicalBusinessUnits_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TechnicalBusinessUnits_Code",
                table: "TechnicalBusinessUnits",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TechnicalBusinessUnits_CompanyId",
                table: "TechnicalBusinessUnits",
                column: "CompanyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TechnicalBusinessUnits");
        }
    }
}
