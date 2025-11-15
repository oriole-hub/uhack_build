import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { Visibility as ViewIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import OperationDetailsDialog from './dialogs/OperationDetailsDialog';
import { OPERATION_TYPE_COLORS, OPERATION_TYPE_LABELS } from './constants/operationTypes';
import { formatOperationDate, formatOperationQuantity, getWarehouseName, getNomenclatureName } from './utils/formatters';

const OperationsList = ({ 
  operations = [], 
  loading, 
  onRefresh,
  warehouses = [],
  nomenclatures = []
}) => {
  const [filters, setFilters] = useState({
    operation_type: '',
    sklad_id: '',
    nomenclature_id: ''
  });
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  /** Обрабатывает изменение фильтров */
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onRefresh(newFilters);
  };

  const filteredOperations = operations || [];
  const getWarehouseNameById = (id) => getWarehouseName(id, warehouses);
  const getNomenclatureNameById = (id) => getNomenclatureName(id, nomenclatures);

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Тип операции</InputLabel>
              <Select
                value={filters.operation_type}
                label="Тип операции"
                onChange={(e) => handleFilterChange('operation_type', e.target.value)}
              >
                <MenuItem value="">Все типы</MenuItem>
                {Object.entries(OPERATION_TYPE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Склад</InputLabel>
              <Select
                value={filters.sklad_id}
                label="Склад"
                onChange={(e) => handleFilterChange('sklad_id', e.target.value)}
              >
                <MenuItem value="">Все склады</MenuItem>
                {warehouses.map(warehouse => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Товар</InputLabel>
              <Select
                value={filters.nomenclature_id}
                label="Товар"
                onChange={(e) => handleFilterChange('nomenclature_id', e.target.value)}
              >
                <MenuItem value="">Все товары</MenuItem>
                {nomenclatures.map(item => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => onRefresh(filters)}
              disabled={loading}
            >
              Обновить
            </Button>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Тип операции</TableCell>
              <TableCell>Товар</TableCell>
              <TableCell>Количество</TableCell>
              <TableCell>Склад-источник</TableCell>
              <TableCell>Склад-назначение</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOperations.map((operation) => (
              <TableRow key={operation.id}>
                <TableCell>
                  <Chip
                    label={OPERATION_TYPE_LABELS[operation.operation_type]}
                    color={OPERATION_TYPE_COLORS[operation.operation_type]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {getNomenclatureNameById(operation.nomenclature_id)}
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={formatOperationQuantity(operation).color}
                  >
                    {formatOperationQuantity(operation).value}
                  </Typography>
                </TableCell>
                <TableCell>
                  {operation.from_sklad_id ? getWarehouseNameById(operation.from_sklad_id) : '-'}
                </TableCell>
                <TableCell>
                  {operation.to_sklad_id ? getWarehouseNameById(operation.to_sklad_id) : '-'}
                </TableCell>
                <TableCell>
                  {formatOperationDate(operation.created_at)}
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    title="Просмотреть детали"
                    onClick={() => {
                      setSelectedOperation(operation);
                      setDetailsDialogOpen(true);
                    }}
                  >
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredOperations.length === 0 && !loading && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              {operations.length === 0 ? 'Операции не найдены' : 'Нет операций по выбранным фильтрам'}
            </Typography>
          </Box>
        )}
      </TableContainer>

      <OperationDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedOperation(null);
        }}
        operation={selectedOperation}
        warehouses={warehouses}
        nomenclatures={nomenclatures}
      />
    </Box>
  );
};

export default OperationsList;