using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VoidBitzChat.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddModelDeploymentSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ModelDeploymentId",
                table: "ChatSessions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ModelDeployments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DeploymentName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Endpoint = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ApiKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ModelType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "gpt-4"),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelDeployments", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChatSessions_ModelDeploymentId",
                table: "ChatSessions",
                column: "ModelDeploymentId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelDeployments_IsActive",
                table: "ModelDeployments",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_ModelDeployments_IsDefault",
                table: "ModelDeployments",
                column: "IsDefault");

            migrationBuilder.CreateIndex(
                name: "IX_ModelDeployments_Name",
                table: "ModelDeployments",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ChatSessions_ModelDeployments_ModelDeploymentId",
                table: "ChatSessions",
                column: "ModelDeploymentId",
                principalTable: "ModelDeployments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatSessions_ModelDeployments_ModelDeploymentId",
                table: "ChatSessions");

            migrationBuilder.DropTable(
                name: "ModelDeployments");

            migrationBuilder.DropIndex(
                name: "IX_ChatSessions_ModelDeploymentId",
                table: "ChatSessions");

            migrationBuilder.DropColumn(
                name: "ModelDeploymentId",
                table: "ChatSessions");
        }
    }
}
