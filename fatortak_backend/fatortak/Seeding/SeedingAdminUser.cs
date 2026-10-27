using fatortak.Common.Enum;
using fatortak.Context;
using fatortak.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace fatortak.Seeding
{
    public static class SeedingAdminUser
    {
        public static async Task Seed(IApplicationBuilder app)
        {
            using (var scope = app.ApplicationServices.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
                var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

                await context.Database.MigrateAsync();
                await userManager.SeedAdminAsync(configuration);
            }
        }

        private static async Task SeedAdminAsync(this UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            var adminEmail = configuration["SeedAdmin:Email"] ?? "admin@fatortak.net";
            var adminUserName = configuration["SeedAdmin:UserName"] ?? "FatortakAdmin";
            var adminPassword = configuration["SeedAdmin:Password"];

            var existingUser = await userManager.FindByEmailAsync(adminEmail);
            if (existingUser != null)
            {
                return;
            }

            // Never fall back to a hardcoded password. The initial password must be
            // supplied through configuration or the SeedAdmin__Password environment variable.
            if (string.IsNullOrWhiteSpace(adminPassword))
            {
                Console.WriteLine(
                    "Skipping default admin seeding because 'SeedAdmin:Password' is not configured. " +
                    "Set the SeedAdmin__Password environment variable (or user secret) to create the first SysAdmin.");
                return;
            }

            var adminUser = new ApplicationUser
            {
                UserName = adminUserName,
                FirstName = "Fatortak",
                LastName = "Admin",
                Role = RoleEnum.SysAdmin.ToString(),
                Email = adminEmail,
                IsActive = true,
                EmailConfirmed = true,
            };

            var createResult = await userManager.CreateAsync(adminUser, adminPassword);
            if (createResult.Succeeded)
            {
                Console.WriteLine($"Admin user '{adminEmail}' created successfully.");
            }
            else
            {
                foreach (var error in createResult.Errors)
                {
                    Console.WriteLine($"User creation error: {error.Description}");
                }
            }
        }
    }
}
