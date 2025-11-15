import React from 'react';
import './Icon.scss';

/**
 * Компонент для отображения иконок из assets/icons
 * @param {string} name - имя файла иконки (без расширения, если используется theme)
 * @param {string} size - размер: 'small' (24px), 'medium' (32px), 'large' (40px), 'xlarge' (48px)
 * @param {string} className - дополнительные CSS классы
 * @param {object} style - дополнительные стили
 * @param {string} alt - альтернативный текст
 * @param {boolean} useTheme - использовать ли тему для выбора черной/белой версии иконки
 * @param {boolean} isDark - явно передать тему (если useTheme=true, но компонент вне ThemeProvider)
 */
const Icon = ({ name, size = 'small', className = '', style = {}, alt = '', useTheme = false, isDark: isDarkProp = null }) => {
  // Получаем тему из localStorage, если useTheme=true
  let isDark = false;
  if (useTheme) {
    if (isDarkProp !== null) {
      isDark = isDarkProp;
    } else {
      isDark = typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark';
    }
  }
  
  // Если useTheme=true, выбираем черную или белую версию иконки
  let iconPath;
  if (useTheme) {
    const baseName = name.replace(/\.(svg|png|jpg)$/i, '');
    const themeSuffix = isDark ? '_white' : '_black';
    iconPath = `/assets/icons/${baseName}${themeSuffix}.svg`;
  } else {
    iconPath = `/assets/icons/${name}`;
  }
  
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

