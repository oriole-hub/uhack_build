import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography
} from '@mui/material';

import { OPERATION_TYPES } from '../constants/operationTypes';

const CreateOperationForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  warehouses = [], 
  nomenclatures = [],
  loading = false,
  initialNomenclatureId = null,
  initialWarehouseId = null
}) => {
  const [formData, setFormData] = useState({
    operation_type: '',
    nomenclature_id: '',
    quantity: '',
    from_sklad_id: '',
    to_sklad_id: '',
    comment: '',
    operation_metadata: {}
  });

  const [metadata, setMetadata] = useState({
    reason: '',
    document_number: '',
    customer: '',
    supplier: '',
    additionalProp1: ''
  });

  useEffect(() => {
    if (open) {
      setFormData({
        operation_type: '',
        nomenclature_id: initialNomenclatureId || '',
        quantity: '',
        from_sklad_id: '',
        to_sklad_id: initialWarehouseId || '',
        comment: '',
        operation_metadata: {}
      });
      setMetadata({
        reason: '',
        document_number: '',
        customer: '',
        supplier: '',
        additionalProp1: ''
      });
    }
  }, [open, initialNomenclatureId, initialWarehouseId]);

  /** Возвращает список видимых полей для типа операции */
  const getVisibleFields = (operationType) => {
    const fields = {
      TRANSFER: ['from_sklad_id', 'to_sklad_id'],
      SALE: ['from_sklad_id'],
      DISPOSAL: ['from_sklad_id'],
      RECEIPT: ['to_sklad_id'],
      RETURN: ['to_sklad_id'],
      ADJUSTMENT: ['from_sklad_id', 'to_sklad_id']
    };
    return fields[operationType] || [];
  };

  /** Возвращает список обязательных полей для типа операции */
  const getRequiredFields = (type) => {
    const requirements = {
      TRANSFER: ['from_sklad_id', 'to_sklad_id'],
      SALE: ['from_sklad_id'],
      DISPOSAL: ['from_sklad_id'],
      RECEIPT: ['to_sklad_id'],
      RETURN: ['to_sklad_id'],
      ADJUSTMENT: []
    };
    return requirements[type] || [];
  };

  const isFormValid = () => {
    const required = getRequiredFields(formData.operation_type);
    for (const field of required) {
      if (!formData[field]) return false;
    }
    if (formData.operation_type === 'ADJUSTMENT' && 
        !formData.from_sklad_id && !formData.to_sklad_id) {
      return false;
    }
    if (!formData.operation_type || !formData.nomenclature_id || !formData.quantity) {
      return false;
    }
    if (formData.operation_type === 'ADJUSTMENT') {
      return Number(formData.quantity) !== 0;
    }
    return Number(formData.quantity) > 0;
  };

  /** Обрабатывает отправку формы */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const operationData = {
      operation_type: formData.operation_type,
      nomenclature_id: formData.nomenclature_id,
      quantity: Number(formData.quantity),
      from_sklad_id: formData.from_sklad_id || undefined,
      to_sklad_id: formData.to_sklad_id || undefined,
      comment: formData.comment || '',
      operation_metadata: {}
    };

    const cleanMetadata = Object.fromEntries(
      Object.entries(metadata).filter(([_, value]) => value && value.trim() !== '')
    );
    if (Object.keys(cleanMetadata).length > 0) {
      operationData.operation_metadata = cleanMetadata;
    }
    onSubmit(operationData);
  };

  /** Обрабатывает изменение полей формы */
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'operation_type') {
      const visibleFields = getVisibleFields(value);
      const newData = {
        operation_type: value,
        from_sklad_id: '',
        to_sklad_id: ''
      };
      
      // Автоматически заполняем склад, если он требуется и был предзаполнен
      if (visibleFields.includes('from_sklad_id') && initialWarehouseId) {
        newData.from_sklad_id = initialWarehouseId;
      }
      if (visibleFields.includes('to_sklad_id') && initialWarehouseId) {
        newData.to_sklad_id = initialWarehouseId;
      }
      
      setFormData(prev => ({ ...prev, ...newData }));
    }
  };

  /** Обрабатывает изменение метаданных */
  const handleMetadataChange = (field, value) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const visibleFields = getVisibleFields(formData.operation_type);
  const showFromSklad = visibleFields.includes('from_sklad_id');
  const showToSklad = visibleFields.includes('to_sklad_id');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Создание операции с товаром</Typography>
        {formData.operation_type && (
          <Typography variant="body2" color="textSecondary">
            {OPERATION_TYPES.find(t => t.value === formData.operation_type)?.label}
          </Typography>
        )}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Тип операции</InputLabel>
                <Select
                  value={formData.operation_type}
                  label="Тип операции"
                  onChange={(e) => handleChange('operation_type', e.target.value)}
                >
                  <MenuItem value="">Выберите тип операции</MenuItem>
                  {OPERATION_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Товар</InputLabel>
                <Select
                  value={formData.nomenclature_id}
                  label="Товар"
                  onChange={(e) => handleChange('nomenclature_id', e.target.value)}
                >
                  <MenuItem value="">Выберите товар</MenuItem>
                  {nomenclatures.map(item => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name || `Товар ${item.id.slice(0, 8)}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Количество"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                inputProps={{ 
                  min: formData.operation_type === 'ADJUSTMENT' ? undefined : 1,
                  step: 1 
                }}
                error={
                  formData.quantity && 
                  (formData.operation_type === 'ADJUSTMENT' 
                    ? Number(formData.quantity) === 0
                    : Number(formData.quantity) <= 0)
                }
                helperText={
                  formData.quantity && 
                  (formData.operation_type === 'ADJUSTMENT'
                    ? (Number(formData.quantity) === 0 
                        ? "Количество не может быть равно 0. Используйте положительное значение для увеличения или отрицательное для уменьшения"
                        : Number(formData.quantity) > 0
                        ? "Положительное значение увеличит остаток"
                        : "Отрицательное значение уменьшит остаток")
                    : Number(formData.quantity) <= 0 
                    ? "Количество должно быть больше 0" 
                    : "")
                }
              />
            </Grid>

            {showFromSklad && (
              <Grid item xs={12} md={showToSklad ? 6 : 12}>
                <FormControl 
                  fullWidth 
                  required={getRequiredFields(formData.operation_type).includes('from_sklad_id')}
                >
                  <InputLabel>
                    {formData.operation_type === 'TRANSFER' ? 'Склад-источник' : 'Склад'}
                  </InputLabel>
                  <Select
                    value={formData.from_sklad_id}
                    label={formData.operation_type === 'TRANSFER' ? 'Склад-источник' : 'Склад'}
                    onChange={(e) => handleChange('from_sklad_id', e.target.value)}
                  >
                    <MenuItem value="">Выберите склад</MenuItem>
                    {warehouses.map(warehouse => (
                      <MenuItem 
                        key={warehouse.id} 
                        value={warehouse.id}
                        disabled={formData.to_sklad_id === warehouse.id && formData.operation_type === 'TRANSFER'}
                      >
                        {warehouse.name || `Склад ${warehouse.id.slice(0, 8)}`}
                        {formData.to_sklad_id === warehouse.id && formData.operation_type === 'TRANSFER' && ' (выбран как назначение)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {showToSklad && (
              <Grid item xs={12} md={showFromSklad ? 6 : 12}>
                <FormControl 
                  fullWidth 
                  required={getRequiredFields(formData.operation_type).includes('to_sklad_id')}
                >
                  <InputLabel>
                    {formData.operation_type === 'TRANSFER' ? 'Склад-назначение' : 'Склад'}
                  </InputLabel>
                  <Select
                    value={formData.to_sklad_id}
                    label={formData.operation_type === 'TRANSFER' ? 'Склад-назначение' : 'Склад'}
                    onChange={(e) => handleChange('to_sklad_id', e.target.value)}
                  >
                    <MenuItem value="">Выберите склад</MenuItem>
                    {warehouses.map(warehouse => (
                      <MenuItem 
                        key={warehouse.id} 
                        value={warehouse.id}
                        disabled={formData.from_sklad_id === warehouse.id && formData.operation_type === 'TRANSFER'}
                      >
                        {warehouse.name || `Склад ${warehouse.id.slice(0, 8)}`}
                        {formData.from_sklad_id === warehouse.id && formData.operation_type === 'TRANSFER' && ' (выбран как источник)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.operation_type === 'TRANSFER' && (
              <Grid item xs={12}>
                <Box sx={{ p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="info.dark">
                    📦 Перемещение: со склада-источника на склад-назначение
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {formData.operation_type === 'ADJUSTMENT' && (
              <Grid item xs={12}>
                <Box sx={{ p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="warning.dark">
                    ⚠️ Корректировка: используйте положительное значение для увеличения остатка или отрицательное для уменьшения. Значение не может быть равно 0.
                  </Typography>
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Дополнительная информация
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Причина операции"
                value={metadata.reason}
                onChange={(e) => handleMetadataChange('reason', e.target.value)}
                placeholder="Например: Инвентаризация"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Номер документа"
                value={metadata.document_number}
                onChange={(e) => handleMetadataChange('document_number', e.target.value)}
                placeholder="Например: INV-001"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Комментарий"
                value={formData.comment}
                onChange={(e) => handleChange('comment', e.target.value)}
                placeholder="Дополнительная информация об операции..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Отмена
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!isFormValid() || loading}
          >
            {loading ? 'Создание...' : 'Создать операцию'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateOperationForm;