// components/dialogs/InventoryReportDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Tabs,
  Tab
} from '@mui/material';
import { Download as DownloadIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { apiService } from '../../services/api';

const InventoryReportDialog = ({ open, onClose, sklad, sklad_id, warehouseName }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [viewMode, setViewMode] = useState('standard'); // 'standard' или 'token'
  const [token, setToken] = useState('');
  const [reportGeneration, setReportGeneration] = useState(null); // { message, url, qr, path, filename }

  // Извлечение токена из данных генерации (определяем до useEffect)
  const getTokenFromGeneration = (generationData) => {
    // Если токен есть в ответе напрямую
    if (generationData.token) {
      return generationData.token;
    }
    
    // Пытаемся извлечь токен из URL (если URL содержит /view/{token})
    const url = generationData.url || generationData.path;
    if (url) {
      console.log('Извлечение токена из URL:', url);
      
      // Ищем паттерн /view/{token} или /inventory/view/{token} в URL
      const viewMatch = url.match(/\/view\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (viewMatch && viewMatch[1]) {
        console.log('Найден токен в URL (view):', viewMatch[1]);
        return viewMatch[1];
      }
      
      // Ищем паттерн /report/inventory/view/{token} в URL
      const reportViewMatch = url.match(/\/report\/inventory\/view\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (reportViewMatch && reportViewMatch[1]) {
        console.log('Найден токен в URL (report/inventory/view):', reportViewMatch[1]);
        return reportViewMatch[1];
      }
    }
    
    // Пытаемся извлечь токен из имени файла
    // Формат: inventory_org_{org_id}_{date}.pdf или inventory_sklad_{sklad_id}_{date}.pdf
    const filename = generationData.filename || generationData.path || generationData.url;
    if (filename) {
      console.log('Извлечение токена из:', filename);
      
      // Ищем паттерн inventory_sklad_{token}_ или inventory_org_{token}_
      const skladMatch = filename.match(/inventory_sklad_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})_/i);
      if (skladMatch && skladMatch[1]) {
        console.log('Найден токен склада:', skladMatch[1]);
        return skladMatch[1];
      }
      
      const orgMatch = filename.match(/inventory_org_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})_/i);
      if (orgMatch && orgMatch[1]) {
        console.log('Найден токен организации:', orgMatch[1]);
        return orgMatch[1];
      }
      
      // Если паттерн не сработал, попробуем найти UUID после inventory_org_ или inventory_sklad_
      const generalMatch = filename.match(/inventory_(?:org|sklad)_([0-9a-f-]{36})/i);
      if (generalMatch && generalMatch[1]) {
        console.log('Найден токен общим паттерном:', generalMatch[1]);
        return generalMatch[1];
      }
    }
    
    // Если не нашли в имени файла, пытаемся найти UUID в пути (но это не токен, а ID организации/склада)
    // НЕ используем это как токен, так как это не работает
    console.warn('Токен не найден в данных генерации. URL:', url, 'Filename:', filename);
    return null;
  };

  useEffect(() => {
    const loadReport = async () => {
      if (!open) {
        setReportData(null);
        setError(null);
        setIsEmpty(false);
        setToken('');
        setViewMode('standard');
        setReportGeneration(null);
        return;
      }

      // Загружаем отчет только в стандартном режиме
      if (viewMode === 'standard' && !reportGeneration) {
        setLoading(true);
        setError(null);
        setIsEmpty(false);
        try {
          const data = await apiService.getInventoryReport(sklad, sklad_id);
          console.log('Ответ от getInventoryReport:', data, 'тип:', typeof data);
          
          // Если ответ - строка (токен), используем её напрямую
          if (typeof data === 'string' && data.trim()) {
            console.log('Токен получен как строка:', data);
            const tokenValue = data.trim();
            
            // Автоматически загружаем отчет по токену
            try {
              const reportData = await apiService.viewInventoryReportByToken(tokenValue);
              console.log('Данные отчета загружены через viewInventoryReportByToken:', reportData);
              setReportData(reportData);
              setIsEmpty(false);
              setError(null);
            } catch (reportError) {
              console.error('Ошибка загрузки отчета по токену:', reportError);
              setError('Не удалось загрузить отчет по токену');
              setReportData(null);
            }
          }
          // Если ответ - объект
          else if (data && typeof data === 'object') {
            // Если есть токен как строка в объекте, используем его для загрузки отчета
            if (data.token && typeof data.token === 'string') {
              console.log('Токен найден в ответе:', data.token);
              // Сохраняем данные генерации (если есть qr, url и т.д.)
              if (data.qr || data.url || data.message) {
                setReportGeneration(data);
              }
              setReportData(null);
              
              // Автоматически загружаем отчет по токену
              try {
                const reportData = await apiService.viewInventoryReportByToken(data.token);
                console.log('Данные отчета загружены через viewInventoryReportByToken:', reportData);
                setReportData(reportData);
                setIsEmpty(false);
                setError(null);
              } catch (reportError) {
                console.error('Ошибка загрузки отчета по токену:', reportError);
                setError('Не удалось загрузить отчет по токену');
                setReportData(null);
              }
            }
            // Проверяем, не являются ли это данные генерации (без токена)
            else if (data.qr || data.url || data.message) {
              // Это данные генерации, сохраняем их отдельно
              setReportGeneration(data);
              setReportData(null);
              
              // Пытаемся извлечь токен из данных генерации
              const tokenValue = getTokenFromGeneration(data);
              console.log('Извлеченный токен из данных генерации:', tokenValue);
              if (tokenValue) {
                try {
                  const reportData = await apiService.viewInventoryReportByToken(tokenValue);
                  console.log('Данные отчета загружены через viewInventoryReportByToken:', reportData);
                  setReportData(reportData);
                  setIsEmpty(false);
                  setError(null);
                } catch (reportError) {
                  console.error('Ошибка загрузки отчета по токену:', reportError);
                  setError('Не удалось загрузить отчет по токену');
                  setReportData(null);
                }
              } else {
                console.warn('Не удалось извлечь токен из данных генерации');
                setError('Не удалось извлечь токен из данных генерации отчета');
              }
            } else {
              // Это данные отчета
              setReportData(data);
              setIsEmpty(false);
            }
          } else {
            // Это данные отчета (не объект и не строка)
            setReportData(data);
            setIsEmpty(false);
          }
        } catch (error) {
          console.error('Ошибка загрузки отчета:', error);
          // Проверяем, если это 404 с сообщением о том, что данных нет
          const errorMessage = error.message || '';
          if (errorMessage.includes('404') && errorMessage.includes('No inventory data found')) {
            setIsEmpty(true);
            setError(null);
            setReportData(null);
          } else {
            setError('Не удалось загрузить отчет по инвентарю');
            setIsEmpty(false);
          }
        } finally {
          setLoading(false);
        }
      }
    };

    loadReport();
  }, [open, sklad, sklad_id, viewMode]);

  const handleLoadByTokenWithToken = async (tokenValue) => {
    if (!tokenValue) {
      setError('Токен не найден');
      return;
    }

    setLoading(true);
    setError(null);
    setIsEmpty(false);
    try {
      const data = await apiService.viewInventoryReportByToken(tokenValue);
      setReportData(data);
      setIsEmpty(false);
    } catch (error) {
      console.error('Ошибка загрузки отчета по токену:', error);
      const errorMessage = error.message || '';
      if (errorMessage.includes('404')) {
        setError('Отчет с указанным токеном не найден');
      } else {
        setError('Не удалось загрузить отчет по токену');
      }
      setIsEmpty(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadByToken = async () => {
    if (!token.trim()) {
      setError('Введите токен для просмотра отчета');
      return;
    }

    await handleLoadByTokenWithToken(token.trim());
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
          <CircularProgress />
          <Typography variant="body2" color="textSecondary">
            Загрузка отчета...
          </Typography>
        </Box>
      );
    }

    if (isEmpty) {
      return (
        <Alert severity="info" sx={{ width: '100%' }}>
          Нет данных по инвентарю для формирования отчета
        </Alert>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      );
    }

    if (!reportData) {
      return (
        <Alert severity="info" sx={{ width: '100%' }}>
          Нет данных для отображения
        </Alert>
      );
    }

    // Если данные - массив, отображаем таблицу
    if (Array.isArray(reportData)) {
      if (reportData.length === 0) {
        return (
          <Alert severity="info" sx={{ width: '100%' }}>
            Нет данных в отчете
          </Alert>
        );
      }

      // Определяем ключи для таблицы
      const keys = Object.keys(reportData[0] || {});
      
      return (
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {keys.map((key) => (
                  <TableCell key={key} sx={{ fontWeight: 'bold' }}>
                    {key}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.map((row, index) => (
                <TableRow key={index}>
                  {keys.map((key) => (
                    <TableCell key={key}>
                      {typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key] || '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // Проверяем, не являются ли это данные генерации (не должны отображаться как отчет)
    if (reportData && typeof reportData === 'object' && (reportData.qr || reportData.url || reportData.message)) {
      return (
        <Alert severity="warning" sx={{ width: '100%' }}>
          Получены данные генерации отчета вместо данных отчета. Пожалуйста, используйте токен для просмотра отчета.
        </Alert>
      );
    }

    // Если данные - объект, отображаем как JSON
    return (
      <Box>
        <Typography variant="body2" component="pre" sx={{ 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-word',
          backgroundColor: '#f5f5f5',
          padding: 2,
          borderRadius: 1,
          maxHeight: 400,
          overflow: 'auto'
        }}>
          {JSON.stringify(reportData, null, 2)}
        </Typography>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box>
          <Typography variant="h6" component="div">
            Отчет по инвентарю
          </Typography>
          {warehouseName && (
            <Typography variant="body2" color="textSecondary" component="div">
              {warehouseName}
            </Typography>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Переключатель режимов */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)}>
              <Tab label="Стандартный просмотр" value="standard" />
              <Tab label="Просмотр по токену" value="token" />
            </Tabs>
          </Box>

          {/* Поле для ввода токена (только в режиме token) */}
          {viewMode === 'token' && (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Токен отчета"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Введите токен для просмотра отчета"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                startIcon={<VisibilityIcon />}
                onClick={handleLoadByToken}
                disabled={loading || !token.trim()}
                fullWidth
              >
                Загрузить отчет по токену
              </Button>
            </Box>
          )}

          {/* Отображение данных генерации отчета (QR-код и ссылка для шаринга) */}
          {reportGeneration && (
            <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                {reportGeneration.message || 'Отчет успешно сгенерирован!'}
              </Alert>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                Поделиться отчетом:
              </Typography>
              
              {/* QR-код */}
              {reportGeneration.qr && (
                <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    QR-код для просмотра отчета:
                  </Typography>
                  <Box
                    component="img"
                    src={`data:image/png;base64,${reportGeneration.qr}`}
                    alt="QR Code"
                    sx={{
                      width: 150,
                      height: 150,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                    Отсканируйте QR-код для просмотра отчета
                  </Typography>
                </Box>
              )}

              {/* Ссылка */}
              {reportGeneration.url && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Ссылка для просмотра отчета:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={reportGeneration.url}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                    sx={{
                      backgroundColor: 'white',
                    }}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                    Скопируйте ссылку для отправки другим пользователям
                  </Typography>
                </Box>
              )}

              {/* Информация о файле */}
              {reportGeneration.filename && (
                <Typography variant="body2" color="textSecondary">
                  Файл: {reportGeneration.filename}
                </Typography>
              )}
            </Box>
          )}

          {/* Содержимое отчета */}
          {renderReportContent()}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Закрыть
        </Button>
        {/* Кнопки действий только в стандартном режиме */}
        {viewMode === 'standard' && (
          <>
            <Button
              startIcon={<DownloadIcon />}
              onClick={async () => {
                setDownloading(true);
                setError(null);
                setReportGeneration(null);
                setReportData(null);
                try {
                  const result = await apiService.downloadInventoryReport(sklad, sklad_id);
                  console.log('Ответ от downloadInventoryReport:', result);
                  
                  // Если это JSON ответ с данными генерации
                  if (result && typeof result === 'object') {
                    // Если есть токен как строка, используем его напрямую
                    if (result.token && typeof result.token === 'string') {
                      console.log('Токен найден в ответе downloadInventoryReport:', result.token);
                      setReportGeneration(result);
                      
                      // Автоматически загружаем отчет по токену для отображения
                      setLoading(true);
                      setError(null);
                      setIsEmpty(false);
                      try {
                        const reportData = await apiService.viewInventoryReportByToken(result.token);
                        console.log('Данные отчета загружены:', reportData);
                        setReportData(reportData);
                        setIsEmpty(false);
                        setError(null);
                      } catch (reportError) {
                        console.error('Ошибка загрузки отчета по токену:', reportError);
                        setError('Не удалось загрузить отчет по токену. Попробуйте использовать режим "Просмотр по токену"');
                        setReportData(null);
                      } finally {
                        setLoading(false);
                      }
                    }
                    // Если есть qr и url, но нет токена, пытаемся извлечь
                    else if (result.qr && result.url) {
                      setReportGeneration(result);
                      
                      // Автоматически загружаем отчет по токену для отображения
                      const tokenValue = getTokenFromGeneration(result);
                      console.log('Извлеченный токен:', tokenValue, 'из данных:', result);
                      if (tokenValue) {
                        setLoading(true);
                        setError(null);
                        setIsEmpty(false);
                        try {
                          const reportData = await apiService.viewInventoryReportByToken(tokenValue);
                          console.log('Данные отчета загружены:', reportData);
                          setReportData(reportData);
                          setIsEmpty(false);
                          setError(null);
                        } catch (reportError) {
                          console.error('Ошибка загрузки отчета по токену:', reportError);
                          setError('Не удалось загрузить отчет по токену. Попробуйте использовать режим "Просмотр по токену"');
                          setReportData(null);
                        } finally {
                          setLoading(false);
                        }
                      } else {
                        console.warn('Не удалось извлечь токен из данных генерации:', result);
                        setError('Не удалось извлечь токен из данных генерации отчета');
                      }
                    }
                  }
                  // Если это обычное скачивание файла, result будет { success: true, filename }
                } catch (error) {
                  console.error('Ошибка скачивания отчета:', error);
                  const errorMessage = error.message || '';
                  if (errorMessage.includes('404') && errorMessage.includes('No inventory data found')) {
                    setError('Нет данных для скачивания отчета');
                  } else {
                    setError('Не удалось скачать отчет по инвентарю');
                  }
                } finally {
                  setDownloading(false);
                }
              }}
              variant="contained"
              color="primary"
              disabled={downloading || loading}
            >
              {downloading ? 'Скачивание...' : 'Скачать отчет'}
            </Button>
            <Button
              onClick={async () => {
                setLoading(true);
                setError(null);
                setIsEmpty(false);
                setReportGeneration(null);
                setReportData(null);
                try {
                  const data = await apiService.getInventoryReport(sklad, sklad_id);
                  console.log('Ответ от getInventoryReport (Обновить):', data, 'тип:', typeof data);
                  
                  // Если ответ - строка (токен), используем её напрямую
                  if (typeof data === 'string' && data.trim()) {
                    console.log('Токен получен как строка (Обновить):', data);
                    const tokenValue = data.trim();
                    
                    // Автоматически загружаем отчет по токену
                    try {
                      const reportData = await apiService.viewInventoryReportByToken(tokenValue);
                      console.log('Данные отчета загружены через viewInventoryReportByToken (Обновить):', reportData);
                      setReportData(reportData);
                      setIsEmpty(false);
                      setError(null);
                    } catch (reportError) {
                      console.error('Ошибка загрузки отчета по токену (Обновить):', reportError);
                      setError('Не удалось загрузить отчет по токену');
                      setReportData(null);
                    }
                  }
                  // Если ответ - объект
                  else if (data && typeof data === 'object') {
                    // Если есть токен как строка в объекте, используем его для загрузки отчета
                    if (data.token && typeof data.token === 'string') {
                      console.log('Токен найден в ответе (Обновить):', data.token);
                      // Сохраняем данные генерации (если есть qr, url и т.д.)
                      if (data.qr || data.url || data.message) {
                        setReportGeneration(data);
                      }
                      
                      // Автоматически загружаем отчет по токену
                      try {
                        const reportData = await apiService.viewInventoryReportByToken(data.token);
                        console.log('Данные отчета загружены через viewInventoryReportByToken (Обновить):', reportData);
                        setReportData(reportData);
                        setIsEmpty(false);
                        setError(null);
                      } catch (reportError) {
                        console.error('Ошибка загрузки отчета по токену (Обновить):', reportError);
                        setError('Не удалось загрузить отчет по токену');
                        setReportData(null);
                      }
                    }
                    // Проверяем, не являются ли это данные генерации (без токена)
                    else if (data.qr || data.url || data.message) {
                      // Это данные генерации, сохраняем их отдельно
                      setReportGeneration(data);
                      
                      // Пытаемся извлечь токен из данных генерации
                      const tokenValue = getTokenFromGeneration(data);
                      console.log('Извлеченный токен из данных генерации (Обновить):', tokenValue);
                      if (tokenValue) {
                        try {
                          const reportData = await apiService.viewInventoryReportByToken(tokenValue);
                          console.log('Данные отчета загружены через viewInventoryReportByToken (Обновить):', reportData);
                          setReportData(reportData);
                          setIsEmpty(false);
                          setError(null);
                        } catch (reportError) {
                          console.error('Ошибка загрузки отчета по токену (Обновить):', reportError);
                          setError('Не удалось загрузить отчет по токену');
                          setReportData(null);
                        }
                      } else {
                        console.warn('Не удалось извлечь токен из данных генерации (Обновить)');
                        setError('Не удалось извлечь токен из данных генерации отчета');
                      }
                    } else {
                      // Это данные отчета
                      setReportData(data);
                      setIsEmpty(false);
                    }
                  } else {
                    // Это данные отчета (не объект и не строка)
                    setReportData(data);
                    setIsEmpty(false);
                  }
                } catch (error) {
                  console.error('Ошибка загрузки отчета (Обновить):', error);
                  const errorMessage = error.message || '';
                  if (errorMessage.includes('404') && errorMessage.includes('No inventory data found')) {
                    setIsEmpty(true);
                    setError(null);
                    setReportData(null);
                  } else {
                    setError('Не удалось загрузить отчет по инвентарю');
                    setIsEmpty(false);
                  }
                } finally {
                  setLoading(false);
                }
              }}
              variant="outlined"
              disabled={loading || downloading}
            >
              Обновить
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default InventoryReportDialog;

