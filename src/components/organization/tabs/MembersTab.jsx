import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useTheme } from '../../../theme/ThemeContext';

import '../../css/styles.scss';
import './MembersTab.scss';

const MembersTab = ({ members, onInvite, onRemove, onEdit }) => {
  const { isDark } = useTheme();
  const [editingMember, setEditingMember] = useState(null);
  const getRoleColor = (role) => {
    const colors = {
      OWNER: 'error',
      ADMIN: 'warning',
      USER: 'primary'
    };
    return colors[role] || 'default';
  };

  // Функция для получения инициалов
  const getInitials = (fullName, email) => {
    if (fullName && fullName !== 'string') {
      return fullName.charAt(0).toUpperCase();
    }
    if (email && email !== 'string') {
      return email.charAt(0).toUpperCase();
    }
    return '?';
  };

  // Функция для форматирования даты (используем joined_at из API /api/orga/me)
  const formatDate = (member) => {
    // Используем joined_at из API /api/orga/me
    const joinedDate = member.joined_at || member.joinedAt;
    if (joinedDate) {
      const date = new Date(joinedDate);
      // Проверяем, что дата валидна
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('ru-RU');
      }
    }
    return 'Не указана';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Участники организации</Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={onInvite}>
          Пригласить
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ '& .MuiTableCell-root': { textAlign: 'left', verticalAlign: 'middle' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Пользователь</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Роль</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Дата присоединения</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar className="member-avatar" sx={{ mr: 2, width: 32, height: 32 }}>
                      {getInitials(member.fullName, member.email)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {member.fullName && member.fullName !== 'string' ? member.fullName : 'Не указано'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {member.email && member.email !== 'string' ? member.email : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={member.role}
                    color={getRoleColor(member.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {formatDate(member)}
                </TableCell>
                

                  <IconButton 
                    size="small" 
                    disabled={member.role === 'OWNER'} 
                    onClick={() => onRemove(member.id)}
                  >
                    <img 
                      src={`/assets/icons/delete_button_${isDark ? 'white' : 'black'}.svg`}
                      alt="Удалить"
                      style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                    />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MembersTab;