import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem
} from '@mui/material';


import '../css/styles.scss';
import '../css/Dialogs.scss';


const InviteMemberDialog = ({ open, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');

  const handleSubmit = (e) => {
    e.preventDefault();
    onInvite(email, role);
    setEmail('');
    setRole('USER');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Пригласить участника</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Роль"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            margin="normal"
          >
            <MenuItem value="USER">Пользователь</MenuItem>
            <MenuItem value="ADMIN">Администратор</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained">Пригласить</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InviteMemberDialog;