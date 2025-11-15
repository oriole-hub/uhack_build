// src/services/authService.js
const API_BASE_URL = 'https://rsue.devoriole.ru/api';

export const authService = {
  async login(credentials, inviteToken = null) {
    try {
      const inviteParam = inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : '';
      const url = API_BASE_URL + '/auth/login' + inviteParam;
      console.log('🔄 Direct login request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Login failed:', errorText);
        let errorMessage = `Login failed: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.error || errorMessage;
        } catch (e) {
          if (errorText) errorMessage = errorText;
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }

      const data = await response.json();
      console.log('✅ Login successful! Response:', data);

      if (data.access_token) {
        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('user', JSON.stringify({
          id: data.user_id,
          email: credentials.email,
          role: data.role
        }));
        
        // Удаляем токен приглашения после успешной авторизации
        if (inviteToken) {
          localStorage.removeItem('invite_token');
        }
        
        return {
          success: true,
          message: data.message || 'Login successful!',
          token: data.access_token,
          user: {
            id: data.user_id,
            email: credentials.email,
            role: data.role
          }
        };
      } else {
        return {
          success: false,
          error: data.detail || 'Login failed - no token received'
        };
      }
      
    } catch (error) {
      console.log('❌ Login error:', error.message);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return { 
          success: false, 
          error: 'CORS error. Please install CORS browser extension.' 
        };
      }
      
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  async register(userData, inviteToken = null) {
    try {
      const inviteParam = inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : '';
      const url = API_BASE_URL + '/auth/reg' + inviteParam;
      console.log('🔄 Direct registration request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: userData.username || userData.fullName || userData.fullname,
          email: userData.email,
          phone: userData.phone || null,
          password: userData.password,
          companyName: userData.companyName,
          role: userData.role || 'Founder'
        })
      });

      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        data = { detail: responseText };
      }

      if (response.ok) {
        // Удаляем токен приглашения после успешной регистрации
        if (inviteToken) {
          localStorage.removeItem('invite_token');
        }
        
        return {
          success: true,
          message: data.message || 'Registration successful!',
          user: data.user
        };
      } else {
        let errorMessage = data.detail || data.error || `Registration failed: ${response.status}`;
        
        if (data.detail && data.detail.includes('Email already exists')) {
          errorMessage = 'This email is already registered. Please use a different email or login.';
        } else if (data.detail && data.detail.includes('email')) {
          errorMessage = 'Email error: ' + data.detail;
        } else if (response.status === 400) {
          errorMessage = 'Invalid data provided. Please check all fields.';
        } else if (response.status === 422) {
          errorMessage = 'Validation error. Please check your input data.';
        }
        
        return {
          success: false,
          error: errorMessage,
          serverError: data
        };
      }
      
    } catch (error) {
      console.log('❌ Registration error:', error.message);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return { 
          success: false, 
          error: 'CORS error. Please install CORS browser extension.' 
        };
      }
      
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      console.log('🔄 Get current user from:', API_BASE_URL + '/auth/me');
      
      const response = await fetch(API_BASE_URL + '/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('Get user response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User data received:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else {
        console.log('❌ Get user failed, status:', response.status);
        return null;
      }
      
    } catch (error) {
      console.log('Get user failed:', error.message);
      return null;
    }
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    console.log('✅ User logged out');
  },

  getToken() {
    return localStorage.getItem('authToken');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async testConnection() {
    try {
      console.log('🔄 Testing connection to:', API_BASE_URL + '/auth/login');
      
      const response = await fetch(API_BASE_URL + '/auth/login', {
        method: 'OPTIONS',
        headers: {
          'accept': 'application/json',
        },
      });
      
      console.log('Connection test status:', response.status);
      
      if (response.status !== 404) {
        return { 
          success: true, 
          message: `✅ Server is responding! Status: ${response.status}` 
        };
      }
      
      return { 
        success: false, 
        message: `❌ Server returned 404.` 
      };
      
    } catch (error) {
      console.log('Connection test failed:', error.message);
      return { 
        success: false, 
        message: `❌ Cannot connect to server: ${error.message}. Please install CORS extension.` 
      };
    }
  }
};