using fatortak.Common.Enum;
using fatortak.Context;
using fatortak.Entities;
using fatortak.Services.Deployment;
using fatortak.Services.InvoiceService;
using fatortak.Services.QuotaService;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace fatortak.Tests;

public class PublicInvoiceTokenServiceTests
{
    private static PublicInvoiceTokenService CreateService()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "test-signing-key-0123456789-abcdefghijklmnopqrstuvwxyz"
            })
            .Build();

        return new PublicInvoiceTokenService(
            configuration,
            NullLogger<PublicInvoiceTokenService>.Instance);
    }

    [Fact]
    public void Token_RoundTrips_For_Matching_Invoice()
    {
        var service = CreateService();
        var invoiceId = Guid.NewGuid();

        var token = service.Create(invoiceId, Guid.NewGuid());

        Assert.True(service.Validate(invoiceId, token));
    }

    [Fact]
    public void Token_Is_Rejected_For_Another_Invoice()
    {
        var service = CreateService();
        var token = service.Create(Guid.NewGuid(), Guid.NewGuid());

        Assert.False(service.Validate(Guid.NewGuid(), token));
    }

    [Fact]
    public void Tampered_Token_Is_Rejected()
    {
        var service = CreateService();
        var invoiceId = Guid.NewGuid();
        var token = service.Create(invoiceId, Guid.NewGuid());
        var tampered = token[..^1] + (token[^1] == 'A' ? "B" : "A");

        Assert.False(service.Validate(invoiceId, tampered));
        Assert.False(service.Validate(invoiceId, null));
    }
}

public class DeploymentModeTests
{
    [Fact]
    public void SelfHosted_Mode_Is_Detected()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Deployment:Mode"] = "SelfHosted",
                ["SelfHosted:AllowRegistration"] = "false"
            })
            .Build();

        var mode = new DeploymentMode(configuration);

        Assert.True(mode.IsSelfHosted);
        Assert.False(mode.AllowRegistration);
    }

    [Fact]
    public void MultiTenant_Is_Default()
    {
        var mode = new DeploymentMode(new ConfigurationBuilder().Build());

        Assert.False(mode.IsSelfHosted);
        Assert.True(mode.AllowRegistration);
    }
}

public class QuotaServiceTests
{
    private sealed class FakeDeploymentMode : IDeploymentMode
    {
        public FakeDeploymentMode(bool selfHosted = false) => IsSelfHosted = selfHosted;
        public bool IsSelfHosted { get; }
        public bool AllowRegistration => true;
    }

    private static async Task<(QuotaService Service, ApplicationDbContext Db, SqliteConnection Connection)>
        CreateAsync(bool selfHosted = false)
    {
        var connection = new SqliteConnection("Filename=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        var accessor = new HttpContextAccessor
        {
            HttpContext = new DefaultHttpContext()
        };
        var db = new ApplicationDbContext(options, accessor);
        await db.Database.EnsureCreatedAsync();

        return (
            new QuotaService(db, new FakeDeploymentMode(selfHosted)),
            db,
            connection);
    }

    [Fact]
    public async Task SelfHosted_Has_No_Quota_Limits()
    {
        var (service, db, connection) = await CreateAsync(selfHosted: true);
        await using var _ = db;
        await using var __ = connection;

        var tenantId = Guid.NewGuid();
        db.Tenants.Add(new Tenant { Id = tenantId, Name = "Test tenant", IsActive = true });
        await db.SaveChangesAsync();

        for (var i = 0; i < 100; i++)
        {
            db.Invoices.Add(new Invoice
            {
                TenantId = tenantId,
                InvoiceNumber = $"INV-{i}",
                CreatedAt = DateTime.UtcNow
            });
        }
        await db.SaveChangesAsync();

        Assert.True(await service.CanCreateInvoiceAsync(tenantId));
        Assert.True(await service.CanAddUserAsync(tenantId));
        Assert.True(await service.CanUseAiAssistantAsync(tenantId));
        Assert.Equal((null, null, null), service.GetPlanLimits(SubscriptionPlan.Trial));
    }

    [Fact]
    public async Task Trial_Invoice_Limit_Is_Enforced()
    {
        var (service, db, connection) = await CreateAsync();
        await using var _ = db;
        await using var __ = connection;

        var tenantId = Guid.NewGuid();
        db.Tenants.Add(new Tenant { Id = tenantId, Name = "Test tenant", IsActive = true });
        await db.SaveChangesAsync();

        for (var i = 0; i < 50; i++)
        {
            db.Invoices.Add(new Invoice
            {
                TenantId = tenantId,
                InvoiceNumber = $"TRIAL-{i}",
                CreatedAt = DateTime.UtcNow
            });
        }
        await db.SaveChangesAsync();

        Assert.False(await service.CanCreateInvoiceAsync(tenantId));
    }

    [Fact]
    public async Task Trial_Ai_Requires_An_Active_Subscription()
    {
        var (service, db, connection) = await CreateAsync();
        await using var _ = db;
        await using var __ = connection;

        Assert.False(await service.CanUseAiAssistantAsync(Guid.NewGuid()));
    }
}
