using fatortak.Common.Enum;
using fatortak.Context;
using fatortak.Entities;
using fatortak.Services.Deployment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace fatortak.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/self-hosted")]
    public class SelfHostedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDeploymentMode _deployment;

        public SelfHostedController(ApplicationDbContext context, IDeploymentMode deployment)
        {
            _context = context;
            _deployment = deployment;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var isSysAdmin = string.Equals(role, RoleEnum.SysAdmin.ToString(), StringComparison.OrdinalIgnoreCase);
            var isAdmin = string.Equals(role, RoleEnum.Admin.ToString(), StringComparison.OrdinalIgnoreCase);

            if (!isSysAdmin && !isAdmin)
                return Forbid();

            var tenantId = (HttpContext.Items["CurrentTenant"] as Tenant)?.Id;
            var scoped = !isSysAdmin;
            if (scoped && tenantId == null)
                return Forbid();

            var onlineCutoff = DateTime.UtcNow.AddMinutes(-5);
            var monthAgo = DateTime.UtcNow.AddDays(-30);

            var usersQuery = _context.Users.AsQueryable();
            var companiesQuery = _context.Companies.AsQueryable();
            var customersQuery = _context.Customers.AsQueryable();
            var itemsQuery = _context.Items.AsQueryable();
            var invoicesQuery = _context.Invoices.AsQueryable();
            var expensesQuery = _context.Expenses.AsQueryable();
            var transactionsQuery = _context.Transactions.AsQueryable();
            var projectsQuery = _context.Projects.AsQueryable();
            var accountsQuery = _context.Accounts.AsQueryable();
            var journalQuery = _context.JournalEntries.AsQueryable();
            var employeesQuery = _context.Employees.AsQueryable();
            var chequesQuery = _context.Cheques.AsQueryable();
            var stakeholdersQuery = _context.Stakeholders.AsQueryable();

            if (scoped)
            {
                usersQuery = usersQuery.Where(u => u.TenantId == tenantId);
                companiesQuery = companiesQuery.Where(x => x.TenantId == tenantId);
                customersQuery = customersQuery.Where(x => x.TenantId == tenantId);
                itemsQuery = itemsQuery.Where(x => x.TenantId == tenantId);
                invoicesQuery = invoicesQuery.Where(x => x.TenantId == tenantId);
                expensesQuery = expensesQuery.Where(x => x.TenantId == tenantId);
                transactionsQuery = transactionsQuery.Where(x => x.TenantId == tenantId);
                projectsQuery = projectsQuery.Where(x => x.TenantId == tenantId);
                accountsQuery = accountsQuery.Where(x => x.TenantId == tenantId);
                journalQuery = journalQuery.Where(x => x.TenantId == tenantId);
                employeesQuery = employeesQuery.Where(x => x.TenantId == tenantId);
                chequesQuery = chequesQuery.Where(x => x.TenantId == tenantId);
                stakeholdersQuery = stakeholdersQuery.Where(x => x.TenantId == tenantId);
            }

            var stats = new
            {
                selfHosted = _deployment.IsSelfHosted,
                registrationEnabled = _deployment.AllowRegistration,
                generatedAt = DateTime.UtcNow,
                scope = scoped ? "tenant" : "installation",
                users = new
                {
                    total = await usersQuery.CountAsync(),
                    active = await usersQuery.CountAsync(u => u.IsActive),
                    online = await usersQuery.CountAsync(u =>
                        u.LastSeenAt != null && u.LastSeenAt >= onlineCutoff),
                    registeredLast30Days = await usersQuery.CountAsync(u => u.CreatedAt >= monthAgo)
                },
                data = new
                {
                    tenants = scoped ? 1 : await _context.Tenants.CountAsync(),
                    companies = await companiesQuery.CountAsync(),
                    customers = await customersQuery.CountAsync(),
                    items = await itemsQuery.CountAsync(),
                    invoices = await invoicesQuery.CountAsync(),
                    expenses = await expensesQuery.CountAsync(),
                    transactions = await transactionsQuery.CountAsync(),
                    projects = await projectsQuery.CountAsync(),
                    accounts = await accountsQuery.CountAsync(),
                    journalEntries = await journalQuery.CountAsync(),
                    employees = await employeesQuery.CountAsync(),
                    cheques = await chequesQuery.CountAsync(),
                    stakeholders = await stakeholdersQuery.CountAsync()
                },
                recentUsers = await usersQuery
                    .OrderByDescending(u => u.CreatedAt)
                    .Take(10)
                    .Select(u => new
                    {
                        u.Id,
                        FullName = u.FirstName + " " + u.LastName,
                        u.Email,
                        u.Role,
                        u.IsActive,
                        u.CreatedAt,
                        u.LastLoginAt,
                        u.LastSeenAt
                    })
                    .ToListAsync()
            };

            return Ok(stats);
        }

        [HttpGet("online")]
        public async Task<IActionResult> GetOnlineUsers()
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var isSysAdmin = string.Equals(role, RoleEnum.SysAdmin.ToString(), StringComparison.OrdinalIgnoreCase);
            var isAdmin = string.Equals(role, RoleEnum.Admin.ToString(), StringComparison.OrdinalIgnoreCase);

            if (!isSysAdmin && !isAdmin)
                return Forbid();

            var tenantId = (HttpContext.Items["CurrentTenant"] as Tenant)?.Id;
            var scoped = !isSysAdmin;
            if (scoped && tenantId == null)
                return Forbid();

            var cutoff = DateTime.UtcNow.AddMinutes(-5);
            var usersQuery = _context.Users
                .Where(u => u.LastSeenAt != null && u.LastSeenAt >= cutoff);

            if (scoped)
                usersQuery = usersQuery.Where(u => u.TenantId == tenantId);

            var users = await usersQuery
                .OrderByDescending(u => u.LastSeenAt)
                .Select(u => new
                {
                    u.Id,
                    FullName = u.FirstName + " " + u.LastName,
                    u.Email,
                    u.Role,
                    u.LastSeenAt,
                    u.LastLoginAt
                })
                .ToListAsync();

            return Ok(new { count = users.Count, users });
        }
    }
}
