// src/components/LoginPage/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './LoginPage.scss';

export default function LoginPage() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [hasInviteToken, setHasInviteToken] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  /** Проверяет и сохраняет токен приглашения из URL при загрузке */
  useEffect(() => {
    const inviteToken = searchParams.get('invite');
    if (inviteToken) {
      localStorage.setItem('invite_token', inviteToken);
      setHasInviteToken(true);
    } else {
      // Проверяем, есть ли уже сохраненный токен
      const savedToken = localStorage.getItem('invite_token');
      setHasInviteToken(!!savedToken);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Пожалуйста, заполните все поля');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError('Пожалуйста, введите действительный адрес электронной почты');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setError('');

    const result = await login(formData);

    if (result.success) {
      // Успешный логин - редирект без сообщения
      navigate('/dashboard');
    } else {
      setError(result.error || 'Ошибка входа. Пожалуйста, попробуйте снова.');
    }
  };
  
  const isFormFilled = formData.email && formData.password;

  return (
    <div className="login-page" style={{ backgroundColor: theme.PAGE_BG }}>
      <div className="login-card" style={{ backgroundColor: theme.CARD }}>
        <div className="login-form">
          <div 
            className="login-header" 
            style={{ borderBottomColor: isDark ? '#ffffff' : theme.TITLE_TEXT, flexDirection: 'row', alignItems: 'center', gap: '15px' }}
          >
            <h1 className="login-title" style={{ color: theme.TITLE_TEXT, margin: 0 }}>Вход</h1>
            <img 
              src={`/assets/icons/main_logo_icon_${isDark ? 'white' : 'black'}.svg`}
              alt="Logo"
              style={{ height: '32px', width: 'auto' }}
            />
          </div>

          {hasInviteToken && (
            <div style={{ 
              color: theme.ACCENT, 
              marginBottom: '15px', 
              textAlign: 'center',
              padding: '10px',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              borderRadius: '5px',
              border: `1px solid ${theme.ACCENT}`
            }}>
              Вы приглашены в организацию
            </div>
          )}

          {error && (
            <div style={{ 
              color: '#ff6b6b', 
              marginBottom: '15px', 
              textAlign: 'center',
              padding: '10px',
              backgroundColor: 'rgba(255,107,107,0.1)',
              borderRadius: '5px',
              border: '1px solid #ff6b6b'
            }}>
              {error}
            </div>
          )}

          <form className="login-fields" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={`login-input ${formData.email ? 'filled' : ''} ${focusedField === 'email' ? 'focused' : ''}`}
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              style={{
                borderColor: focusedField === 'email' ? theme.ACCENT : (formData.email ? theme.ACCENT : theme.INPUT_BORDER),
                backgroundColor: isDark ? '#1a1a1a' : theme.INPUT_BG,
                color: isDark ? '#ffffff' : theme.INPUT_TEXT,
              }}
            />

            <div className={`password-field ${formData.password ? 'filled' : ''} ${focusedField === 'password' ? 'focused' : ''}`}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Пароль"
                className="login-input"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={{
                  borderColor: focusedField === 'password' ? theme.ACCENT : (formData.password ? theme.ACCENT : theme.INPUT_BORDER),
                  backgroundColor: isDark ? '#1a1a1a' : theme.INPUT_BG,
                  color: isDark ? '#ffffff' : theme.INPUT_TEXT,
                }}
              />
              <img
                src={showPassword ? "/assets/LoginPage/eye-on.png" : "/assets/LoginPage/eye-off.png"}
                alt="переключить видимость пароля"
                className="eye-icon"
                onClick={() => setShowPassword(prev => !prev)}
                style={{ filter: theme.EYE_ICON_FILTER }}
              />
            </div>

            {/* Добавлена кнопка внутри формы для корректной работы Enter */}
            <button
              type="submit"
              className={`login-btn ${isFormFilled ? 'active' : ''}`}
              disabled={!isFormFilled || loading}
              style={{
                backgroundColor: isFormFilled ? theme.ACCENT : theme.BTN,
                color: isFormFilled ? '#000' : theme.LABEL_TEXT,
                marginTop: '20px'
              }}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div 
            className="login-footer" 
            style={{ borderTopColor: isDark ? '#ffffff' : theme.TITLE_TEXT }}
          >
            <p className="login-link" style={{ color: theme.LABEL_TEXT }}>
              Нет аккаунта?{' '}
              <span 
                onClick={() => navigate('/register')} 
                style={{ 
                  color: theme.ACCENT, 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  textDecoration: 'underline'
                }}
              >
                Зарегистрироваться
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="right-art">
        <img 
          src={`/assets/LoginPage/oriole${isDark ? '_b' : '_l'}.svg`} 
          alt="O-Gate" 
        />
      </div>

      <button className="theme-toggle-btn" onClick={toggleTheme}>
        <img
          src={`/assets/LoginPage/${isDark ? 'sun' : 'moon'}.svg`}
          alt="Toggle theme"
        />
      </button>
    </div>
  );
}