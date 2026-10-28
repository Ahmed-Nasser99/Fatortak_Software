using fatortak.Common.Enum;
using fatortak.Context;
using fatortak.Dtos.Shared;
using fatortak.Dtos.Stakeholder;
using fatortak.Entities;
using fatortak.Helpers;
using Microsoft.EntityFrameworkCore;

namespace fatortak.Services.StakeholderService
{
    public interface IStakeholderService
    {
        Task<ServiceResult<List<StakeholderDto>>> GetAllAsync();
        Task<ServiceResult<StakeholderDto>> GetByIdAsync(Guid id);
        Task<ServiceResult<StakeholderDto>> CreateAsync(CreateStakeholderDto dto);
        Task<ServiceResult<StakeholderDto>> UpdateAsync(Guid id, UpdateStakeholderDto dto);
        Task<ServiceResult<bool>> DeleteAsync(Guid id);
        Task<ServiceResult<List<StakeholderTransactionDto>>> GetTransactionsAsync(Guid stakeholderId);
        Task<ServiceResult<StakeholderTransactionDto>> AddTransactionAsync(
            Guid stakeholderId, CreateStakeholderTransactionDto dto);
        Task<ServiceResult<bool>> DeleteTransactionAsync(Guid transactionId);
        Task<ServiceResult<StakeholderStatementDto>> GetStatementAsync(Guid stakeholderId);
    }

    public class StakeholderService : IStakeholderService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<StakeholderService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public StakeholderService(
            ApplicationDbContext context,
            ILogger<StakeholderService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid TenantId =>
            (_httpContextAccessor.HttpContext?.Items["CurrentTenant"] as Tenant)?.Id ?? Guid.Empty;

        private Guid? CurrentUserId
        {
            get
            {
                var value = UserHelper.GetUserId();
                return Guid.TryParse(value, out var id) ? id : null;
            }
        }

        public async Task<ServiceResult<List<StakeholderDto>>> GetAllAsync()
        {
            if (TenantId == Guid.Empty)
                return ServiceResult<List<StakeholderDto>>.Failure("Tenant context not found.");

            var stakeholders = await _context.Stakeholders
                .AsNoTracking()
                .Include(s => s.Account)
                .Where(s => s.TenantId == TenantId)
                .OrderBy(s => s.Name)
                .ToListAsync();

            var transactions = await _context.StakeholderTransactions
                .AsNoTracking()
                .Where(t => t.TenantId == TenantId)
                .ToListAsync();

            var result = stakeholders.Select(s => Map(s, transactions)).ToList();
            return ServiceResult<List<StakeholderDto>>.SuccessResult(result);
        }

        public async Task<ServiceResult<StakeholderDto>> GetByIdAsync(Guid id)
        {
            var stakeholder = await _context.Stakeholders
                .AsNoTracking()
                .Include(s => s.Account)
                .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == TenantId);

            if (stakeholder == null)
                return ServiceResult<StakeholderDto>.Failure("Stakeholder not found.");

            var transactions = await _context.StakeholderTransactions
                .AsNoTracking()
                .Where(t => t.TenantId == TenantId && t.StakeholderId == id)
                .ToListAsync();

            return ServiceResult<StakeholderDto>.SuccessResult(Map(stakeholder, transactions));
        }

