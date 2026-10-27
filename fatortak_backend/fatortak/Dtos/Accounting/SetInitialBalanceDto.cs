using System.ComponentModel.DataAnnotations;

namespace fatortak.Dtos.Accounting
{
    public class SetInitialBalanceDto
    {
        [Required]
        public Guid AccountId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }
        
        public Guid? SourceAccountId { get; set; }
    }
}
