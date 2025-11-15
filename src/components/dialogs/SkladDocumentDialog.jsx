// src/components/dialogs/SkladDocumentDialog.jsx
import React, { useState, useEffect } from 'react';
import '../css/styles.scss';
import '../css/Dialogs.scss';

const SkladDocumentDialog = ({ open, document: doc, warehouse, warehouses = [], onClose, onSave }) => {
  const isEdit = !!doc;
  const [formData, setFormData] = useState({
    sklad_ids: [],
    doc_type: 'incoming',
    number: '',
    description: '',
    address_from: {
      country: '',
      city: '',
      street: '',
      postalCode: '',
      building: ''
    },
    address_to: {
      country: '',
      city: '',
      street: '',
      postalCode: '',
      building: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (isEdit && doc) {
        setFormData({
          sklad_ids: doc.sklad_ids || [],
          doc_type: doc.doc_type || 'incoming',
          number: doc.number || '',
          description: doc.description || '',
          address_from: doc.address_from || {
            country: '',
            city: '',
            street: '',
            postalCode: '',
            building: ''
          },
          address_to: doc.address_to || {
            country: '',
            city: '',
            street: '',
            postalCode: '',
            building: ''
          }
        });
      } else {
        setFormData({
          sklad_ids: warehouse ? [warehouse.id] : [],
          doc_type: 'incoming',
          number: '',
          description: '',
          address_from: {
            country: '',
            city: '',
            street: '',
            postalCode: '',
            building: ''
          },
          address_to: {
            country: '',
            city: '',
            street: '',
            postalCode: '',
            building: ''
          }
        });
      }
      setErrors({});
    }
  }, [open, doc, isEdit, warehouse]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Очищаем ошибку для этого поля
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleWarehouseToggle = (warehouseId) => {
    setFormData(prev => {
      const currentIds = prev.sklad_ids || [];
      const newIds = currentIds.includes(warehouseId)
        ? currentIds.filter(id => id !== warehouseId)
        : [...currentIds, warehouseId];
      return { ...prev, sklad_ids: newIds };
    });
  };

  const handleAddressChange = (addressType, field, value) => {
    setFormData(prev => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.number || !formData.number.trim()) {
      newErrors.number = 'Номер документа обязателен';
    }

    if (!formData.sklad_ids || formData.sklad_ids.length === 0) {
      newErrors.sklad_ids = 'Выберите хотя бы один склад';
    }

    if (!formData.doc_type) {
      newErrors.doc_type = 'Тип документа обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Очищает пустые адреса перед отправкой
  const cleanAddress = (address) => {
    const cleaned = {};
    if (address.country && address.country.trim()) cleaned.country = address.country.trim();
    if (address.city && address.city.trim()) cleaned.city = address.city.trim();
    if (address.street && address.street.trim()) cleaned.street = address.street.trim();
    if (address.postalCode && address.postalCode.trim()) cleaned.postalCode = address.postalCode.trim();
    if (address.building && address.building.trim()) cleaned.building = address.building.trim();
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Подготавливаем данные для отправки
      const dataToSend = {
        sklad_ids: formData.sklad_ids,
        doc_type: formData.doc_type,
        number: formData.number.trim(),
      };

      // Добавляем опциональные поля только если они заполнены
      if (formData.description && formData.description.trim()) {
        dataToSend.description = formData.description.trim();
      }

      // Очищаем и добавляем адреса только если они не пустые
      const cleanedAddressFrom = cleanAddress(formData.address_from);
      if (cleanedAddressFrom) {
        dataToSend.address_from = cleanedAddressFrom;
      }

      const cleanedAddressTo = cleanAddress(formData.address_to);
      if (cleanedAddressTo) {
        dataToSend.address_to = cleanedAddressTo;
      }

      await onSave(dataToSend);
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении документа:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableWarehouses = warehouses.length > 0 ? warehouses : (warehouse ? [warehouse] : []);

  return (
    <div className={`dialog-overlay ${open ? 'active' : ''}`} onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{isEdit ? 'Редактировать документ' : 'Создать документ'}</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-group">
            <label htmlFor="doc_type">Тип документа *</label>
            <select
              id="doc_type"
              value={formData.doc_type}
              onChange={(e) => handleChange('doc_type', e.target.value)}
              className={errors.doc_type ? 'error' : ''}
              disabled={loading}
            >
              <option value="incoming">Приходный</option>
              <option value="outgoing">Отходный</option>
              <option value="inventory">Инвентаризация</option>
            </select>
            {errors.doc_type && <span className="error-message">{errors.doc_type}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="number">Номер документа *</label>
            <input
              type="text"
              id="number"
              value={formData.number}
              onChange={(e) => handleChange('number', e.target.value)}
              className={errors.number ? 'error' : ''}
              disabled={loading}
              placeholder="DOC-001"
            />
            {errors.number && <span className="error-message">{errors.number}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={loading}
              rows={3}
              placeholder="Описание документа (необязательно)"
            />
          </div>

          <div className="form-group">
            <label>Склады *</label>
            <div className="warehouses-checkbox-list">
              {availableWarehouses.map((wh) => (
                <label key={wh.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.sklad_ids.includes(wh.id)}
                    onChange={() => handleWarehouseToggle(wh.id)}
                    disabled={loading}
                  />
                  <span>{wh.name || wh.code || 'Склад'}</span>
                </label>
              ))}
            </div>
            {errors.sklad_ids && <span className="error-message">{errors.sklad_ids}</span>}
          </div>

          {/* Адрес отправки (для отходных документов) */}
          {(formData.doc_type === 'outgoing' || formData.doc_type === 'inventory') && (
            <div className="form-section">
              <h4>Адрес отправки</h4>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Страна</label>
                  <input
                    type="text"
                    value={formData.address_from.country || ''}
                    onChange={(e) => handleAddressChange('address_from', 'country', e.target.value)}
                    placeholder="Россия"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Город</label>
                  <input
                    type="text"
                    value={formData.address_from.city || ''}
                    onChange={(e) => handleAddressChange('address_from', 'city', e.target.value)}
                    placeholder="Москва"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Улица</label>
                  <input
                    type="text"
                    value={formData.address_from.street || ''}
                    onChange={(e) => handleAddressChange('address_from', 'street', e.target.value)}
                    placeholder="ул. Примерная"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Почтовый индекс</label>
                  <input
                    type="text"
                    value={formData.address_from.postalCode || ''}
                    onChange={(e) => handleAddressChange('address_from', 'postalCode', e.target.value)}
                    placeholder="123456"
                    disabled={loading}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Здание</label>
                  <input
                    type="text"
                    value={formData.address_from.building || ''}
                    onChange={(e) => handleAddressChange('address_from', 'building', e.target.value)}
                    placeholder="1"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Адрес назначения (для приходных документов) */}
          {formData.doc_type === 'incoming' && (
            <div className="form-section">
              <h4>Адрес назначения</h4>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Страна</label>
                  <input
                    type="text"
                    value={formData.address_to.country || ''}
                    onChange={(e) => handleAddressChange('address_to', 'country', e.target.value)}
                    placeholder="Россия"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Город</label>
                  <input
                    type="text"
                    value={formData.address_to.city || ''}
                    onChange={(e) => handleAddressChange('address_to', 'city', e.target.value)}
                    placeholder="Москва"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Улица</label>
                  <input
                    type="text"
                    value={formData.address_to.street || ''}
                    onChange={(e) => handleAddressChange('address_to', 'street', e.target.value)}
                    placeholder="ул. Примерная"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Почтовый индекс</label>
                  <input
                    type="text"
                    value={formData.address_to.postalCode || ''}
                    onChange={(e) => handleAddressChange('address_to', 'postalCode', e.target.value)}
                    placeholder="123456"
                    disabled={loading}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Здание</label>
                  <input
                    type="text"
                    value={formData.address_to.building || ''}
                    onChange={(e) => handleAddressChange('address_to', 'building', e.target.value)}
                    placeholder="1"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="dialog-actions">
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkladDocumentDialog;

