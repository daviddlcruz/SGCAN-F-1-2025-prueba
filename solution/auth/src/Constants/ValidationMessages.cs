namespace auth.Constants;

public class ValidationMessages
{
    public const string EmailRequired = "El correo electrónico es obligatorio.";
    public const string EmailInvalid = "Formato de correo electrónico no válido.";

    public const string FirstNameRequired = "El nombre es obligatorio.";
    public const string FirstNameMaxLength = "El nombre no puede exceder de 50 caracteres.";

    public const string LastNameRequired = "El apellido es obligatorio.";

    public const string PasswordRequired = "La contraseña es obligatoria.";
    public const string PasswordMinLength = "La contraseña debe tener al menos 8 caracteres.";
    public const string PasswordComplexity = "La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número.";
    
    public const string EmailInUse = "El email ya existe.";
    public const string UserCreatedOk = "Usuario creado exitosamente.";
    public const string InvalidCredentials = "Credenciales incorrectas.";
    public const string InvalidToken = "Token invalido.";
    
    public const string InvalidHeaders = "Cabeceras no validas.";
    public const string ErrorInterno = "Error interno";
}
