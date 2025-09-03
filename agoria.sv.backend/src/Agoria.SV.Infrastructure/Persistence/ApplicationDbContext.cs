using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Agoria.SV.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Company> Companies { get; set; }
    public DbSet<TechnicalBusinessUnit> TechnicalBusinessUnits { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<WorksCouncil> WorksCouncils { get; set; }
    public DbSet<OrMembership> OrMemberships { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Company>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("Companies");
            
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.LegalName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Ondernemingsnummer).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Sector).IsRequired().HasMaxLength(100);
            
            entity.OwnsOne(e => e.Address, address =>
            {
                address.Property(a => a.Street).IsRequired().HasMaxLength(200);
                address.Property(a => a.Number).IsRequired().HasMaxLength(20);
                address.Property(a => a.PostalCode).IsRequired().HasMaxLength(20);
                address.Property(a => a.City).IsRequired().HasMaxLength(100);
                address.Property(a => a.Country).IsRequired().HasMaxLength(100);
            });
            
            entity.OwnsOne(e => e.ContactPerson, contact =>
            {
                contact.Property(c => c.FirstName).IsRequired().HasMaxLength(100);
                contact.Property(c => c.LastName).IsRequired().HasMaxLength(100);
                contact.Property(c => c.Email).IsRequired().HasMaxLength(200);
                contact.Property(c => c.Phone).IsRequired().HasMaxLength(50);
                contact.Property(c => c.Function).HasMaxLength(100);
            });

            entity.HasIndex(e => e.Ondernemingsnummer).IsUnique();
        });

        modelBuilder.Entity<TechnicalBusinessUnit>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("TechnicalBusinessUnits");
            
            entity.Property(e => e.CompanyId).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Manager).HasMaxLength(100);
            entity.Property(e => e.Department).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Language).IsRequired().HasMaxLength(10);
            entity.Property(e => e.PcWorkers).HasMaxLength(100);
            entity.Property(e => e.PcClerks).HasMaxLength(100);
            entity.Property(e => e.FodDossierBase).HasMaxLength(20);
            entity.Property(e => e.FodDossierSuffix).IsRequired().HasMaxLength(5);
            
            entity.OwnsOne(e => e.Location, location =>
            {
                location.Property(l => l.Street).IsRequired().HasMaxLength(200);
                location.Property(l => l.Number).IsRequired().HasMaxLength(20);
                location.Property(l => l.PostalCode).IsRequired().HasMaxLength(20);
                location.Property(l => l.City).IsRequired().HasMaxLength(100);
                location.Property(l => l.Country).IsRequired().HasMaxLength(100);
            });
            
            entity.OwnsOne(e => e.ElectionBodies, electionBodies =>
            {
                electionBodies.Property(eb => eb.Cpbw).IsRequired();
                electionBodies.Property(eb => eb.Or).IsRequired();
                electionBodies.Property(eb => eb.SdWorkers).IsRequired();
                electionBodies.Property(eb => eb.SdClerks).IsRequired();
            });

            entity.HasOne(e => e.Company)
                  .WithMany()
                  .HasForeignKey(e => e.CompanyId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.Code).IsUnique();
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("Employees");
            
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.StartDate).IsRequired();

            entity.HasOne(e => e.TechnicalBusinessUnit)
                  .WithMany()
                  .HasForeignKey(e => e.TechnicalBusinessUnitId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.Email).IsUnique();
        });

        modelBuilder.Entity<WorksCouncil>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("WorksCouncils");
            
            entity.Property(e => e.TechnicalBusinessUnitId).IsRequired();

            entity.HasOne(e => e.TechnicalBusinessUnit)
                  .WithMany()
                  .HasForeignKey(e => e.TechnicalBusinessUnitId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.TechnicalBusinessUnitId).IsUnique();
        });

        modelBuilder.Entity<OrMembership>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("OrMemberships");
            
            entity.Property(e => e.WorksCouncilId).IsRequired();
            entity.Property(e => e.TechnicalBusinessUnitId).IsRequired();
            entity.Property(e => e.EmployeeId).IsRequired();
            entity.Property(e => e.Category)
                  .HasConversion(
                      v => v.ToStringValue(),
                      v => ORCategoryHelper.FromString(v))
                  .IsRequired()
                  .HasMaxLength(50);
            entity.Property(e => e.Order).IsRequired();

            entity.HasOne(e => e.WorksCouncil)
                  .WithMany(wc => wc.Memberships)
                  .HasForeignKey(e => e.WorksCouncilId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Employee)
                  .WithMany()
                  .HasForeignKey(e => e.EmployeeId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.TechnicalBusinessUnit)
                  .WithMany()
                  .HasForeignKey(e => e.TechnicalBusinessUnitId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Unique constraint: an employee can only be in one category per technical unit
            entity.HasIndex(e => new { e.EmployeeId, e.Category }).IsUnique();
        });
    }
}
