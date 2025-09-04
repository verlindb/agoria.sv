using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Agoria.SV.Infrastructure.Migrations.Concurrency
{
    /// <inheritdoc />
    public partial class AddConcurrencyTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "WorksCouncils",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[8]);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "WorksCouncils",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "TechnicalBusinessUnits",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[8]);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "TechnicalBusinessUnits",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "OrMemberships",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[8]);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "OrMemberships",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Employees",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[8]);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "Employees",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Companies",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[8]);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "Companies",
                type: "int",
                nullable: false,
                defaultValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "WorksCouncils");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "WorksCouncils");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "TechnicalBusinessUnits");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "TechnicalBusinessUnits");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "OrMemberships");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "OrMemberships");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Companies");
        }
    }
}
