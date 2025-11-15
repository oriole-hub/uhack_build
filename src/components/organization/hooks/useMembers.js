// src/components/organization/hooks/useMembers.js
import { useCallback } from 'react';
import { apiService } from '../../../services/api';

export const useMembers = (organizationId, setMembers, setSnackbar) => {
  // Уведомления
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar({ open: false, message: '', severity: 'success' });
    }, 3000);
  }, [setSnackbar]);

  // Приглашение участника
  const handleInviteMember = async (email, role) => {
    try {
      const newMember = await apiService.inviteMember(organizationId, email, role);
      setMembers(prev => [...prev, newMember]);
      showSnackbar('✅ Приглашение отправлено');
      return newMember;
    } catch (error) {
      console.error('❌ Ошибка отправки приглашения:', error);
      showSnackbar('❌ Ошибка отправки приглашения', 'error');
      throw error;
    }
  };

  // Удаление участника
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого участника?')) {
      return;
    }

    try {
      await apiService.removeMember(organizationId, memberId);
      setMembers(prev => prev.filter(member => member.id !== memberId));
      showSnackbar('✅ Участник удален');
    } catch (error) {
      console.error('❌ Ошибка удаления участника:', error);
      showSnackbar('❌ Ошибка удаления участника', 'error');
      throw error;
    }
  };

  return {
    handleInviteMember,
    handleRemoveMember
  };
};