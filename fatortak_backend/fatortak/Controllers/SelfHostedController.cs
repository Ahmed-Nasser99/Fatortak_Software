using fatortak.Common.Enum;
using fatortak.Context;
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

            if ((_deployment.IsSelfHosted && !isAdmin && !isSysAdmin) ||
                (!_deployment.IsSelfHosted && !isSysAdmin))
            {
                return Forbid();
            }

            var onlineCutoff = DateTime.UtcNow.AddMinutes(-5);
            var monthAgo = DateTime.UtcNow.AddDays(-30);

            var stats = new
            {
                selfHosted = _deployment.IsSelfHosted,
                registrationEnabled = _deployment.AllowRegistration,
                generatedAt = DateTime.UtcNow,
                users = new
                {
                    total = await _context.Users.CountAsync(),
                    active = await _context.Users.CountAsync(u => u.IsActive),
                    online = await _context.Users.CountAsync(u =>
                        u.LastSeenAt != null && u.LastSeenAt >= onlineCutoff),
                    registeredLast30Days = await _context.Users.CountAsync(u => u.CreatedAt >= monthAgo)
                },
                data = new
                {
                    tenants = await _context.Tenants.CountAsync(),
                    companies = await _context.Companies.CountAsync(),
                    customers = await _context.Customers.CountAsync(),
                    items = await _context.Items.CountAsync(),
                    invoices = await _context.Invoices.CountAsync(),
                    expenses = await _context.Expenses.CountAsync(),
                    transactions = await _context.Transactions.CountAsync(),
                    projects = await _context.Projects.CountAsync(),
                    accounts = await _context.Accounts.CountAsync(),
                    journalEntries = await _context.JournalEntries.CountAsync(),
                    employees = await _context.Employees.CountAsync(),
                    cheques = await _context.Cheques.CountAsync(),
                    stakeholders = await _context.Stakeholders.CountAsync()
                },
                recentUsers = await _context.Users
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

            if ((_deployment.IsSelfHosted && !isAdmin && !isSysAdmin) ||
                (!_deployment.IsSelfHosted && !isSysAdmin))
            {
                return Forbid();
            }

            var cutoff = DateTime.UtcNow.AddMinutes(-5);
            var users = await _context.Users
                .Where(u => u.LastSeenAt != null && u.LastSeenAt >= cutoff)
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
