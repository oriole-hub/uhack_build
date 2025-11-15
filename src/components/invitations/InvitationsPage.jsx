import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import '../css/styles.scss';
import './InvitationsPage.scss';

const InvitationsPage = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState({});

  const normalizeStatus = (status) => {
    if (!status) return 'pending';
    return status.toString().toLowerCase();
  };

  const getStatusLabel = (status) => {
    const value = normalizeStatus(status);
    switch (value) {
      case 'accepted':
        return 'Принято';
      case 'declined':
        return 'Отклонено';
      case 'pending':
        return 'Ожидает ответа';
      default:
        return status || 'Неизвестно';
    }
  };

  const extractInvitations = (payload) => {
    if (!payload) return [];
    const candidates = [
      payload.invitations,
      payload.data?.invitations,
      payload.dashboard?.invitations,
      payload.user?.invitations,
      payload.results,
      payload.items,
      Array.isArray(payload) ? payload : null
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }
    return [];
  };

  const normalizeInvitation = (raw) => {
    if (!raw) return null;
    const organization = raw.organization || raw.org || raw.organization_info || raw.organization_data || {};
    const normalizedStatus = normalizeStatus(raw.status || raw.state || raw.invitation_status);

    return {
      id: (raw.id || raw.invitation_id || raw.uuid || raw.code || '').toString(),
      organization_name:
        raw.organization_name ||
        organization.legal_name ||
        organization.legalName ||
        organization.name ||
        'Организация',
      role: raw.role || raw.invited_role || raw.member_role || 'USER',
      status: normalizedStatus,
      created_at: raw.created_at || raw.createdAt || raw.created || null,
      expires_at: raw.expires_at || raw.expiresAt || raw.expires || null,
    };
  };

  const loadInvitations = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      setError('');
      const dashboard = await apiService.getUserDashboard();
      const rawInvitations = extractInvitations(dashboard);
      const normalized = rawInvitations
        .map((item) => normalizeInvitation(item))
        .filter(Boolean);
      setInvitations(normalized);
    } catch (err) {
      console.error('Ошибка загрузки приглашений:', err);
      setError(err?.message || 'Ошибка загрузки приглашений');
      setInvitations([]);
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  /** Принимает приглашение */
  const handleAccept = async (invitationId) => {
    try {
      setProcessing(prev => ({ ...prev, [invitationId]: 'accept' }));
      setError('');
      const response = await apiService.respondToInvitation(invitationId, 'accept');
      console.log('✅ Приглашение принято:', response);
      await loadInvitations(false);
    } catch (err) {
      console.error('❌ Ошибка принятия приглашения:', err);
      const errorMessage = err?.message || 'Ошибка принятия приглашения';
      setError(errorMessage);
      // Показываем ошибку на 5 секунд
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessing(prev => {
        const newState = { ...prev };
        delete newState[invitationId];
        return newState;
      });
    }
  };

  /** Отклоняет приглашение */
  const handleDecline = async (invitationId) => {
    if (!window.confirm('Вы уверены, что хотите отклонить это приглашение?')) {
      return;
    }

    try {
      setProcessing(prev => ({ ...prev, [invitationId]: 'decline' }));
      setError('');
      const response = await apiService.respondToInvitation(invitationId, 'decline');
      console.log('✅ Приглашение отклонено:', response);
      await loadInvitations(false);
    } catch (err) {
      console.error('❌ Ошибка отклонения приглашения:', err);
      const errorMessage = err?.message || 'Ошибка отклонения приглашения';
      setError(errorMessage);
      // Показываем ошибку на 5 секунд
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessing(prev => {
        const newState = { ...prev };
        delete newState[invitationId];
        return newState;
      });
    }
  };

  /** Форматирует дату */
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Не указано';
    }
  };

  if (loading) {
    return (
      <div className={`invitations-page ${isDark ? 'dark-mode' : ''}`}>
        <div className="loading">Загрузка приглашений...</div>
      </div>
    );
  }

  return (
    <div className={`invitations-page ${isDark ? 'dark-mode' : ''}`}>
      <div className="invitations-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            className="btn-back" 
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              color: isDark ? '#ffffff' : '#1a1a1a'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            ← Назад
          </button>
          <h1>Входящие приглашения</h1>
        </div>
        <button className="btn-refresh" onClick={loadInvitations}>
          Обновить
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {invitations.length === 0 ? (
        <div className="empty-state">
          <p>У вас нет входящих приглашений</p>
        </div>
      ) : (
        <div className="invitations-list">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="invitation-card">
              <div className="invitation-info">
                <h3 className="invitation-organization">
                  {invitation.organization_name || 'Организация'}
                </h3>
                <div className="invitation-details">
                  <div className="invitation-field">
                    <span className="field-label">Роль:</span>
                    <span className="field-value">{invitation.role || 'User'}</span>
                  </div>
                  {invitation.created_at && (
                    <div className="invitation-field">
                      <span className="field-label">Дата создания:</span>
                      <span className="field-value">{formatDate(invitation.created_at)}</span>
                    </div>
                  )}
                  {invitation.expires_at && (
                    <div className="invitation-field">
                      <span className="field-label">Действительно до:</span>
                      <span className="field-value">{formatDate(invitation.expires_at)}</span>
                    </div>
                  )}
                  {invitation.status && (
                    <div className="invitation-field">
                      <span className="field-label">Статус:</span>
                      <span className={`field-value status-${invitation.status}`}>
                        {getStatusLabel(invitation.status)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="invitation-actions">
                <button
                  className="btn-accept"
                  onClick={() => handleAccept(invitation.id)}
                  disabled={processing[invitation.id] === 'accept' || invitation.status === 'accepted'}
                >
                  {processing[invitation.id] === 'accept' ? 'Принятие...' : 'Принять'}
                </button>
                <button
                  className="btn-decline"
                  onClick={() => handleDecline(invitation.id)}
                  disabled={processing[invitation.id] === 'decline' || invitation.status === 'declined'}
                >
                  {processing[invitation.id] === 'decline' ? 'Отклонение...' : 'Отклонить'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvitationsPage;

