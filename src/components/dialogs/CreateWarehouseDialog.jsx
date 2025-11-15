// components/CreateWarehouseDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography
} from '@mui/material';

const CreateWarehouseDialog = ({ open, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'MAIN',
    address: {
      country: 'Россия',
      city: '',
      street: '',
      postalCode: ''
    },
    contact_person: {
      name: '',
      phone: '',
      email: ''
    },
    settings: {
      allowNegativeStock: false,
      requireApproval: false,
      autoPrintLabels: false,
      barcodeType: 'EAN13'
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Валидация email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Валидация телефона (базовая)
  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // Валидация минимальной длины (минимум 3 символа)
  const validateMinLength = (value, minLength = 3) => {
    return value && value.trim().length >= minLength;
  };

  const validateForm = () => {
    const newErrors = {};

    // Обязательные поля с минимальной длиной
    if (!formData.name.trim()) {
      newErrors.name = 'Название склада обязательно';
    } else if (!validateMinLength(formData.name)) {
      newErrors.name = 'Название должно содержать минимум 3 символа';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Код склада обязателен';
    } else if (!validateMinLength(formData.code)) {
      newErrors.code = 'Код должен содержать минимум 3 символа';
    }

    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'Город обязателен';
    }

    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Улица обязательна';
    }

    // Валидация email
    if (formData.contact_person.email && !validateEmail(formData.contact_person.email)) {
      newErrors['contact_person.email'] = 'Введите корректный email адрес';
    }

    // Валидация телефона
    if (formData.contact_person.phone && !validatePhone(formData.contact_person.phone)) {
      newErrors['contact_person.phone'] = 'Введите корректный номер телефона';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onCreate(formData);
      handleClose();
    } catch (error) {
      console.error('Ошибка при создании склада:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Сбрасываем форму при закрытии
    setFormData({
      name: '',
      code: '',
      type: 'MAIN',
      address: {
        country: 'Россия',
        city: '',
        street: '',
        postalCode: ''
      },
      contact_person: {
        name: '',
        phone: '',
        email: ''
      },
      settings: {
        allowNegativeStock: false,
        requireApproval: false,
        autoPrintLabels: false,
        barcodeType: 'EAN13'
      }
    });
    setErrors({});
    onClose();
  };

  const handleChange = (path, value) => {
    setFormData(prev => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const nested = keys.reduce((obj, key) => obj[key], prev);
      nested[lastKey] = value;
      return { ...prev };
    });

    // Очищаем ошибку при изменении поля
    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: '' }));
    }
  };

  const getError = (path) => {
    return errors[path] || '';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Создать новый склад
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>

            {/* Основная информация */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Основная информация
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Название склада *"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={!!getError('name')}
                helperText={getError('name') || 'Минимум 3 символа'}
                required
                inputProps={{
                  minLength: 3,
                  maxLength: 100
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Код склада *"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                error={!!getError('code')}
                helperText={getError('code') || 'Минимум 3 символа'}
                required
                inputProps={{
                  minLength: 3,
                  maxLength: 50
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Тип склада</InputLabel>
                <Select
                  value={formData.type}
                  label="Тип склада"
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <MenuItem value="MAIN">Основной</MenuItem>
                  <MenuItem value="RESERVE">Резервный</MenuItem>
                  <MenuItem value="RETAIL">Розничный</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Адрес */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Адрес
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Страна"
                value={formData.address.country}
                onChange={(e) => handleChange('address.country', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Город *"
                value={formData.address.city}
                onChange={(e) => handleChange('address.city', e.target.value)}
                error={!!getError('address.city')}
                helperText={getError('address.city')}
                required
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Улица, дом *"
                value={formData.address.street}
                onChange={(e) => handleChange('address.street', e.target.value)}
                error={!!getError('address.street')}
                helperText={getError('address.street')}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Почтовый индекс"
                value={formData.address.postalCode}
                onChange={(e) => handleChange('address.postalCode', e.target.value)}
              />
            </Grid>

            {/* Контактное лицо */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Контактное лицо
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Имя контактного лица"
                value={formData.contact_person.name}
                onChange={(e) => handleChange('contact_person.name', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Телефон"
                value={formData.contact_person.phone}
                onChange={(e) => handleChange('contact_person.phone', e.target.value)}
                error={!!getError('contact_person.phone')}
                helperText={getError('contact_person.phone') || 'Формат: +79123456789'}
                placeholder="+79123456789"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.contact_person.email}
                onChange={(e) => handleChange('contact_person.email', e.target.value)}
                error={!!getError('contact_person.email')}
                helperText={getError('contact_person.email') || 'example@domain.com'}
                placeholder="example@domain.com"
              />
            </Grid>

            {/* Настройки */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Настройки склада
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.settings.allowNegativeStock}
                    onChange={(e) => handleChange('settings.allowNegativeStock', e.target.checked)}
                  />
                }
                label="Разрешить отрицательный остаток"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.settings.requireApproval}
                    onChange={(e) => handleChange('settings.requireApproval', e.target.checked)}
                  />
                }
                label="Требовать подтверждение операций"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.settings.autoPrintLabels}
                    onChange={(e) => handleChange('settings.autoPrintLabels', e.target.checked)}
                  />
                }
                label="Автопечать этикеток"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Тип штрих-кода</InputLabel>
                <Select
                  value={formData.settings.barcodeType}
                  label="Тип штрих-кода"
                  onChange={(e) => handleChange('settings.barcodeType', e.target.value)}
                >
                  <MenuItem value="EAN13">EAN-13</MenuItem>
                  <MenuItem value="CODE128">CODE-128</MenuItem>
                  <MenuItem value="QR">QR Code</MenuItem>
                </Select>
              </FormControl>
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            style={{ color: '#10b981', borderColor: '#10b981' }}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            style={{ 
              backgroundColor: '#10b981', 
              color: 'white',
              '&:hover': { backgroundColor: '#059669' }
            }}
          >
            {loading ? 'Создание...' : 'Создать склад'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateWarehouseDialog;