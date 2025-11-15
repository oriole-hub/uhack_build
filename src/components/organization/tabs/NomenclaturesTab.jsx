// src/components/organization/NomenclaturesTab.jsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const NomenclaturesTab = ({ 
  nomenclatures, 
  warehouses, 
  onCreateNomenclature,
  onEditNomenclature, 
  onDeleteNomenclature, 
  onSearchNomenclatures,
  organizationId 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newNomenclature, setNewNomenclature] = useState({
    name: '',
    article: '',
    barcode: '',
    quantity: 1,
    unit: 'pcs',
    category_id: '',
    warehouse_id: '',
    properties: {
      brand: '',
      fat: '',
      volume: '',
      shelf_life: ''
    }
  });
  const [errors, setErrors] = useState({});

  // Все номенклатуры в одном массиве
  const allNomenclatures = useMemo(() => {
    const all = [];
    // Если nomenclatures - это объект с ключами-складами
    if (nomenclatures && typeof nomenclatures === 'object' && !Array.isArray(nomenclatures)) {
      Object.values(nomenclatures).forEach(warehouseNomenclatures => {
        if (Array.isArray(warehouseNomenclatures)) {
          all.push(...warehouseNomenclatures);
        }
      });
    } else if (Array.isArray(nomenclatures)) {
      // Если nomenclatures - это массив
      all.push(...nomenclatures);
    }
    return all;
  }, [nomenclatures]);

  // Отфильтрованные номенклатуры
  const filteredNomenclatures = useMemo(() => {
    let filtered = allNomenclatures;

    // Фильтр по поисковому запросу
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.article?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по складу
    if (selectedWarehouse !== 'all') {
      filtered = filtered.filter(item => item.warehouse_id === selectedWarehouse);
    }

    return filtered;
  }, [allNomenclatures, searchQuery, selectedWarehouse]);

  // Уникальные категории для автодополнения
  const categories = useMemo(() => {
    const uniqueCategories = new Set();
    allNomenclatures.forEach(item => {
      if (item.category_id) {
        uniqueCategories.add(item.category_id);
      }
    });
    return Array.from(uniqueCategories);
  }, [allNomenclatures]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchNomenclatures) {
      await onSearchNomenclatures(searchQuery);
    }
  };

  const getWarehouseName = (warehouseId) => {
    if (!warehouseId) return 'Неизвестный склад';
    const warehouse = warehouses?.find(w => w.id === warehouseId);
    return warehouse?.name || 'Неизвестный склад';
  };

  const handleCreateNomenclature = () => {
    setCreateDialogOpen(true);
    setNewNomenclature({
      name: '',
      article: '',
      barcode: '',
      quantity: 1,
      unit: 'pcs',
      category_id: '',
      warehouse_id: '',
      properties: {
        brand: '',
        fat: '',
        volume: '',
        shelf_life: ''
      }
    });
    setErrors({});
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!newNomenclature.name.trim()) {
      newErrors.name = 'Название товара обязательно';
    } else if (newNomenclature.name.trim().length < 3) {
      newErrors.name = 'Название должно содержать минимум 3 символа';
    }

    if (!newNomenclature.article.trim()) {
      newErrors.article = 'Артикул обязателен';
    } else if (newNomenclature.article.trim().length < 3) {
      newErrors.article = 'Артикул должен содержать минимум 3 символа';
    }

    if (!newNomenclature.warehouse_id) {
      newErrors.warehouse_id = 'Выберите склад';
    }

    if (!newNomenclature.category_id) {
      newErrors.category_id = 'Категория обязательна';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (onCreateNomenclature) {
        await onCreateNomenclature(newNomenclature);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Ошибка создания номенклатуры:', error);
    }
  };

  const handleChange = (field, value) => {
    setNewNomenclature(prev => ({
      ...prev,
      [field]: value
    }));

    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePropertyChange = (property, value) => {
    setNewNomenclature(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [property]: value
      }
    }));
  };

  const units = [
    { value: 'pcs', label: 'Штуки' },
    { value: 'kg', label: 'Килограммы' },
    { value: 'g', label: 'Граммы' },
    { value: 'l', label: 'Литры' },
    { value: 'ml', label: 'Миллилитры' },
    { value: 'pack', label: 'Упаковки' },
    { value: 'box', label: 'Коробки' }
  ];

  const safeWarehouses = Array.isArray(warehouses) ? warehouses : [];

  return (
    <Box>
      {/* Заголовок и действия */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Номенклатура
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNomenclature}
          disabled={safeWarehouses.length === 0}
        >
          Добавить номенклатуру
        </Button>
      </Box>

      {safeWarehouses.length === 0 && (
        <Card sx={{ mb: 3, bgcolor: 'warning.light' }}>
          <CardContent>
            <Typography color="warning.dark">
              Для добавления номенклатуры сначала создайте склад
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Фильтры и поиск */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Поиск номенклатуры"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                InputProps={{
                  endAdornment: <SearchIcon color="action" />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Фильтр по складу</InputLabel>
                <Select
                  value={selectedWarehouse}
                  label="Фильтр по складу"
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                >
                  <MenuItem value="all">Все склады</MenuItem>
                  {safeWarehouses.map(warehouse => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
              >
                Найти
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Статистика */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всего номенклатур
              </Typography>
              <Typography variant="h4" component="div">
                {allNomenclatures.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Найдено
              </Typography>
              <Typography variant="h4" component="div">
                {filteredNomenclatures.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Складов с номенклатурой
              </Typography>
              <Typography variant="h4" component="div">
                {nomenclatures && typeof nomenclatures === 'object' && !Array.isArray(nomenclatures)
                  ? Object.keys(nomenclatures).length
                  : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Таблица номенклатур */}
      {filteredNomenclatures.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Артикул</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Склад</TableCell>
                <TableCell>Количество</TableCell>
                <TableCell>Ед. изм.</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredNomenclatures.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Chip 
                      label={item.article || 'Без артикула'} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {item.name || 'Без названия'}
                    </Typography>
                    {item.barcode && (
                      <Typography variant="caption" color="textSecondary">
                        Штрих-код: {item.barcode}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={item.category_id || 'Без категории'} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {getWarehouseName(item.warehouse_id)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.quantity || 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {item.unit === 'pcs' ? 'шт' : 
                     item.unit === 'kg' ? 'кг' :
                     item.unit === 'g' ? 'г' :
                     item.unit === 'l' ? 'л' :
                     item.unit === 'ml' ? 'мл' :
                     item.unit === 'pack' ? 'упак' :
                     item.unit === 'box' ? 'кор' : item.unit || 'шт'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => onEditNomenclature && onEditNomenclature(item.id, item)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDeleteNomenclature && onDeleteNomenclature(item.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Номенклатура не найдена
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {searchQuery || selectedWarehouse !== 'all' 
                ? 'Попробуйте изменить параметры поиска' 
                : safeWarehouses.length === 0
                ? 'Сначала создайте склад'
                : 'Добавьте первую номенклатуру в систему'
              }
            </Typography>
            {safeWarehouses.length > 0 && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateNomenclature}
              >
                Добавить номенклатуру
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Диалог создания номенклатуры */}
      <Dialog 
        open={createDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Создать номенклатуру</Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Название товара *"
                value={newNomenclature.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name || 'Минимум 3 символа'}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Артикул *"
                value={newNomenclature.article}
                onChange={(e) => handleChange('article', e.target.value)}
                error={!!errors.article}
                helperText={errors.article || 'Минимум 3 символа'}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.warehouse_id}>
                <InputLabel>Склад *</InputLabel>
                <Select
                  value={newNomenclature.warehouse_id}
                  label="Склад *"
                  onChange={(e) => handleChange('warehouse_id', e.target.value)}
                >
                  {safeWarehouses.map(warehouse => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.warehouse_id && (
                  <Typography variant="caption" color="error">
                    {errors.warehouse_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={categories}
                value={newNomenclature.category_id}
                onChange={(event, newValue) => handleChange('category_id', newValue || '')}
                onInputChange={(event, newInputValue) => handleChange('category_id', newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Категория *"
                    error={!!errors.category_id}
                    helperText={errors.category_id || 'Введите или выберите категорию'}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Штрих-код"
                value={newNomenclature.barcode}
                onChange={(e) => handleChange('barcode', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Количество"
                type="number"
                value={newNomenclature.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Единица измерения</InputLabel>
                <Select
                  value={newNomenclature.unit}
                  label="Единица измерения"
                  onChange={(e) => handleChange('unit', e.target.value)}
                >
                  {units.map(unit => (
                    <MenuItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Свойства товара */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Свойства товара
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Бренд"
                value={newNomenclature.properties.brand}
                onChange={(e) => handlePropertyChange('brand', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Жирность/Состав"
                value={newNomenclature.properties.fat}
                onChange={(e) => handlePropertyChange('fat', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Объем/Вес"
                value={newNomenclature.properties.volume}
                onChange={(e) => handlePropertyChange('volume', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Срок годности"
                value={newNomenclature.properties.shelf_life}
                onChange={(e) => handlePropertyChange('shelf_life', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!newNomenclature.name || !newNomenclature.article || !newNomenclature.warehouse_id || !newNomenclature.category_id}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NomenclaturesTab;
