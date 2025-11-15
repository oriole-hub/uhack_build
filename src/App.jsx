// src/App.js - дополните маршруты
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import './App.scss';

// Провайдеры контекста
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Страницы
import Dashboard from './pages/Dashboard.jsx';
import JoinOrganizationPage from './pages/JoinOrganizationPage';
import OrganizationPage from './components/organization/pages/OrganizationPage';
import WarehousePage from './components/warehouse/WarehousePage';
import StockOperationsPage from './components/stock/pages/StockOperationsPage';
import InvitationsPage from './components/invitations/InvitationsPage';
import LoginPage from './components/auth/LoginPage/LoginPage';
import RegisterPage from './components/auth/RegisterPage/RegisterPage';
import VerificationPage from './components/auth/VerificationPage/VerificationPage';

// Компонент загрузки
function LoadingScreen() {
  // Проверяем тему из localStorage
  const isDark = localStorage.getItem('theme') === 'dark';
  
  return (
    <div className={`App ${isDark ? 'dark-mode' : ''}`} style={{ 
      backgroundColor: isDark ? '#1a1a1a' : '#f5f7fa',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="loading">Загрузка...</div>
    </div>
  );
}

// Компонент для редиректа с сохранением query параметров
function AuthRedirect() {
  const [searchParams] = useSearchParams();
  const invite = searchParams.get('invite');
  const to = invite ? `/login?invite=${encodeURIComponent(invite)}` : '/login';
  return <Navigate to={to} replace />;
}

// Компонент маршрутов
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <Routes>
        {/* ===== Публичные маршруты ===== */}
        <Route
          path="/auth"
          element={<AuthRedirect />}
        />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/register"
          element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/verify"
          element={!user ? <VerificationPage /> : <Navigate to="/dashboard" replace />}
        />

        {/* ===== Присоединение по QR / инвайту ===== */}
        <Route path="/orga/join/:code" element={<JoinOrganizationPage />} />

        {/* ===== Защищённые маршруты ===== */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/organizations/:id"
          element={user ? <OrganizationPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/warehouses/:id"
          element={user ? <WarehousePage /> : <Navigate to="/login" replace />}
        />
        {/* НОВЫЙ МАРШРУТ - Операции с товарами */}
        <Route
          path="/stock/operations"
          element={user ? <StockOperationsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/organizations/:id/operations"
          element={user ? <StockOperationsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/invitations"
          element={user ? <InvitationsPage /> : <Navigate to="/login" replace />}
        />

        {/* ===== Главная ===== */}
        <Route
          path="/"
          element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
        />

        {/* ===== Любой неизвестный маршрут ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// Главный компонент App
export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}