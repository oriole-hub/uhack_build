import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import SkeletonLoader from './SkeletonLoader';
import '../css/styles.scss';

const StockOperationsSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <div 
      style={{ 
        padding: '24px',
        backgroundColor: isDark ? '#1a1a1a' : '#f5f7fa',
        minHeight: '100vh'
      }}
    >
      {/* Header skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <SkeletonLoader variant="rect" width="100px" height="40px" />
        <SkeletonLoader variant="title" width="250px" height="32px" />
      </div>

      {/* User info skeleton */}
      <div style={{ 
        marginBottom: '24px', 
        padding: '16px', 
        background: isDark ? '#2a2a2a' : '#f5f5f5', 
        borderRadius: '8px' 
      }}>
        <SkeletonLoader variant="line" width="300px" height="16px" />
      </div>

      {/* Operations list skeleton */}
      <div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ 
            marginBottom: '16px', 
            padding: '16px', 
            background: isDark ? '#2a2a2a' : 'white', 
            borderRadius: '8px',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <SkeletonLoader variant="title" width="200px" height="20px" />
              <SkeletonLoader variant="line" width="100px" height="14px" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <SkeletonLoader variant="line" width="100%" />
              <SkeletonLoader variant="line" width="100%" />
              <SkeletonLoader variant="line" width="100%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockOperationsSkeleton;

