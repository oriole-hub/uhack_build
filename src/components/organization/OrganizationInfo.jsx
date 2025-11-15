import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Button
} from '@mui/material';
import { Edit as EditIcon, QrCode as QrCodeIcon } from '@mui/icons-material';
import '../css/styles.scss';
import '../css/OrganizationInfo.scss';

const OrganizationInfo = ({ organization, onEdit, onShowQr }) => {
  /** Возвращает строку адреса */
  const getAddressString = () => {
    if (!organization.address) return 'Не указано';

    const { country, city, street, addressLine1, addressLine2 } = organization.address;
    const addressParts = [country, city, street, addressLine1, addressLine2].filter(Boolean);

    return addressParts.length > 0 ? addressParts.join(', ') : 'Не указано';
  };

  /** Получает значение настройки */
  const getSetting = (key, defaultValue) => {
    if (!organization.settings) return defaultValue;

    return organization.settings[key] || defaultValue;
  };

  /** Проверяет валидность названия */
  const isValidName = (value) => {
    if (!value || typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (trimmed === 'string' || trimmed === '') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(trimmed)) return false;
    if (trimmed === organization.id) return false;
    return true;
  };

  /** Возвращает отображаемое название */
  const getDisplayName = () => {
    if (isValidName(organization.legalName)) {
      return organization.legalName;
    }
    if (isValidName(organization.name)) {
      return organization.name;
    }
    return 'Не указано';
  };

  const displayName = getDisplayName();
  const mainInfoItems = [
    {
      label: 'ID:',
      value: organization.id,
      key: 'id'
    },
    {
      label: 'Название:',
      value: displayName,
      key: 'name'
    },
    {
      label: 'Юридическое название:',
      value: isValidName(organization.legalName) ? organization.legalName : 'Не указано',
      key: 'legalName'
    },
    {
      label: 'Описание:',
      value: organization.description,
      key: 'description'
    },
    {
      label: 'ИНН:',
      value: organization.inn,
      key: 'inn'
    },
    {
      label: 'Адрес:',
      value: getAddressString(),
      key: 'address'
    },
    {
      label: 'Количество участников:',
      value: organization.members_count || (organization.members ? organization.members.length : 0),
      key: 'membersCount'
    },
    {
      label: 'Дата создания:',
      value: organization.createdAt ? new Date(organization.createdAt).toLocaleDateString('ru-RU') : 'Не указана',
      key: 'createdAt'
    }
  ];

  // Настройки
  const settingsItems = [
    {
      label: 'Валюта:',
      value: getSetting('currency', 'RUB'),
      key: 'currency'
    },
    {
      label: 'Язык:',
      value: getSetting('language', 'ru'),
      key: 'language'
    },
    {
      label: 'Часовой пояс:',
      value: getSetting('timezone', 'Europe/Moscow'),
      key: 'timezone'
    },
    {
      label: 'Резервное копирование:',
      value: getSetting('autoBackup', false) ? 'Включено' : 'Отключено',
      key: 'autoBackup'
    },
    ...(getSetting('autoBackup', false) ? [{
      label: 'Частота бэкапа:',
      value: getSetting('backupFrequency', 'DAILY'),
      key: 'backupFrequency'
    }] : [])
  ];

  // Компонент элемента информации
  const InfoItem = ({ label, value }) => (
    <Box className="info-item">
      <Typography variant="body2" color="textSecondary" className="info-label">
        {label}
      </Typography>
      <Typography variant="body2" className="info-value">
        {value || 'Не указано'}
      </Typography>
    </Box>
  );

  // Компонент карточки информации
  const InfoCard = ({ title, items, showEditButton = false, showQrButton = false }) => (
    <Card className="info-card">
      <CardContent>
        <Box className="card-header">
          <Typography variant="h6" className="card-title">
            {title}
          </Typography>
          <Box className="card-actions">
            {showQrButton && (
              <Button
                variant="outlined"
                startIcon={<QrCodeIcon />}
                onClick={onShowQr}
                size="small"
                className="qr-button"
                title="Показать QR-код организации"
              >
                QR-код
              </Button>
            )}
            {showEditButton && (
              <IconButton
                onClick={onEdit}
                size="small"
                className="edit-button"
                title="Редактировать организацию"
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>
        </Box>
        <Box className="info-list">
          {items.map((item) => (
            <InfoItem
              key={item.key}
              label={item.label}
              value={item.value}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <div className="organization-info">
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Основная информация"
            items={mainInfoItems}
            showEditButton={true}
            showQrButton={true}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Настройки"
            items={settingsItems}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default OrganizationInfo;