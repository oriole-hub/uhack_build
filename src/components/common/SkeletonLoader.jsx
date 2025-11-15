import React from 'react';
import '../css/styles.scss';

/**
 * Компонент для отображения skeleton загрузки
 */
const SkeletonLoader = ({ 
  variant = 'line', 
  width, 
  height, 
  className = '',
  count = 1 
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`skeleton skeleton-${variant} ${className}`}
      style={{
        width: width || '100%',
        height: height || (variant === 'line' ? '14px' : variant === 'title' ? '32px' : variant === 'subtitle' ? '20px' : '16px')
      }}
    />
  ));

  return <>{skeletons}</>;
};

export default SkeletonLoader;

