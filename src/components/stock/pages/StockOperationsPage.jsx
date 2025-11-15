import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../theme/ThemeContext';
import { useStockOperations } from '../hooks/useStockOperations';
import { apiService } from '../../../services/api';
import StockOperationsTab from '../tabs/StockOperationsTab';
import StockOperationsSkeleton from '../../common/StockOperationsSkeleton';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import '../styles/index.scss';

const StockOperationsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [warehouses, setWarehouses] = useState([]);
  const [nomenclatures, setNomenclatures] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  const {
    loadOperations
  } = useStockOperations(setSnackbar);

  /** Загружает начальные данные */
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [warehousesData, nomenclaturesData] = await Promise.all([
        apiService.getWarehouses(),
        apiService.getNomenclatures()
      ]);
      setWarehouses(warehousesData);
      setNomenclatures(nomenclaturesData);
      await loadOperations();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Ошибка загрузки данных', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, [loadOperations]);

  useEffect(() => {
    loadInitialData();
  }, [id, loadInitialData]);

  /** Возвращается на предыдущую страницу */
  const handleBack = () => {
    navigate(-1);
  };

  /** Прокручивает страницу наверх */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <StockOperationsSkeleton />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
        >
          Назад
        </Button>
        <Typography variant="h4" component="h1">
          Операции с товарами
        </Typography>
      </Box>

      {user && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2">
            👤 {user.fullName || user.email} • Роль: {user.role}
          </Typography>
        </Box>
      )}

      <StockOperationsTab
        organizationId={id}
        warehouses={warehouses}
        nomenclatures={nomenclatures}
        setSnackbar={setSnackbar}
      />

      {/* Боковые кнопки */}
      <div className="stock-side-buttons">
        <button className="side-button scroll-top" onClick={scrollToTop} title="Наверх">
          ↑
        </button>
        <button className="side-button theme-toggle" onClick={toggleTheme} title="Переключить тему">
          <img
            src={`/assets/LoginPage/${isDark ? 'sun' : 'moon'}.svg`}
            alt="Toggle theme"
          />
        </button>
      </div>

      {snackbar.open && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            p: 2,
            bgcolor: snackbar.severity === 'error' ? 'error.main' : 'success.main',
            color: 'white',
            borderRadius: 1,
            zIndex: 9999
          }}
        >
          {snackbar.message}
        </Box>
      )}
    </Box>
  );
};

export default StockOperationsPage;