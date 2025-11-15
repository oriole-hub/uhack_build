import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import CreateOrganizationDialog from '../components/dialogs/CreateOrganizationDialog';
import { apiService } from '../services/api';
import DashboardSkeleton from '../components/common/DashboardSkeleton';
import '../components/css/styles.scss';
import './Dashboard.scss';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [organizations, setOrganizations] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showOrganizations, setShowOrganizations] = useState(true);

  useEffect(() => {
    loadOrganizations();
    document.title = 'Панель управления — Мои организации';
  }, []);

  /** Загружает список организаций */
  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrganizations();
      let orgsArray = [];

      if (Array.isArray(response)) {
        orgsArray = response;
      } else if (response && response.id) {
        orgsArray = [response];
      } else if (response && Array.isArray(response.data)) {
        orgsArray = response.data;
      } else if (response && Array.isArray(response.organizations)) {
        orgsArray = response.organizations;
      } else {
        orgsArray = [];
      }
      const validOrgs = orgsArray.filter(org => {
        const isValidName = (value, orgId) => {
          if (!value || typeof value !== 'string') return false;
          const trimmed = value.trim();
          if (trimmed === 'string' || trimmed === '') return false;
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(trimmed)) return false;
          if (trimmed === orgId) return false;
          return true;
        };
        
        return isValidName(org.name, org.id) || isValidName(org.legalName, org.id);
      });

      // Логирование для отладки
      console.log('📊 Ответ API организаций:', response);
      console.log('📊 Обработанные организации:', validOrgs);
      validOrgs.forEach(org => {
        console.log(`📊 Организация ${org.id}:`, {
          members_count: org.members_count,
          memberCount: org.memberCount,
          members: org.members,
          membersLength: org.members?.length
        });
      });

      setOrganizations(validOrgs);
      } catch (error) {
        console.error('Ошибка загрузки организаций:', error);
        // Убираем всплывающую ошибку - просто логируем в консоль
      } finally {
      setLoading(false);
    }
  };

  /** Создает новую организацию */
  const handleCreateOrganization = async (organizationData) => {
    try {
      await apiService.createOrganization(organizationData);
      setSnackbar({ 
        open: true, 
        message: '✅ Организация успешно создана', 
        severity: 'success' 
      });
      setCreateDialogOpen(false);
      await loadOrganizations();
    } catch (error) {
      console.error('Ошибка создания организации:', error);
      setSnackbar({ 
        open: true, 
        message: '❌ Ошибка создания организации', 
        severity: 'error' 
      });
    }
  };

  /** Показывает уведомление */
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ open: false, message: '', severity: 'success' }), 3000);
  }, []);

  /** Переходит на страницу организации */
  const handleOrganizationClick = (orgId) => {
    navigate(`/organizations/${orgId}`);
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

  /** Прокручивает страницу наверх */
  const scrollToTop = () => {
    // Находим все возможные scrollable контейнеры
    const selectors = [
      '.dashboard-content-wrapper',
      '.dashboard-page',
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

  const handleScrollToTop = (e) => {
    e.preventDefault();
    scrollToTop();
  };

  /** Возвращает валидное название организации */
  const getValidOrgName = (org) => {
    const isValidName = (value, orgId) => {
      if (!value || typeof value !== 'string') return false;
      const trimmed = value.trim();
      if (trimmed === 'string' || trimmed === '') return false;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(trimmed)) return false;
      if (trimmed === orgId) return false;
      return true;
    };
    
    if (isValidName(org.legalName, org.id)) return org.legalName;
    if (isValidName(org.name, org.id)) return org.name;
    return 'Не указано';
  };

  /** Форматирует дату в формате DD.MM.YY */
  const formatOrgDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${day}.${month}.${year}`;
    } catch {
      return 'Не указана';
    }
  };

  /** Обрабатывает удаление организации */
  const handleDeleteOrganization = (e, orgId) => {
    e.stopPropagation();
    if (window.confirm('Вы уверены, что хотите удалить эту организацию?')) {
      // TODO: Реализовать удаление организации
      showSnackbar('Функция удаления организации будет реализована позже', 'info');
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={`dashboard-page ${isDark ? 'dark-mode' : ''}`}>
      <div className="dashboard-side-buttons">
        <button className="side-button scroll-top" onClick={handleScrollToTop} title="Наверх">
          ↑
        </button>
        <button className="side-button theme-toggle" onClick={toggleTheme} title="Переключить тему">
          <img
            src={`/assets/LoginPage/${isDark ? 'sun' : 'moon'}.svg`}
            alt="Toggle theme"
          />
        </button>
      </div>

      <div className="dashboard-content-wrapper">
        <div className="dashboard-welcome-section">
          <div className="welcome-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
              <h1 className="welcome-title" style={{ margin: 0 }}>Добро пожаловать организатор!</h1>
              <img 
                src={`/assets/icons/main_logo_icon_${isDark ? 'white' : 'black'}.svg`}
                alt="Logo"
                style={{ height: '24px', width: 'auto' }}
              />
            </div>
            <div className="welcome-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="btn-invitations"
                onClick={() => navigate('/invitations')}
                title="Входящие приглашения"
                style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', fontSize: '14px', height: '36px' }}
              >

                Приглашения
              </button>
              <button 
                className="btn-logout-top"
                onClick={handleLogout}
                title="Выйти из системы"
                style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', fontSize: '14px', height: '36px' }}
              >
                <img 
                  src={`/assets/icons/exit_button_${isDark ? 'white' : 'black'}.svg`}
                  alt="Выйти"
                  style={{ width: '24px', height: '24px', marginRight: '8px', objectFit: 'contain' }}
                />
                ВЫЙТИ
              </button>
            </div>
          </div>
          <div className="welcome-content-box" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="account-info" style={{ textAlign: 'center', fontSize: '14px' }}>
              <div className="account-info-row">
                <span className="account-label">Имя:</span>
                <span className="account-value">{user?.name || user?.username || user?.fullName || 'Не указано'}</span>
              </div>
              <div className="account-info-row">
                <span className="account-label">Email:</span>
                <span className="account-value">{user?.email || 'Не указан'}</span>
              </div>
              {user?.role && (
                <div className="account-info-row">
                  <span className="account-label">Роль:</span>
                  <span className="account-value">{user.role}</span>
                </div>
              )}
              {user?.email_verified !== undefined && (
                <div className="account-info-row">
                  <span className="account-label">Email подтвержден:</span>
                  <span className={`account-value ${user.email_verified ? 'verified' : 'not-verified'}`}>
                    {user.email_verified ? '✓ Да' : '✗ Нет'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="organization-section">
          <div className="section-header">
            <h2>Организации:</h2>
            <div className="section-header-actions">
              <button
                className="btn-hide"
                onClick={() => setShowOrganizations(!showOrganizations)}
              >
                {showOrganizations ? 'Скрыть' : 'Показать'}
              </button>
              <button
                className="btn btn-contained btn-add-org"
                onClick={() => setCreateDialogOpen(true)}
              >
                Добавить организацию +
              </button>
            </div>
          </div>

          {showOrganizations && (
            <div className="section-content">
              {organizations.length > 0 ? (
                <div className="organizations-list">
                  {organizations.map((org) => {
                    const orgName = getValidOrgName(org);
                    const shortName = orgName.replace(/ООО|ОАО|ЗАО|ИП/g, '').trim() || orgName;
                    return (
                      <div key={org.id} className="organization-card-new">
                        <div className="org-card-top">
                          <h3 className="org-card-title">Организация {orgName}</h3>
                          <div className="org-card-actions">
                            <button
                              className="btn-select-org"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOrganizationClick(org.id);
                              }}
                            >
                              Выбрать
                            </button>
                            <button
                              className="btn-delete-org"
                              onClick={(e) => handleDeleteOrganization(e, org.id)}
                              title="Удалить организацию"
                            >
                              <img 
                                src={`/assets/icons/delete_button_${isDark ? 'white' : 'black'}.svg`}
                                alt="Удалить"
                                style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="org-card-tags">
                          <span className="org-tag">Название: {shortName}</span>
                          <span className="org-tag">Участников: {
                            (org.members_count !== undefined && org.members_count !== null)
                              ? org.members_count
                              : (org.memberCount !== undefined && org.memberCount !== null)
                                ? org.memberCount
                                : (org.members && Array.isArray(org.members))
                                  ? org.members.length
                                  : 0
                          }</span>
                          <span className="org-tag">Складов: {
                            (org.warehouseCount !== undefined && org.warehouseCount !== null)
                              ? org.warehouseCount
                              : (org.warehouses && Array.isArray(org.warehouses))
                                ? org.warehouses.length
                                : 0
                          }</span>
                          <span className="org-tag">Дата: {formatOrgDate(org.created_at || org.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state-box">
                  <p>У вас нету организаций</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

        {createDialogOpen && (
          <CreateOrganizationDialog
            onClose={() => setCreateDialogOpen(false)}
            onCreate={handleCreateOrganization}
          />
        )}

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

export default Dashboard;

