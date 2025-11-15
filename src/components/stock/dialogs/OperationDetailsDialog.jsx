import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Paper
} from '@mui/material';

import { OPERATION_TYPE_COLORS } from '../constants/operationTypes';
import { formatOperationQuantity, getWarehouseName, getNomenclatureName } from '../utils/formatters';

const DETAIL_OPERATION_TYPE_LABELS = {
  TRANSFER: 'Перемещение между складами',
  SALE: 'Продажа',
  DISPOSAL: 'Утилизация',
  RECEIPT: 'Поступление',
  RETURN: 'Возврат',
  ADJUSTMENT: 'Корректировка'
};

const OperationDetailsDialog = ({ 
  open, 
  onClose, 
  operation,
  warehouses = [],
  nomenclatures = []
}) => {
  if (!operation) return null;

  const getWarehouseNameById = (id) => getWarehouseName(id, warehouses);
  const getNomenclatureNameById = (id) => getNomenclatureName(id, nomenclatures);
  
  /** Форматирует дату для детального просмотра */
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      return new Date(dateString).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={DETAIL_OPERATION_TYPE_LABELS[operation.operation_type] || operation.operation_type}
            color={OPERATION_TYPE_COLORS[operation.operation_type] || 'default'}
            size="small"
          />
          <Typography variant="h6">Детали операции</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Основная информация
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">ID операции:</Typography>
                  <Typography variant="body1">{operation.id}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Товар:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {getNomenclatureNameById(operation.nomenclature_id)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Количество:</Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight="bold"
                    color={formatOperationQuantity(operation).color}
                  >
                    {formatOperationQuantity(operation).value}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Дата создания:</Typography>
                  <Typography variant="body1">{formatDate(operation.created_at)}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {(operation.from_sklad_id || operation.to_sklad_id) && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Информация о складах
                </Typography>
                <Divider sx={{ my: 1 }} />
                
                <Grid container spacing={2}>
                  {operation.from_sklad_id && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        {operation.operation_type === 'TRANSFER' ? 'Склад-источник:' : 'Склад:'}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {getWarehouseNameById(operation.from_sklad_id)}
                      </Typography>
                    </Grid>
                  )}
                  
                  {operation.to_sklad_id && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        {operation.operation_type === 'TRANSFER' ? 'Склад-назначение:' : 'Склад:'}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {getWarehouseNameById(operation.to_sklad_id)}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          )}

          {operation.comment && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Комментарий
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1">{operation.comment}</Typography>
              </Paper>
            </Grid>
          )}

          {operation.operation_metadata && Object.keys(operation.operation_metadata).length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Дополнительная информация
                </Typography>
                <Divider sx={{ my: 1 }} />
                
                <Grid container spacing={2}>
                  {Object.entries(operation.operation_metadata).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Typography variant="body2" color="textSecondary">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                      </Typography>
                      <Typography variant="body1">{String(value)}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Системная информация
              </Typography>
              <Divider sx={{ my: 1 }} />
              
              <Grid container spacing={2}>
                {operation.organization_id && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">ID организации:</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {operation.organization_id}
                    </Typography>
                  </Grid>
                )}
                
                {operation.performed_by && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Выполнил:</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {operation.performed_by}
                    </Typography>
                  </Grid>
                )}
                
                {operation.updated_at && operation.updated_at !== operation.created_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Обновлено:</Typography>
                    <Typography variant="body1">{formatDate(operation.updated_at)}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OperationDetailsDialog;

