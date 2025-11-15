// src/components/dialogs/CreateNomenclatureDialog.jsx
import React, { useState, useEffect } from 'react';
import '../css/styles.scss';
import '../css/Dialogs.scss';

const CreateNomenclatureDialog = ({ 
  open, 
  warehouse, 
  onClose, 
  onCreate,
  prefilledBarcode = null
}) => {
  const [formData, setFormData] = useState({
    name: '',
    article: '',
    barcode: '',
    quantity: 1,
    unit: 'pcs',
    category_id: '',
    warehouse_id: '',
    properties: {}
  });
  const [properties, setProperties] = useState([]); // Массив объектов {key: '', value: ''}
  const [newPropertyKey, setNewPropertyKey] = useState('');
  const [newPropertyValue, setNewPropertyValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Сброс формы при открытии/закрытии
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        article: '',
        barcode: prefilledBarcode || '',
        quantity: 1,
        unit: 'pcs',
        category_id: '',
        warehouse_id: warehouse?.id || '',
        properties: {}
      });
      setProperties([]);
      setNewPropertyKey('');
      setNewPropertyValue('');
      setErrors({});
    }
  }, [open, prefilledBarcode, warehouse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddProperty = () => {
    if (!newPropertyKey.trim()) {
      alert('Введите ключ характеристики');
      return;
    }
    if (!newPropertyValue.trim()) {
      alert('Введите значение характеристики');
      return;
    }

    // Проверяем, нет ли уже такого ключа
    if (properties.some(p => p.key === newPropertyKey.trim())) {
      alert('Характеристика с таким ключом уже существует');
      return;
    }

    setProperties(prev => [...prev, { key: newPropertyKey.trim(), value: newPropertyValue.trim() }]);
    setNewPropertyKey('');
    setNewPropertyValue('');
  };

  const handleRemoveProperty = (index) => {
    setProperties(prev => prev.filter((_, i) => i !== index));
  };

  const handlePropertyKeyChange = (index, value) => {
    setProperties(prev => prev.map((prop, i) => 
      i === index ? { ...prop, key: value } : prop
    ));
  };

  const handlePropertyValueChange = (index, value) => {
    setProperties(prev => prev.map((prop, i) => 
      i === index ? { ...prop, value: value } : prop
    ));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название товара обязательно';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Название должно содержать минимум 3 символа';
    }

    if (!formData.article.trim()) {
      newErrors.article = 'Артикул обязателен';
    } else if (formData.article.trim().length < 3) {
      newErrors.article = 'Артикул должен содержать минимум 3 символа';
    }

    if (!formData.warehouse_id) {
      newErrors.warehouse_id = 'Склад не указан';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Преобразуем массив properties в объект
    const propertiesObj = {};
    properties.forEach(prop => {
      if (prop.key && prop.value) {
        propertiesObj[prop.key] = prop.value;
      }
    });

    const nomenclatureData = {
      name: formData.name.trim(),
      article: formData.article.trim(),
      barcode: formData.barcode?.trim() || null,
      quantity: parseInt(formData.quantity) || 1,
      unit: formData.unit || 'pcs',
      category_id: formData.category_id?.trim() || null,
      properties: Object.keys(propertiesObj).length > 0 ? propertiesObj : null,
      warehouse_id: formData.warehouse_id
    };

    setLoading(true);
    try {
      await onCreate(nomenclatureData);
      onClose();
    } catch (error) {
      console.error('Ошибка создания номенклатуры:', error);
    } finally {
      setLoading(false);
    }
  };

  const units = [
    { value: 'pcs', label: 'Штуки' },
    { value: 'kg', label: 'Килограммы' },
    { value: 'g', label: 'Граммы' },
    { value: 'l', label: 'Литры' },
    { value: 'ml', label: 'Миллилитры' },
    { value: 'pack', label: 'Упаковки' },
    { value: 'box', label: 'Коробки' }
  ];

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={`dialog-overlay ${open ? 'active' : ''}`} onClick={handleOverlayClick}>
      <div className="dialog-content" onClick={handleContentClick}>
        <div className="dialog-header">
          <h2>Создать номенклатуру</h2>
          {warehouse && (
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
              Склад: <strong>{warehouse.name}</strong>
            </p>
          )}
          {prefilledBarcode && (
            <p style={{ 
              margin: '8px 0 0 0', 
              padding: '8px 12px', 
              background: '#e3f2fd', 
              borderRadius: '4px',
              color: '#1976d2',
              fontSize: '13px'
            }}>
              📷 Отсканированный штрихкод: <strong>{prefilledBarcode}</strong>
            </p>
          )}
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-section">
            <h3>Основная информация</h3>
            
            <div className="form-group">
              <label htmlFor="name">Название товара *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Например: Молоко Простоквашино 3.2%"
                className={errors.name ? 'error' : ''}
                disabled={loading}
                required
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="article">Артикул *</label>
                <input
                  type="text"
                  id="article"
                  name="article"
                  value={formData.article}
                  onChange={handleChange}
                  placeholder="Например: MLK-001"
                  className={errors.article ? 'error' : ''}
                  disabled={loading}
                  required
                />
                {errors.article && <span className="error-message">{errors.article}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="barcode">Штрих-код</label>
                <input
                  type="text"
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder="Например: 4601234567890"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category_id">Категория</label>
                <input
                  type="text"
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  placeholder="Например: Молочные продукты"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="unit">Единица измерения *</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  disabled={loading}
                  required
                >
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Количество *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Характеристики товара</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
              Добавьте дополнительные характеристики в формате ключ-значение
            </p>

            {/* Список добавленных характеристик */}
            {properties.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                {properties.map((prop, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginBottom: '8px',
                    alignItems: 'center'
                  }}>
                    <input
                      type="text"
                      value={prop.key}
                      onChange={(e) => handlePropertyKeyChange(index, e.target.value)}
                      placeholder="Ключ"
                      style={{ flex: 1 }}
                      disabled={loading}
                    />
                    <input
                      type="text"
                      value={prop.value}
                      onChange={(e) => handlePropertyValueChange(index, e.target.value)}
                      placeholder="Значение"
                      style={{ flex: 1 }}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveProperty(index)}
                      disabled={loading}
                      style={{
                        padding: '8px 12px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Форма добавления новой характеристики */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              alignItems: 'center',
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e0e0e0'
            }}>
              <input
                type="text"
                value={newPropertyKey}
                onChange={(e) => setNewPropertyKey(e.target.value)}
                placeholder="Ключ (например: Бренд)"
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddProperty();
                  }
                }}
              />
              <input
                type="text"
                value={newPropertyValue}
                onChange={(e) => setNewPropertyValue(e.target.value)}
                placeholder="Значение (например: Простоквашино)"
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddProperty();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddProperty}
                disabled={loading || !newPropertyKey.trim() || !newPropertyValue.trim()}
                style={{
                  padding: '8px 16px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Добавить
              </button>
            </div>
          </div>

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
              className="btn-contained"
              disabled={loading || !formData.name.trim() || !formData.article.trim()}
            >
              {loading ? 'Создание...' : 'Создать номенклатуру'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNomenclatureDialog;
