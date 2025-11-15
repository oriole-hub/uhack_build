import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../theme/ThemeContext';
import { apiService } from '../../../services/api';
import { useOrganizationData } from '../hooks/useOrganizationData';
import { useWarehouses } from '../hooks/useWarehouses';
import { useMembers } from '../hooks/useMembers';
import EditOrganizationDialog from '../../dialogs/EditOrganizationDialog';
import CreateWarehouseDialog from '../../dialogs/CreateWarehouseDialog';
import EditWarehouseDialog from '../../dialogs/EditWarehouseDialog';
import InviteMemberDialog from '../../dialogs/InviteMemberDialog';
import CreateInvitationDialog from '../../dialogs/CreateInvitationDialog';
import QrCodeDialog from '../../dialogs/QrCodeDialog';
import InventoryReportDialog from '../../dialogs/InventoryReportDialog';
import OrganizationPageSkeleton from '../../common/OrganizationPageSkeleton';
import { Button } from '@mui/material';
import { Inventory as InventoryIcon } from '@mui/icons-material';
import './OrganizationPage.scss';

const OrganizationPage = () => {
  const { id } = useParams();
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false);
  const [editWarehouseDialogOpen, setEditWarehouseDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [createInvitationDialogOpen, setCreateInvitationDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showWarehouses, setShowWarehouses] = useState(true);
  const [showMembers, setShowMembers] = useState(true);
  const [statistics, setStatistics] = useState({
    totalSold: 0,
    totalInStock: 0,
    totalItems: 0
  });
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  const {
    organization,
    warehouses,
    setWarehouses,
    members,
    setMembers,
    loading,
    error,
    loadOrganizationData,
    handleUpdateOrganization
  } = useOrganizationData(id, setSnackbar);

  const {
    handleCreateWarehouse,
    handleUpdateWarehouse,
    handleDeleteWarehouse
  } = useWarehouses(id, setWarehouses, setSnackbar);

  const {
    handleInviteMember,
    handleRemoveMember
  } = useMembers(id, setMembers, setSnackbar);

  /** Показывает уведомление */
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ open: false, message: '', severity: 'success' }), 3000);
  }, []);

  /** Переходит на страницу склада */
  const handleViewWarehouse = async (warehouseId) => {
    try {
      // Выбираем склад перед переходом
      await apiService.chooseWarehouse(warehouseId);
      console.log('✅ Склад выбран перед переходом');
    } catch (error) {
      console.warn('⚠️ Ошибка выбора склада (продолжаем переход):', error);
      // Продолжаем переход даже если выбор не удался
    }
    navigate(`/warehouses/${warehouseId}`);
  };

  /** Открывает диалог редактирования склада */
  const handleEditWarehouseClick = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setEditWarehouseDialogOpen(true);
  };

  /** Выходит из системы */
  const handleLogout = async () => {
    try {
      await logout();
      showSnackbar('Вы успешно вышли из системы', 'success');
      navigate('/login');
    } catch (error) {
      showSnackbar('Ошибка при выходе из системы', 'error');
    }
  };

  /** Форматирует адрес */
  const formatAddress = (address) => {
    if (!address) return 'Не указан';
    if (typeof address === 'string') return address;
    const parts = [];
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);
    if (address.city) parts.push(`г. ${address.city}`);
    if (address.street) parts.push(`ул. ${address.street}`);
    if (address.addressLine1) parts.push(`д. ${address.addressLine1}`);
    if (address.addressLine2) parts.push(`стр. ${address.addressLine2}`);
    return parts.length > 0 ? parts.join(', ') : 'Не указан';
  };

  /** Проверяет валидность названия организации */
  const isValidOrgName = (value, orgId) => {
    if (!value || typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (trimmed === 'string' || trimmed === '') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(trimmed)) return false;
    if (trimmed === orgId) return false;
    return true;
  };

  /** Возвращает валидное название организации */
  const getValidOrgName = (org) => {
    if (!org) return 'Не указано';
    if (isValidOrgName(org.legalName, org.id)) return org.legalName;
    if (isValidOrgName(org.name, org.id)) return org.name;
    return 'Не указано';
  };

  /** Форматирует дату вступления участника */
  const formatMemberDate = (member) => {
    // Используем joined_at из API /api/orga/me
    const joinedDate = member.joined_at || member.joinedAt;
    if (joinedDate) {
      const date = new Date(joinedDate);
      // Проверяем, что дата валидна
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}.${month}.${year}`;
      }
    }
    return 'Не указана';
  };

  /** Прокручивает страницу наверх */
  const scrollToTop = () => {
    // Находим все возможные scrollable контейнеры
    const selectors = [
      '.organization-content-wrapper',
      '.organization-page',
      'main',
      '#root',
      'body',
      'html'
    ];
    
    // Прокручиваем все найденные контейнеры
    selectors.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        try {
          // Проверяем, является ли элемент scrollable
          const isScrollable = element.scrollHeight > element.clientHeight;
          if (isScrollable || selector === 'html' || selector === 'body') {
            element.scrollTo({ top: 0, behavior: 'smooth' });
            // Также устанавливаем scrollTop напрямую для надежности
            if (element.scrollTop !== undefined) {
              element.scrollTop = 0;
            }
          }
        } catch (e) {
          // Если scrollTo не поддерживается, используем scrollTop
          if (element.scrollTop !== undefined) {
            element.scrollTop = 0;
          }
        }
      }
    });
    
    // Прокручиваем window
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
    
    // Также прокручиваем document.documentElement
    try {
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
    } catch (e) {
      document.documentElement.scrollTop = 0;
    }
  };

  useEffect(() => {
    loadOrganizationData();
  }, [loadOrganizationData]);

  /** Рассчитывает общую статистику по всем складам организации */
  const calculateOrganizationStatistics = useCallback(async () => {
    if (!warehouses || warehouses.length === 0) {
      setStatistics({ totalSold: 0, totalInStock: 0, totalItems: 0 });
      return;
    }

    try {
      setStatisticsLoading(true);
      
      let totalSold = 0;
      let totalInStock = 0;
      let totalItems = 0;

      // Обрабатываем каждый склад
      for (const warehouse of warehouses) {
        try {
          // Загружаем документы склада
          const docs = await apiService.getSkladDocuments(warehouse.id);
          const documentsArray = Array.isArray(docs) ? docs : [];
          
          // Подсчитываем проданные товары из документов типа "outgoing"
          const outgoingDocs = documentsArray.filter(doc => doc.doc_type === 'outgoing');
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

          // Загружаем номенклатуры склада
          const nomenclatures = await apiService.getNomenclatures(warehouse.id, 0, 1000);
          const nomenclaturesArray = Array.isArray(nomenclatures) 
            ? nomenclatures 
            : (nomenclatures?.items || []);
          
          // Подсчитываем общее количество товаров на складе
          const warehouseStock = nomenclaturesArray.reduce((sum, nom) => {
            return sum + (Number(nom.quantity) || 0);
          }, 0);
          totalInStock += warehouseStock;
          
          // Подсчитываем количество позиций
          totalItems += nomenclaturesArray.length;
        } catch (err) {
          console.warn(`⚠️ Не удалось загрузить данные для склада ${warehouse.id}:`, err);
        }
      }

      setStatistics({
        totalSold,
        totalInStock,
        totalItems
      });
    } catch (err) {
      console.error('❌ Ошибка расчета статистики организации:', err);
    } finally {
      setStatisticsLoading(false);
    }
  }, [warehouses]);

  // Пересчитываем статистику при изменении складов
  useEffect(() => {
    if (warehouses && warehouses.length > 0) {
      calculateOrganizationStatistics();
    } else {
      setStatistics({ totalSold: 0, totalInStock: 0, totalItems: 0 });
    }
  }, [warehouses, calculateOrganizationStatistics]);

  // Логирование данных организации для отладки
  useEffect(() => {
    if (organization) {
      console.log('📊 Данные организации:', organization);
      console.log('📊 members_count:', organization.members_count);
      console.log('📊 members (из объекта):', organization.members);
      console.log('📊 Все ключи объекта:', Object.keys(organization));
    }
  }, [organization]);

  useEffect(() => {
    if (members) {
      console.log('👥 Участники (из состояния):', members);
      console.log('👥 Количество участников:', members.length);
    }
  }, [members]);

  if (loading) {
    return <OrganizationPageSkeleton />;
  }
  if (error) {
    return (
      <div className={`organization-page ${isDark ? 'dark-mode' : ''}`}>
        <div className="error">{error}</div>
      </div>
    );
  }
  if (!organization) {
    return (
      <div className={`organization-page ${isDark ? 'dark-mode' : ''}`}>
        <div className="error">Организация не найдена</div>
      </div>
    );
  }

  return (
    <div className={`organization-page ${isDark ? 'dark-mode' : ''}`}>
      <div className="organization-side-buttons">
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

      <div className="organization-content-wrapper">
      <div className="page-header-user">
        <div className="user-info">
          {user && (
            <>
              <span className="user-name">
                {user.name || user.email}
              </span>
              {user.role && (
                <span className="user-role">{user.role}</span>
              )}
            </>
          )}
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-back"
            onClick={() => navigate('/dashboard')}
            title="Назад"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'inherit'
            }}
          >
            ← Назад
          </button>
        </div>
      </div>

      <div className="organization-section">
        <div className="section-header">
          <h2>Основная информация организации:</h2>
        </div>
        
        <div className="section-content">
          <div className="info-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <table className="info-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>Юридическое название</th>
                  <th style={{ textAlign: 'center' }}>ИНН</th>
                  <th style={{ textAlign: 'center' }}>КПП</th>
                  <th style={{ textAlign: 'center' }}>Адрес</th>
                  <th style={{ textAlign: 'center' }}>Участников</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'center' }}>{getValidOrgName(organization)}</td>
                  <td style={{ textAlign: 'center' }}>{organization.inn || 'Не указан'}</td>
                  <td style={{ textAlign: 'center' }}>{organization.kpp || organization.settings?.kpp || 'Не указан'}</td>
                  <td style={{ textAlign: 'center' }}>{formatAddress(organization.address)}</td>
                  <td style={{ textAlign: 'center' }}>{
                    (organization.members_count !== undefined && organization.members_count !== null) 
                      ? organization.members_count 
                      : (members && Array.isArray(members) && members.length > 0)
                        ? members.length
                        : (organization.members && Array.isArray(organization.members) && organization.members.length > 0)
                          ? organization.members.length
                          : (organization.members_count === 0 || (members && Array.isArray(members) && members.length === 0))
                            ? 0
                            : 'Не указано'
                  }</td>
                </tr>
              </tbody>
            </table>
            
            <div className="card-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', width: '100%' }}>
              <button
                className="btn btn-action btn-add-warehouse"
                onClick={() => setWarehouseDialogOpen(true)}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#10b981';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <img 
                  src={`/assets/icons/add_icon_${isDark ? 'white' : 'black'}.svg`}
                  alt="Добавить склад"
                  style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                />
                Добавить склад
              </button>
              <button
                className="btn btn-action btn-add-member"
                onClick={() => setInviteDialogOpen(true)}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#10b981';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <img 
                  src={`/assets/icons/add_user_icon_${isDark ? 'white' : 'black'}.svg`}
                  alt="Добавить участника"
                  style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                />
                Добавить участника
              </button>
              <button
                className="btn btn-action btn-add-member"
                onClick={() => setCreateInvitationDialogOpen(true)}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#10b981';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <img 
                  src={`/assets/icons/add_icon_${isDark ? 'white' : 'black'}.svg`}
                  alt="Создать приглашение"
                  style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                />
                Создать приглашение
              </button>
              <button
                className="btn btn-action"
                title="QR-код"
                onClick={() => setQrDialogOpen(true)}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#10b981';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <img 
                  src="/assets/icons/qr-code_button_all_theme.svg"
                  alt="QR-код"
                  style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                />
                QR-код
              </button>
              <button
                className="btn btn-action"
                title="Настройки"
                onClick={() => setEditDialogOpen(true)}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#10b981';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <img 
                  src={`/assets/icons/settings_button_${isDark ? 'white' : 'black'}.svg`}
                  alt="Настройки"
                  style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                />
                Настройки
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Статистика по всем складам */}
      <div className="organization-statistics">
        <h2 className="statistics-title">Общая статистика</h2>
        <div className="statistics-cards">
          <div className="stat-card stat-card-stock">
            <div className="stat-icon">
              <img 
                src={`/assets/icons/settings_button_${isDark ? 'white' : 'black'}.svg`}
                alt="На складе"
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              />
            </div>
            <div className="stat-content">
              <div className="stat-label">На всех складах</div>
              <div className="stat-value">
                {statisticsLoading ? '...' : statistics.totalInStock.toLocaleString('ru-RU')}
              </div>
            </div>
          </div>
          <div className="stat-card stat-card-items">
            <div className="stat-icon">
              <img 
                src={`/assets/icons/add_user_icon_${isDark ? 'white' : 'black'}.svg`}
                alt="Позиций"
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              />
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

      <div className="organization-section">
        <div className="section-header">
          <h2>Склады организации:</h2>
          <button
            className="btn-hide"
            onClick={() => setShowWarehouses(!showWarehouses)}
          >
            {showWarehouses ? 'Скрыть' : 'Показать'}
          </button>
        </div>
        
        {showWarehouses && (
          <div className="section-content">
            {warehouses && warehouses.length > 0 ? (
              <div className="warehouses-grid">
                {warehouses.map((warehouse) => {
                  /** Возвращает отображаемое название склада */
                  const getWarehouseDisplayName = () => {
                    const isUUID = (str) => {
                      if (!str) return false;
                      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                      return uuidRegex.test(str);
                    };
                    const nameIsId = warehouse.name && warehouse.id && warehouse.name === warehouse.id;
                    if (warehouse.name && warehouse.name.trim() && !isUUID(warehouse.name) && !nameIsId) {
                      return warehouse.name;
                    }
                    if (warehouse.code && warehouse.code.trim()) {
                      return warehouse.code;
                    }
                    return 'Склад';
                  };
                  
                  return (
                  <div key={warehouse.id} className="warehouse-card">
                    <div className="warehouse-card-header">
                      <h3>{getWarehouseDisplayName()}</h3>
                      <div className="warehouse-card-actions">
                        <button className="btn-select" onClick={() => handleViewWarehouse(warehouse.id)}>
                          Выбрать
                        </button>
                        <button 
                          className="btn-delete-icon"
                          onClick={() => handleDeleteWarehouse(warehouse.id)}
                          title="Удалить"
                        >
                          <img 
                            src={`/assets/icons/delete_button_${isDark ? 'white' : 'black'}.svg`}
                            alt="Удалить"
                            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="warehouse-card-content">
                      <p><strong>Тип:</strong> {warehouse.type === 'MAIN' ? 'Основной' : 'Дополнительный'}</p>
                      <p><strong>Контактный номер:</strong> {warehouse.contact_person?.phone || warehouse.contact_phone || 'Не указан'}</p>
                      <p><strong>Адрес:</strong> {formatAddress(warehouse.address)}</p>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state-small">
                <p>Нет добавленных складов</p>
                <button
                  className="btn btn-contained"
                  onClick={() => setWarehouseDialogOpen(true)}
                >
                  Добавить склад
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="organization-section">
        <div className="section-header">
          <h2>Участники организации:</h2>
          <button
            className="btn-hide"
            onClick={() => setShowMembers(!showMembers)}
          >
            {showMembers ? 'Скрыть' : 'Показать'}
          </button>
        </div>
        
        {showMembers && (
          <div className="section-content">
            <div className="info-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <table className="info-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>Пользователь</th>
                    <th style={{ textAlign: 'center' }}>Роль</th>
                    <th style={{ textAlign: 'center' }}>Дата вступления</th>
                    <th style={{ textAlign: 'center' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {members && members.length > 0 ? (
                    members.map((member) => (
                      <tr key={member.id}>
                        <td style={{ textAlign: 'center' }}>{member.fullName || member.email || 'Не указано'}</td>
                        <td style={{ textAlign: 'center' }}>{member.role || 'USER'}</td>
                        <td style={{ textAlign: 'center' }}>{formatMemberDate(member)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={member.role === 'OWNER'}
                              title="Удалить"
                              style={{
                                backgroundColor: member.role === 'OWNER' ? '#ccc' : '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: member.role === 'OWNER' ? 'not-allowed' : 'pointer',
                                opacity: member.role === 'OWNER' ? 0.5 : 1,
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => {
                                if (member.role !== 'OWNER') {
                                  e.target.style.backgroundColor = '#dc2626';
                                  e.target.style.transform = 'translateY(-2px)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (member.role !== 'OWNER') {
                                  e.target.style.backgroundColor = '#ef4444';
                                  e.target.style.transform = 'translateY(0)';
                                }
                              }}
                            >
                              <img 
                                src={`/assets/icons/delete_button_white.svg`}
                                alt="Удалить"
                                style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                              />
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                        Нет участников
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      </div>

      <EditOrganizationDialog 
        open={editDialogOpen} 
        organization={organization} 
        onClose={() => setEditDialogOpen(false)} 
        onSave={handleUpdateOrganization} 
      />
      
      <CreateWarehouseDialog 
        open={warehouseDialogOpen} 
        onClose={() => setWarehouseDialogOpen(false)} 
        onCreate={handleCreateWarehouse} 
      />
      
      <EditWarehouseDialog 
        open={editWarehouseDialogOpen} 
        warehouse={selectedWarehouse} 
        onClose={() => {
          setEditWarehouseDialogOpen(false);
          setSelectedWarehouse(null);
        }} 
        onUpdate={handleUpdateWarehouse} 
      />
      
      <InviteMemberDialog 
        open={inviteDialogOpen} 
        onClose={() => setInviteDialogOpen(false)} 
        onInvite={handleInviteMember} 
      />

      <CreateInvitationDialog
        open={createInvitationDialogOpen}
        onClose={() => setCreateInvitationDialogOpen(false)}
        organizationId={id}
        onSuccess={() => {
          showSnackbar('✅ Приглашение успешно отправлено', 'success');
          loadOrganizationData();
        }}
      />
      
      <QrCodeDialog 
        open={qrDialogOpen} 
        organizationId={id} 
        organizationName={getValidOrgName(organization) || 'Организация'}
        onClose={() => setQrDialogOpen(false)} 
      />

      <InventoryReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        sklad={false}
        sklad_id={null}
        warehouseName={getValidOrgName(organization) || 'Организация'}
      />

      {snackbar.open && (
        <div className={`snackbar snackbar-${snackbar.severity}`}>
          <span className="snackbar-message">{snackbar.message}</span>
          <button 
            className="snackbar-close"
            onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}
            aria-label="Закрыть уведомление"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default OrganizationPage;