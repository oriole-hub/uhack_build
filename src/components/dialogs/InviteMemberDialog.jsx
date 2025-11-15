import React, { useState } from 'react';
import '../css/styles.scss';
import '../css/Dialogs.scss';

const InviteMemberDialog = ({ open, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');

  const handleSubmit = (e) => {
    e.preventDefault();
    onInvite(email, role);
    setEmail('');
    setRole('USER');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  if (!open) return null;

  return (
    <div className="dialog-overlay active" onClick={handleOverlayClick}>
      <div className="dialog-content create-organization-dialog" onClick={handleContentClick}>
        <div className="dialog-header">
          <h2>Пригласить участника</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label className="form-label">Роль</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">Пользователь</option>
                <option value="ADMIN">Администратор</option>
              </select>
            </div>
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="btn btn-outlined"
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-contained"
            >
              Пригласить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberDialog;
