using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Agoria.SV.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorksCouncilAndOrMembership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WorksCouncils",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TechnicalBusinessUnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorksCouncils", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorksCouncils_TechnicalBusinessUnits_TechnicalBusinessUnitId",
                        column: x => x.TechnicalBusinessUnitId,
                        principalTable: "TechnicalBusinessUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrMemberships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorksCouncilId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TechnicalBusinessUnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrMemberships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrMemberships_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrMemberships_TechnicalBusinessUnits_TechnicalBusinessUnitId",
                        column: x => x.TechnicalBusinessUnitId,
                        principalTable: "TechnicalBusinessUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrMemberships_WorksCouncils_WorksCouncilId",
                        column: x => x.WorksCouncilId,
                        principalTable: "WorksCouncils",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrMemberships_EmployeeId_Category",
                table: "OrMemberships",
                columns: new[] { "EmployeeId", "Category" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrMemberships_TechnicalBusinessUnitId",
                table: "OrMemberships",
                column: "TechnicalBusinessUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_OrMemberships_WorksCouncilId",
                table: "OrMemberships",
                column: "WorksCouncilId");

            migrationBuilder.CreateIndex(
                name: "IX_WorksCouncils_TechnicalBusinessUnitId",
                table: "WorksCouncils",
                column: "TechnicalBusinessUnitId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrMemberships");

            migrationBuilder.DropTable(
                name: "WorksCouncils");
        }
    }
}