        public async Task<ServiceResult<StakeholderDto>> CreateAsync(CreateStakeholderDto dto)
        {
            if (TenantId == Guid.Empty)
                return ServiceResult<StakeholderDto>.Failure("Tenant context not found.");

            if (dto.OwnershipPercent < 0 || dto.OwnershipPercent > 100)
                return ServiceResult<StakeholderDto>.Failure("Ownership must be between 0 and 100.");

            var totalOwnership = await _context.Stakeholders
                .Where(s => s.TenantId == TenantId && s.IsActive)
                .SumAsync(s => (decimal?)s.OwnershipPercent) ?? 0m;

            if (totalOwnership + dto.OwnershipPercent > 100.01m)
                return ServiceResult<StakeholderDto>.Failure(
                    "Total active ownership cannot exceed 100%.");

            var accountId = dto.AccountId ?? await GetOrCreateAccountIdAsync(
                "3000", "Capital", AccountType.Equity);

            if (dto.AccountId.HasValue)
            {
                var accountExists = await _context.Accounts
                    .AnyAsync(a => a.Id == dto.AccountId.Value && a.TenantId == TenantId);
                if (!accountExists)
                    return ServiceResult<StakeholderDto>.Failure("Selected equity account was not found.");
            }

            var stakeholder = new Stakeholder
            {
                TenantId = TenantId,
                Name = dto.Name.Trim(),
                Type = dto.Type,
                Email = dto.Email,
                Phone = dto.Phone,
                OwnershipPercent = dto.OwnershipPercent,
                AccountId = accountId,
                Notes = dto.Notes,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Stakeholders.Add(stakeholder);
            await _context.SaveChangesAsync();

            var created = await GetByIdAsync(stakeholder.Id);
            return created;
        }

        public async Task<ServiceResult<StakeholderDto>> UpdateAsync(
            Guid id, UpdateStakeholderDto dto)
        {
            var stakeholder = await _context.Stakeholders
                .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == TenantId);

            if (stakeholder == null)
                return ServiceResult<StakeholderDto>.Failure("Stakeholder not found.");

            if (dto.OwnershipPercent < 0 || dto.OwnershipPercent > 100)
                return ServiceResult<StakeholderDto>.Failure("Ownership must be between 0 and 100.");

            var otherOwnership = await _context.Stakeholders
                .Where(s => s.TenantId == TenantId && s.IsActive && s.Id != id)
                .SumAsync(s => (decimal?)s.OwnershipPercent) ?? 0m;

            if (otherOwnership + dto.OwnershipPercent > 100.01m)
                return ServiceResult<StakeholderDto>.Failure(
                    "Total active ownership cannot exceed 100%.");

            if (dto.AccountId.HasValue)
            {
                var accountExists = await _context.Accounts
                    .AnyAsync(a => a.Id == dto.AccountId.Value && a.TenantId == TenantId);
                if (!accountExists)
                    return ServiceResult<StakeholderDto>.Failure("Selected equity account was not found.");
            }

            stakeholder.Name = dto.Name.Trim();
            stakeholder.Type = dto.Type;
            stakeholder.Email = dto.Email;
            stakeholder.Phone = dto.Phone;
            stakeholder.OwnershipPercent = dto.OwnershipPercent;
            stakeholder.AccountId = dto.AccountId ?? stakeholder.AccountId;
            stakeholder.Notes = dto.Notes;
            stakeholder.IsActive = dto.IsActive;
            stakeholder.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<ServiceResult<bool>> DeleteAsync(Guid id)
        {
            var stakeholder = await _context.Stakeholders
                .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == TenantId);

            if (stakeholder == null)
                return ServiceResult<bool>.Failure("Stakeholder not found.");

            var hasTransactions = await _context.StakeholderTransactions
                .AnyAsync(t => t.StakeholderId == id && t.TenantId == TenantId);

            if (hasTransactions)
                return ServiceResult<bool>.Failure(
                    "Delete the stakeholder's transactions first, or mark the stakeholder inactive.");

            _context.Stakeholders.Remove(stakeholder);
            await _context.SaveChangesAsync();
            return ServiceResult<bool>.SuccessResult(true);
        }

        public async Task<ServiceResult<List<StakeholderTransactionDto>>> GetTransactionsAsync(
            Guid stakeholderId)
        {
            var stakeholderExists = await _context.Stakeholders
                .AnyAsync(s => s.Id == stakeholderId && s.TenantId == TenantId);

            if (!stakeholderExists)
                return ServiceResult<List<StakeholderTransactionDto>>.Failure("Stakeholder not found.");

            var transactions = await _context.StakeholderTransactions
                .AsNoTracking()
                .Include(t => t.Stakeholder)
                .Include(t => t.PaymentAccount)
                .Where(t => t.TenantId == TenantId && t.StakeholderId == stakeholderId)
                .OrderByDescending(t => t.Date)
                .ThenByDescending(t => t.CreatedAt)
                .ToListAsync();

            return ServiceResult<List<StakeholderTransactionDto>>.SuccessResult(
                transactions.Select(MapTransaction).ToList());
        }

