import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Box
} from '@mui/material';
import axios from 'axios';

function VerifyEmail() {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Token não encontrado');
            return;
        }

        verifyEmail(token);
    }, [location]);

    const verifyEmail = async (token) => {
        try {
            const response = await axios.post('/api/auth/verify-email', { token });
            setStatus('success');
            setMessage(response.data);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data || 'Erro ao verificar email');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    Verificação de Email
                </Typography>

                {status === 'loading' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {status === 'success' && (
                    <>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {message}
                        </Alert>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/auth')}
                        >
                            Ir para Login
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {message}
                        </Alert>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/auth')}
                        >
                            Voltar para Login
                        </Button>
                    </>
                )}
            </Paper>
        </Container>
    );
}

export default VerifyEmail; 