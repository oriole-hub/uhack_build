// src/components/organization/WarehousesTab.jsx
import React, { useState } from 'react';
import { apiService } from '../../services/api';
import './WarehousesTab.scss';

const WarehousesTab = ({ 
  warehouses, 
  onCreate, 
  onEdit, 
  onDelete, 
  onView
}) => {
  const safeWarehouses = Array.isArray(warehouses) ? warehouses : [];
  const [selectingWarehouse, setSelectingWarehouse] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ open: false, message: '', severity: 'success' }), 3000);
  };

  const handleSelectWarehouse = async (warehouse) => {
    try {
      setSelectingWarehouse(warehouse.id);
      console.log('🎯 Выбор склада:', warehouse.id);
      
      // Отправляем запрос на выбор склада
      const response = await apiService.chooseWarehouse(warehouse.id);
      console.log('✅ Склад выбран:', response);
      
      showSnackbar(`Склад "${warehouse.name}" успешно выбран`, 'success');
      
      // Если нужно выполнить дополнительное действие после выбора
      if (onView) {
        onView(warehouse.id);
      }
      
    } catch (error) {
      console.error('❌ Ошибка выбора склада:', error);
      showSnackbar('Ошибка при выборе склада', 'error');
    } finally {
      setSelectingWarehouse(null);
    }
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Склады</h2>
        <button className="btn-primary" onClick={onCreate}>
          + Добавить склад
        </button>
      </div>
      
      <div className="warehouses-grid">
        {safeWarehouses.length === 0 ? (
          <div className="empty-state">
            <p>Нет добавленных складов</p>
          </div>
        ) : (
          safeWarehouses.map(warehouse => (
            <div key={warehouse.id} className="warehouse-card">
              <div className="warehouse-header">
                <h3>{warehouse.name}</h3>
                <span className={`warehouse-type ${warehouse.type?.toLowerCase() || 'main'}`}>
                  {warehouse.type === 'MAIN' ? 'Основной' : 'Дополнительный'}
                </span>
              </div>
              
              <div className="warehouse-info">
                <p><strong>Адрес:</strong> {warehouse.address?.city || 'Не указан'}, {warehouse.address?.street || 'Не указан'}</p>
                <p><strong>Контакт:</strong> {warehouse.contact_person?.name || 'Не указан'}</p>
              </div>
              
              <div className="warehouse-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => handleSelectWarehouse(warehouse)}
                  disabled={selectingWarehouse === warehouse.id}
                >
                  {selectingWarehouse === warehouse.id ? 'Выбор...' : 'Выбрать'}
                </button>
                <button 
                  className="btn-outline" 
                  onClick={() => onEdit(warehouse)}
                >
                  Редактировать
                </button>
                <button 
                  className="btn-danger" 
                  onClick={() => onDelete(warehouse.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Snackbar для уведомлений */}
      {snackbar.open && (
        <div className={`snackbar snackbar-${snackbar.severity}`}>
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default WarehousesTab;