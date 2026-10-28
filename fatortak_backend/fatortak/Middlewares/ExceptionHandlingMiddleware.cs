using System.Diagnostics;
using System.Text.Json;

namespace fatortak.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IHostEnvironment _environment;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger,
            IHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var correlationId = context.Request.Headers["X-Correlation-ID"].FirstOrDefault()
                ?? Activity.Current?.TraceId.ToString()
                ?? Guid.NewGuid().ToString("N");

            context.Response.Headers["X-Correlation-ID"] = correlationId;

            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Unhandled exception. CorrelationId: {CorrelationId}, Path: {Path}, Method: {Method}",
                    correlationId,
                    context.Request.Path,
                    context.Request.Method);

                if (context.Response.HasStarted)
                    throw;

                context.Response.Clear();
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/json";

                var message = _environment.IsDevelopment()
                    ? ex.Message
                    : "An unexpected error occurred. Reference the correlation ID when contacting support.";

                await context.Response.WriteAsync(JsonSerializer.Serialize(new
                {
                    success = false,
                    errorMessage = message,
                    correlationId
                }));
            }
        }
    }
}
