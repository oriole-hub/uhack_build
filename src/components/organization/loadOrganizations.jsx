import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateOrganizationDialog from '../components/dialogs/CreateOrganizationDialog';
import { authService } from '../services/auth';
import { apiService } from '../services/api';
import '../css/styles.css';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [organizations, setOrganizations] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [user, setUser] = useState(authService.getUser());
  const navigate = useNavigate();

  useEffect(() => {
    loadOrganizations();
    if (!user) {
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiService.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
    }
  };

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const userOrgs = await apiService.getMyOrganizations();

      if (userOrgs && userOrgs.length > 0) {
        setOrganizations(userOrgs);
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки организаций:', error);
      setOrganizations([]);
      if (error.status !== 401) {
        showSnackbarMessage('Ошибка загрузки организаций', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const showSnackbarMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar({ open: false, message: '', severity: 'success' });
    }, 3000);
  };

  const handleCreateOrganization = async (orgData) => {
    try {
      const newOrg = await apiService.createOrganization(orgData);
      console.log('Организация создана:', newOrg);
      await loadOrganizations();
      setCreateDialogOpen(false);
      showSnackbarMessage('Организация создана успешно!');

      if (newOrg.id) {
        setTimeout(() => {
          navigate(`/organizations/${newOrg.id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Ошибка создания организации:', error);
      showSnackbarMessage('Ошибка при создании организации: ' + error.message, 'error');
    }
  };

  const handleOrganizationClick = (orgId) => {
    navigate(`/organizations/${orgId}`);
  };

  const handleLogout = () => {
    onLogout();
    showSnackbarMessage('Вы вышли из системы');
  };

  if (loading) {
    return (
      <div className="grid-container">
        <div className="grid-content">
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Мои организации</h1>
            <p>Управляйте вашими организациями и складами</p>
            {user && (
              <div className="user-info">
                <span className="user-name">👤 {user.fullName || user.email}</span>
                <span className="user-role">Роль: {user.role}</span>
                {user.email_verified && (
                  <span className="verification-badge">✓ Email подтвержден</span>
                )}
              </div>
            )}
          </div>
          
          <div className="dashboard-actions">
            <button
              className="btn btn-contained"
              onClick={() => setCreateDialogOpen(true)}
            >
              <span>+</span>
              Создать организацию
            </button>
            <button
              className="btn btn-outlined"
              onClick={handleLogout}
            >
              🚪 Выйти
            </button>
          </div>
        </div>

        {/* Organizations Grid */}
        {organizations.length > 0 ? (
          <div className="organizations-grid">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="organization-card card"
                onClick={() => handleOrganizationClick(org.id)}
              >
                <div className="org-card-header">
                  <h3>{org.name}</h3>
                  <div className="org-badge">Активна</div>
                </div>
                <p className="org-description">{org.description}</p>
                <div className="org-stats">
                  <div className="stat">
                    <span className="stat-number">{org.memberCount}</span>
                    <span className="stat-label">участников</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{org.warehouseCount}</span>
                    <span className="stat-label">складов</span>
                  </div>
                  <div className="stat">
                    <span className="stat-date">с {org.createdAt}</span>
                  </div>
                </div>
                <div className="org-card-footer">
                  <button className="btn btn-outlined btn-small">
                    Перейти →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <h2>У вас пока нет организаций</h2>
            <p>Создайте первую организацию для управления складами и товарами</p>
            <button
              className="btn btn-contained"
              onClick={() => setCreateDialogOpen(true)}
            >
              <span>+</span>
              Создать организацию
            </button>
          </div>
        )}

        {/* Dialogs */}
        {createDialogOpen && (
          <CreateOrganizationDialog
            onClose={() => setCreateDialogOpen(false)}
            onCreate={handleCreateOrganization}
          />
        )}

        {/* Snackbar */}
        {snackbar.open && (
          <div className={`snackbar snackbar-${snackbar.severity}`}>
            {snackbar.message}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Dashboard;