        public async Task<ServiceResult<StakeholderTransactionDto>> AddTransactionAsync(
            Guid stakeholderId, CreateStakeholderTransactionDto dto)
        {
            if (dto.Amount <= 0)
                return ServiceResult<StakeholderTransactionDto>.Failure(
                    "Amount must be greater than zero.");

            var stakeholder = await _context.Stakeholders
                .Include(s => s.Account)
                .FirstOrDefaultAsync(s => s.Id == stakeholderId && s.TenantId == TenantId);

            if (stakeholder == null)
                return ServiceResult<StakeholderTransactionDto>.Failure("Stakeholder not found.");

            var paymentAccount = dto.PaymentAccountId.HasValue
                ? await _context.Accounts.FirstOrDefaultAsync(a =>
                    a.Id == dto.PaymentAccountId.Value && a.TenantId == TenantId)
                : await GetAccountByCodeAsync("1000");

            if (paymentAccount == null)
                return ServiceResult<StakeholderTransactionDto>.Failure(
                    "Payment account not found and default cash account is missing.");

            var equityAccount = stakeholder.Account
                ?? await GetAccountByCodeAsync("3000");

            if (equityAccount == null)
                return ServiceResult<StakeholderTransactionDto>.Failure("Capital account not found.");

            var loanAccount = await GetOrCreateAccountAsync(
                "2400", "Stakeholder Loans", AccountType.Liability);
            var distributionAccount = await GetOrCreateAccountAsync(
                "3300", "Distributions", AccountType.Equity);

            var existingTransactions = await _context.StakeholderTransactions
                .Where(t => t.TenantId == TenantId && t.StakeholderId == stakeholderId)
                .ToListAsync();

            var capitalBalance = existingTransactions
                .Where(t => t.Type == StakeholderTransactionType.CapitalContribution)
                .Sum(t => t.Amount)
                - existingTransactions.Where(t => t.Type == StakeholderTransactionType.Withdrawal)
                    .Sum(t => t.Amount)
                - existingTransactions.Where(t => t.Type == StakeholderTransactionType.Dividend)
                    .Sum(t => t.Amount);

            var loanBalance = existingTransactions
                .Where(t => t.Type == StakeholderTransactionType.LoanReceived)
                .Sum(t => t.Amount)
                - existingTransactions.Where(t => t.Type == StakeholderTransactionType.LoanRepayment)
                    .Sum(t => t.Amount);

            if (dto.Type == StakeholderTransactionType.LoanRepayment &&
                dto.Amount > loanBalance)
            {
                return ServiceResult<StakeholderTransactionDto>.Failure(
                    $"Repayment exceeds the outstanding loan balance ({loanBalance:0.00}).");
            }

            if (dto.Type == StakeholderTransactionType.Withdrawal &&
                dto.Amount > capitalBalance)
            {
                return ServiceResult<StakeholderTransactionDto>.Failure(
                    $"Withdrawal exceeds the available capital balance ({capitalBalance:0.00}).");
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var entry = await BuildJournalEntryAsync(
                    stakeholder, dto, paymentAccount, equityAccount, loanAccount, distributionAccount);

                _context.JournalEntries.Add(entry);

                var stakeholderTransaction = new StakeholderTransaction
                {
                    TenantId = TenantId,
                    StakeholderId = stakeholder.Id,
                    Type = dto.Type,
                    Amount = dto.Amount,
                    Date = dto.Date,
                    PaymentAccountId = paymentAccount.Id,
                    JournalEntryId = entry.Id,
                    Reference = dto.Reference,
                    Description = dto.Description,
                    CreatedAt = DateTime.UtcNow
                };

                _context.StakeholderTransactions.Add(stakeholderTransaction);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                stakeholderTransaction.Stakeholder = stakeholder;
                stakeholderTransaction.PaymentAccount = paymentAccount;
                return ServiceResult<StakeholderTransactionDto>.SuccessResult(
                    MapTransaction(stakeholderTransaction));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error adding stakeholder transaction");
                return ServiceResult<StakeholderTransactionDto>.Failure(
                    "Failed to record the stakeholder transaction.");
            }
        }

