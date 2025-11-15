export const OPERATION_TYPES = [
  { value: 'TRANSFER', label: 'Перемещение между складами' },
  { value: 'SALE', label: 'Продажа' },
  { value: 'DISPOSAL', label: 'Утилизация' },
  { value: 'RECEIPT', label: 'Поступление' },
  { value: 'RETURN', label: 'Возврат' },
  { value: 'ADJUSTMENT', label: 'Корректировка' }
];

export const OPERATION_TYPE_COLORS = {
  TRANSFER: 'primary',
  SALE: 'success',
  DISPOSAL: 'error',
  RECEIPT: 'info',
  RETURN: 'warning',
  ADJUSTMENT: 'secondary'
};

export const OPERATION_TYPE_LABELS = {
  TRANSFER: 'Перемещение',
  SALE: 'Продажа',
  DISPOSAL: 'Утилизация',
  RECEIPT: 'Поступление',
  RETURN: 'Возврат',
  ADJUSTMENT: 'Корректировка'
};

