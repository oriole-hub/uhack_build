// src/components/VerificationPage/VerificationPage.jsx
import React, { useState } from 'react';
import { useTheme } from '../../../theme/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './VerificationPage.scss';

export default function VerificationPage() {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: location.state?.email || localStorage.getItem('pendingVerificationEmail') || '',
    code: ''
  });

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.code) {
      setError('Пожалуйста, введите email и код подтверждения');
      return;
    }

    if (formData.code.length !== 6) {
      setError('Код подтверждения должен содержать 6 цифр');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('https://rsue.devoriole.ru/api/auth/verify', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          code: formData.code
        })
      });

      console.log('Verification response status:', response.status);

      const responseText = await response.text();
      console.log('Raw verification response:', responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        data = { detail: responseText };
      }

      if (response.ok) {
        setSuccess('Email успешно подтвержден! Перенаправление на страницу входа...');
        localStorage.removeItem('pendingVerificationEmail');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.detail || data.error || 'Ошибка подтверждения. Пожалуйста, проверьте код и попробуйте снова.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Ошибка сети. Пожалуйста, проверьте подключение и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!formData.email) {
      setError('Email обязателен для повторной отправки кода');
      return;
    }

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Resending code to:', formData.email);
      
      const response = await fetch('https://rsue.devoriole.ru/api/auth/resend', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        })
      });

      console.log('Resend response status:', response.status);

      const responseText = await response.text();
      console.log('Raw resend response:', responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        data = { detail: responseText };
      }

      if (response.ok) {
        setSuccess('Новый код подтверждения отправлен на ваш email!');
      } else {
        setError(data.detail || data.error || 'Ошибка повторной отправки кода. Пожалуйста, попробуйте снова.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError('Ошибка сети. Пожалуйста, проверьте подключение и попробуйте снова.');
    } finally {
      setResendLoading(false);
    }
  };

  const isVerifyDisabled = loading || !formData.email || !formData.code || formData.code.length !== 6;
  const isResendDisabled = resendLoading || !formData.email;

  return (
    <div className="verification-page" style={{ backgroundColor: theme.PAGE_BG }}>
      <div className="verification-card" style={{ backgroundColor: theme.CARD }}>
        <div className="verification-form">
          <div 
            className="verification-header" 
            style={{ borderBottomColor: isDark ? '#ffffff' : theme.TITLE_TEXT, flexDirection: 'row', alignItems: 'center', gap: '15px' }}
          >
            <h1 className="verification-title" style={{ color: theme.TITLE_TEXT, margin: 0 }}>Подтверждение Email</h1>
            <img
              src={`/assets/icons/main_logo_icon_${isDark ? 'white' : 'black'}.svg`}
              alt="Logo"
              style={{ height: '28px', width: 'auto' }}
            />
          </div>

          <p className="verification-description" style={{ color: theme.LABEL_TEXT }}>
            Мы отправили 6-значный код подтверждения на <strong>{formData.email}</strong>. Пожалуйста, введите код ниже для подтверждения вашего аккаунта.
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <form className="verification-fields" onSubmit={handleVerify}>
            <input
              type="email"
              name="email"
              placeholder="Email адрес"
              className={`verification-input ${focusedField === 'email' ? 'focused' : ''}`}
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

            <input
              type="text"
              name="code"
              placeholder="Введите 6-значный код"
              className={`verification-input ${focusedField === 'code' ? 'focused' : ''}`}
              value={formData.code}
              onChange={handleChange}
              onFocus={() => setFocusedField('code')}
              onBlur={() => setFocusedField(null)}
              maxLength={6}
               style={{
                borderColor: focusedField === 'code' ? theme.ACCENT : (formData.code ? theme.ACCENT : theme.INPUT_BORDER),
                backgroundColor: isDark ? '#1a1a1a' : theme.INPUT_BG,
                color: isDark ? '#ffffff' : theme.INPUT_TEXT,
              }}
            />

            <div className="verification-actions">
              <button
                type="button"
                className="resend-btn"
                onClick={handleResendCode}
                disabled={isResendDisabled}
                style={{
                  color: isResendDisabled ? theme.LABEL_TEXT : theme.ACCENT,
                  backgroundColor: 'transparent',
                  cursor: isResendDisabled ? 'not-allowed' : 'pointer',
                  opacity: isResendDisabled ? 0.6 : 1
                }}
              >
                {resendLoading ? 'Отправка...' : 'Отправить код повторно'}
              </button>
            </div>

            <button
              type="submit"
              className="verify-btn"
              disabled={isVerifyDisabled}
              style={{
                backgroundColor: isVerifyDisabled ? theme.BTN : theme.ACCENT,
                color: isVerifyDisabled ? theme.LABEL_TEXT : '#000',
                cursor: isVerifyDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Проверка...' : 'Подтвердить Email'}
            </button>
          </form>

          <div 
            className="verification-footer" 
            style={{ borderTopColor: isDark ? '#ffffff' : theme.TITLE_TEXT }}
          >
            <p className="verification-link" style={{ color: theme.LABEL_TEXT }}>
              Помните пароль?{' '}
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