// src/components/dialogs/CreateNomenclatureDialog.jsx
import React, { useState, useEffect } from 'react';
import '../css/styles.scss';
import '../css/Dialogs.scss';

const CreateNomenclatureDialog = ({ 
  open, 
  warehouse, 
  onClose, 
  onCreate,
  onUpdate,
  nomenclature = null,
  prefilledBarcode = null
}) => {
  const isEdit = !!nomenclature;
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

  // Сброс формы при открытии/закрытии или загрузка данных для редактирования
  useEffect(() => {
    if (open) {
      if (isEdit && nomenclature) {
        // Режим редактирования - загружаем данные номенклатуры
        setFormData({
          name: nomenclature.name || '',
          article: nomenclature.article || '',
          barcode: nomenclature.barcode || '',
          quantity: nomenclature.quantity || 1,
          unit: nomenclature.unit || 'pcs',
          category_id: nomenclature.category_id || '',
          warehouse_id: nomenclature.warehouse_id || warehouse?.id || '',
          properties: nomenclature.properties || {}
        });
        // Преобразуем объект properties в массив
        const propsArray = [];
        if (nomenclature.properties && typeof nomenclature.properties === 'object') {
          Object.entries(nomenclature.properties).forEach(([key, value]) => {
            propsArray.push({ key, value });
          });
        }
        setProperties(propsArray);
      } else {
        // Режим создания - сбрасываем форму
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
      }
      setNewPropertyKey('');
      setNewPropertyValue('');
      setErrors({});
    }
  }, [open, prefilledBarcode, warehouse, nomenclature, isEdit]);

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
      if (isEdit && nomenclature) {
        // Режим редактирования
        await onUpdate(nomenclature.id, nomenclatureData);
      } else {
        // Режим создания
        await onCreate(nomenclatureData);
      }
      onClose();
    } catch (error) {
      console.error(`Ошибка ${isEdit ? 'обновления' : 'создания'} номенклатуры:`, error);
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
          <div>
            <h2>{isEdit ? 'Редактировать номенклатуру' : 'Создать номенклатуру'}</h2>
            {warehouse && (
              <div style={{ marginTop: '4px', fontSize: '14px', opacity: 0.9 }}>
                Склад: <strong>{warehouse.name}</strong>
              </div>
            )}
            {prefilledBarcode && (
              <div style={{ 
                marginTop: '8px', 
                padding: '8px 12px', 
                background: 'rgba(59, 130, 246, 0.1)', 
                borderRadius: '6px',
                fontSize: '13px'
              }}>
                📷 Отсканированный штрихкод: <strong>{prefilledBarcode}</strong>
              </div>
            )}
          </div>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-grid">
            <div className="form-section">
              <h4>Основная информация</h4>
              
              <div className="form-row">
                <label className="form-label">Название товара *</label>
                <input
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Например: Молоко Простоквашино 3.2%"
                  disabled={loading}
                  required
                />
                {errors.name && <div className="error-text">{errors.name}</div>}
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-row">
                  <label className="form-label">Артикул *</label>
                  <input
                    type="text"
                    name="article"
                    className={`form-input ${errors.article ? 'error' : ''}`}
                    value={formData.article}
                    onChange={handleChange}
                    placeholder="Например: MLK-001"
                    disabled={loading}
                    required
                  />
                  {errors.article && <div className="error-text">{errors.article}</div>}
                </div>

                <div className="form-row">
                  <label className="form-label">Штрих-код</label>
                  <input
                    type="text"
                    name="barcode"
                    className="form-input"
                    value={formData.barcode}
                    onChange={handleChange}
                    placeholder="Например: 4601234567890"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-row">
                  <label className="form-label">Категория</label>
                  <input
                    type="text"
                    name="category_id"
                    className="form-input"
                    value={formData.category_id}
                    onChange={handleChange}
                    placeholder="Например: Молочные продукты"
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <label className="form-label">Единица измерения *</label>
                  <select
                    name="unit"
                    className="form-select"
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

              <div className="form-row">
                <label className="form-label">Количество *</label>
                <input
                  type="number"
                  name="quantity"
                  className="form-input"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Характеристики товара</h4>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                Добавьте дополнительные характеристики в формате ключ-значение
              </div>

              {/* Список добавленных характеристик */}
              {properties.length > 0 && (
                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {properties.map((prop, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      alignItems: 'center'
                    }}>
                      <input
                        type="text"
                        className="form-input"
                        value={prop.key}
                        onChange={(e) => handlePropertyKeyChange(index, e.target.value)}
                        placeholder="Ключ"
                        style={{ flex: 1 }}
                        disabled={loading}
                      />
                      <input
                        type="text"
                        className="form-input"
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
                        className="btn btn-outlined"
                        style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
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
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  className="form-input"
                  value={newPropertyKey}
                  onChange={(e) => setNewPropertyKey(e.target.value)}
                  placeholder="Ключ (например: Бренд)"
                  style={{ flex: 1 }}
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
                  className="form-input"
                  value={newPropertyValue}
                  onChange={(e) => setNewPropertyValue(e.target.value)}
                  placeholder="Значение (например: Простоквашино)"
                  style={{ flex: 1 }}
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
                  className="btn btn-contained"
                  style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
                >
                  Добавить
                </button>
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
              disabled={loading || !formData.name.trim() || !formData.article.trim()}
            >
              {loading ? (isEdit ? 'Сохранение...' : 'Создание...') : (isEdit ? 'Сохранить' : 'Создать номенклатуру')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNomenclatureDialog;
