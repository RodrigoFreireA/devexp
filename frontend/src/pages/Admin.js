import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

function Admin() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      setError('Erro ao carregar usuários');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Usuário excluído com sucesso');
        fetchUsers();
      } catch (err) {
        setError('Erro ao excluir usuário');
        console.error(err);
      }
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/admin/users/${selectedUser.id}`,
        selectedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Usuário atualizado com sucesso');
      setOpenDialog(false);
      fetchUsers();
    } catch (err) {
      setError('Erro ao atualizar usuário');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Usuários
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Nível</TableCell>
              <TableCell>GitHub</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.experienceLevel}</TableCell>
                <TableCell>{user.github || '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nome"
            fullWidth
            value={selectedUser?.name || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={selectedUser?.email || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="GitHub"
            fullWidth
            value={selectedUser?.github || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, github: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Nível de Experiência"
            select
            fullWidth
            value={selectedUser?.experienceLevel || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, experienceLevel: e.target.value })}
          >
            <MenuItem value="JUNIOR">Júnior</MenuItem>
            <MenuItem value="PLENO">Pleno</MenuItem>
            <MenuItem value="SENIOR">Sênior</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Admin; 