// components/EditWarehouseDialog.js
import React, { useState, useEffect } from 'react';
import '../css/styles.scss';
import '../css/Dialogs.scss';

const EditWarehouseDialog = ({ warehouse, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'MAIN',
    address: {
      country: '',
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || '',
        code: warehouse.code || '',
        type: warehouse.type || 'MAIN',
        address: {
          country: warehouse.address?.country || 'Россия',
          city: warehouse.address?.city || '',
          street: warehouse.address?.street || '',
          postalCode: warehouse.address?.postalCode || ''
        },
        contact_person: {
          name: warehouse.contact_person?.name || '',
          phone: warehouse.contact_person?.phone || '',
          email: warehouse.contact_person?.email || ''
        },
        settings: {
          allowNegativeStock: warehouse.settings?.allowNegativeStock || false,
          requireApproval: warehouse.settings?.requireApproval || false,
          autoPrintLabels: warehouse.settings?.autoPrintLabels || false,
          barcodeType: warehouse.settings?.barcodeType || 'EAN13'
        }
      });
    }
  }, [warehouse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onUpdate(warehouse.id, formData);
      onClose();
    } catch (error) {
      console.error('Ошибка обновления склада:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (path, value) => {
    setFormData(prev => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const nested = keys.reduce((obj, key) => obj[key], prev);
      nested[lastKey] = value;
      return { ...prev };
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  if (!warehouse) return null;

  return (
    <div className="dialog-overlay active" onClick={handleOverlayClick}>
      <div className="dialog-content create-organization-dialog" onClick={handleContentClick}>
        <div className="dialog-header">
          <h2>Редактировать склад</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Название склада *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <label className="form-label">Код склада *</label>
              <input
                type="text"
                className="form-input"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                required
                disabled={loading}
              />
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
                  <label className="form-label">Город</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address.city}
                    onChange={(e) => handleChange('address.city', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">Улица</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address.street}
                    onChange={(e) => handleChange('address.street', e.target.value)}
                    disabled={loading}
                  />
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

            <div className="form-section">
              <h4>Контактное лицо</h4>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-row">
                  <label className="form-label">Имя</label>
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
                    className="form-input"
                    value={formData.contact_person.phone}
                    onChange={(e) => handleChange('contact_person.phone', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="form-row" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.contact_person.email}
                    onChange={(e) => handleChange('contact_person.email', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Настройки</h4>
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
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWarehouseDialog;
