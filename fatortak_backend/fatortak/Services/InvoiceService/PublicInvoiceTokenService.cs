using Microsoft.AspNetCore.WebUtilities;
using System.Security.Cryptography;
using System.Text;

namespace fatortak.Services.InvoiceService
{
    public interface IPublicInvoiceTokenService
    {
        string Create(Guid invoiceId, Guid tenantId);
        bool Validate(Guid invoiceId, string? token);
    }

    /// <summary>
    /// Creates short, signed, expiring tokens for public invoice links.
    /// The token contains the invoice, tenant, expiry and an HMAC signature.
    /// It contains no secret and cannot be forged without the server key.
    /// </summary>
    public class PublicInvoiceTokenService : IPublicInvoiceTokenService
    {
        private static readonly TimeSpan Lifetime = TimeSpan.FromDays(30);
        private readonly byte[] _key;
        private readonly ILogger<PublicInvoiceTokenService> _logger;

        public PublicInvoiceTokenService(
            IConfiguration configuration,
            ILogger<PublicInvoiceTokenService> logger)
        {
            _logger = logger;
            var configured = configuration["PublicInvoice:SigningKey"];
            var signingKey = string.IsNullOrWhiteSpace(configured)
                ? configuration["Jwt:Key"]
                : configured;

            if (string.IsNullOrWhiteSpace(signingKey))
                throw new InvalidOperationException("A public invoice signing key is required.");

            _key = Encoding.UTF8.GetBytes(signingKey);
        }

        public string Create(Guid invoiceId, Guid tenantId)
        {
            var expires = DateTimeOffset.UtcNow.Add(Lifetime).ToUnixTimeSeconds();
            var payload = $"{invoiceId:N}.{tenantId:N}.{expires}";
            var signature = Sign(payload);
            return WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes($"{payload}.{signature}"));
        }

        public bool Validate(Guid invoiceId, string? token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return false;

            try
            {
                var decoded = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
                var parts = decoded.Split('.');
                if (parts.Length != 4)
                    return false;

                if (!Guid.TryParseExact(parts[0], "N", out var tokenInvoiceId) ||
                    tokenInvoiceId != invoiceId)
                    return false;

                if (!long.TryParse(parts[2], out var expires) ||
                    DateTimeOffset.FromUnixTimeSeconds(expires) < DateTimeOffset.UtcNow)
                    return false;

                var payload = $"{parts[0]}.{parts[1]}.{parts[2]}";
                var expected = Sign(payload);
                var actualBytes = Encoding.UTF8.GetBytes(parts[3]);
                var expectedBytes = Encoding.UTF8.GetBytes(expected);

                return actualBytes.Length == expectedBytes.Length &&
                       CryptographicOperations.FixedTimeEquals(actualBytes, expectedBytes);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Invalid public invoice token.");
                return false;
            }
        }

        private string Sign(string payload)
        {
            using var hmac = new HMACSHA256(_key);
            return WebEncoders.Base64UrlEncode(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload)));
        }
    }
}
