using fatortak.Common.Enum;
using System.ComponentModel.DataAnnotations;

namespace fatortak.Dtos.Stakeholder
{
    public class StakeholderDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public StakeholderType Type { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public decimal OwnershipPercent { get; set; }
        public Guid? AccountId { get; set; }
        public string? AccountName { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; }
        public decimal CapitalBalance { get; set; }
        public decimal LoanBalance { get; set; }
        public decimal NetPosition { get; set; }
        public int TransactionCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateStakeholderDto
    {
        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        public StakeholderType Type { get; set; } = StakeholderType.Shareholder;
        [EmailAddress, MaxLength(200)]
        public string? Email { get; set; }
        [MaxLength(50)]
        public string? Phone { get; set; }
        [Range(0, 100)]
        public decimal OwnershipPercent { get; set; }
        public Guid? AccountId { get; set; }
        [MaxLength(1000)]
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdateStakeholderDto : CreateStakeholderDto
    {
    }

    public class StakeholderTransactionDto
    {
        public Guid Id { get; set; }
        public Guid StakeholderId { get; set; }
        public string StakeholderName { get; set; } = string.Empty;
        public StakeholderTransactionType Type { get; set; }
        public decimal Amount { get; set; }
        public DateOnly Date { get; set; }
        public Guid? PaymentAccountId { get; set; }
        public string? PaymentAccountName { get; set; }
        public Guid? JournalEntryId { get; set; }
        public string? Reference { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateStakeholderTransactionDto
    {
        public StakeholderTransactionType Type { get; set; }
        [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
        public decimal Amount { get; set; }
        public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
        public Guid? PaymentAccountId { get; set; }
        [MaxLength(100)]
        public string? Reference { get; set; }
        [MaxLength(500)]
        public string? Description { get; set; }
    }

    public class StakeholderStatementDto
    {
        public StakeholderDto Stakeholder { get; set; } = new();
        public List<StakeholderTransactionDto> Transactions { get; set; } = new();
        public decimal CapitalBalance { get; set; }
        public decimal LoanBalance { get; set; }
        public decimal NetPosition { get; set; }
    }
}
