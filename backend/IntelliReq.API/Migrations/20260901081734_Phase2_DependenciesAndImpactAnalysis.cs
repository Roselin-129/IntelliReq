using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IntelliReq.API.Migrations
{
    /// <inheritdoc />
    public partial class Phase2_DependenciesAndImpactAnalysis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChangeImpactAnalyses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequirementId = table.Column<Guid>(type: "uuid", nullable: false),
                    OldVersion = table.Column<int>(type: "integer", nullable: false),
                    NewVersion = table.Column<int>(type: "integer", nullable: false),
                    ChangeSummary = table.Column<string>(type: "text", nullable: false),
                    ImpactScore = table.Column<double>(type: "double precision", nullable: false),
                    ImpactLevel = table.Column<string>(type: "text", nullable: false),
                    AffectedRequirementIds = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChangeImpactAnalyses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChangeImpactAnalyses_Requirements_RequirementId",
                        column: x => x.RequirementId,
                        principalTable: "Requirements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Dependencies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceRequirementId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetRequirementId = table.Column<Guid>(type: "uuid", nullable: false),
                    DependencyType = table.Column<int>(type: "integer", nullable: false),
                    Confidence = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dependencies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Dependencies_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Dependencies_Requirements_SourceRequirementId",
                        column: x => x.SourceRequirementId,
                        principalTable: "Requirements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Dependencies_Requirements_TargetRequirementId",
                        column: x => x.TargetRequirementId,
                        principalTable: "Requirements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChangeImpactAnalyses_RequirementId",
                table: "ChangeImpactAnalyses",
                column: "RequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_Dependencies_ProjectId",
                table: "Dependencies",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Dependencies_SourceRequirementId_TargetRequirementId_Depend~",
                table: "Dependencies",
                columns: new[] { "SourceRequirementId", "TargetRequirementId", "DependencyType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Dependencies_TargetRequirementId",
                table: "Dependencies",
                column: "TargetRequirementId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChangeImpactAnalyses");

            migrationBuilder.DropTable(
                name: "Dependencies");
        }
    }
}
