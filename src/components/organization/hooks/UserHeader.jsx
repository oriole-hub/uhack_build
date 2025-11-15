// src/components/organization/UserHeader.jsx
import React from 'react';

const UserHeader = ({ user, onLogout }) => {
  return (
    <div className="page-header-user">
      <div className="user-info">
        {user && (
          <>
            <span className="user-name">👤 {user.name || user.email}</span>
            {user.role && (
              <span className="user-role">{user.role}</span>
            )}
          </>
        )}
      </div>
      <button 
        className="btn-logout"
        onClick={onLogout}
        title="Выйти из системы"
      >
        <span className="logout-icon">🚪</span>
        Выйти
      </button>
    </div>
  );
};

export default UserHeader;