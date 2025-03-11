import React, { useState, useEffect } from 'react';
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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Configuração base do axios
axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

function Auth() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openResendDialog, setOpenResendDialog] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/feed');
    }
  }, [navigate]);

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

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTab(0); // Muda para a aba de login
    setFormData({
      ...formData,
      password: ''
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

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/resend-verification', {
        email: resendEmail
      });
      
      if (response.data.nextResendDelay) {
        setResendCooldown(response.data.nextResendDelay);
      }
      
      setSuccess('Email de verificação reenviado com sucesso!');
      setOpenResendDialog(false);
    } catch (err) {
      if (err.response?.data?.nextResendDelay) {
        const minutes = Math.ceil(err.response.data.nextResendDelay / 60000);
        setError(`Aguarde ${minutes} minutos antes de solicitar um novo reenvio.`);
      } else if (err.response?.data?.blocked) {
        setError('Conta bloqueada por excesso de tentativas. Entre em contato com o administrador.');
      } else {
        setError(err.response?.data || 'Erro ao reenviar email de verificação.');
      }
    } finally {
      setLoading(false);
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
        email: formData.email.trim(),
        password: formData.password
      };

      if (tab === 1) {
        // Adiciona campos adicionais apenas para registro
        requestData.name = formData.name.trim();
        requestData.github = formData.github ? formData.github.trim() : '';
        requestData.experienceLevel = formData.experienceLevel.toUpperCase();
      }
      
      console.log('Enviando requisição:', {
        endpoint,
        data: { ...requestData, password: '***' }
      });

      if (tab === 0) {
        // Login
        try {
          const response = await axios.post(endpoint, requestData);
          const { accessToken, user } = response.data;
          
          if (!accessToken) {
            throw new Error('Token não recebido do servidor');
          }

          localStorage.setItem('token', accessToken);
          localStorage.setItem('user', JSON.stringify(user));
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          setSuccess('Usuário logado com sucesso!');
          
          setTimeout(() => {
            navigate('/feed');
          }, 1000);
        } catch (err) {
          if (err.response?.status === 401 && err.response?.data?.includes('email não verificado')) {
            setResendEmail(formData.email);
            setOpenResendDialog(true);
          } else {
            throw err;
          }
        }
      } else {
        // Registro
        try {
          const response = await axios.post(endpoint, requestData);
          console.log('Resposta do registro:', response.data);
          setOpenDialog(true); // Abre o diálogo de sucesso
          setFormData({
            email: '',
            password: '',
            name: '',
            github: '',
            experienceLevel: ''
          });
        } catch (err) {
          console.error('Erro no registro:', err.response?.data);
          throw err;
        }
      }
    } catch (err) {
      console.error('Erro na autenticação:', err.response?.data || err.message);
      setError(
        err.response?.data || 
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

      {/* Diálogo de sucesso no registro */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Registro realizado com sucesso!"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Um email de verificação será enviado para {formData.email}. 
            Por favor, verifique sua caixa de entrada e siga as instruções para ativar sua conta.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" autoFocus>
            Entendi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de reenvio de email */}
      <Dialog
        open={openResendDialog}
        onClose={() => setOpenResendDialog(false)}
        aria-labelledby="resend-dialog-title"
      >
        <DialogTitle id="resend-dialog-title">
          Email não verificado
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Seu email ainda não foi verificado. Deseja que enviemos um novo email de verificação para {resendEmail}?
            {resendCooldown && (
              <Typography color="error" sx={{ mt: 1 }}>
                Próximo reenvio disponível em: {Math.ceil(resendCooldown / 60000)} minutos
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResendDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleResendEmail}
            variant="contained"
            disabled={loading || resendCooldown}
          >
            {loading ? <CircularProgress size={24} /> : 'Reenviar Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Auth; 