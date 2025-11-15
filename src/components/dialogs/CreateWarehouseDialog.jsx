// components/CreateWarehouseDialog.jsx
import React, { useState } from 'react';
import '../css/styles.scss';
import '../css/Dialogs.scss';

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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
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
          <h2>Создать новый склад</h2>
          <button className="dialog-close" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-grid">
            {/* Основная информация */}
            <div className="form-section">
              <h4>Основная информация</h4>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-row">
                  <label className="form-label">Название склада *</label>
                  <input
                    type="text"
                    className={`form-input ${getError('name') ? 'error' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Минимум 3 символа"
                    required
                    minLength={3}
                    maxLength={100}
                    disabled={loading}
                  />
                  {getError('name') && <div className="error-text">{getError('name')}</div>}
                  {!getError('name') && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Минимум 3 символа</div>}
                </div>

                <div className="form-row">
                  <label className="form-label">Код склада *</label>
                  <input
                    type="text"
                    className={`form-input ${getError('code') ? 'error' : ''}`}
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    placeholder="Минимум 3 символа"
                    required
                    minLength={3}
                    maxLength={50}
                    disabled={loading}
                  />
                  {getError('code') && <div className="error-text">{getError('code')}</div>}
                  {!getError('code') && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Минимум 3 символа</div>}
                </div>

                <div className="form-row">
                  <label className="form-label">Тип склада</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    disabled={loading}
                  >
                    <option value="MAIN">Основной</option>
                    <option value="RESERVE">Резервный</option>
                    <option value="RETAIL">Розничный</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Адрес */}
            <div className="form-section">
              <h4>Адрес</h4>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-row">
                  <label className="form-label">Страна</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address.country}
                    onChange={(e) => handleChange('address.country', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <label className="form-label">Город *</label>
                  <input
                    type="text"
                    className={`form-input ${getError('address.city') ? 'error' : ''}`}
                    value={formData.address.city}
                    onChange={(e) => handleChange('address.city', e.target.value)}
                    required
                    disabled={loading}
                  />
                  {getError('address.city') && <div className="error-text">{getError('address.city')}</div>}
                </div>

                <div className="form-row" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Улица, дом *</label>
                  <input
                    type="text"
                    className={`form-input ${getError('address.street') ? 'error' : ''}`}
                    value={formData.address.street}
                    onChange={(e) => handleChange('address.street', e.target.value)}
                    required
                    disabled={loading}
                  />
                  {getError('address.street') && <div className="error-text">{getError('address.street')}</div>}
                </div>

                <div className="form-row">
                  <label className="form-label">Почтовый индекс</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address.postalCode}
                    onChange={(e) => handleChange('address.postalCode', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Контактное лицо */}
            <div className="form-section">
              <h4>Контактное лицо</h4>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-row">
                  <label className="form-label">Имя контактного лица</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.contact_person.name}
                    onChange={(e) => handleChange('contact_person.name', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <label className="form-label">Телефон</label>
                  <input
                    type="tel"
                    className={`form-input ${getError('contact_person.phone') ? 'error' : ''}`}
                    value={formData.contact_person.phone}
                    onChange={(e) => handleChange('contact_person.phone', e.target.value)}
                    placeholder="+79123456789"
                    disabled={loading}
                  />
                  {getError('contact_person.phone') && <div className="error-text">{getError('contact_person.phone')}</div>}
                  {!getError('contact_person.phone') && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Формат: +79123456789</div>}
                </div>

                <div className="form-row" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-input ${getError('contact_person.email') ? 'error' : ''}`}
                    value={formData.contact_person.email}
                    onChange={(e) => handleChange('contact_person.email', e.target.value)}
                    placeholder="example@domain.com"
                    disabled={loading}
                  />
                  {getError('contact_person.email') && <div className="error-text">{getError('contact_person.email')}</div>}
                  {!getError('contact_person.email') && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>example@domain.com</div>}
                </div>
              </div>
            </div>

            {/* Настройки */}
            <div className="form-section">
              <h4>Настройки склада</h4>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-row form-checkbox">
                  <input
                    type="checkbox"
                    id="allowNegativeStock"
                    checked={formData.settings.allowNegativeStock}
                    onChange={(e) => handleChange('settings.allowNegativeStock', e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor="allowNegativeStock" className="form-label-checkbox">Разрешить отрицательный остаток</label>
                </div>

                <div className="form-row form-checkbox">
                  <input
                    type="checkbox"
                    id="requireApproval"
                    checked={formData.settings.requireApproval}
                    onChange={(e) => handleChange('settings.requireApproval', e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor="requireApproval" className="form-label-checkbox">Требовать подтверждение операций</label>
                </div>

                <div className="form-row form-checkbox">
                  <input
                    type="checkbox"
                    id="autoPrintLabels"
                    checked={formData.settings.autoPrintLabels}
                    onChange={(e) => handleChange('settings.autoPrintLabels', e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor="autoPrintLabels" className="form-label-checkbox">Автопечать этикеток</label>
                </div>

                <div className="form-row">
                  <label className="form-label">Тип штрих-кода</label>
                  <select
                    className="form-select"
                    value={formData.settings.barcodeType}
                    onChange={(e) => handleChange('settings.barcodeType', e.target.value)}
                    disabled={loading}
                  >
                    <option value="EAN13">EAN-13</option>
                    <option value="CODE128">CODE-128</option>
                    <option value="QR">QR Code</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="btn btn-outlined"
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-contained"
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать склад'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWarehouseDialog;
