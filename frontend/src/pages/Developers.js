import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Avatar,
    Chip,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert,
    useTheme,
    alpha,
    Paper,
    Grid,
    IconButton,
    Tooltip,
    Link
} from '@mui/material';
import {
    Search as SearchIcon,
    GitHub as GitHubIcon,
    LinkedIn as LinkedInIcon,
    Code as CodeIcon,
    Star as StarIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const experienceLevelColors = {
    'JUNIOR': '#4caf50',
    'PLENO': '#2196f3',
    'SENIOR': '#9c27b0'
};

const Developers = () => {
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDevelopers();
    }, []);

    const fetchDevelopers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const validDevelopers = response.data
                .filter(dev => dev && dev.id)
                .map(dev => ({
                    id: dev.id,
                    name: dev.name || dev.username || 'Usuário',
                    email: dev.email,
                    github: dev.github,
                    bio: dev.bio || 'Nenhuma biografia disponível',
                    experienceLevel: dev.experienceLevel || 'Não definido',
                    avatar: dev.avatar
                }));
            setDevelopers(validDevelopers);
        } catch (err) {
            console.error('Erro ao buscar desenvolvedores:', err);
            setError('Erro ao carregar desenvolvedores');
        } finally {
            setLoading(false);
        }
    };

    const filteredDevelopers = developers.filter(dev => {
        const matchesSearch = dev.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            dev.bio?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = !selectedLevel || dev.experienceLevel === selectedLevel;
        return matchesSearch && matchesLevel;
    });

    return (
        <Container maxWidth="xl">
            <Box sx={{ 
                position: 'relative',
                mb: 6,
                mt: 2,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: theme.palette.primary.main,
                color: 'white',
                p: 4
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: theme.palette.primary.dark,
                    opacity: 0.4,
                    zIndex: 0
                }} />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h3" component="h1" gutterBottom>
                        Desenvolvedores
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                        Conheça os talentos da nossa comunidade
                    </Typography>

                    <Box sx={{ 
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        mt: 3,
                        flexWrap: 'wrap'
                    }}>
                        <Paper sx={{
                            p: '2px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            width: 400,
                            bgcolor: 'rgba(255, 255, 255, 0.9)'
                        }}>
                            <IconButton sx={{ p: '10px' }}>
                                <SearchIcon />
                            </IconButton>
                            <TextField
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="Buscar desenvolvedores..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                variant="standard"
                                InputProps={{ disableUnderline: true }}
                            />
                        </Paper>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {['JUNIOR', 'PLENO', 'SENIOR'].map((level) => (
                                <Chip
                                    key={level}
                                    label={level}
                                    onClick={() => setSelectedLevel(selectedLevel === level ? '' : level)}
                                    sx={{
                                        bgcolor: selectedLevel === level 
                                            ? alpha(experienceLevelColors[level], 0.9)
                                            : 'rgba(255, 255, 255, 0.9)',
                                        color: selectedLevel === level ? 'white' : 'text.primary',
                                        '&:hover': {
                                            bgcolor: selectedLevel === level 
                                                ? alpha(experienceLevelColors[level], 0.8)
                                                : 'rgba(255, 255, 255, 0.8)'
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredDevelopers.map((developer) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={developer.id}>
                            <Card 
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: theme.shadows[8]
                                    }
                                }}
                                onClick={() => navigate(`/profile/${developer.id}`)}
                            >
                                <CardContent>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        mb: 2
                                    }}>
                                        <Avatar
                                            src={developer.avatar}
                                            sx={{ 
                                                width: 100, 
                                                height: 100,
                                                mb: 2,
                                                border: `3px solid ${experienceLevelColors[developer.experienceLevel] || theme.palette.primary.main}`
                                            }}
                                        >
                                            {developer.name?.[0] || '?'}
                                        </Avatar>
                                        <Typography variant="h6" gutterBottom>
                                            {developer.name}
                                        </Typography>
                                        <Chip
                                            label={developer.experienceLevel}
                                            sx={{
                                                bgcolor: alpha(experienceLevelColors[developer.experienceLevel] || theme.palette.primary.main, 0.1),
                                                color: experienceLevelColors[developer.experienceLevel] || theme.palette.primary.main,
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Box>

                                    <Typography 
                                        color="text.secondary"
                                        sx={{
                                            mb: 2,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            minHeight: 60
                                        }}
                                    >
                                        {developer.bio || 'Nenhuma biografia disponível'}
                                    </Typography>

                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'center',
                                        gap: 1
                                    }}>
                                        {developer.email && (
                                            <Chip
                                                icon={<EmailIcon />}
                                                label={developer.email}
                                                variant="outlined"
                                                size="small"
                                                onClick={() => window.location.href = `mailto:${developer.email}`}
                                            />
                                        )}
                                        {developer.github && (
                                            <Tooltip title="GitHub">
                                                <IconButton 
                                                    component={Link}
                                                    href={`https://github.com/${developer.github}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <GitHubIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default Developers; 