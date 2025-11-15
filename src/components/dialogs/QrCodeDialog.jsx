// components/QrCodeDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import { apiService } from '../../services/api';

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
      const data = await apiService.generateOrganizationQrCode(organizationId, expiresIn);
      setQrData(data);
    } catch (error) {
      console.error('Ошибка загрузки QR-кода:', error);
      setError('Не удалось загрузить QR-код');
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            QR-код организации
          </Typography>
          <Tooltip title="Обновить QR-код">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        {organizationName && (
          <Typography variant="body2" color="textSecondary">
            {organizationName}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Настройки срока действия */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2">
                Срок действия:
              </Typography>
              <TextField
                size="small"
                type="number"
                value={expiresIn / 3600}
                onChange={(e) => handleExpiresInChange(e.target.value * 3600)}
                inputProps={{
                  min: 1,
                  max: 168,
                  step: 1
                }}
                sx={{ width: 80 }}
              />
              <Typography variant="body2" color="textSecondary">
                часов ({getExpiresInLabel(expiresIn)})
              </Typography>
            </Box>
          </Grid>

          {/* QR-код */}
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              {loading ? (
                <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
                  <CircularProgress />
                  <Typography variant="body2" color="textSecondary">
                    Генерация QR-кода...
                  </Typography>
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ width: '100%' }}>
                  {error}
                </Alert>
              ) : qrData?.qr_image ? (
                <>
                  <Box
                    component="img"
                    src={qrData.qr_image}
                    alt="QR Code"
                    sx={{
                      width: 200,
                      height: 200,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  />

                  <Typography variant="body2" color="textSecondary" align="center">
                    {qrData.expires_at && (
                      <>
                        {formatExpiresAt(qrData.expires_at)}
                        <br />
                        <Typography
                          variant="caption"
                          color={getTimeUntilExpiry(qrData.expires_at).includes('истек') ? 'error' : 'textSecondary'}
                        >
                          {getTimeUntilExpiry(qrData.expires_at)}
                        </Typography>
                      </>
                    )}
                  </Typography>
                </>
              ) : null}
            </Box>
          </Grid>

          {/* Ссылка для присоединения */}
          {qrData?.join_url && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Ссылка для присоединения:
              </Typography>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  value={removeApiFromUrl(qrData.join_url)}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                />
                <Tooltip title={copied ? "Скопировано!" : "Копировать ссылку"}>
                  <IconButton onClick={handleCopyLink} color={copied ? "success" : "default"}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          )}

          {/* Информация о токене */}
          {qrData?.token && (
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  Токен приглашения: {qrData.token}
                </Typography>
              </Alert>
            </Grid>
          )}

          {/* Инструкция */}
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                Отсканируйте QR-код или отправьте ссылку для присоединения к организации.
                Новые участники смогут присоединиться до истечения срока действия.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Закрыть
        </Button>
        {qrData?.qr_image && (
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleDownloadQr}
            variant="outlined"
          >
            Скачать QR-код
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QrCodeDialog;