using fatortak.Common.Enum;

namespace fatortak.Entities
{
    public class Stakeholder : ITenantEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public StakeholderType Type { get; set; } = StakeholderType.Shareholder;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public decimal OwnershipPercent { get; set; }
        public Guid? AccountId { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Tenant? Tenant { get; set; }
        public Account? Account { get; set; }
        public ICollection<StakeholderTransaction> Transactions { get; set; } = new List<StakeholderTransaction>();
    }

    public class StakeholderTransaction : ITenantEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TenantId { get; set; }
        public Guid StakeholderId { get; set; }
        public StakeholderTransactionType Type { get; set; }
        public decimal Amount { get; set; }
        public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
        public Guid? PaymentAccountId { get; set; }
        public Guid? JournalEntryId { get; set; }
        public string? Reference { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public Stakeholder? Stakeholder { get; set; }
        public Account? PaymentAccount { get; set; }
        public JournalEntry? JournalEntry { get; set; }
    }
}
