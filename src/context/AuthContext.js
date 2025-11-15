import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Проверяем токен при загрузке приложения
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
        } else {
          // Если не удалось получить пользователя, но токен есть
          const savedUser = authService.getUser();
          if (savedUser) {
            setUser(savedUser);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка при проверке авторизации:', error);
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const inviteToken = localStorage.getItem('invite_token');
      const result = await authService.login(credentials, inviteToken);

      if (result.success) {
        setUser(result.user);
        navigate('/dashboard');
      }

      return result;
    } catch (error) {
      console.error('Ошибка при логине:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithToken = async (token) => {
    try {
      setLoading(true);
      const result = await authService.loginWithToken(token);
      
      if (result.success) {
        setUser(result.user);
        navigate('/dashboard');
      }
      
      return result;
    } catch (error) {
      console.error('Ошибка при логине с токеном:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const inviteToken = localStorage.getItem('invite_token');
      const result = await authService.register(userData, inviteToken);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    login,
    loginWithToken,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};