// src/components/warehouse/WarehousePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { apiService } from '../../services/api';
import CreateNomenclatureDialog from '../dialogs/CreateNomenclatureDialog';
import InventoryReportDialog from '../dialogs/InventoryReportDialog';
import CreateOperationForm from '../stock/dialogs/CreateOperationForm';
import SkladDocumentDialog from '../dialogs/SkladDocumentDialog';
import DocumentItemsDialog from '../dialogs/DocumentItemsDialog';
import BarcodeScanner from '../barcode/BarcodeScanner';
import WarehousePageSkeleton from '../common/WarehousePageSkeleton';
import Icon from '../common/Icon';
import './WarehousePage.scss';

const WarehousePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [warehouse, setWarehouse] = useState(null);
  const [nomenclatures, setNomenclatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 100,
    total: 0
  });
  const [nomenclatureDialogOpen, setNomenclatureDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [scanningLoading, setScanningLoading] = useState(false);
  const [prefilledBarcode, setPrefilledBarcode] = useState(null);
  const [operationDialogOpen, setOperationDialogOpen] = useState(false);
  const [selectedNomenclature, setSelectedNomenclature] = useState(null);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [allNomenclatures, setAllNomenclatures] = useState([]);
  const [operationLoading, setOperationLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [showDocuments, setShowDocuments] = useState(true);
  const [showNomenclatures, setShowNomenclatures] = useState(true);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentItemsDialogOpen, setDocumentItemsDialogOpen] = useState(false);
  const [selectedDocumentForItems, setSelectedDocumentForItems] = useState(null);
  const [statistics, setStatistics] = useState({
    totalSold: 0,
    totalInStock: 0,
    totalItems: 0
  });
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  console.log('🚀 WarehousePage запущен с ID:', id);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ open: false, message: '', severity: 'success' }), 3000);
  };

  const fetchWarehouse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Загрузка склада с ID:', id);
      
      // Сначала выбираем склад для работы
      try {
        await apiService.chooseWarehouse(id);
        console.log('✅ Склад выбран для работы');
      } catch (chooseErr) {
        console.warn('⚠️ Ошибка выбора склада (продолжаем загрузку):', chooseErr);
        // Не прерываем загрузку, если выбор склада не удался
      }
      
      const data = await apiService.getWarehouse(id);
      console.log('✅ Данные склада получены:', data);
      
      setWarehouse(data);
    } catch (err) {
      console.error('❌ Ошибка загрузки склада:', err);
      
      if (err.message.includes('404')) {
        setError('Склад не найден. Возможно, он был удален или у вас нет к нему доступа.');
      } else if (err.message.includes('401') || err.message.includes('токен')) {
        setError('Ошибка авторизации');
        navigate('/login');
      } else {
        setError(err.message || 'Не удалось загрузить данные склада');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchNomenclatures = useCallback(async (search = '', skip = 0) => {
    try {
      console.log('🔄 Загрузка номенклатур для склада:', id);
      
      // Используем endpoint /api/reestr/list с фильтрацией по warehouse_id
      const data = await apiService.getNomenclatures(id, skip, pagination.limit);
      console.log('✅ Номенклатуры получены:', data);
      
      // Предполагаем, что API возвращает массив номенклатур
      if (Array.isArray(data)) {
        setNomenclatures(data);
        setPagination(prev => ({ ...prev, skip, total: data.length }));
      } else if (data && Array.isArray(data.items)) {
        // Если API возвращает { items: [], total: number }
        setNomenclatures(data.items);
        setPagination(prev => ({ ...prev, skip, total: data.total }));
      } else {
        setNomenclatures([]);
      }
    } catch (err) {
      console.error('❌ Ошибка загрузки номенклатур:', err);
      setNomenclatures([]);
    }
  }, [id, pagination.limit]);

  const handleCreateNomenclature = async (nomenclatureData) => {
    try {
      console.log('📦 Создание номенклатуры:', nomenclatureData);
      
      // Проверяем обязательные поля
      if (!nomenclatureData.name || !nomenclatureData.article) {
        showSnackbar('Заполните обязательные поля: название и артикул', 'error');
        return;
      }

      // Используем API для создания номенклатуры
      const createdNomenclature = await apiService.createNomenclature(nomenclatureData);
      
      console.log('✅ Номенклатура создана:', createdNomenclature);
      showSnackbar('Номенклатура успешно создана', 'success');
      
      // Обновляем списки номенклатур
      await Promise.all([
        fetchNomenclatures(),
        fetchAllNomenclatures()
      ]);
      
      // Закрываем диалог
      setNomenclatureDialogOpen(false);
      setPrefilledBarcode(null);
      
    } catch (error) {
      console.error('❌ Ошибка создания номенклатуры:', error);
      const errorMessage = error.message || 'Ошибка при создании номенклатуры';
      showSnackbar(errorMessage, 'error');
      // Не закрываем диалог при ошибке, чтобы пользователь мог исправить данные
      throw error; // Пробрасываем ошибку, чтобы диалог не закрылся
    }
  };

  const handleSearch = useCallback((search = '') => {
    setSearchTerm(search);
    fetchNomenclatures(search, 0);
  }, [fetchNomenclatures]);

  const handlePageChange = useCallback((newSkip) => {
    fetchNomenclatures(searchTerm, newSkip);
  }, [fetchNomenclatures, searchTerm]);

  /** Загружает все номенклатуры организации */
  const fetchAllNomenclatures = useCallback(async () => {
    try {
      // Вызываем без warehouseId, чтобы получить все номенклатуры
      const nomenclatures = await apiService.getNomenclatures(null, 0, 1000);
      setAllNomenclatures(Array.isArray(nomenclatures) ? nomenclatures : (nomenclatures?.items || []));
    } catch (err) {
      console.error('❌ Ошибка загрузки номенклатур:', err);
    }
  }, []);

  /** Загружает все склады организации */
  const fetchAllWarehouses = useCallback(async () => {
    try {
      if (warehouse?.organization_id) {
        const warehouses = await apiService.getOrganizationWarehouses(warehouse.organization_id);
        setAllWarehouses(warehouses);
      }
    } catch (err) {
      console.error('❌ Ошибка загрузки складов:', err);
    }
  }, [warehouse?.organization_id]);

  /** Загружает документы склада */
  const fetchDocuments = useCallback(async () => {
    try {
      setDocumentsLoading(true);
      const docs = await apiService.getSkladDocuments(id);
      const documentsArray = Array.isArray(docs) ? docs : [];
      setDocuments(documentsArray);
    } catch (err) {
      console.error('❌ Ошибка загрузки документов:', err);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  }, [id]);

  /** Рассчитывает статистику на основе документов и номенклатур */
  const calculateStatistics = useCallback(async (docs = null, noms = null) => {
    try {
      setStatisticsLoading(true);
      
      const documentsToUse = docs || documents;
      const nomenclaturesToUse = noms || nomenclatures;
      
      // Подсчитываем проданные товары из документов типа "outgoing"
      let totalSold = 0;
      const outgoingDocs = documentsToUse.filter(doc => doc.doc_type === 'outgoing');
      
      for (const doc of outgoingDocs) {
        try {
          const items = await apiService.getDocumentItems(doc.id);
          const itemsArray = Array.isArray(items) ? items : (items?.items || []);
          const docTotal = itemsArray.reduce((sum, item) => {
            return sum + (Number(item.quantity_documental) || 0);
          }, 0);
          totalSold += docTotal;
        } catch (err) {
          console.warn(`⚠️ Не удалось загрузить items для документа ${doc.id}:`, err);
        }
      }
      
      // Подсчитываем общее количество товаров на складе из номенклатур
      const totalInStock = nomenclaturesToUse.reduce((sum, nom) => {
        return sum + (Number(nom.quantity) || 0);
      }, 0);
      
      // Подсчитываем общее количество позиций (номенклатур)
      const totalItems = nomenclaturesToUse.length;
      
      setStatistics({
        totalSold,
        totalInStock,
        totalItems
      });
    } catch (err) {
      console.error('❌ Ошибка расчета статистики:', err);
    } finally {
      setStatisticsLoading(false);
    }
  }, [documents, nomenclatures]);

  useEffect(() => {
    if (id) {
      fetchWarehouse();
      fetchNomenclatures();
      fetchAllNomenclatures();
      fetchDocuments();
    } else {
      setError('ID склада не указан');
      setLoading(false);
    }
  }, [fetchWarehouse, fetchNomenclatures, fetchAllNomenclatures, fetchDocuments, id]);

  // Пересчитываем статистику при изменении документов или номенклатур
  useEffect(() => {
    if ((documents.length > 0 || nomenclatures.length > 0) && !documentsLoading) {
      calculateStatistics(documents, nomenclatures);
    }
  }, [documents, nomenclatures, documentsLoading, calculateStatistics]);

  useEffect(() => {
    if (warehouse?.organization_id) {
      fetchAllWarehouses();
    }
  }, [warehouse?.organization_id, fetchAllWarehouses]);

  /** Включает прокрутку страницы */
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    fetchWarehouse();
    fetchNomenclatures();
    fetchDocuments();
  };

  /** Форматирует тип документа */
  const formatDocType = (docType) => {
    const types = {
      'outgoing': 'Отходный',
      'incoming': 'Приходный',
      'inventory': 'Инвентаризация'
    };
    return types[docType] || docType;
  };

  /** Форматирует дату */
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  /** Обрабатывает создание документа */
  const handleCreateDocument = () => {
    setSelectedDocument(null);
    setDocumentDialogOpen(true);
  };

  /** Обрабатывает редактирование документа */
  const handleEditDocument = (doc) => {
    setSelectedDocument(doc);
    setDocumentDialogOpen(true);
  };

  /** Обрабатывает сохранение документа */
  const handleSaveDocument = async (formData) => {
    try {
      if (selectedDocument) {
        // Редактирование
        await apiService.updateSkladDocument(selectedDocument.id, formData);
        showSnackbar('Документ успешно обновлен', 'success');
      } else {
        // Создание
        await apiService.createSkladDocument(formData);
        showSnackbar('Документ успешно создан', 'success');
      }
      fetchDocuments();
    } catch (error) {
      console.error('❌ Ошибка сохранения документа:', error);
      showSnackbar(error.message || 'Ошибка при сохранении документа', 'error');
      throw error;
    }
  };

  /** Обрабатывает удаление документа */
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Удалить документ?')) {
      return;
    }

    try {
      await apiService.deleteSkladDocument(docId);
      showSnackbar('Документ удален', 'success');
      fetchDocuments();
    } catch (error) {
      console.error('❌ Ошибка удаления документа:', error);
      showSnackbar('Ошибка при удалении документа', 'error');
    }
  };

  /** Обрабатывает открытие диалога номенклатур документа */
  const handleOpenDocumentItems = (doc) => {
    setSelectedDocumentForItems(doc);
    setDocumentItemsDialogOpen(true);
  };

  const handleOpenCreateNomenclature = (barcode = null) => {
    console.log('🔵 Открытие диалога создания номенклатуры, barcode:', barcode);
    setPrefilledBarcode(barcode);
    setNomenclatureDialogOpen(true);
    console.log('🔵 Диалог должен быть открыт, nomenclatureDialogOpen:', true);
  };

  /** Обрабатывает сканирование штрихкода */
  const handleBarcodeScan = async (barcode) => {
    try {
      setScanningLoading(true);
      
      const results = await apiService.searchByBarcode(barcode);
      
      if (!results || (Array.isArray(results) && results.length === 0)) {
        showSnackbar('Товар не найден. Предлагаем добавить новый товар.', 'info');
        handleOpenCreateNomenclature(barcode);
        return;
      }

      const foundItem = Array.isArray(results) ? results[0] : results;
      showSnackbar(`Товар найден: ${foundItem.name || foundItem.article || 'Без названия'}`, 'success');
      
      // Открываем диалог создания операции с предзаполненным товаром
      setSelectedNomenclature(foundItem);
      setOperationDialogOpen(true);
      
      fetchNomenclatures();
      fetchAllNomenclatures();
    } catch (error) {
      console.error('❌ Ошибка поиска по штрихкоду:', error);
      
      if (error.message.includes('404') || error.message.includes('not found')) {
        showSnackbar('Товар не найден. Предлагаем добавить новый товар.', 'info');
        handleOpenCreateNomenclature(barcode);
      } else {
        showSnackbar('Ошибка при поиске товара', 'error');
      }
    } finally {
      setScanningLoading(false);
    }
  };

  /** Обрабатывает создание операции со складом */
  const handleCreateOperation = async (operationData) => {
    try {
      setOperationLoading(true);
      
      await apiService.createStockOperation(operationData);
      
      showSnackbar('Операция успешно создана', 'success');
      setOperationDialogOpen(false);
      setSelectedNomenclature(null);
      
      // Обновляем список номенклатур
      fetchNomenclatures();
    } catch (error) {
      console.error('❌ Ошибка создания операции:', error);
      showSnackbar(error.message || 'Ошибка при создании операции', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  if (loading) {
    return <WarehousePageSkeleton />;
  }

  if (error) {
    return (
      <div className={`warehouse-page ${isDark ? 'dark-mode' : ''}`}>
        <div className="page-header">
          <button onClick={handleBack} className="btn-back">
            ← Назад
          </button>
          <h1>Ошибка</h1>
        </div>
        <div className="error-state">
          <div className="error-message">{error}</div>
          <div className="error-suggestions">
            <p>Возможные причины:</p>
            <ul>
              <li>Склад был удален</li>
              <li>У вас нет прав доступа к этому складу</li>
              <li>Неправильный ID склада</li>
            </ul>
          </div>
          <button onClick={handleRefresh} className="btn-primary">
            Повторить попытку
          </button>
          <button onClick={handleBack} className="btn-outline">
            Вернуться к организации
          </button>
        </div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className={`warehouse-page ${isDark ? 'dark-mode' : ''}`}>
        <div className="page-header">
          <button onClick={handleBack} className="btn-back">
            ← Назад
          </button>
          <h1>Склад не найден</h1>
        </div>
        <div className="error-state">
          <div className="error-message">Склад с указанным ID не существует или у вас нет к нему доступа</div>
          <button onClick={handleBack} className="btn-primary">
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  /** Прокручивает страницу наверх */
  const scrollToTop = () => {
    // Пытаемся найти scrollable контейнер
    const contentWrapper = document.querySelector('.warehouse-content-wrapper');
    if (contentWrapper) {
      contentWrapper.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Форматирует адрес для отображения
  const formatAddress = () => {
    if (!warehouse.address) return 'Не указан';
    const parts = [];
    if (warehouse.address.country) parts.push(warehouse.address.country);
    if (warehouse.address.city) parts.push(`г. ${warehouse.address.city}`);
    if (warehouse.address.street) parts.push(warehouse.address.street);
    if (warehouse.address.building) parts.push(`д. ${warehouse.address.building}`);
    return parts.length > 0 ? parts.join(', ') : 'Не указан';
  };

  return (
    <div className={`warehouse-page ${isDark ? 'dark-mode' : ''}`}>
      {/* Верхняя панель */}
      <div className="warehouse-top-bar">
        <h1 className="warehouse-title">Склад {warehouse.name || `№${warehouse.code || id}`}</h1>
        <button className="btn-logout" onClick={handleLogout}>
          ВЫЙТИ
        </button>
      </div>

      <div className="warehouse-content-wrapper">
        {/* Карточка информации о складе */}
        <div className="warehouse-info-card">
          <button className="warehouse-edit-btn" onClick={() => {/* TODO: открыть диалог редактирования */}}>
            <Icon name="change_button" size="small" useTheme={true} />
          </button>
          <div className="warehouse-info-list">
            <div className="warehouse-info-item">
              <span className="info-label">Тип:</span>
              <span className="info-value">{warehouse.type === 'MAIN' ? 'Основной' : 'Дополнительный'}</span>
            </div>
            <div className="warehouse-info-item">
              <span className="info-label">Код:</span>
              <span className="info-value">{warehouse.code || 'Не указан'}</span>
            </div>
            <div className="warehouse-info-item">
              <span className="info-label">ID:</span>
              <span className="info-value">#{warehouse.id?.slice(-6) || 'Не указан'}</span>
            </div>
            <div className="warehouse-info-item">
              <span className="info-label">Количество рабочих:</span>
              <span className="info-value">137</span>
            </div>
            <div className="warehouse-info-item">
              <span className="info-label">Адрес:</span>
              <span className="info-value">{formatAddress()}</span>
            </div>
            {warehouse.contact_person && (
              <>
                <div className="warehouse-info-item">
                  <span className="info-label">Контактное лицо:</span>
                  <span className="info-value">{warehouse.contact_person.name || warehouse.contact_person.fullName || 'Не указано'}</span>
                </div>
                <div className="warehouse-info-item">
                  <span className="info-label">Телефон:</span>
                  <span className="info-value">{warehouse.contact_person.phone || 'Не указан'}</span>
                </div>
                <div className="warehouse-info-item">
                  <span className="info-label">Почта:</span>
                  <span className="info-value">{warehouse.contact_person.email || 'Не указана'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Статистика */}
        <div className="warehouse-statistics">
          <h2 className="statistics-title">Статистика</h2>
          <div className="statistics-cards">
            <div className="stat-card stat-card-sold">
              <div className="stat-icon">
                <Icon name="add_icon" size="large" useTheme={true} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Продано товаров</div>
                <div className="stat-value">
                  {statisticsLoading ? '...' : statistics.totalSold.toLocaleString('ru-RU')}
                </div>
              </div>
            </div>
            <div className="stat-card stat-card-stock">
              <div className="stat-icon">
                <Icon name="settings_button" size="large" useTheme={true} />
              </div>
              <div className="stat-content">
                <div className="stat-label">На складе</div>
                <div className="stat-value">
                  {statisticsLoading ? '...' : statistics.totalInStock.toLocaleString('ru-RU')}
                </div>
              </div>
            </div>
            <div className="stat-card stat-card-items">
              <div className="stat-icon">
                <Icon name="add_icon" size="large" useTheme={true} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Всего позиций</div>
                <div className="stat-value">
                  {statisticsLoading ? '...' : statistics.totalItems.toLocaleString('ru-RU')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Секция номенклатур */}
        <div className="nomenclatures-section">
          <div className="nomenclatures-section-header">
            <h2>Номенклатуры:</h2>
            <div className="nomenclatures-header-actions">
              <button
                className="btn-hide"
                onClick={() => setShowNomenclatures(!showNomenclatures)}
              >
                {showNomenclatures ? 'Скрыть' : 'Показать'}
              </button>
              <div className="nomenclatures-search-box">
                <input
                  type="text"
                  placeholder="Поиск номенклатур..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
              <button
                className="btn-add-nomenclature"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenCreateNomenclature();
                }}
              >
                Добавить номенклатуру +
              </button>
            </div>
          </div>

          {showNomenclatures && (
            <div className="nomenclatures-list-table">
              {nomenclatures.length === 0 ? (
                <div className="empty-state">
                  <p>Нет номенклатур</p>
                  <button 
                    type="button"
                    className="btn-outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenCreateNomenclature();
                    }}
                  >
                    Добавить первую номенклатуру
                  </button>
                </div>
              ) : (
                <div className="nomenclatures-table">
                  {nomenclatures.map((nomenclature) => (
                    <div key={nomenclature.id} className="nomenclature-row">
                      <div className="nomenclature-cell nomenclature-name">
                        <span className="nomenclature-label">Название:</span>
                        <span className="nomenclature-value">{nomenclature.name || 'Не указано'}</span>
                      </div>
                      <div className="nomenclature-cell nomenclature-article">
                        <span className="nomenclature-label">Артикул:</span>
                        <span className="nomenclature-value">{nomenclature.article || 'Не указан'}</span>
                      </div>
                      <div className="nomenclature-cell nomenclature-barcode">
                        <span className="nomenclature-label">Штрихкод:</span>
                        <span className="nomenclature-value">{nomenclature.barcode || 'Не указан'}</span>
                      </div>
                      <div className="nomenclature-cell nomenclature-quantity">
                        <span className="nomenclature-label">Количество:</span>
                        <span className="nomenclature-value">{nomenclature.quantity || '0'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Секция документов */}
        <div className="documents-section">
          <div className="documents-section-header">
            <h2>Документы:</h2>
            <div className="documents-header-actions">
              <button
                className="btn-hide"
                onClick={() => setShowDocuments(!showDocuments)}
              >
                {showDocuments ? 'Скрыть' : 'Показать'}
              </button>
              <div className="documents-search-box">
                <input
                  type="text"
                  placeholder="Поиск по ID"
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
              <button
                className="btn-add-document"
                onClick={handleCreateDocument}
              >
                Добавить документ +
              </button>
              <button
                className="btn-qr-scan"
                onClick={() => {/* TODO: открыть сканер */}}
                title="Сканировать QR"
              >
                📷
              </button>
            </div>
          </div>

          {showDocuments && (
            <div className="documents-list-table">
              {documentsLoading ? (
                <div className="loading">Загрузка документов...</div>
              ) : documents.length === 0 ? (
                <div className="empty-state">
                  <p>Нет документов</p>
                  <button 
                    className="btn-outline"
                    onClick={handleCreateDocument}
                  >
                    Создать первый документ
                  </button>
                </div>
              ) : (
                <div className="documents-table">
                  {documents.map((doc) => (
                    <div key={doc.id} className="document-row">
                      <div className="document-cell document-type">
                        <span className="doc-type-label">Тип:</span>
                        <span className={`doc-type-value doc-type-${doc.doc_type}`}>
                          {formatDocType(doc.doc_type)}
                        </span>
                      </div>
                      <div className="document-cell document-number">
                        <span className="doc-number-label">Номер:</span>
                        <span className="doc-number-value">{doc.number || 'Без номера'}</span>
                      </div>
                      <div className="document-cell document-date">
                        <span className="doc-date-label">Дата создания:</span>
                        <span className="doc-date-value">{formatDate(doc.created_at)}</span>
                      </div>
                      <div className="document-cell document-actions">
                        <button
                          className="btn-view"
                          onClick={() => handleOpenDocumentItems(doc)}
                          title="Номенклатуры"
                        >
                          <Icon name="settings_button" size="small" useTheme={true} />
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => handleEditDocument(doc)}
                          title="Редактировать"
                        >
                          <Icon name="change_button" size="small" useTheme={true} />
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteDocument(doc.id)}
                          title="Удалить"
                        >
                          <Icon name="delete_button" size="small" useTheme={true} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Боковые кнопки */}
      <div className="warehouse-side-buttons">
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

      {/* Диалог создания номенклатуры */}
      <CreateNomenclatureDialog 
        open={nomenclatureDialogOpen}
        warehouse={warehouse}
        onClose={() => {
          setNomenclatureDialogOpen(false);
          setPrefilledBarcode(null);
        }}
        onCreate={handleCreateNomenclature}
        prefilledBarcode={prefilledBarcode}
      />

      {/* Диалог отчета по инвентарю */}
      <InventoryReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        sklad={true}
        sklad_id={id}
        warehouseName={warehouse?.name}
      />

      {/* Диалог создания операции */}
      <CreateOperationForm
        open={operationDialogOpen}
        onClose={() => {
          setOperationDialogOpen(false);
          setSelectedNomenclature(null);
        }}
        onSubmit={handleCreateOperation}
        warehouses={allWarehouses.length > 0 ? allWarehouses : (warehouse ? [warehouse] : [])}
        nomenclatures={allNomenclatures.length > 0 ? allNomenclatures : nomenclatures}
        loading={operationLoading}
        initialNomenclatureId={selectedNomenclature?.id || null}
        initialWarehouseId={warehouse?.id || null}
      />

      {/* Диалог создания/редактирования документа */}
      <SkladDocumentDialog
        open={documentDialogOpen}
        document={selectedDocument}
        warehouse={warehouse}
        warehouses={allWarehouses.length > 0 ? allWarehouses : (warehouse ? [warehouse] : [])}
        onClose={() => {
          setDocumentDialogOpen(false);
          setSelectedDocument(null);
        }}
        onSave={handleSaveDocument}
      />

      {/* Диалог номенклатур документа */}
      <DocumentItemsDialog
        open={documentItemsDialogOpen}
        document={selectedDocumentForItems}
        onClose={() => {
          setDocumentItemsDialogOpen(false);
          setSelectedDocumentForItems(null);
        }}
      />

      {/* Snackbar для уведомлений */}
      {snackbar.open && (
        <div className={`snackbar snackbar-${snackbar.severity}`}>
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default WarehousePage;