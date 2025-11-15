import React from 'react';
import './Icon.scss';

/**
 * Компонент для отображения иконок из assets/icons
 * @param {string} name - имя файла иконки
 * @param {string} size - размер: 'small' (24px), 'medium' (32px), 'large' (40px), 'xlarge' (48px)
 * @param {string} className - дополнительные CSS классы
 * @param {object} style - дополнительные стили
 * @param {string} alt - альтернативный текст
 */
const Icon = ({ name, size = 'small', className = '', style = {}, alt = '' }) => {
  // Путь к иконкам в public/assets/icons
  const iconPath = `/assets/icons/${name}`;
  
  // Размеры иконок
  const sizes = {
    small: '24px',
    medium: '32px',
    large: '40px',
    xlarge: '48px'
  };
  
  const iconSize = sizes[size] || sizes.small;
  
  return (
    <img 
      src={iconPath} 
      alt={alt || name}
      className={`icon icon-${size} ${className}`}
      style={{ 
        width: iconSize, 
        height: iconSize, 
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style 
      }}
    />
  );
};

export default Icon;

