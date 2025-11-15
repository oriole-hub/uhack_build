import React, { useState } from 'react';
import '../css/styles.scss';
import '../css/Dialogs.scss';

const CreateOrganizationDialog = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    description: '',
    inn: '',
    kpp: '',
    address: {
      country: 'Россия',
      city: '',
      street: '',
      postalCode: ''
    },
    settings: {
      currency: 'RUB',
      language: 'ru',
      timezone: 'Europe/Moscow',
      autoBackup: true,
      backupFrequency: 'DAILY'
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Проверка имени (минимум 3 символа)
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Название должно содержать минимум 3 символа';
    }

    // Проверка ИНН (10 или 12 цифр)
    if (!formData.inn.trim()) {
      newErrors.inn = 'ИНН обязателен';
    } else {
      const innRegex = /^\d{10}$|^\d{12}$/;
      if (!innRegex.test(formData.inn)) {
        newErrors.inn = 'ИНН должен содержать 10 или 12 цифр';
      }
    }

    // Проверка КПП (9 цифр)
    if (!formData.kpp.trim()) {
      newErrors.kpp = 'КПП обязателен';
    } else {
      const kppRegex = /^\d{9}$/;
      if (!kppRegex.test(formData.kpp)) {
        newErrors.kpp = 'КПП должен содержать 9 цифр';
      }
    }

    // Проверка юридического названия
    if (!formData.legalName.trim()) {
      newErrors.legalName = 'Юридическое название обязательно';
    } else if (formData.legalName.trim().length < 3) {
      newErrors.legalName = 'Юридическое название должно содержать минимум 3 символа';
    }

    // Проверка адреса
    if (!formData.address.country.trim()) {
      newErrors.country = 'Страна обязательна';
    }
    if (!formData.address.city.trim()) {
      newErrors.city = 'Город обязателен';
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
      // Сброс формы после успешного создания
      setFormData({
        name: '',
        legalName: '',
        description: '',
        inn: '',
        kpp: '',
        address: {
          country: 'Россия',
          city: '',
          street: '',
          postalCode: ''
        },
        settings: {
          currency: 'RUB',
          language: 'ru',
          timezone: 'Europe/Moscow',
          autoBackup: true,
          backupFrequency: 'DAILY'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
    // Очищаем ошибку при изменении поля адреса
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSettingsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
    // Очищаем ошибку при изменении поля настроек, если нужно
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="dialog-overlay active" onClick={handleOverlayClick}>
      <div className="dialog-content create-organization-dialog" onClick={handleContentClick}>
        <div className="dialog-header">
          <h2>Создать организацию</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-grid">
              <div className="form-row">
                <label className="form-label">Название организации *</label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Введите название организации (минимум 3 символа)"
                  required
                  minLength={3}
                  disabled={loading}
                />
                {errors.name && <div className="error-text">{errors.name}</div>}
              </div>

              <div className="form-row">
                <label className="form-label">Юридическое название *</label>
                <input
                  type="text"
                  className={`form-input ${errors.legalName ? 'error' : ''}`}
                  value={formData.legalName}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                  placeholder="Полное юридическое название"
                  required
                  minLength={3}
                  disabled={loading}
                />
                {errors.legalName && <div className="error-text">{errors.legalName}</div>}
              </div>

              <div className="form-row">
                <label className="form-label">Описание</label>
                <textarea
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Описание деятельности организации"
                  rows="3"
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <label className="form-label">ИНН *</label>
                <input
                  type="text"
                  className={`form-input ${errors.inn ? 'error' : ''}`}
                  value={formData.inn}
                  onChange={(e) => handleChange('inn', e.target.value)}
                  placeholder="10 или 12 цифр"
                  required
                  pattern="\d{10}|\d{12}"
                  disabled={loading}
                />
                {errors.inn && <div className="error-text">{errors.inn}</div>}
              </div>

              <div className="form-row">
                <label className="form-label">КПП *</label>
                <input
                  type="text"
                  className={`form-input ${errors.kpp ? 'error' : ''}`}
                  value={formData.kpp}
                  onChange={(e) => handleChange('kpp', e.target.value)}
                  placeholder="9 цифр"
                  required
                  pattern="\d{9}"
                  disabled={loading}
                />
                {errors.kpp && <div className="error-text">{errors.kpp}</div>}
              </div>

              <div className="form-section">
                <h4>Адрес *</h4>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-row">
                    <label className="form-label">Страна *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.country ? 'error' : ''}`}
                      value={formData.address.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      placeholder="Россия"
                      required
                      disabled={loading}
                    />
                    {errors.country && <div className="error-text">{errors.country}</div>}
                  </div>
                  <div className="form-row">
                    <label className="form-label">Город *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.city ? 'error' : ''}`}
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="Москва"
                      required
                      disabled={loading}
                    />
                    {errors.city && <div className="error-text">{errors.city}</div>}
                  </div>
                  <div className="form-row">
                    <label className="form-label">Улица</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      placeholder="ул. Примерная, 123"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-row">
                    <label className="form-label">Почтовый индекс</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.address.postalCode}
                      onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                      placeholder="123456"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Настройки</h4>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-row">
                    <label className="form-label">Валюта</label>
                    <select
                      className="form-select"
                      value={formData.settings.currency}
                      onChange={(e) => handleSettingsChange('currency', e.target.value)}
                      disabled={loading}
                    >
                      <option value="RUB">RUB - Российский рубль</option>
                      <option value="USD">USD - Доллар США</option>
                      <option value="EUR">EUR - Евро</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label className="form-label">Язык</label>
                    <select
                      className="form-select"
                      value={formData.settings.language}
                      onChange={(e) => handleSettingsChange('language', e.target.value)}
                      disabled={loading}
                    >
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label className="form-label">Часовой пояс</label>
                    <select
                      className="form-select"
                      value={formData.settings.timezone}
                      onChange={(e) => handleSettingsChange('timezone', e.target.value)}
                      disabled={loading}
                    >
                      <option value="Europe/Moscow">Europe/Moscow (Москва)</option>
                      <option value="Europe/London">Europe/London (Лондон)</option>
                      <option value="America/New_York">America/New_York (Нью-Йорк)</option>
                    </select>
                  </div>
                  <div className="form-row form-checkbox">
                    <input
                      type="checkbox"
                      id="autoBackup"
                      checked={formData.settings.autoBackup}
                      onChange={(e) => handleSettingsChange('autoBackup', e.target.checked)}
                      disabled={loading}
                    />
                    <label htmlFor="autoBackup" className="form-label-checkbox">Автоматическое резервное копирование</label>
                  </div>
                  {formData.settings.autoBackup && (
                    <div className="form-row">
                      <label className="form-label">Частота резервного копирования</label>
                      <select
                        className="form-select"
                        value={formData.settings.backupFrequency}
                        onChange={(e) => handleSettingsChange('backupFrequency', e.target.value)}
                        disabled={loading}
                      >
                        <option value="DAILY">Ежедневно</option>
                        <option value="WEEKLY">Еженедельно</option>
                        <option value="MONTHLY">Ежемесячно</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="btn btn-outlined"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-contained"
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать организацию'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrganizationDialog;