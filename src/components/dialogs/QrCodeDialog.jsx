// components/QrCodeDialog.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import '../css/styles.scss';
import '../css/Dialogs.scss';

const QrCodeDialog = ({ open, onClose, organizationId, organizationName }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expiresIn, setExpiresIn] = useState(86400); // 24 часа по умолчанию

  const loadQrCode = async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);
    try {
      // Используем новый эндпоинт /api/offline/sklad/{sklad_id}/token
      // organizationId используется как sklad_id
      const data = await apiService.createOfflineSkladToken(organizationId, expiresIn);
      setQrData(data);
    } catch (error) {
      console.error('Ошибка загрузки QR-кода через /api/offline/sklad/{sklad_id}/token:', error);
      // Если новый эндпоинт не работает, пробуем старый метод
      try {
        console.log('Пробуем старый метод generateOfflineSkladQrCode...');
        const data = await apiService.generateOfflineSkladQrCode(organizationId, expiresIn);
        setQrData(data);
      } catch (fallbackError) {
        console.error('Ошибка загрузки QR-кода (fallback):', fallbackError);
        setError(`Не удалось загрузить QR-код: ${fallbackError.message || 'Неизвестная ошибка'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && organizationId) {
      loadQrCode();
    }
  }, [open, organizationId, expiresIn]);

  // Функция для удаления /api из URL
  const removeApiFromUrl = (url) => {
    if (!url) return url;
    return url.replace(/\/api\//, '/').replace(/\/api$/, '');
  };

  const handleCopyLink = async () => {
    if (qrData?.join_url) {
      try {
        const cleanUrl = removeApiFromUrl(qrData.join_url);
        await navigator.clipboard.writeText(cleanUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Ошибка копирования:', error);
      }
    }
  };

  const handleDownloadQr = () => {
    if (qrData?.qr_image) {
      const link = document.createElement('a');
      link.href = qrData.qr_image;
      link.download = `qr-code-${organizationId}.png`;
      link.click();
    }
  };

  const handleRefresh = () => {
    loadQrCode();
  };

  const formatExpiresAt = (expiresAt) => {
    if (!expiresAt) return '';
    const date = new Date(expiresAt);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilExpiry = (expiresAt) => {
    if (!expiresAt) return '';
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `истекает через ${diffHours}ч ${diffMinutes}м`;
    } else if (diffMinutes > 0) {
      return `истекает через ${diffMinutes} минут`;
    } else {
      return 'истек';
    }
  };

  const handleExpiresInChange = (value) => {
    const newValue = parseInt(value) || 3600;
    setExpiresIn(Math.max(3600, Math.min(604800, newValue))); // От 1 часа до 7 дней
  };

  const getExpiresInLabel = (seconds) => {
    const hours = seconds / 3600;
    if (hours >= 24) {
      const days = hours / 24;
      return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`;
    }
    return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'}`;
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <h2>QR-код организации</h2>
              {organizationName && (
                <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.9 }}>{organizationName}</div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="dialog-close"
                onClick={handleRefresh}
                disabled={loading}
                title="Обновить QR-код"
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1
                }}
              >
                ↻
              </button>
              <button 
                className="dialog-close" 
                onClick={onClose}
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="dialog-form" style={{ padding: '28px' }}>
          {/* Настройки срока действия */}
          <div className="form-row">
            <label className="form-label">Срок действия:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="number"
                className="form-input"
                value={expiresIn / 3600}
                onChange={(e) => handleExpiresInChange(e.target.value * 3600)}
                min={1}
                max={168}
                step={1}
                style={{ width: '80px' }}
              />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                часов ({getExpiresInLabel(expiresIn)})
              </span>
            </div>
          </div>

          {/* QR-код */}
          <div className="form-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px 0' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Генерация QR-кода...</div>
              </div>
            ) : error ? (
              <div className="error-text" style={{ padding: '16px', textAlign: 'center' }}>{error}</div>
            ) : qrData?.qr_image ? (
              <>
                <img
                  src={qrData.qr_image}
                  alt="QR Code"
                  style={{
                    width: '200px',
                    height: '200px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px',
                    background: 'white'
                  }}
                />
                <div style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                  {qrData.expires_at && (
                    <>
                      <div>{formatExpiresAt(qrData.expires_at)}</div>
                      <div style={{ color: getTimeUntilExpiry(qrData.expires_at).includes('истек') ? '#ef4444' : '#6b7280', marginTop: '4px' }}>
                        {getTimeUntilExpiry(qrData.expires_at)}
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* Ссылка для присоединения */}
          {qrData?.join_url && (
            <div className="form-row">
              <label className="form-label">Ссылка для присоединения:</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  value={removeApiFromUrl(qrData.join_url)}
                  readOnly
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-outlined"
                  onClick={handleCopyLink}
                  style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
                >
                  {copied ? 'Скопировано!' : 'Копировать'}
                </button>
              </div>
            </div>
          )}

          {/* Информация о токене */}
          {qrData?.token && (
            <div className="form-section" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>ℹ</span>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Токен приглашения:</h4>
              </div>
              <div style={{ fontSize: '13px', wordBreak: 'break-all', color: '#374151' }}>
                {qrData.token}
              </div>
            </div>
          )}

          {/* Инструкция */}
          <div className="form-section" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px' }}>ℹ</span>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Инструкция</h4>
            </div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              Отсканируйте QR-код или отправьте ссылку для присоединения к организации.
              Новые участники смогут присоединиться до истечения срока действия.
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button
            type="button"
            className="btn btn-outlined"
            onClick={onClose}
          >
            Закрыть
          </button>
          {qrData?.qr_image && (
            <button
              type="button"
              className="btn btn-contained"
              onClick={handleDownloadQr}
            >
              Скачать QR-код
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrCodeDialog;
