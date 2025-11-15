/**
 * Утилиты для работы с JWT токенами
 */

/**
 * Декодирование JWT токена
 * @param {string} token - JWT токен
 * @returns {object|null} - Декодированный payload
 */
export const decodeJWT = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Ошибка декодирования JWT:', error);
    return null;
  }
};

/**
 * Проверка срока действия JWT токена
 * @param {string} token - JWT токен
 * @returns {boolean} - true если токен истек
 */
export const isJWTExpired = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const exp = payload.exp * 1000; // Convert to milliseconds
  return Date.now() >= exp;
};

/**
 * Получение времени до истечения токена
 * @param {string} token - JWT токен
 * @returns {number} - Время в миллисекундах до истечения
 */
export const getTimeUntilExpiry = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const exp = payload.exp * 1000;
  return Math.max(0, exp - Date.now());
};

/**
 * Проверка формата JWT токена
 * @param {string} token - JWT токен
 * @returns {boolean} - true если формат корректный
 */
export const isValidJWTFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    // Проверяем, что все части могут быть декодированы из base64
    atob(parts[0]);
    atob(parts[1]);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Извлечение данных пользователя из JWT токена
 * @param {string} token - JWT токен
 * @returns {object} - Данные пользователя
 */
export const extractUserFromJWT = (token) => {
  const payload = decodeJWT(token);
  if (!payload) {
    return {
      id: 'unknown',
      email: 'unknown@example.com',
      role: 'User'
    };
  }

  return {
    id: payload.user_id || payload.sub || 'unknown',
    email: payload.sub || 'unknown@example.com',
    role: payload.role || 'User',
    exp: payload.exp
  };
};