/**
 * User Data Transfer Object
 */
class UserDto {
  static toResponse(user) {
    if (!user) return null;
    return {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  static toAuthResponse(user, accessToken, refreshToken = null) {
    const response = {
      user: this.toResponse(user),
      tokens: {
        accessToken
      }
    };
    if (refreshToken) {
      response.tokens.refreshToken = refreshToken;
    }
    return response;
  }
}

export default UserDto;
