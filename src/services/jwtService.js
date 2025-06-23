class JwtService {
  getPayload(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      return JSON.parse(atob(parts[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  extractUserId(token) {
    const payload = this.getPayload(token);
    return payload ? payload.userId : null;
  }

  extractCompanyId(token) {
    const payload = this.getPayload(token);
    return payload ? payload.companyId : null;
  }

  isTokenExpired(token) {
    const payload = this.getPayload(token);
    if (!payload) {
        return true;
    }
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  }
}

export const jwtService = new JwtService(); 