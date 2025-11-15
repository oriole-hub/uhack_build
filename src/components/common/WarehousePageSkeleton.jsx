import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import SkeletonLoader from './SkeletonLoader';
import '../css/styles.scss';
import '../warehouse/WarehousePage.scss';

const WarehousePageSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`warehouse-page ${isDark ? 'dark-mode' : ''}`}>
      <div className="warehouse-content-wrapper">
        {/* Top bar skeleton */}
        <div className="warehouse-top-bar">
          <SkeletonLoader variant="title" width="200px" height="28px" />
          <SkeletonLoader variant="rect" width="120px" height="40px" />
        </div>

        {/* Info card skeleton */}
        <div className="warehouse-info-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <SkeletonLoader variant="title" width="300px" height="32px" />
            <SkeletonLoader variant="rect" width="100px" height="36px" />
          </div>
          <div className="warehouse-info-list">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="warehouse-info-item">
                <SkeletonLoader variant="line" width="150px" height="14px" />
                <SkeletonLoader variant="line" width="200px" height="16px" />
              </div>
            ))}
          </div>
        </div>

        {/* Statistics skeleton */}
        <div className="warehouse-statistics">
          <SkeletonLoader variant="subtitle" width="150px" height="24px" style={{ marginBottom: '20px' }} />
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

        {/* Documents section skeleton */}
        <div className="documents-section">
          <div className="documents-section-header">
            <SkeletonLoader variant="title" width="200px" height="28px" />
            <div className="documents-header-actions">
              <SkeletonLoader variant="rect" width="200px" height="40px" />
              <SkeletonLoader variant="rect" width="120px" height="40px" />
              <SkeletonLoader variant="rect" width="180px" height="40px" />
            </div>
          </div>
          <div className="documents-list-table">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="document-row">
                <SkeletonLoader variant="line" width="100px" height="16px" />
                <SkeletonLoader variant="line" width="120px" height="16px" />
                <SkeletonLoader variant="line" width="100px" height="16px" />
                <SkeletonLoader variant="line" width="80px" height="16px" />
              </div>
            ))}
          </div>
        </div>

        {/* Nomenclatures section skeleton */}
        <div className="nomenclatures-section">
          <div className="nomenclatures-section-header">
            <SkeletonLoader variant="title" width="200px" height="28px" />
            <div className="nomenclatures-header-actions">
              <SkeletonLoader variant="rect" width="200px" height="40px" />
              <SkeletonLoader variant="rect" width="180px" height="40px" />
            </div>
          </div>
          <div className="nomenclatures-list-table">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="nomenclature-row">
                <SkeletonLoader variant="line" width="200px" height="16px" />
                <SkeletonLoader variant="line" width="100px" height="16px" />
                <SkeletonLoader variant="line" width="100px" height="16px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehousePageSkeleton;

