using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using auth.Constants;
using auth.Contexts;
using auth.Dto;
using auth.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace auth.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AuthDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AuthDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }
    
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AuthRequestModel.RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            return Conflict(new { message = ValidationMessages.EmailInUse });
        }
        
        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email
        };

        CreatePasswordHash(dto.Password, out byte[] passwordHash, out byte[] passwordSalt);
        user.PasswordHash = passwordHash;
        user.PasswordSalt = passwordSalt;

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = ValidationMessages.UserCreatedOk });
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthRequestModel.LoginDto dto)
    {
        var user = await _context.Users
            .SingleOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
        {
            return Unauthorized(new { message = ValidationMessages.InvalidCredentials });
        }

        if (!VerifyPasswordHash(dto.Password, user.PasswordHash, user.PasswordSalt))
        {
            return Unauthorized(new { message = ValidationMessages.InvalidCredentials });
        }
        
        var token = GenerateJwtToken(user);
        return Ok(new { token });
    }
    
    [HttpPost("validate")]
    public IActionResult ValidateToken([FromHeader] string authorization)
    {
        if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer "))
        {
            return BadRequest(new { message = ValidationMessages.InvalidHeaders });
        }

        var token = authorization.Substring("Bearer ".Length).Trim();
        string secretKey = Environment.GetEnvironmentVariable("JWT_SECRET") 
                           ?? throw new Exception("JWT Secret key is missing");

        if (string.IsNullOrEmpty(secretKey))
        {
            return StatusCode(500, new { message = ValidationMessages.ErrorInterno });
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var claimsPrincipal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;

            return Ok(new
            {
                isValid = true,
                userId = jwtToken.Claims.FirstOrDefault(c => c.Type == "nameid")?.Value,
                email = jwtToken.Claims.FirstOrDefault(c => c.Type == "unique_name")?.Value,
                expires = jwtToken.ValidTo
            });
        }
        catch (Exception ex)
        {
            return Unauthorized(new { isValid = false, message = ValidationMessages.InvalidToken, error = ex.Message });
        }
    }
    
    private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
    {
        using var hmac = new HMACSHA512();
        passwordSalt = hmac.Key;
        passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
    }
    
    private bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
    {
        using var hmac = new HMACSHA512(storedSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return computedHash.SequenceEqual(storedHash);
    }
    
    private string GenerateJwtToken(User user)
    {
        string secretKey = Environment.GetEnvironmentVariable("JWT_SECRET") 
                ?? throw new Exception("JWT Secret key is missing");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Email),
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}