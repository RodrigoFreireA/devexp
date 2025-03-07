import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Configuração base do axios
axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.withCredentials = true;

function Auth() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    github: '',
    experienceLevel: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get('/api/users/me', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data;
    } catch (err) {
      console.error('Erro ao buscar dados do usuário:', err.response?.data?.message || err.message);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const endpoint = tab === 0 ? '/api/auth/login' : '/api/auth/register';
      const requestData = {
        email: formData.email,
        password: formData.password
      };

      if (tab === 1) {
        // Adiciona campos adicionais apenas para registro
        requestData.name = formData.name;
        requestData.github = formData.github;
        requestData.experienceLevel = formData.experienceLevel;
      }
      
      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (tab === 0) {
        // Login
        const { accessToken } = response.data;
        if (!accessToken) {
          throw new Error('Token não recebido do servidor');
        }

        // Configura o token para todas as requisições futuras
        localStorage.setItem('token', accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        try {
          // Buscar dados do usuário
          const userData = await fetchUserData(accessToken);
          localStorage.setItem('user', JSON.stringify(userData));
          
          setSuccess('Usuário logado com sucesso!');
          
          setTimeout(() => {
            navigate('/profile');
          }, 1000);
        } catch (userError) {
          console.error('Erro ao buscar dados do usuário:', userError);
          setError('Erro ao buscar dados do usuário. Por favor, tente novamente.');
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      } else {
        // Registro
        setSuccess('Usuário registrado com sucesso! Faça o login.');
        setTab(0);
        setFormData({
          ...formData,
          password: ''
        });
      }
    } catch (err) {
      console.error('Erro na autenticação:', err.response?.data?.message || err.message);
      
      setError(
        err.response?.data?.message || 
        'Ocorreu um erro. Por favor, tente novamente.'
      );

      // Limpa o token em caso de erro
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
          <Tab label="Login" />
          <Tab label="Registro" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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

          {tab === 1 && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nome completo"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Senha"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />

          {tab === 1 && (
            <>
              <TextField
                margin="normal"
                fullWidth
                label="GitHub (opcional)"
                name="github"
                value={formData.github}
                onChange={handleChange}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                label="Nível de Experiência"
                name="experienceLevel"
                select
                SelectProps={{ native: true }}
                value={formData.experienceLevel}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                <option value="JUNIOR">Júnior</option>
                <option value="PLENO">Pleno</option>
                <option value="SENIOR">Sênior</option>
              </TextField>
            </>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              tab === 0 ? 'Entrar' : 'Registrar'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Auth; 