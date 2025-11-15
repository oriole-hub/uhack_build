import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useStockOperations } from '../hooks/useStockOperations';
import CreateOperationForm from '../dialogs/CreateOperationForm';
import OperationsList from '../OperationsList';

const StockOperationsTab = ({ organizationId, warehouses, nomenclatures, setSnackbar }) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const {
    operations,
    loading,
    error,
    createOperation,
    loadOperations
  } = useStockOperations(setSnackbar);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  /** Обрабатывает создание операции */
  const handleCreateOperation = async (operationData) => {
    try {
      await createOperation(operationData);
      setCreateDialogOpen(false);
      loadOperations();
    } catch (error) {
      // Ошибка обработана в хуке
    }
  };

  /** Обновляет список операций с фильтрами */
  const handleRefresh = (filters = {}) => {
    loadOperations(filters);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Операции с товарами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Новая операция
        </Button>
      </Box>

      <OperationsList
        operations={operations}
        loading={loading}
        onRefresh={handleRefresh}
        warehouses={warehouses}
        nomenclatures={nomenclatures}
      />
      <CreateOperationForm
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateOperation}
        warehouses={warehouses}
        nomenclatures={nomenclatures}
        loading={loading}
      />
    </Box>
  );
};

export default StockOperationsTab;