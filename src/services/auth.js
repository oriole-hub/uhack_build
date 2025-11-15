import { apiService } from './api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');

    if (this.token) {
      apiService.setToken(this.token);
    }
  }

  /**
   * Вход в систему с email и паролем
   */
  async login(credentials) {
    try {
      const response = await apiService.login(credentials);
      this.token = response.access_token;
      apiService.setToken(this.token);
      localStorage.setItem('authToken', this.token);

      // Получаем информацию о пользователе
      const user = await this.getCurrentUser();
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ Пользователь успешно авторизован:', user);
      return { success: true, user };
      
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Регистрация нового пользователя
   */
  async register(userData) {
    try {
      const response = await apiService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Получение данных текущего пользователя
   */
  async getCurrentUser() {
    try {
      if (!this.token) return null;
      
      const user = await apiService.getMe();
      return user;
    } catch (error) {
      console.warn('⚠️ Не удалось получить данные пользователя:', error.message);
      // Создаем временного пользователя на основе токена
      return this._createTempUserFromToken(this.token);
    }
  }

  /**
   * Выход из системы
   */
  logout() {
    this.token = null;
    this.user = null;
    apiService.clearAuth();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  /**
   * Проверка авторизации пользователя
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Получение текущего токена
   */
  getToken() {
    return this.token;
  }

  /**
   * Получение данных пользователя
   */
  getUser() {
    return this.user;
  }

  /**
   * Валидация токена
   */
  async validateToken() {
    if (!this.token) return false;
    
    try {
      await apiService.getMe();
      return true;
    } catch (error) {
      console.warn('Токен невалиден:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Создание временного пользователя на основе токена
   */
  _createTempUserFromToken(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub || payload.user_id || 'unknown',
        email: payload.email || payload.sub || 'unknown@example.com',
        fullName: payload.username || payload.sub?.split('@')[0] || 'Пользователь',
        role: payload.role || 'User',
        email_verified: false
      };
    } catch (error) {
      return {
        id: 'unknown',
        email: 'unknown@example.com',
        fullName: 'Пользователь',
        role: 'User',
        email_verified: false
      };
    }
  }
}

export const authService = new AuthService();