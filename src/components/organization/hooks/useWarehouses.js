import { useCallback } from 'react';
import { apiService } from '../../../services/api';

export const useWarehouses = (organizationId, setWarehouses, setSnackbar) => {
  /** Показывает уведомление */
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar({ open: false, message: '', severity: 'success' });
    }, 3000);
  }, [setSnackbar]);

  /** Создает склад */
  const handleCreateWarehouse = async (warehouseData) => {
    try {
      const newWarehouse = await apiService.createWarehouse(warehouseData);
      setWarehouses(prev => {
        if (!Array.isArray(prev)) {
          console.warn('⚠️ Warehouses state is not array, initializing:', prev);
          return [newWarehouse];
        }
        return [...prev, newWarehouse];
      });
      
      showSnackbar('✅ Склад создан');
      return newWarehouse;
    } catch (error) {
      console.error('❌ Ошибка создания склада:', error);
      showSnackbar('❌ Ошибка создания склада', 'error');
      throw error;
    }
  };

  /** Обновляет склад */
  const handleUpdateWarehouse = async (warehouseId, data) => {
    try {
      const updatedWarehouse = await apiService.updateWarehouse(warehouseId, data);
      
      setWarehouses(prev => {
        if (!Array.isArray(prev)) {
          console.warn('⚠️ Warehouses state is not array during update:', prev);
          return [updatedWarehouse];
        }
        return prev.map(warehouse => 
          warehouse.id === warehouseId ? updatedWarehouse : warehouse
        );
      });
      
      showSnackbar('✅ Склад обновлен');
      return updatedWarehouse;
    } catch (error) {
      console.error('❌ Ошибка обновления склада:', error);
      showSnackbar('❌ Ошибка обновления склада', 'error');
      throw error;
    }
  };

  /** Удаляет склад */
  const handleDeleteWarehouse = async (warehouseId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот склад?')) {
      return;
    }

    try {
      await apiService.deleteWarehouse(warehouseId);
      
      setWarehouses(prev => {
        if (!Array.isArray(prev)) {
          console.warn('⚠️ Warehouses state is not array during delete:', prev);
          return [];
        }
        return prev.filter(warehouse => warehouse.id !== warehouseId);
      });
      
      showSnackbar('✅ Склад удален');
    } catch (error) {
      console.error('❌ Ошибка удаления склада:', error);
      showSnackbar('❌ Ошибка удаления склада', 'error');
      throw error;
    }
  };

  return {
    handleCreateWarehouse,
    handleUpdateWarehouse,
    handleDeleteWarehouse
  };
};