using System.Text;
using IntelliReq.API.Data;
using IntelliReq.API.Repositories;
using IntelliReq.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

const string FrontendCorsPolicy = "FrontendCorsPolicy";

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// DATABASE
// ==========================================

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// ==========================================
// AUTHENTICATION & JWT
// ==========================================

var jwtSecretKey = builder.Configuration["Jwt:SecretKey"]
                   ?? Environment.GetEnvironmentVariable("INTELLIREQ_JWT_SECRET")
                   ?? "IntelliReq_Super_Secret_JWT_Signing_Key_2026_Secure_Token!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "IntelliReq.API";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "IntelliReq.Web";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey))
    };
});

// ==========================================
// CONTROLLERS
// ==========================================

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ==========================================
// CORS — Allow React dev server
// ==========================================

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ==========================================
// REPOSITORIES
// ==========================================

builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
builder.Services.AddScoped<IRequirementRepository, RequirementRepository>();
builder.Services.AddScoped<IDependencyRepository, DependencyRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// ==========================================
// SERVICES
// ==========================================

builder.Services.AddScoped<ProjectService>();
builder.Services.AddScoped<DocumentService>();
builder.Services.AddScoped<RequirementService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// ==========================================
// AI ANALYSIS SERVICE
// ==========================================

builder.Services.AddHttpClient<IAnalysisService, AnalysisService>(client =>
{
    client.BaseAddress = new Uri("http://127.0.0.1:8000");
    client.Timeout = TimeSpan.FromSeconds(30);
});

// ==========================================
// OTHER SERVICES
// ==========================================

builder.Services.AddScoped<IDependencyService, DependencyService>();
builder.Services.AddScoped<IImpactAnalysisService, ImpactAnalysisService>();

// ==========================================
// OPENAPI
// ==========================================

builder.Services.AddOpenApi();

var app = builder.Build();

// ==========================================
// DATABASE AUTO MIGRATION (EF CORE)
// ==========================================

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

// ==========================================
// HTTP REQUEST PIPELINE
// ==========================================

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();