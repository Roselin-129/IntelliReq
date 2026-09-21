using IntelliReq.API.DTOs;

namespace IntelliReq.API.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<UserDto?> GetCurrentUserAsync(Guid userId);
}
