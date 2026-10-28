using fatortak.Common.Enum;
using fatortak.Context;
using fatortak.Dtos.Shared;
using fatortak.Dtos.User;
using fatortak.Entities;
using fatortak.Services.QuotaService;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace fatortak.Services.UserService
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<UserService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IQuotaService _quotaService;

        public UserService(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole<Guid>> roleManager,
            ILogger<UserService> logger,
            IHttpContextAccessor httpContextAccessor,
            IQuotaService quotaService)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _quotaService = quotaService;
        }

        private Guid? TenantId =>
            (_httpContextAccessor.HttpContext?.Items["CurrentTenant"] as Tenant)?.Id;

        private static readonly HashSet<string> TenantRoles = new(StringComparer.OrdinalIgnoreCase)
        {
            RoleEnum.Admin.ToString(),
            RoleEnum.Editor.ToString(),
            RoleEnum.Watcher.ToString()
        };

        private static bool CanAssignRole(string? requestedRole, string? currentRole)
        {
            if (string.IsNullOrWhiteSpace(requestedRole))
                return true;

            if (TenantRoles.Contains(requestedRole))
                return true;

            // Only an existing SysAdmin may create another SysAdmin.
            return string.Equals(requestedRole, RoleEnum.SysAdmin.ToString(), StringComparison.OrdinalIgnoreCase)
                && string.Equals(currentRole, RoleEnum.SysAdmin.ToString(), StringComparison.OrdinalIgnoreCase);
        }

        public async Task<ServiceResult<UserDto>> CreateUserAsync(UserCreateDto dto, Guid currentUserId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Verify current user has permission to create users
                var currentUser = await _userManager.FindByIdAsync(currentUserId.ToString());
                if (currentUser == null || currentUser.Role != RoleEnum.Admin.ToString())
                    return ServiceResult<UserDto>.Failure("Unauthorized");

                if (TenantId == null)
                    return ServiceResult<UserDto>.Failure("Tenant context is required.");

                if (!await _quotaService.CanAddUserAsync(TenantId.Value))
                    return ServiceResult<UserDto>.Failure(
                        "User limit reached for your plan. Upgrade to add more users.");

                var requestedRole = string.IsNullOrWhiteSpace(dto.Role)
                    ? RoleEnum.Watcher.ToString()
                    : dto.Role;

                if (!CanAssignRole(requestedRole, currentUser.Role))
                    return ServiceResult<UserDto>.Failure("You cannot assign this role.");

                // Check if email exists
                if (await _userManager.FindByEmailAsync(dto.Email) != null)
                    return ServiceResult<UserDto>.Failure("Email already registered");

                // Create user
                var user = new ApplicationUser
                {
                    UserName = dto.Email,
                    Email = dto.Email,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    TenantId = TenantId.Value,
                    PhoneNumber = dto.PhoneNumber,
                    Role = requestedRole,
                    IsActive = true
                };

                var result = await _userManager.CreateAsync(user, dto.Password);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description);
                    return ServiceResult<UserDto>.ValidationError(errors);
                }

                await transaction.CommitAsync();

                return ServiceResult<UserDto>.SuccessResult(MapToDto(user, requestedRole));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Error creating user {dto.Email}");
                return ServiceResult<UserDto>.Failure("Failed to create user");
            }
        }

        public async Task<ServiceResult<UserDto>> GetUserAsync(Guid userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null || user.TenantId != TenantId)
                    return ServiceResult<UserDto>.Failure("User not found");

                var role = user.Role ?? "User";

                return ServiceResult<UserDto>.SuccessResult(MapToDto(user, role));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving user {userId}");
                return ServiceResult<UserDto>.Failure("Failed to retrieve user");
            }
        }

        public async Task<ServiceResult<PagedResponseDto<UserDto>>> GetUsersAsync(
            UserFilterDto filter, PaginationDto pagination)
        {
            try
            {
                var query = _userManager.Users
                    .Where(u => u.TenantId == TenantId)
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(filter.Email))
                    query = query.Where(u => u.Email.Contains(filter.Email));

                if (filter.IsActive.HasValue)
                    query = query.Where(u => u.IsActive == filter.IsActive.Value);

                // Join with TenantUsers to filter by role
                if (!string.IsNullOrWhiteSpace(filter.Role))
                {
                    query = query.Where(u => u.Role == filter.Role);
                }

                var totalCount = await query.CountAsync();

                var users = await query
                    .OrderBy(u => u.LastName)
                    .ThenBy(u => u.FirstName)
                    .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                var userDtos = new List<UserDto>();
                foreach (var user in users)
                {
                    userDtos.Add(MapToDto(user, user.Role ?? "User"));
                }

                return ServiceResult<PagedResponseDto<UserDto>>.SuccessResult(
                    new PagedResponseDto<UserDto>
                    {
                        Data = userDtos,
                        PageNumber = pagination.PageNumber,
                        PageSize = pagination.PageSize,
                        TotalCount = totalCount
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return ServiceResult<PagedResponseDto<UserDto>>.Failure("Failed to retrieve users");
            }
        }

        public async Task<ServiceResult<UserDto>> UpdateUserAsync(
            Guid userId, UserUpdateDto dto, Guid currentUserId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Verify current user has permission to update users
                var currentUser = await _userManager.FindByIdAsync(currentUserId.ToString());
                if (currentUser == null ||
                    (currentUser.Role != RoleEnum.Admin.ToString() &&
                     currentUser.Role != RoleEnum.SysAdmin.ToString()))
                    return ServiceResult<UserDto>.Failure("Unauthorized");

                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null || user.TenantId != TenantId)
                    return ServiceResult<UserDto>.Failure("User not found");

                if (!string.IsNullOrWhiteSpace(dto.Role) && !CanAssignRole(dto.Role, currentUser.Role))
                    return ServiceResult<UserDto>.Failure("You cannot assign this role.");

                if (user.Id == currentUserId && !string.IsNullOrWhiteSpace(dto.Role) &&
                    !string.Equals(dto.Role, user.Role, StringComparison.OrdinalIgnoreCase))
                    return ServiceResult<UserDto>.Failure("You cannot change your own role.");

                // Update basic info
                if (!string.IsNullOrWhiteSpace(dto.FirstName))
                    user.FirstName = dto.FirstName;

                if (!string.IsNullOrWhiteSpace(dto.LastName))
                    user.LastName = dto.LastName;

                if (!string.IsNullOrWhiteSpace(dto.Email))
                {
                    var emailOwner = await _userManager.FindByEmailAsync(dto.Email);
                    if (emailOwner != null && emailOwner.Id != user.Id)
                        return ServiceResult<UserDto>.Failure("Email already registered");

                    user.Email = dto.Email;
                    user.UserName = dto.Email;
                }

                if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
                    user.PhoneNumber = dto.PhoneNumber;

                // Update role if specified
                if (!string.IsNullOrWhiteSpace(dto.Role))
                {
                    user.Role = dto.Role;
                }

                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                    return ServiceResult<UserDto>.ValidationError(
                        updateResult.Errors.Select(e => e.Description));

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return ServiceResult<UserDto>.SuccessResult(MapToDto(user, user.Role ?? RoleEnum.Watcher.ToString()));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Error updating user {userId}");
                return ServiceResult<UserDto>.Failure("Failed to update user");
            }
        }

        public async Task<ServiceResult<bool>> DeleteUserAsync(Guid userId, Guid currentUserId)
        {
            try
            {
                var currentUser = await _userManager.FindByIdAsync(currentUserId.ToString());
                if (currentUser == null ||
                    (currentUser.Role != RoleEnum.Admin.ToString() &&
                     currentUser.Role != RoleEnum.SysAdmin.ToString()))
                    return ServiceResult<bool>.Failure("Unauthorized");

                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null || user.TenantId != TenantId)
                    return ServiceResult<bool>.Failure("User not found");

                if (user.Role == RoleEnum.SysAdmin.ToString() &&
                    currentUser.Role != RoleEnum.SysAdmin.ToString())
                    return ServiceResult<bool>.Failure("Only a SysAdmin can delete a SysAdmin.");

                // Don't allow deactivating yourself
                if (user.Id == currentUserId)
                    return ServiceResult<bool>.Failure("Cannot deactivate yourself");

                await _userManager.DeleteAsync(user);

                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deactivating user {userId}");
                return ServiceResult<bool>.Failure("Failed to deactivate user");
            }
        }

        public async Task<ServiceResult<bool>> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null || user.TenantId != TenantId)
                    return ServiceResult<bool>.Failure("User not found");

                var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description);
                    return ServiceResult<bool>.ValidationError(errors);
                }

                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error changing password for user {userId}");
                return ServiceResult<bool>.Failure("Failed to change password");
            }
        }

        private UserDto MapToDto(ApplicationUser user, string role) => new()
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}
