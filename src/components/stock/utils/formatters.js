/** Форматирует дату для отображения */
export const formatOperationDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

/** Форматирует количество для отображения в зависимости от типа операции */
export const formatOperationQuantity = (operation) => {
  const { operation_type, quantity } = operation;
  
  let value;
  let color = 'text.primary';
  
  if (operation_type === 'ADJUSTMENT') {
    value = quantity > 0 ? `+${quantity}` : quantity;
    color = quantity > 0 ? 'success.main' : 'error.main';
  } else if (operation_type === 'RECEIPT' || operation_type === 'RETURN') {
    value = `+${quantity}`;
    color = 'success.main';
  } else {
    value = `-${Math.abs(quantity)}`;
    color = 'text.primary';
  }
  
  return { value, color };
};

/** Получает название склада по ID */
export const getWarehouseName = (warehouseId, warehouses = []) => {
  if (!warehouseId) return 'Не указан';
  const warehouse = warehouses.find(w => w.id === warehouseId);
  return warehouse 
    ? (warehouse.name || `Склад ${warehouse.id.slice(0, 8)}`)
    : `ID: ${warehouseId.slice(0, 8)}`;
};

/** Получает название номенклатуры по ID */
export const getNomenclatureName = (nomenclatureId, nomenclatures = []) => {
  if (!nomenclatureId) return 'Не указан';
  const item = nomenclatures.find(n => n.id === nomenclatureId);
  return item 
    ? (item.name || `Товар ${item.id.slice(0, 8)}`)
    : `ID: ${nomenclatureId.slice(0, 8)}`;
};

