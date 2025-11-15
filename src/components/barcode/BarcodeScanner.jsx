import React, { useState, useRef, useEffect } from 'react';
import { TextField, Button, Box, Typography, IconButton } from '@mui/material';
import { QrCodeScanner as ScannerIcon, Clear as ClearIcon } from '@mui/icons-material';
import './BarcodeScanner.scss';

const BarcodeScanner = ({ onScan, onNotFound, warehouse, loading = false }) => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isScanning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isScanning]);

  /** Обрабатывает ввод штрихкода */
  const handleBarcodeChange = (e) => {
    const value = e.target.value.trim();
    setBarcode(value);
  };

  /** Обрабатывает отправку штрихкода */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    const scannedBarcode = barcode.trim();
    setBarcode('');
    
    if (onScan) {
      await onScan(scannedBarcode);
    }
  };

  /** Обрабатывает нажатие Enter */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  /** Очищает поле ввода */
  const handleClear = () => {
    setBarcode('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  /** Переключает режим сканирования */
  const toggleScanning = () => {
    setIsScanning(!isScanning);
    if (!isScanning && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <Box className="barcode-scanner">
      <Box className="barcode-scanner-header">
        <Typography variant="h6" className="barcode-scanner-title">
          Сканирование штрихкода
        </Typography>
        <IconButton
          onClick={toggleScanning}
          color={isScanning ? 'primary' : 'default'}
          size="small"
          title={isScanning ? 'Остановить сканирование' : 'Начать сканирование'}
        >
          <ScannerIcon />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit} className="barcode-scanner-form">
        <Box className="barcode-input-wrapper">
          <TextField
            inputRef={inputRef}
            fullWidth
            variant="outlined"
            placeholder={isScanning ? 'Наведите сканер на штрихкод...' : 'Введите или отсканируйте штрихкод'}
            value={barcode}
            onChange={handleBarcodeChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoFocus={isScanning}
            InputProps={{
              endAdornment: barcode && (
                <IconButton
                  onClick={handleClear}
                  size="small"
                  edge="end"
                  disabled={loading}
                >
                  <ClearIcon />
                </IconButton>
              ),
            }}
            className="barcode-input"
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!barcode.trim() || loading}
          className="barcode-submit-btn"
        >
          {loading ? 'Поиск...' : 'Найти товар'}
        </Button>
      </form>

      {warehouse && (
        <Typography variant="caption" color="textSecondary" className="barcode-warehouse-info">
          Склад: {warehouse.name || warehouse.code || 'Не указан'}
        </Typography>
      )}
    </Box>
  );
};

export default BarcodeScanner;

