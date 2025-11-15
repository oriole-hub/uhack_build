// src/components/dialogs/DocumentItemsDialog.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { apiService } from '../../services/api';
import '../css/styles.scss';
import '../css/Dialogs.scss';

const DocumentItemsDialog = ({ open, document, onClose }) => {
  const { isDark } = useTheme();
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [nomenclatures, setNomenclatures] = useState([]);
  const [nomenclaturesLoading, setNomenclaturesLoading] = useState(false);
  const [error, setError] = useState(null);

  // Используем ref для хранения актуальных items
  const itemsRef = useRef([]);
  
  // Обновляем ref при изменении items
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

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

  // Обновляет фактическое количество для всех элементов через /api/docsklad/items/{item_id}
  const updateActualQuantities = useCallback(async () => {
    const currentItems = itemsRef.current;
    if (!currentItems || currentItems.length === 0) return;

    try {
      // Обновляем каждый элемент параллельно
      const updatedItems = await Promise.all(
        currentItems.map(async (item) => {
          try {
            // Получаем актуальные данные через /api/docsklad/items/{item_id}
            const updatedItem = await apiService.getDocumentItem(item.id);
            return {
              ...item,
              quantity_actual: updatedItem.quantity_actual !== undefined && updatedItem.quantity_actual !== null 
                ? updatedItem.quantity_actual 
                : item.quantity_actual
            };
          } catch (err) {
            console.warn(`⚠️ Не удалось обновить элемент ${item.id}:`, err);
            // Возвращаем исходный элемент при ошибке
            return item;
          }
        })
      );

      // Обновляем состояние с новыми данными
      setItems(updatedItems);
    } catch (err) {
      console.error('❌ Ошибка обновления фактических количеств:', err);
    }
  }, []);

  // Загрузка номенклатур документа
  useEffect(() => {
    if (open && document?.id) {
      fetchNomenclatures();
    }
  }, [open, document?.id]);

  // Автообновление фактического количества каждую минуту
  useEffect(() => {
    if (!open || !document?.id) return;

    // Первая загрузка
    fetchItems();

    // Устанавливаем интервал обновления каждую минуту
    const interval = setInterval(() => {
      updateActualQuantities();
    }, 60000); // 60000 мс = 1 минута

    // Очистка интервала при размонтировании или закрытии
    return () => clearInterval(interval);
  }, [open, document?.id, updateActualQuantities]);

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

  const getNomenclatureQuantity = (nomenclatureId) => {
    const nom = nomenclatures.find(n => n.id === nomenclatureId);
    return nom?.quantity || 0;
  };

  if (!open) return null;

  return (
    <>
      <div className="dialog-overlay active" onClick={handleOverlayClick}>
        <div className="dialog-content create-organization-dialog" onClick={handleContentClick}>
          <div className="dialog-header">
            <h2>Номенклатуры документа</h2>
            <button className="dialog-close" onClick={onClose}>×</button>
          </div>

          <div className="dialog-form" style={{ padding: '28px' }}>
            {error && (
              <div className="error-text" style={{ marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                {String(error)}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <button
                type="button"
                className="btn btn-contained"
                onClick={handleOpenAddItem}
                style={{ width: '100%' }}
              >
                + Добавить номенклатуру
              </button>
            </div>

            {itemsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Загрузка номенклатур...</div>
            ) : items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                Номенклатуры не добавлены
              </div>
            ) : (
              <div className="document-items-table">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#10b981', color: 'white' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Номенклатура</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Единица</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Упаковка</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Кол-во (док.)</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Кол-во (факт.)</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px' }}>{item.name || getNomenclatureName(item.nomenclature_id) || 'Не указано'}</td>
                        <td style={{ padding: '12px' }}>{item.unit || 'шт'}</td>
                        <td style={{ padding: '12px' }}>
                          {item.packaging ? (
                            <span>
                              {item.packaging.name} ({item.packaging.base_units} {item.unit || 'шт'})
                            </span>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>{String(getNomenclatureQuantity(item.nomenclature_id) || 0)}</td>
                        <td style={{ padding: '12px' }}>{item.quantity_actual !== undefined && item.quantity_actual !== null ? String(item.quantity_actual) : '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-outlined"
                              onClick={() => handleOpenEditItem(item)}
                              style={{ padding: '6px 12px', fontSize: '14px' }}
                              title="Редактировать"
                            >
                              <img
                                src={`/assets/icons/change_button_${isDark ? 'white' : 'black'}.svg`}
                                alt="Редактировать"
                                style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                              />
                            </button>
                            <button
                              type="button"
                              className="btn btn-outlined"
                              onClick={() => handleDeleteItem(item.id)}
                              style={{ padding: '6px 12px', fontSize: '14px', backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white' }}
                              title="Удалить"
                            >
                              <img
                                src="/assets/icons/delete_button_white.svg"
                                alt="Удалить"
                                style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                              />
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
    <div className="dialog-overlay active" onClick={handleOverlayClick}>
      <div className="dialog-content create-organization-dialog" onClick={handleContentClick}>
        <div className="dialog-header">
          <h2>{isEdit ? 'Редактировать номенклатуру' : 'Добавить номенклатуру'}</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Номенклатура *</label>
              <select
                className={`form-select ${errors.nomenclature_id ? 'error' : ''}`}
                value={formData.nomenclature_id}
                onChange={(e) => handleNomenclatureChange(e.target.value)}
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
              {errors.nomenclature_id && <div className="error-text">{errors.nomenclature_id}</div>}
            </div>

            <div className="form-row">
              <label className="form-label">Название товара</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Автоматически из номенклатуры"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <label className="form-label">Единица измерения</label>
              <input
                type="text"
                className="form-input"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                placeholder="Автоматически из номенклатуры"
                disabled={loading}
              />
            </div>

            <div className="form-row form-checkbox">
              <input
                type="checkbox"
                id="showPackaging"
                checked={showPackaging}
                onChange={(e) => setShowPackaging(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="showPackaging" className="form-label-checkbox">Указать упаковку</label>
            </div>

            {showPackaging && (
              <div className="form-section">
                <h4>Упаковка</h4>
                <div className="form-row">
                  <label className="form-label">Название упаковки *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.packaging_name ? 'error' : ''}`}
                    value={formData.packaging.name}
                    onChange={(e) => handlePackagingChange('name', e.target.value)}
                    placeholder="Ящик, Пачка и т.д."
                    disabled={loading}
                  />
                  {errors.packaging_name && <div className="error-text">{errors.packaging_name}</div>}
                </div>

                <div className="form-row">
                  <label className="form-label">Количество базовых единиц *</label>
                  <input
                    type="number"
                    className={`form-input ${errors.packaging_base_units ? 'error' : ''}`}
                    value={formData.packaging.base_units}
                    onChange={(e) => handlePackagingChange('base_units', e.target.value)}
                    placeholder="10"
                    min="1"
                    disabled={loading}
                    required
                  />
                  {errors.packaging_base_units && <div className="error-text">{errors.packaging_base_units}</div>}
                </div>

                <div className="form-row">
                  <label className="form-label">Штрихкод упаковки</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.packaging.barcode}
                    onChange={(e) => handlePackagingChange('barcode', e.target.value)}
                    placeholder="1234567890"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <label className="form-label">Количество документальное *</label>
              <input
                type="number"
                className={`form-input ${errors.quantity_documental ? 'error' : ''}`}
                value={formData.quantity_documental}
                onChange={(e) => handleChange('quantity_documental', e.target.value)}
                placeholder="100"
                min="0"
                step="0.01"
                disabled={loading}
                required
              />
              {errors.quantity_documental && <div className="error-text">{errors.quantity_documental}</div>}
            </div>

            <div className="form-row">
              <label className="form-label">Количество фактическое</label>
              <input
                type="number"
                className={`form-input ${errors.quantity_actual ? 'error' : ''}`}
                value={formData.quantity_actual !== null ? formData.quantity_actual : ''}
                onChange={(e) => handleChange('quantity_actual', e.target.value === '' ? null : e.target.value)}
                placeholder="98 (для инвентаризации)"
                min="0"
                step="0.01"
                disabled={loading}
              />
              {errors.quantity_actual && <div className="error-text">{errors.quantity_actual}</div>}
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
              {loading ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Добавить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentItemsDialog;
