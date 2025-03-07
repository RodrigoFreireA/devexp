import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Grid,
  Button,
  TextField,
  Alert,
  Box,
  Chip
} from '@mui/material';
import axios from 'axios';

function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    github: '',
    bio: '',
    experienceLevel: ''
  });

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isOwnProfile = !id || currentUser?.id === Number(id);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (isOwnProfile) {
          setUser(currentUser);
          setFormData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            github: currentUser.github || '',
            bio: currentUser.bio || '',
            experienceLevel: currentUser.experienceLevel || ''
          });
        } else {
          const response = await axios.get(`/api/users/${id}`);
          setUser(response.data);
        }
      } catch (err) {
        setError('Erro ao carregar dados do usuário');
        console.error(err);
      }
    };

    loadUserData();
  }, [id, isOwnProfile, currentUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/users/${user.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (isOwnProfile) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      setUser(response.data);
      setSuccess('Perfil atualizado com sucesso!');
      setEditing(false);
    } catch (err) {
      setError('Erro ao atualizar perfil');
      console.error(err);
    }
  };

  if (!user) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
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

        <Grid container spacing={4}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Avatar
              src={user.avatar}
              sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
            >
              {user.name?.charAt(0)}
            </Avatar>
            
            <Chip
              label={user.experienceLevel}
              color="primary"
              sx={{ mb: 2 }}
            />
            
            {user.github && (
              <Button
                variant="outlined"
                fullWidth
                href={`https://github.com/${user.github}`}
                target="_blank"
                sx={{ mb: 2 }}
              >
                GitHub
              </Button>
            )}
          </Grid>

          <Grid item xs={12} md={8}>
            {editing && isOwnProfile ? (
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="GitHub"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  multiline
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Nível de Experiência"
                  name="experienceLevel"
                  select
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  margin="normal"
                  SelectProps={{ native: true }}
                >
                  <option value="">Selecione...</option>
                  <option value="JUNIOR">Júnior</option>
                  <option value="PLENO">Pleno</option>
                  <option value="SENIOR">Sênior</option>
                </TextField>

                <Box sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ mr: 1 }}
                  >
                    Salvar
                  </Button>
                  <Button onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="h4" gutterBottom>
                  {user.name}
                </Typography>
                
                {isOwnProfile && (
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {user.email}
                  </Typography>
                )}
                
                {user.bio && (
                  <Typography paragraph>
                    {user.bio}
                  </Typography>
                )}
                
                {isOwnProfile && (
                  <Button
                    variant="contained"
                    onClick={() => setEditing(true)}
                  >
                    Editar Perfil
                  </Button>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Profile;