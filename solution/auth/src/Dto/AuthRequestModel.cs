using System.ComponentModel.DataAnnotations;
using auth.Constants;

namespace auth.Dto;

public class AuthRequestModel
{
    public class RegisterDto
    {
        [Required(ErrorMessage = ValidationMessages.FirstNameRequired)]
        [StringLength(50, ErrorMessage = ValidationMessages.FirstNameMaxLength)]
        public string FirstName { get; set; } = string.Empty;
    
        [Required(ErrorMessage = ValidationMessages.LastNameRequired)]
        public string LastName  { get; set; } = string.Empty;
    
        [Required(ErrorMessage = ValidationMessages.EmailRequired)]
        [EmailAddress(ErrorMessage = ValidationMessages.EmailInvalid)]
        public string Email     { get; set; } = string.Empty;
    
        [Required(ErrorMessage = ValidationMessages.PasswordRequired)]
        [MinLength(8, ErrorMessage = ValidationMessages.PasswordMinLength)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", 
            ErrorMessage = ValidationMessages.PasswordComplexity)]
        public string Password  { get; set; } = string.Empty;
    }

    
    public class LoginDto
    {
        [Required(ErrorMessage = ValidationMessages.EmailRequired)]
        [EmailAddress(ErrorMessage = ValidationMessages.EmailInvalid)]
        public string Email    { get; set; } = string.Empty;
        
        [Required(ErrorMessage = ValidationMessages.PasswordRequired)]
        public string Password { get; set; } = string.Empty;
    }
}