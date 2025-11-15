import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import SkeletonLoader from './SkeletonLoader';
import '../css/styles.scss';
import '../organization/pages/OrganizationPage.scss';

const OrganizationPageSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`organization-page ${isDark ? 'dark-mode' : ''}`}>
      <div className="organization-content-wrapper">
        {/* Header skeleton */}
        <div className="page-header-user">
          <div className="user-info">
            <SkeletonLoader variant="line" width="200px" height="20px" />
            <SkeletonLoader variant="line" width="150px" height="16px" />
          </div>
        </div>

        {/* Organization info skeleton */}
        <div className="organization-info-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <SkeletonLoader variant="title" width="300px" height="32px" />
            <SkeletonLoader variant="rect" width="120px" height="40px" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <SkeletonLoader variant="line" width="100px" height="12px" style={{ marginBottom: '8px' }} />
                <SkeletonLoader variant="line" width="100%" height="16px" />
              </div>
            ))}
          </div>
        </div>

        {/* Statistics skeleton */}
        <div className="organization-statistics">
          <SkeletonLoader variant="subtitle" width="200px" height="24px" style={{ marginBottom: '20px' }} />
          <div className="statistics-cards">
            {[1, 2, 3].map((i) => (
              <div key={i} className="stat-card">
                <SkeletonLoader variant="circle" width="48px" height="48px" />
                <div style={{ flex: 1 }}>
                  <SkeletonLoader variant="line" width="120px" height="14px" style={{ marginBottom: '8px' }} />
                  <SkeletonLoader variant="title" width="80px" height="24px" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warehouses section skeleton */}
        <div className="warehouses-section">
          <div className="section-header">
            <SkeletonLoader variant="title" width="200px" height="28px" />
            <SkeletonLoader variant="rect" width="180px" height="36px" />
          </div>
          <div className="warehouses-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="warehouse-card">
                <SkeletonLoader variant="title" width="250px" height="24px" style={{ marginBottom: '16px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <SkeletonLoader variant="line" width="100%" />
                  <SkeletonLoader variant="line" width="100%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationPageSkeleton;

