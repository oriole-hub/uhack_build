import { useState, useCallback } from 'react';
import { apiService } from '../../../services/api';

export const useOrganizationData = (id, setSnackbar) => {
  const [organization, setOrganization] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Создает mock организацию */
  const createMockOrganization = useCallback(() => {
    return {
      id: id,
      name: `Организация ${id.slice(0, 8)}`,
      legalName: `ООО Организация ${id.slice(0, 8)}`,
      description: 'Описание тестовой организации',
      inn: '1234567890',
      address: {
        country: 'Россия',
        city: 'Москва',
        street: 'ул. Тестовая, 123',
        postalCode: '123456'
      },
      settings: {
        currency: 'RUB',
        language: 'ru',
        timezone: 'Europe/Moscow',
        autoBackup: true,
        backupFrequency: 'DAILY'
      },
      createdAt: '2024-01-15T00:00:00Z'
    };
  }, [id]);

  /** Показывает уведомление */
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar({ open: false, message: '', severity: 'success' });
    }, 3000);
  }, [setSnackbar]);

  /** Загружает данные организации */
  const loadOrganizationData = useCallback(async () => {
    if (!id) {
      setError('ID организации не указан');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [organizationData, warehousesData, membersData] = await Promise.allSettled([
        apiService.getOrganization(id),
        apiService.getOrganizationWarehouses(id),
        apiService.getOrganizationMembers(id)
      ]);

      /** Проверяет валидность данных организации */
      const isValidOrganizationData = (org) => {
        if (!org) return false;
        const isValidName = (value) => {
          if (!value || typeof value !== 'string') return false;
          const trimmed = value.trim();
          if (trimmed === 'string' || trimmed === '') return false;
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(trimmed)) return false;
          if (trimmed === org.id) return false;
          return true;
        };
        return isValidName(org.name) || isValidName(org.legalName);
      };

      let orgResult;
      if (organizationData.status === 'fulfilled' && organizationData.value) {
        const orgData = organizationData.value;
        if (isValidOrganizationData(orgData)) {
          orgResult = orgData;
        } else {
          console.warn('⚠️ Получены невалидные данные организации, используются мок-данные:', orgData);
          orgResult = createMockOrganization();
          showSnackbar('Получены невалидные данные организации', 'warning');
        }
      } else {
        orgResult = createMockOrganization();
        if (organizationData.status === 'rejected') {
          console.warn('⚠️ Ошибка загрузки организации, используются мок-данные:', organizationData.reason);
          showSnackbar('Используются демо-данные', 'warning');
        }
      }

      const warehousesResult = warehousesData.status === 'fulfilled'
        ? warehousesData.value
        : [];

      const membersResult = membersData.status === 'fulfilled'
        ? membersData.value
        : [];

      setOrganization(orgResult);
      setWarehouses(warehousesResult);
      setMembers(membersResult);

    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error);
      setError('Не удалось загрузить данные организации');
      showSnackbar('Ошибка загрузки данных', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showSnackbar, createMockOrganization]);

  /** Обновляет организацию */
  const handleUpdateOrganization = async (data) => {
    try {
      const updatedOrganization = await apiService.updateOrganization(id, data);
      setOrganization(prev => ({ ...prev, ...updatedOrganization }));
      showSnackbar('✅ Организация обновлена');
      return updatedOrganization;
    } catch (error) {
      console.error('❌ Ошибка обновления организации:', error);
      showSnackbar('❌ Ошибка обновления организации', 'error');
      throw error;
    }
  };

  return {
    organization,
    warehouses,
    members,
    loading,
    error,
    setWarehouses,
    setMembers,
    loadOrganizationData,
    handleUpdateOrganization
  };
};