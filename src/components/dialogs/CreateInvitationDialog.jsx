import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { apiService } from '../../services/api';
import '../css/styles.scss';
import '../css/Dialogs.scss';

const CreateInvitationDialog = ({ open, onClose, organizationId, onSuccess }) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('User');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      // Сброс состояния при закрытии
      setEmail('');
      setFullName('');
      setPhone('');
      setRole('User');
      setError('');
    }
  }, [open]);

  /** Отправка приглашения */
  const handleSendInvitation = async (e) => {
    e?.preventDefault();
    
    if (!email.trim()) {
      setError('Email обязателен для заполнения');
      return;
    }

    setSending(true);
    setError('');

    try {
      // Определяем identifier_type и identifier_value
      // Приоритет: email > phone > fullName
      let identifierType = 'email';
      let identifierValue = email.trim();

      if (email.trim()) {
        identifierType = 'email';
        identifierValue = email.trim();
      } else if (phone.trim()) {
        identifierType = 'phone';
        identifierValue = phone.trim();
      } else if (fullName.trim()) {
        identifierType = 'full_name';
        identifierValue = fullName.trim();
      }

      await apiService.createInvitation(organizationId, {
        identifier_type: identifierType,
        identifier_value: identifierValue,
        role: role,
        expires_in_hours: 168 // 7 дней по умолчанию
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Ошибка создания приглашения:', err);
      setError(err.message || 'Ошибка создания приглашения');
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className={`dialog-overlay ${open ? 'active' : ''}`} onClick={onClose}>
      <div 
        className={`dialog-content create-invitation-dialog ${isDark ? 'dark-mode' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <h2 className="dialog-title">Создать приглашение</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          <form onSubmit={handleSendInvitation}>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">ФИО *</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иванов Иван Иванович"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Телефон</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67"
              />
              <small className="form-hint">Необязательное поле</small>
            </div>

            <div className="form-group">
              <label className="form-label">Роль</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="User">Пользователь</option>
                <option value="Admin">Администратор</option>
              </select>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="dialog-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending || !email.trim() || !fullName.trim()}
              >
                {sending ? 'Отправка...' : 'Отправить приглашение'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateInvitationDialog;
