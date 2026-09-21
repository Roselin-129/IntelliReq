using IntelliReq.API.Models;
using IntelliReq.API.Models.Analysis;
using Microsoft.EntityFrameworkCore;

namespace IntelliReq.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Project> Projects { get; set; }
    public DbSet<Document> Documents { get; set; }
    public DbSet<Requirement> Requirements { get; set; }
    public DbSet<RequirementVersion> RequirementVersions { get; set; }
    public DbSet<RequirementAnalysis> RequirementAnalyses { get; set; }
    public DbSet<Dependency> Dependencies { get; set; }
    public DbSet<ChangeImpactAnalysis> ChangeImpactAnalyses { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ──────────────────────────────────────────────────────────
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // ── Requirement → Project ─────────────────────────────────────────
        modelBuilder.Entity<Requirement>()
            .HasOne(r => r.Project)
            .WithMany(p => p.Requirements)
            .HasForeignKey(r => r.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Requirement → Document ─────────────────────────────────────────
        modelBuilder.Entity<Requirement>()
            .HasOne(r => r.Document)
            .WithMany(d => d.Requirements)
            .HasForeignKey(r => r.DocumentId)
            .OnDelete(DeleteBehavior.SetNull);

        // ── RequirementVersion → Requirement ───────────────────────────────
        modelBuilder.Entity<RequirementVersion>()
            .HasOne(rv => rv.Requirement)
            .WithMany(r => r.Versions)
            .HasForeignKey(rv => rv.RequirementId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── RequirementAnalysis → Requirement ──────────────────────────────
        modelBuilder.Entity<RequirementAnalysis>()
            .HasOne(ra => ra.Requirement)
            .WithMany()
            .HasForeignKey(ra => ra.RequirementId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Dependency → Project ───────────────────────────────────────────
        modelBuilder.Entity<Dependency>()
            .HasOne(d => d.Project)
            .WithMany(p => p.Dependencies)
            .HasForeignKey(d => d.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Dependency → SourceRequirement (Restrict to avoid multi-cascade)
        modelBuilder.Entity<Dependency>()
            .HasOne(d => d.SourceRequirement)
            .WithMany(r => r.SourceDependencies)
            .HasForeignKey(d => d.SourceRequirementId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── Dependency → TargetRequirement (Restrict to avoid multi-cascade)
        modelBuilder.Entity<Dependency>()
            .HasOne(d => d.TargetRequirement)
            .WithMany(r => r.TargetDependencies)
            .HasForeignKey(d => d.TargetRequirementId)
            .OnDelete(DeleteBehavior.Restrict);

        // Unique index: prevent duplicate dependency pairs
        modelBuilder.Entity<Dependency>()
            .HasIndex(d => new { d.SourceRequirementId, d.TargetRequirementId, d.DependencyType })
            .IsUnique();

        // ── ChangeImpactAnalysis → Requirement ────────────────────────────
        modelBuilder.Entity<ChangeImpactAnalysis>()
            .HasOne(c => c.Requirement)
            .WithMany()
            .HasForeignKey(c => c.RequirementId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}