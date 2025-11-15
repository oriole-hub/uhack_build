import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import SkeletonLoader from './SkeletonLoader';
import '../css/styles.scss';
import '../../pages/Dashboard.scss';

const DashboardSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`dashboard-page ${isDark ? 'dark-mode' : ''}`}>
      <div className="dashboard-content-wrapper">
        {/* Welcome section skeleton */}
        <div className="dashboard-welcome-section">
          <div className="welcome-header">
            <SkeletonLoader variant="title" width="400px" height="32px" />
            <SkeletonLoader variant="rect" width="100px" height="40px" />
          </div>
          <div className="welcome-content-box">
            <div className="account-info">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="account-info-row" style={{ marginBottom: '12px' }}>
                  <SkeletonLoader variant="line" width="120px" />
                  <SkeletonLoader variant="line" width="200px" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Organizations section skeleton */}
        <div className="organization-section">
          <div className="section-header">
            <SkeletonLoader variant="title" width="200px" height="28px" />
            <div className="section-header-actions">
              <SkeletonLoader variant="rect" width="80px" height="36px" />
              <SkeletonLoader variant="rect" width="180px" height="36px" />
            </div>
          </div>
          <div className="organizations-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="organization-card-new" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <SkeletonLoader variant="title" width="250px" height="24px" />
                  <SkeletonLoader variant="circle" width="32px" height="32px" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <SkeletonLoader variant="line" width="100%" />
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

export default DashboardSkeleton;

