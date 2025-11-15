// src/components/RegisterPage/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './RegisterPage.scss';

export default function RegisterPage() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    companyName: '',
    role: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
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
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username?.trim()) newErrors.username = 'Требуется имя пользователя';
    if (!formData.email?.trim()) newErrors.email = 'Требуется email';
    // Телефон теперь необязательный
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Пожалуйста, введите действительный номер телефона';
    }
    if (!formData.password?.trim()) newErrors.password = 'Требуется пароль';
    if (!formData.companyName?.trim()) newErrors.companyName = 'Требуется название компании';
    if (!formData.role?.trim()) newErrors.role = 'Требуется роль';
    
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Пожалуйста, введите действительный адрес электронной почты';
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать не менее 6 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // В RegisterPage.jsx обновите handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setErrors({});

    const result = await register(formData);

    if (result.success) {
      // Сохраняем email для верификации
      localStorage.setItem('pendingVerificationEmail', formData.email);
      // Редирект на страницу верификации
      navigate('/verify', { state: { email: formData.email } });
    } else {
      setErrors({ general: result.error || 'Ошибка регистрации. Пожалуйста, попробуйте снова.' });
    }
  };

  // Проверяем заполненность обязательных полей (телефон необязательный)
  const isFormFilled = formData.username?.trim() && formData.email?.trim() && formData.password?.trim() && formData.companyName?.trim() && formData.role?.trim();

  return (
    <div className="register-page" style={{ backgroundColor: theme.PAGE_BG }}>
      <div className="register-card" style={{ backgroundColor: theme.CARD }}>
        <div className="register-form">
          <div 
            className="register-header" 
            style={{ borderBottomColor: isDark ? '#ffffff' : theme.TITLE_TEXT, flexDirection: 'row', alignItems: 'center', gap: '15px' }}
          >
            <h1 className="register-title" style={{ color: theme.TITLE_TEXT, margin: 0 }}>Регистрация</h1>
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

          {errors.general && (
            <div className="error-message" style={{
              padding: '10px',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              borderRadius: '6px',
              fontSize: '13px',
              textAlign: 'center',
              color: '#ff6b6b',
              marginBottom: '10px',
              border: '1px solid #ff6b6b'
            }}>
              {errors.general}
            </div>
          )}

          <form className="register-fields" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Имя пользователя"
              className={`register-input ${errors.username ? 'input-error' : ''} ${formData.username ? 'filled' : ''} ${focusedField === 'username' ? 'focused' : ''}`}
              value={formData.username}
              onChange={handleChange}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              style={{
                borderColor: focusedField === 'username' ? theme.ACCENT : (errors.username ? '#ff6b6b' : (formData.username ? theme.ACCENT : theme.INPUT_BORDER)),
                backgroundColor: isDark ? '#1a1a1a' : theme.INPUT_BG,
                color: isDark ? '#ffffff' : theme.INPUT_TEXT,
              }}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}

            <input
              type="email"
              name="email"
              placeholder="Email"
              className={`register-input ${errors.email ? 'input-error' : ''} ${formData.email ? 'filled' : ''} ${focusedField === 'email' ? 'focused' : ''}`}
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              style={{
                borderColor: focusedField === 'email' ? theme.ACCENT : (errors.email ? '#ff6b6b' : (formData.email ? theme.ACCENT : theme.INPUT_BORDER)),
                backgroundColor: isDark ? '#1a1a1a' : theme.INPUT_BG,
                color: isDark ? '#ffffff' : theme.INPUT_TEXT,
              }}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}

            <input
              type="tel"
              name="phone"
              placeholder="Телефон (необязательно)"
              className={`register-input ${errors.phone ? 'input-error' : ''} ${formData.phone ? 'filled' : ''} ${focusedField === 'phone' ? 'focused' : ''}`}
              value={formData.phone}
              onChange={handleChange}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              style={{
                borderColor: focusedField === 'phone' ? theme.ACCENT : (errors.phone ? '#ff6b6b' : (formData.phone ? theme.ACCENT : theme.INPUT_BORDER)),
                backgroundColor: isDark ? '#1a1a1a' : theme.INPUT_BG,
                color: isDark ? '#ffffff' : theme.INPUT_TEXT,
              }}
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}

            <input
              type="text"
              name="companyName"
              placeholder="Название компании"
              className={`register-input ${errors.companyName ? 'input-error' : ''} ${formData.companyName ? 'filled' : ''} ${focusedField === 'companyName' ? 'focused' : ''}`}
              value={formData.companyName}
              onChange={handleChange}
              onFocus={() => setFocusedField('companyName')}
              onBlur={() => setFocusedField(null)}
              style={{
                borderColor: focusedField === 'companyName' ? theme.ACCENT : (errors.companyName ? '#ff6b6b' : (formData.companyName ? theme.ACCENT : theme.INPUT_BORDER)),
                backgroundColor: isDark ? '#1a1a1a' : theme.INPUT_BG,
                color: isDark ? '#ffffff' : theme.INPUT_TEXT,
              }}
            />
            {errors.companyName && <div className="error-message">{errors.companyName}</div>}

            <select
              name="role"
              className={`role-select ${errors.role ? 'input-error' : ''} ${formData.role ? 'filled' : ''} ${focusedField === 'role' ? 'focused' : ''}`}
              value={formData.role}
              onChange={handleChange}
              onFocus={() => setFocusedField('role')}
              onBlur={() => setFocusedField(null)}
              style={{
                borderColor: focusedField === 'role' ? theme.ACCENT : (errors.role ? '#ff6b6b' : (formData.role ? theme.ACCENT : theme.INPUT_BORDER)),
                color: isDark ? '#ffffff' : (formData.role ? theme.LABEL_TEXT : '#ccc'),
                backgroundColor: isDark ? '#1a1a1a' : theme.CARD,
              }}
            >
              <option value="" disabled>Выберите роль</option>
              <option value="Founder">Основатель</option>
              <option value="Checker">Проверяющий</option>
            </select>
            {errors.role && <div className="error-message">{errors.role}</div>}

            <div className={`password-field ${formData.password ? 'filled' : ''} ${focusedField === 'password' ? 'focused' : ''}`}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Пароль"
                className={`register-input ${errors.password ? 'input-error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={{
                  borderColor: focusedField === 'password' ? theme.ACCENT : (errors.password ? '#ff6b6b' : (formData.password ? theme.ACCENT : theme.INPUT_BORDER)),
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
            {errors.password && <div className="error-message">{errors.password}</div>}
          </form>

          <div 
            className="register-footer" 
            style={{ borderTopColor: isDark ? '#ffffff' : theme.TITLE_TEXT }}
          >
            <p className="register-link" style={{ color: theme.LABEL_TEXT }}>
              Уже есть аккаунт?{' '}
              <span 
                onClick={() => navigate('/login')} 
                style={{ 
                  color: theme.ACCENT, 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  textDecoration: 'underline'
                }}
              >
                Войти
              </span>
            </p>
            
            <button
              type="submit"
              className={`register-btn ${isFormFilled ? 'active' : ''}`}
              disabled={!isFormFilled || loading}
              style={{
                backgroundColor: isFormFilled ? theme.ACCENT : theme.BTN,
                color: isFormFilled ? '#000' : theme.LABEL_TEXT,
              }}
              onClick={handleSubmit}
            >
              {loading ? 'Создание...' : 'Зарегистрироваться'}
            </button>
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