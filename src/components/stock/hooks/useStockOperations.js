import { useState, useCallback } from 'react';
import { apiService } from '../../../services/api';

export const useStockOperations = (setSnackbar) => {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentOperation, setCurrentOperation] = useState(null);

  /** Показывает уведомление */
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar({ open: false, message: '', severity: 'success' });
    }, 3000);
  }, [setSnackbar]);

  /** Создает новую операцию с валидацией */
  const createOperation = useCallback(async (operationData) => {
    try {
      setLoading(true);
      setError(null);
      if (operationData.operation_type === 'ADJUSTMENT') {
        if (operationData.quantity === 0) {
          throw new Error('Количество не может быть равно 0 для корректировки');
        }
      } else if (operationData.quantity <= 0) {
        throw new Error('Количество должно быть больше 0');
      }

      if (operationData.operation_type === 'TRANSFER') {
        if (!operationData.from_sklad_id || !operationData.to_sklad_id) {
          throw new Error('Для перемещения требуются склад-источник и склад-назначение');
        }
        if (operationData.from_sklad_id === operationData.to_sklad_id) {
          throw new Error('Склад-источник и склад-назначение не могут быть одинаковыми');
        }
      }

      if (operationData.operation_type === 'SALE' || operationData.operation_type === 'DISPOSAL') {
        if (!operationData.from_sklad_id) {
          throw new Error('Для списания требуется склад-источник');
        }
      }

      if (operationData.operation_type === 'RECEIPT' || operationData.operation_type === 'RETURN') {
        if (!operationData.to_sklad_id) {
          throw new Error('Для поступления/возврата требуется склад-назначение');
        }
      }

      if (operationData.operation_type === 'ADJUSTMENT') {
        if (!operationData.from_sklad_id && !operationData.to_sklad_id) {
          throw new Error('Для корректировки требуется указать склад');
        }
      }

      const newOperation = await apiService.createStockOperation(operationData);
      setOperations(prev => {
        if (!Array.isArray(prev)) {
          return [newOperation];
        }
        return [newOperation, ...prev];
      });
      
      showSnackbar('✅ Операция успешно создана');
      
      return newOperation;
    } catch (error) {
      let errorMessage = 'Ошибка при создании операции';
      
      try {
        const errorText = error.message || '';
        if (errorText.includes('detail')) {
          const detailMatch = errorText.match(/\{"detail":"([^"]+)"\}/);
          if (detailMatch) {
            errorMessage = detailMatch[1];
          } else if (errorText.includes('Insufficient stock')) {
            const availableMatch = errorText.match(/Available: (\d+), Required: (\d+)/);
            if (availableMatch) {
              errorMessage = `Недостаточно товара на складе. Доступно: ${availableMatch[1]}, Требуется: ${availableMatch[2]}`;
            } else {
              errorMessage = 'Недостаточно товара на складе';
            }
          } else if (errorText.includes('quantity') || errorText.includes('Количество')) {
            errorMessage = 'Количество должно быть больше 0';
          } else if (errorText.includes('not found') || errorText.includes('не найден')) {
            errorMessage = 'Товар или склад не найден';
          } else if (errorText.includes('требуется') || errorText.includes('одинаковыми')) {
            errorMessage = errorText;
          } else {
            errorMessage = errorText;
          }
        } else if (errorText.includes('quantity') || errorText.includes('Количество')) {
          errorMessage = 'Количество должно быть больше 0';
        } else if (errorText.includes('Insufficient stock')) {
          errorMessage = 'Недостаточно товара на складе';
        } else if (errorText.includes('not found') || errorText.includes('не найден')) {
          errorMessage = 'Товар или склад не найден';
        } else if (errorText.includes('требуется') || errorText.includes('одинаковыми')) {
          errorMessage = errorText;
        } else if (errorText) {
          errorMessage = errorText;
        }
      } catch (parseError) {
        errorMessage = error.message || 'Ошибка при создании операции';
      }
      
      setError(errorMessage);
      showSnackbar(`❌ ${errorMessage}`, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  /** Загружает список операций с фильтрами */
  const loadOperations = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const operationsData = await apiService.getStockOperations(filters);
      
      setOperations(prev => {
        if (!Array.isArray(prev)) {
          return operationsData || [];
        }
        return operationsData || [];
      });
      
    } catch (error) {
      setError('Не удалось загрузить операции');
      showSnackbar('❌ Ошибка загрузки операций', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  /** Получает операцию по ID */
  const getOperation = useCallback(async (operationId) => {
    try {
      setLoading(true);
      setError(null);
      const operation = await apiService.getStockOperation(operationId);
      setCurrentOperation(operation);
      
      return operation;
    } catch (error) {
      setError('Не удалось загрузить операцию');
      showSnackbar('❌ Ошибка загрузки операции', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  /** Обновляет операцию (временно недоступно) */
  const updateOperation = useCallback(async (operationId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      if (updateData.quantity && updateData.quantity <= 0) {
        throw new Error('Количество должно быть больше 0');
      }
      showSnackbar('⚠️ Обновление операций временно недоступно', 'warning');
      return null;
    } catch (error) {
      setError('Ошибка при обновлении операции');
      showSnackbar('❌ Ошибка обновления операции', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  /** Удаляет операцию (временно недоступно) */
  const deleteOperation = useCallback(async (operationId) => {
    try {
      setLoading(true);
      setError(null);
      if (!window.confirm('Вы уверены, что хотите удалить эту операцию? Это действие нельзя отменить.')) {
        return;
      }
      showSnackbar('⚠️ Удаление операций временно недоступно', 'warning');
      return;
    } catch (error) {
      setError('Ошибка при удалении операции');
      showSnackbar('❌ Ошибка удаления операции', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  /** Фильтрует операции по типу */
  const getOperationsByType = useCallback((type) => {
    if (!Array.isArray(operations)) return [];
    return operations.filter(op => op.operation_type === type);
  }, [operations]);

  /** Фильтрует операции по складу */
  const getOperationsByWarehouse = useCallback((warehouseId) => {
    if (!Array.isArray(operations)) return [];
    return operations.filter(op => 
      op.from_sklad_id === warehouseId || op.to_sklad_id === warehouseId
    );
  }, [operations]);

  /** Фильтрует операции по товару */
  const getOperationsByNomenclature = useCallback((nomenclatureId) => {
    if (!Array.isArray(operations)) return [];
    return operations.filter(op => op.nomenclature_id === nomenclatureId);
  }, [operations]);

  /** Возвращает статистику по операциям */
  const getOperationsStats = useCallback(() => {
    if (!Array.isArray(operations)) {
      return { total: 0, byType: {}, totalQuantity: 0 };
    }
    const stats = { total: operations.length, byType: {}, totalQuantity: 0 };
    operations.forEach(op => {
      stats.byType[op.operation_type] = (stats.byType[op.operation_type] || 0) + 1;
      stats.totalQuantity += Math.abs(op.quantity) || 0;
    });
    return stats;
  }, [operations]);

  /** Сбрасывает ошибку */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /** Сбрасывает текущую операцию */
  const clearCurrentOperation = useCallback(() => {
    setCurrentOperation(null);
  }, []);

  return {
    operations,
    currentOperation,
    loading,
    error,
    createOperation,
    loadOperations,
    getOperation,
    updateOperation,
    deleteOperation,
    getOperationsByType,
    getOperationsByWarehouse,
    getOperationsByNomenclature,
    getOperationsStats,
    clearError,
    clearCurrentOperation
  };
};