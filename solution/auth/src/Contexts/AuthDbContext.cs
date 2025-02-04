using auth.Models;
using Microsoft.EntityFrameworkCore;

namespace auth.Contexts;

public class AuthDbContext : DbContext
{
    public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options) {}

    public DbSet<User> Users { get; set; } = null!;
}