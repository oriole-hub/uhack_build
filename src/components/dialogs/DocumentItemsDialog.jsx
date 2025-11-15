// src/components/dialogs/DocumentItemsDialog.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import '../css/styles.scss';
import '../css/Dialogs.scss';

const DocumentItemsDialog = ({ open, document, onClose }) => {
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [nomenclatures, setNomenclatures] = useState([]);
  const [nomenclaturesLoading, setNomenclaturesLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка номенклатур документа
  useEffect(() => {
    if (open && document?.id) {
      fetchItems();
      fetchNomenclatures();
    }
  }, [open, document?.id]);

  const fetchItems = async () => {
    try {
      setItemsLoading(true);
      setError(null);
      const data = await apiService.getDocumentItems(document.id);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Ошибка загрузки номенклатур документа:', err);
      setError(err.message || 'Не удалось загрузить номенклатуры');
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  const fetchNomenclatures = async () => {
    try {
      setNomenclaturesLoading(true);
      const data = await apiService.getNomenclatures(null, 0, 1000);
      setNomenclatures(Array.isArray(data) ? data : (data?.items || []));
    } catch (err) {
      console.error('❌ Ошибка загрузки номенклатур:', err);
    } finally {
      setNomenclaturesLoading(false);
    }
  };

  const handleOpenAddItem = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setSelectedItem(null);
    setAddItemDialogOpen(true);
  };

  const handleOpenEditItem = (item) => {
    setSelectedItem(item);
    setEditItemDialogOpen(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Удалить номенклатуру из документа?')) {
      return;
    }

    try {
      await apiService.deleteDocumentItem(itemId);
      fetchItems();
    } catch (err) {
      console.error('❌ Ошибка удаления номенклатуры:', err);
      alert('Ошибка при удалении номенклатуры');
    }
  };

  const handleSaveItem = async (itemData) => {
    try {
      if (selectedItem) {
        // Редактирование
        await apiService.updateDocumentItem(selectedItem.id, itemData);
      } else {
        // Создание
        await apiService.addDocumentItem(document.id, itemData);
      }
      fetchItems();
      setAddItemDialogOpen(false);
      setEditItemDialogOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('❌ Ошибка сохранения номенклатуры:', err);
      throw err;
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

  const getNomenclatureName = (nomenclatureId) => {
    const nom = nomenclatures.find(n => n.id === nomenclatureId);
    return nom?.name || nom?.article || 'Неизвестная номенклатура';
  };

  if (!open) return null;

  return (
    <>
      <div className={`dialog-overlay active`} onClick={handleOverlayClick}>
        <div className="dialog-content" onClick={handleContentClick}>
          <div className="dialog-header">
            <h2>Номенклатуры документа</h2>
            <button className="dialog-close" onClick={onClose}>×</button>
          </div>

          <div className="dialog-body">
            {error && (
              <div className="error-message" style={{ marginBottom: '16px', padding: '12px', background: '#fee', borderRadius: '8px' }}>
                {String(error)}
              </div>
            )}

            <div className="document-items-actions">
              <button
                type="button"
                className="btn btn-contained"
                onClick={handleOpenAddItem}
              >
                + Добавить номенклатуру
              </button>
            </div>

            {itemsLoading ? (
              <div className="loading">Загрузка номенклатур...</div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <p>Номенклатуры не добавлены</p>
              </div>
            ) : (
              <div className="document-items-table">
                <table>
                  <thead>
                    <tr>
                      <th>Номенклатура</th>
                      <th>Единица</th>
                      <th>Упаковка</th>
                      <th>Кол-во (док.)</th>
                      <th>Кол-во (факт.)</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name || getNomenclatureName(item.nomenclature_id) || 'Не указано'}</td>
                        <td>{item.unit || 'шт'}</td>
                        <td>
                          {item.packaging ? (
                            <span>
                              {item.packaging.name} ({item.packaging.base_units} {item.unit || 'шт'})
                            </span>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td>{String(item.quantity_documental || 0)}</td>
                        <td>{item.quantity_actual !== undefined && item.quantity_actual !== null ? String(item.quantity_actual) : '-'}</td>
                        <td>
                          <div className="item-actions">
                            <button
                              type="button"
                              className="btn-small"
                              onClick={() => handleOpenEditItem(item)}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="btn-small"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="btn btn-outlined"
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>

      {/* Диалог добавления/редактирования номенклатуры */}
      {(addItemDialogOpen || editItemDialogOpen) && (
        <DocumentItemFormDialog
          open={addItemDialogOpen || editItemDialogOpen}
          item={selectedItem}
          nomenclatures={nomenclatures}
          onClose={() => {
            setAddItemDialogOpen(false);
            setEditItemDialogOpen(false);
            setSelectedItem(null);
          }}
          onSave={handleSaveItem}
        />
      )}
    </>
  );
};

// Компонент формы для добавления/редактирования номенклатуры в документе
const DocumentItemFormDialog = ({ open, item, nomenclatures, onClose, onSave }) => {
  const isEdit = !!item;
  const [formData, setFormData] = useState({
    nomenclature_id: '',
    name: '',
    unit: '',
    packaging: {
      name: '',
      base_units: 1,
      barcode: ''
    },
    quantity_documental: 0,
    quantity_actual: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPackaging, setShowPackaging] = useState(false);

  useEffect(() => {
    if (open) {
      if (isEdit && item) {
        setFormData({
          nomenclature_id: item.nomenclature_id || '',
          name: item.name || '',
          unit: item.unit || '',
          packaging: item.packaging || {
            name: '',
            base_units: 1,
            barcode: ''
          },
          quantity_documental: item.quantity_documental || 0,
          quantity_actual: item.quantity_actual !== undefined && item.quantity_actual !== null ? item.quantity_actual : null
        });
        setShowPackaging(!!item.packaging);
      } else {
        setFormData({
          nomenclature_id: '',
          name: '',
          unit: '',
          packaging: {
            name: '',
            base_units: 1,
            barcode: ''
          },
          quantity_documental: 0,
          quantity_actual: null
        });
        setShowPackaging(false);
      }
      setErrors({});
    }
  }, [open, item, isEdit]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNomenclatureChange = (nomenclatureId) => {
    const nom = nomenclatures.find(n => n.id === nomenclatureId);
    setFormData(prev => ({
      ...prev,
      nomenclature_id: nomenclatureId,
      name: nom?.name || prev.name,
      unit: nom?.unit || prev.unit
    }));
  };

  const handlePackagingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      packaging: {
        ...prev.packaging,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nomenclature_id) {
      newErrors.nomenclature_id = 'Выберите номенклатуру';
    }

    if (formData.quantity_documental === null || formData.quantity_documental < 0) {
      newErrors.quantity_documental = 'Количество должно быть >= 0';
    }

    if (formData.quantity_actual !== null && formData.quantity_actual < 0) {
      newErrors.quantity_actual = 'Фактическое количество должно быть >= 0';
    }

    if (showPackaging) {
      if (!formData.packaging.name) {
        newErrors.packaging_name = 'Название упаковки обязательно';
      }
      if (!formData.packaging.base_units || formData.packaging.base_units <= 0) {
        newErrors.packaging_base_units = 'Количество базовых единиц должно быть > 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Подготавливаем данные согласно документации API
      const itemData = {
        nomenclature_id: formData.nomenclature_id,
        quantity_documental: Number(formData.quantity_documental),
      };

      // Добавляем опциональные поля только если они заполнены
      if (formData.name && formData.name.trim()) {
        itemData.name = formData.name.trim();
      }

      if (formData.unit && formData.unit.trim()) {
        itemData.unit = formData.unit.trim();
      }

      // Упаковка добавляется только если указана
      if (showPackaging && formData.packaging.name && formData.packaging.name.trim()) {
        itemData.packaging = {
          name: formData.packaging.name.trim(),
          base_units: Number(formData.packaging.base_units),
        };
        // Штрихкод упаковки опционален
        if (formData.packaging.barcode && formData.packaging.barcode.trim()) {
          itemData.packaging.barcode = formData.packaging.barcode.trim();
        }
      }

      // quantity_actual отправляется только если указано (не null и не undefined)
      if (formData.quantity_actual !== null && formData.quantity_actual !== undefined) {
        itemData.quantity_actual = Number(formData.quantity_actual);
      }

      await onSave(itemData);
    } catch (error) {
      console.error('Ошибка при сохранении номенклатуры:', error);
      alert('Ошибка при сохранении номенклатуры');
    } finally {
      setLoading(false);
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

  if (!open) return null;

  return (
    <div className={`dialog-overlay active`} onClick={handleOverlayClick}>
      <div className="dialog-content" onClick={handleContentClick}>
        <div className="dialog-header">
          <h2>{isEdit ? 'Редактировать номенклатуру' : 'Добавить номенклатуру'}</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-group">
            <label htmlFor="nomenclature_id">Номенклатура *</label>
            <select
              id="nomenclature_id"
              value={formData.nomenclature_id}
              onChange={(e) => handleNomenclatureChange(e.target.value)}
              className={errors.nomenclature_id ? 'error' : ''}
              disabled={loading || isEdit}
              required
            >
              <option value="">Выберите номенклатуру</option>
              {nomenclatures.map((nom) => (
                <option key={nom.id} value={nom.id}>
                  {nom.name || nom.article || nom.id}
                </option>
              ))}
            </select>
            {errors.nomenclature_id && <span className="error-message">{errors.nomenclature_id}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="name">Название товара</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Автоматически из номенклатуры"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Единица измерения</label>
            <input
              type="text"
              id="unit"
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              placeholder="Автоматически из номенклатуры"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={showPackaging}
                onChange={(e) => setShowPackaging(e.target.checked)}
                disabled={loading}
              />
              Указать упаковку
            </label>
          </div>

          {showPackaging && (
            <div className="form-section">
              <h4>Упаковка</h4>
              <div className="form-group">
                <label htmlFor="packaging_name">Название упаковки *</label>
                <input
                  type="text"
                  id="packaging_name"
                  value={formData.packaging.name}
                  onChange={(e) => handlePackagingChange('name', e.target.value)}
                  className={errors.packaging_name ? 'error' : ''}
                  placeholder="Ящик, Пачка и т.д."
                  disabled={loading}
                />
                {errors.packaging_name && <span className="error-message">{errors.packaging_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="packaging_base_units">Количество базовых единиц *</label>
                <input
                  type="number"
                  id="packaging_base_units"
                  value={formData.packaging.base_units}
                  onChange={(e) => handlePackagingChange('base_units', e.target.value)}
                  className={errors.packaging_base_units ? 'error' : ''}
                  placeholder="10"
                  min="1"
                  disabled={loading}
                  required
                />
                {errors.packaging_base_units && <span className="error-message">{errors.packaging_base_units}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="packaging_barcode">Штрихкод упаковки</label>
                <input
                  type="text"
                  id="packaging_barcode"
                  value={formData.packaging.barcode}
                  onChange={(e) => handlePackagingChange('barcode', e.target.value)}
                  placeholder="1234567890"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="quantity_documental">Количество документальное *</label>
            <input
              type="number"
              id="quantity_documental"
              value={formData.quantity_documental}
              onChange={(e) => handleChange('quantity_documental', e.target.value)}
              className={errors.quantity_documental ? 'error' : ''}
              placeholder="100"
              min="0"
              step="0.01"
              disabled={loading}
              required
            />
            {errors.quantity_documental && <span className="error-message">{errors.quantity_documental}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="quantity_actual">Количество фактическое</label>
            <input
              type="number"
              id="quantity_actual"
              value={formData.quantity_actual !== null ? formData.quantity_actual : ''}
              onChange={(e) => handleChange('quantity_actual', e.target.value === '' ? null : e.target.value)}
              className={errors.quantity_actual ? 'error' : ''}
              placeholder="98 (для инвентаризации)"
              min="0"
              step="0.01"
              disabled={loading}
            />
            {errors.quantity_actual && <span className="error-message">{errors.quantity_actual}</span>}
          </div>

          <div className="dialog-actions">
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
              {loading ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Добавить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentItemsDialog;
