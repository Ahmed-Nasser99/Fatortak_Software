using fatortak.Dtos.Stakeholder;
using fatortak.Services.StakeholderService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fatortak.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class StakeholdersController : ControllerBase
    {
        private readonly IStakeholderService _service;

        public StakeholdersController(IStakeholderService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStakeholderDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return result.Success
                ? CreatedAtAction(nameof(Get), new { id = result.Data?.Id }, result)
                : BadRequest(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStakeholderDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id:guid}/transactions")]
        public async Task<IActionResult> GetTransactions(Guid id)
        {
            var result = await _service.GetTransactionsAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost("{id:guid}/transactions")]
        public async Task<IActionResult> AddTransaction(
            Guid id, [FromBody] CreateStakeholderTransactionDto dto)
        {
            var result = await _service.AddTransactionAsync(id, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("transactions/{transactionId:guid}")]
        public async Task<IActionResult> DeleteTransaction(Guid transactionId)
        {
            var result = await _service.DeleteTransactionAsync(transactionId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id:guid}/statement")]
        public async Task<IActionResult> GetStatement(Guid id)
        {
            var result = await _service.GetStatementAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }
    }
}
