// Authentication service for handling login, registration, and token management
// This service manages all auth-related API calls and local storage

const API_BASE_URL = 'http://localhost:5001/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('shuttle_token');
    this.user = JSON.parse(localStorage.getItem('shuttle_user') || 'null');
  }

  // Helper method to make API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add auth token if available
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Register a new driver
  async registerDriver(driverData) {
    try {
      const response = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: driverData.name,
          email: driverData.email,
          password: driverData.password,
          busNumber: driverData.busNo,
          mobileNumber: driverData.mobileNo,
          currentLocation: driverData.location
        })
      });

      if (response.success) {
        this.setAuthData(response.data.token, response.data.user);
        return response;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Login with email and password
  async login(email, password) {
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.success) {
        this.setAuthData(response.data.token, response.data.user);
        return response;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Google OAuth login
  async googleLogin(googleData) {
    try {
      const response = await this.makeRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          googleId: googleData.sub,
          name: googleData.name,
          email: googleData.email,
          picture: googleData.picture,
          email_verified: googleData.email_verified
        })
      });

      if (response.success) {
        this.setAuthData(response.data.token, response.data.user);
        return response;
      }
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await this.makeRequest('/auth/me');
      if (response.success) {
        this.user = response.data.user;
        localStorage.setItem('shuttle_user', JSON.stringify(this.user));
        return response.data.user;
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(updateData) {
    try {
      const response = await this.makeRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.success) {
        this.user = response.data.user;
        localStorage.setItem('shuttle_user', JSON.stringify(this.user));
        return response.data.user;
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  // Store authentication data locally
  setAuthData(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('shuttle_token', token);
    localStorage.setItem('shuttle_user', JSON.stringify(user));
  }

  // Clear authentication data
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('shuttle_token');
    localStorage.removeItem('shuttle_user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get auth token
  getToken() {
    return this.token;
  }

  // Check if token is expired (basic check)
  isTokenExpired() {
    if (!this.token) return true;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Token validation error:', error);
      return true;
    }
  }

  // Refresh user data if needed
  async refreshUserData() {
    if (this.isTokenExpired()) {
      this.logout();
      return null;
    }

    try {
      return await this.getProfile();
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      this.logout();
      return null;
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService; 