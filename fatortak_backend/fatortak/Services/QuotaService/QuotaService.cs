using fatortak.Common.Enum;
using fatortak.Context;
using fatortak.Entities;
using fatortak.Services.Deployment;
using Microsoft.EntityFrameworkCore;

namespace fatortak.Services.QuotaService
{
    public class QuotaService : IQuotaService
    {
        private readonly ApplicationDbContext _db;
        private readonly IDeploymentMode _deployment;

        public QuotaService(ApplicationDbContext db, IDeploymentMode deployment)
        {
            _db = db;
            _deployment = deployment;
        }

        public (int? Invoices, int? Users, int? Ai) GetPlanLimits(SubscriptionPlan? plan)
        {
            if (_deployment.IsSelfHosted)
                return (null, null, null);

            return plan switch
            {
                SubscriptionPlan.Trial => (50, 1, 10),
                SubscriptionPlan.Starter => (100, 3, 30),
                SubscriptionPlan.Professional => (500, 5, 150),
                SubscriptionPlan.Enterprise => (null, null, null),
                null => (50, 1, 10),
                _ => (50, 1, 10)
            };
        }

        public async Task<bool> CanCreateInvoiceAsync(Guid tenantId)
        {
            if (_deployment.IsSelfHosted) return true;

            var subscription = await GetActiveSubscription(tenantId);
            var limit = GetPlanLimits(subscription?.Plan).Invoices;
            if (limit == null) return true;

            var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var count = await _db.Invoices.CountAsync(i =>
                i.TenantId == tenantId && i.CreatedAt >= startOfMonth);

            return count < limit.Value;
        }

        public Task<bool> CanAddCustomerAsync(Guid tenantId) => Task.FromResult(true);

        public Task<bool> CanAddItemAsync(Guid tenantId) => Task.FromResult(true);

        public async Task<bool> CanAddUserAsync(Guid tenantId)
        {
            if (_deployment.IsSelfHosted) return true;

            var subscription = await GetActiveSubscription(tenantId);
            var limit = GetPlanLimits(subscription?.Plan).Users;
            if (limit == null) return true;

            var count = await _db.Users.CountAsync(u => u.TenantId == tenantId);
            return count < limit.Value;
        }

        public async Task<bool> CanUseAiAssistantAsync(Guid tenantId)
        {
            if (_deployment.IsSelfHosted) return true;

            var subscription = await GetActiveSubscription(tenantId);
            var limit = GetPlanLimits(subscription?.Plan).Ai;
            if (limit == null) return true;
            if (subscription == null) return false;

            await ResetAiUsageIfNeededAsync(subscription);
            return subscription.AiUsageThisMonth < limit.Value;
        }

        public async Task RecordAiUsageAsync(Guid tenantId)
        {
            var subscription = await GetActiveSubscription(tenantId);
            if (subscription == null) return;

            await ResetAiUsageIfNeededAsync(subscription);
            subscription.AiUsageThisMonth++;
            await _db.SaveChangesAsync();
        }

        public async Task ResetMonthlyAiUsageAsync()
        {
            var firstDay = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var subscriptions = await _db.Subscriptions
                .Where(s => s.AiUsageResetDate == null || s.AiUsageResetDate < firstDay)
                .ToListAsync();

            foreach (var subscription in subscriptions)
            {
                subscription.AiUsageThisMonth = 0;
                subscription.AiUsageResetDate = DateTime.UtcNow;
            }

            if (subscriptions.Count > 0)
                await _db.SaveChangesAsync();
        }

        public async Task<Subscription?> GetActiveSubscription(Guid tenantId)
        {
            if (_deployment.IsSelfHosted)
                return null;

            return await _db.Subscriptions
                .Where(s => s.TenantId == tenantId && (s.EndDate == null || s.EndDate > DateTime.UtcNow))
                .OrderByDescending(s => s.StartDate)
                .FirstOrDefaultAsync();
        }

        private async Task ResetAiUsageIfNeededAsync(Subscription subscription)
        {
            var firstDay = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            if (subscription.AiUsageResetDate == null || subscription.AiUsageResetDate < firstDay)
            {
                subscription.AiUsageThisMonth = 0;
                subscription.AiUsageResetDate = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }
    }
}
