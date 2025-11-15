import React, { useState, useEffect } from 'react';
import '../css/styles.scss';
import '../css/Dialogs.scss';

const EditOrganizationDialog = ({ open, organization, onClose, onSave }) => {
  const [formData, setFormData] = useState(organization);

  useEffect(() => {
    setFormData(organization);
  }, [organization]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  if (!open) return null;

  return (
    <div className="dialog-overlay active" onClick={handleOverlayClick}>
      <div className="dialog-content create-organization-dialog" onClick={handleContentClick}>
        <div className="dialog-header">
          <h2>Редактировать организацию</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Название</label>
              <input
                type="text"
                className="form-input"
                value={formData?.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="form-label">Юридическое название</label>
              <input
                type="text"
                className="form-input"
                value={formData?.legalName || ''}
                onChange={(e) => handleChange('legalName', e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="form-label">Описание</label>
              <textarea
                className="form-input"
                value={formData?.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-row">
              <label className="form-label">ИНН</label>
              <input
                type="text"
                className="form-input"
                value={formData?.inn || formData?.taxId || ''}
                onChange={(e) => handleChange('inn', e.target.value)}
              />
            </div>
          </div>

          <div className="dialog-footer">
            <button
              type="button"
              className="btn btn-outlined"
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-contained"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrganizationDialog;
