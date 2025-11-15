// src/components/organization/hooks/useNomenclatures.js
import { useState, useCallback } from 'react';
import { apiService } from '../../../services/api';

const useNomenclatures = (organizationId, setSnackbar) => {
  const [nomenclatures, setNomenclatures] = useState({});

  // Уведомления
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar({ open: false, message: '', severity: 'success' });
    }, 3000);
  }, [setSnackbar]);

  // Загрузка номенклатур для склада
  const loadWarehouseNomenclatures = useCallback(async (warehouseId) => {
    try {
      const nomenclaturesData = await apiService.getNomenclatures(warehouseId);
      setNomenclatures(prev => ({
        ...prev,
        [warehouseId]: nomenclaturesData
      }));
    } catch (error) {
      console.error(`❌ Ошибка загрузки номенклатур для склада ${warehouseId}:`, error);
      // Используем пустой массив если API недоступно
      setNomenclatures(prev => ({
        ...prev,
        [warehouseId]: []
      }));
    }
  }, []);

  // Загрузка всех номенклатур организации
  const loadAllNomenclatures = useCallback(async () => {
    try {
      const allNomenclatures = await apiService.getNomenclatures();
      // Группируем номенклатуры по складам
      const groupedNomenclatures = {};
      allNomenclatures.forEach(item => {
        if (item.warehouse_id) {
          if (!groupedNomenclatures[item.warehouse_id]) {
            groupedNomenclatures[item.warehouse_id] = [];
          }
          groupedNomenclatures[item.warehouse_id].push(item);
        }
      });
      setNomenclatures(groupedNomenclatures);
    } catch (error) {
      console.error('❌ Ошибка загрузки всех номенклатур:', error);
    }
  }, []);

  // Создание номенклатуры
  const handleCreateNomenclature = useCallback(() => {
    // Эта функция только для инициализации создания
    // Реальная логика в handleSaveNomenclature
  }, []);

  // Сохранение номенклатуры
  const handleSaveNomenclature = async (nomenclatureData, warehouse = null) => {
    try {
      const newNomenclature = await apiService.createNomenclature({
        ...nomenclatureData,
        organization_id: organizationId,
        warehouse_id: warehouse?.id || null
      });

      // Обновляем список номенклатур
      if (warehouse) {
        // Добавляем к конкретному складу
        setNomenclatures(prev => ({
          ...prev,
          [warehouse.id]: [
            ...(prev[warehouse.id] || []),
            newNomenclature
          ]
        }));
      } else {
        // Перезагружаем все номенклатуры
        loadAllNomenclatures();
      }

      showSnackbar('✅ Номенклатура создана');
      return newNomenclature;
    } catch (error) {
      console.error('❌ Ошибка создания номенклатуры:', error);
      showSnackbar('❌ Ошибка создания номенклатуры', 'error');
      throw error;
    }
  };

  // Редактирование номенклатуры
  const handleEditNomenclature = async (nomenclatureId, updatedData) => {
    try {
      const updatedNomenclature = await apiService.updateNomenclature(nomenclatureId, updatedData);
      
      // Обновляем во всех складах
      setNomenclatures(prev => {
        const newNomenclatures = { ...prev };
        Object.keys(newNomenclatures).forEach(warehouseId => {
          newNomenclatures[warehouseId] = newNomenclatures[warehouseId].map(item =>
            item.id === nomenclatureId ? { ...item, ...updatedNomenclature } : item
          );
        });
        return newNomenclatures;
      });
      
      showSnackbar('✅ Номенклатура обновлена');
      return updatedNomenclature;
    } catch (error) {
      console.error('❌ Ошибка обновления номенклатуры:', error);
      showSnackbar('❌ Ошибка обновления номенклатуры', 'error');
      throw error;
    }
  };

  // Удаление номенклатуры
  const handleDeleteNomenclature = async (nomenclatureId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту номенклатуру?')) {
      return;
    }

    try {
      await apiService.deleteNomenclature(nomenclatureId);
      
      // Удаляем из всех складов
      setNomenclatures(prev => {
        const newNomenclatures = { ...prev };
        Object.keys(newNomenclatures).forEach(warehouseId => {
          newNomenclatures[warehouseId] = newNomenclatures[warehouseId].filter(
            item => item.id !== nomenclatureId
          );
        });
        return newNomenclatures;
      });
      
      showSnackbar('✅ Номенклатура удалена');
    } catch (error) {
      console.error('❌ Ошибка удаления номенклатуры:', error);
      showSnackbar('❌ Ошибка удаления номенклатуры', 'error');
      throw error;
    }
  };

  // Поиск номенклатур
  const handleSearchNomenclatures = async (query) => {
    try {
      const searchResults = await apiService.searchNomenclatures(query);
      return searchResults;
    } catch (error) {
      console.error('❌ Ошибка поиска номенклатур:', error);
      showSnackbar('❌ Ошибка поиска номенклатур', 'error');
      return [];
    }
  };

  // Подсчет общего количества номенклатур
  const getTotalNomenclaturesCount = useCallback(() => {
    return Object.values(nomenclatures).reduce((total, warehouseNomenclatures) => {
      return total + (warehouseNomenclatures?.length || 0);
    }, 0);
  }, [nomenclatures]);

  return {
    nomenclatures,
    setNomenclatures,
    loadWarehouseNomenclatures,
    loadAllNomenclatures,
    handleCreateNomenclature,
    handleSaveNomenclature,
    handleEditNomenclature,
    handleDeleteNomenclature,
    handleSearchNomenclatures,
    getTotalNomenclaturesCount
  };
};


export default useNomenclatures;