        public async Task<ServiceResult<bool>> DeleteTransactionAsync(Guid transactionId)
        {
            var stakeholderTransaction = await _context.StakeholderTransactions
                .Include(t => t.JournalEntry)
                .ThenInclude(j => j.Lines)
                .FirstOrDefaultAsync(t => t.Id == transactionId && t.TenantId == TenantId);

            if (stakeholderTransaction == null)
                return ServiceResult<bool>.Failure("Transaction not found.");

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var original = stakeholderTransaction.JournalEntry;
                if (original != null && original.IsPosted)
                {
                    var reversal = new JournalEntry
                    {
                        TenantId = TenantId,
                        EntryNumber = await GenerateEntryNumberAsync(),
                        Date = DateTime.UtcNow.Date,
                        ReferenceType = JournalEntryReferenceType.Reversing,
                        ReferenceId = original.Id,
                        ReversingEntryId = original.Id,
                        Description = $"Reversal of stakeholder transaction {stakeholderTransaction.Id}",
                        IsPosted = true,
                        PostedAt = DateTime.UtcNow,
                        PostedBy = CurrentUserId,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = CurrentUserId
                    };

                    _context.JournalEntries.Add(reversal);
                    foreach (var line in original.Lines)
                    {
                        _context.JournalEntryLines.Add(new JournalEntryLine
                        {
                            JournalEntryId = reversal.Id,
                            AccountId = line.AccountId,
                            Debit = line.Credit,
                            Credit = line.Debit,
                            Description = $"Reversal - {line.Description}"
                        });
                    }
                }

                _context.StakeholderTransactions.Remove(stakeholderTransaction);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error deleting stakeholder transaction");
                return ServiceResult<bool>.Failure("Failed to delete the stakeholder transaction.");
            }
        }

        public async Task<ServiceResult<StakeholderStatementDto>> GetStatementAsync(Guid stakeholderId)
        {
            var stakeholderResult = await GetByIdAsync(stakeholderId);
            if (!stakeholderResult.Success || stakeholderResult.Data == null)
                return ServiceResult<StakeholderStatementDto>.Failure(
                    stakeholderResult.ErrorMessage ?? "Stakeholder not found.");

            var transactions = await GetTransactionsAsync(stakeholderId);
            var data = stakeholderResult.Data;

            return ServiceResult<StakeholderStatementDto>.SuccessResult(new StakeholderStatementDto
            {
                Stakeholder = data,
                Transactions = transactions.Data ?? new List<StakeholderTransactionDto>(),
                CapitalBalance = data.CapitalBalance,
                LoanBalance = data.LoanBalance,
                NetPosition = data.NetPosition
            });
        }

        private async Task<JournalEntry> BuildJournalEntryAsync(
            Stakeholder stakeholder,
            CreateStakeholderTransactionDto dto,
            Account paymentAccount,
            Account equityAccount,
            Account loanAccount,
            Account distributionAccount)
        {
            var entry = new JournalEntry
            {
                TenantId = TenantId,
                EntryNumber = await GenerateEntryNumberAsync(),
                Date = dto.Date.ToDateTime(TimeOnly.MinValue),
                ReferenceType = JournalEntryReferenceType.Stakeholder,
                ReferenceId = stakeholder.Id,
                Description = $"Stakeholder {stakeholder.Name} - {dto.Type}",
                IsPosted = true,
                PostedAt = DateTime.UtcNow,
                PostedBy = CurrentUserId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = CurrentUserId
            };

            void Debit(Account account, decimal amount, string description) =>
                _context.JournalEntryLines.Add(new JournalEntryLine
                {
                    JournalEntryId = entry.Id,
                    AccountId = account.Id,
                    Debit = amount,
                    Credit = 0,
                    Description = description
                });

            void Credit(Account account, decimal amount, string description) =>
                _context.JournalEntryLines.Add(new JournalEntryLine
                {
                    JournalEntryId = entry.Id,
                    AccountId = account.Id,
                    Debit = 0,
                    Credit = amount,
                    Description = description
                });

            switch (dto.Type)
            {
                case StakeholderTransactionType.CapitalContribution:
                    Debit(paymentAccount, dto.Amount, "Capital contribution received");
                    Credit(equityAccount, dto.Amount, "Capital contribution");
                    break;
                case StakeholderTransactionType.Dividend:
                    Debit(distributionAccount, dto.Amount, "Dividend distribution");
                    Credit(paymentAccount, dto.Amount, "Dividend paid");
                    break;
                case StakeholderTransactionType.LoanReceived:
                    Debit(paymentAccount, dto.Amount, "Stakeholder loan received");
                    Credit(loanAccount, dto.Amount, "Stakeholder loan payable");
                    break;
                case StakeholderTransactionType.LoanRepayment:
                    Debit(loanAccount, dto.Amount, "Stakeholder loan repayment");
                    Credit(paymentAccount, dto.Amount, "Loan repayment paid");
                    break;
                case StakeholderTransactionType.Withdrawal:
                    Debit(equityAccount, dto.Amount, "Stakeholder withdrawal");
                    Credit(paymentAccount, dto.Amount, "Withdrawal paid");
                    break;
                default:
                    throw new InvalidOperationException("Unsupported stakeholder transaction type.");
            }

            return entry;
        }

        private async Task<string> GenerateEntryNumberAsync()
        {
            var prefix = $"JE-{DateTime.UtcNow:yyyyMMdd}-";
            var count = await _context.JournalEntries
                .CountAsync(j => j.TenantId == TenantId && j.EntryNumber.StartsWith(prefix));
            return $"{prefix}{count + 1:D4}";
        }

        private async Task<Account?> GetAccountByCodeAsync(string code) =>
            await _context.Accounts
                .FirstOrDefaultAsync(a => a.TenantId == TenantId && a.AccountCode == code);

        private async Task<Guid> GetOrCreateAccountIdAsync(
            string code, string name, AccountType type)
        {
            var account = await GetOrCreateAccountAsync(code, name, type);
            return account.Id;
        }

        private async Task<Account> GetOrCreateAccountAsync(
            string code, string name, AccountType type)
        {
            var account = await GetAccountByCodeAsync(code);
            if (account != null) return account;

            account = new Account
            {
                TenantId = TenantId,
                AccountCode = code,
                Name = name,
                AccountType = type,
                Level = 0,
                IsPostable = true,
                IsSystem = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }

        private static StakeholderDto Map(
            Stakeholder stakeholder,
            IEnumerable<StakeholderTransaction> transactions)
        {
            var list = transactions.Where(t => t.StakeholderId == stakeholder.Id).ToList();

            var capital = list
                .Where(t => t.Type == StakeholderTransactionType.CapitalContribution)
                .Sum(t => t.Amount)
                - list.Where(t => t.Type == StakeholderTransactionType.Withdrawal)
                    .Sum(t => t.Amount)
                - list.Where(t => t.Type == StakeholderTransactionType.Dividend)
                    .Sum(t => t.Amount);

            var loans = list
                .Where(t => t.Type == StakeholderTransactionType.LoanReceived)
                .Sum(t => t.Amount)
                - list.Where(t => t.Type == StakeholderTransactionType.LoanRepayment)
                    .Sum(t => t.Amount);

            return new StakeholderDto
            {
                Id = stakeholder.Id,
                Name = stakeholder.Name,
                Type = stakeholder.Type,
                Email = stakeholder.Email,
                Phone = stakeholder.Phone,
                OwnershipPercent = stakeholder.OwnershipPercent,
                AccountId = stakeholder.AccountId,
                AccountName = stakeholder.Account?.Name,
                Notes = stakeholder.Notes,
                IsActive = stakeholder.IsActive,
                CapitalBalance = capital,
                LoanBalance = loans,
                NetPosition = capital + loans,
                TransactionCount = list.Count,
                CreatedAt = stakeholder.CreatedAt
            };
        }

        private static StakeholderTransactionDto MapTransaction(StakeholderTransaction transaction) => new()
        {
            Id = transaction.Id,
            StakeholderId = transaction.StakeholderId,
            StakeholderName = transaction.Stakeholder?.Name ?? string.Empty,
            Type = transaction.Type,
            Amount = transaction.Amount,
            Date = transaction.Date,
            PaymentAccountId = transaction.PaymentAccountId,
            PaymentAccountName = transaction.PaymentAccount?.Name,
            JournalEntryId = transaction.JournalEntryId,
            Reference = transaction.Reference,
            Description = transaction.Description,
            CreatedAt = transaction.CreatedAt
        };
    }
}
