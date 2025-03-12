import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Chip,
    Avatar,
    Button,
    Pagination,
    CircularProgress,
    Alert,
    IconButton,
    Divider,
    Paper,
    CardHeader,
    CardActions,
    InputAdornment
} from '@mui/material';
import {
    Favorite,
    FavoriteBorder,
    Comment as CommentIcon,
    Share as ShareIcon,
    Code as CodeIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';
import CreatePost from '../components/CreatePost';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

function Feed() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const theme = useTheme();

    const fetchPosts = async () => {
        try {
            console.log('Buscando posts...');
            const response = await axios.get('/api/posts');
            console.log('Posts recebidos:', response.data);
            if (!Array.isArray(response.data)) {
                console.error('Resposta inválida da API: posts não é um array', response.data);
                setPosts([]);
                return;
            }
            // Filtra posts inválidos e ordena por data de criação (mais novos primeiro)
            const validPosts = response.data
                .filter(post => 
                    post && 
                    post.id && 
                    post.author && 
                    post.author.id && 
                    post.author.name
                )
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            console.log('Posts válidos:', validPosts);
            setPosts(validPosts);
        } catch (err) {
            console.error('Erro ao carregar posts:', err);
            console.error('Detalhes do erro:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError('Erro ao carregar posts: ' + err.message);
            setPosts([]);
        }
    };

    const fetchDevelopers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('size', 9);
            if (search) params.append('search', search);
            if (experienceLevel) params.append('experienceLevel', experienceLevel);

            const response = await axios.get(`/api/feed/developers?${params.toString()}`);
            setDevelopers(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError('Erro ao carregar desenvolvedores: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [page, search, experienceLevel]);

    const fetchTrending = async () => {
        try {
            const response = await axios.get('/api/feed/trending');
            setTrending(response.data);
        } catch (err) {
            console.error('Erro ao carregar trending:', err);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchDevelopers();
        fetchTrending();
    }, [page, search, experienceLevel, fetchDevelopers]);

    const handleLike = async (postId) => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            if (!currentUser || !currentUser.id) {
                navigate('/auth');
                return;
            }

            if (!postId) {
                console.error('ID do post não fornecido');
                return;
            }

            await axios.post(`/api/posts/${postId}/like`, {
                userId: currentUser.id
            });
            await fetchPosts();
        } catch (err) {
            console.error('Erro ao curtir post:', err);
            console.error('Detalhes do erro:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError('Erro ao curtir post: ' + (err.response?.data || err.message));
        }
    };

    const handleDelete = async (postId) => {
        if (!postId) {
            console.error('ID do post não fornecido');
            return;
        }

        if (window.confirm('Tem certeza que deseja excluir este post?')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/auth');
                    return;
                }

                await axios.delete(`/api/posts/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                await fetchPosts();
            } catch (err) {
                console.error('Erro ao deletar post:', err);
                console.error('Detalhes do erro:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setError('Erro ao deletar post: ' + (err.response?.data || err.message));
            }
        }
    };

    const handleComment = async (postId, commentText) => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            
            if (!currentUser || !currentUser.id) {
                navigate('/auth');
                return;
            }

            if (!token) {
                setError('Sessão expirada. Por favor, faça login novamente.');
                navigate('/auth');
                return;
            }

            if (!postId) {
                console.error('ID do post não fornecido');
                return;
            }

            if (!commentText || !commentText.trim()) {
                console.error('Comentário vazio');
                return;
            }

            const response = await axios.post(
                `/api/posts/${postId}/comment`,
                {
                    userId: currentUser.id,
                    content: commentText.trim()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Resposta do servidor:', response.data);
            await fetchPosts();
        } catch (err) {
            console.error('Erro ao comentar:', err);
            console.error('Detalhes do erro:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            if (err.response?.status === 401) {
                setError('Sessão expirada. Por favor, faça login novamente.');
                navigate('/auth');
            } else {
                setError('Erro ao comentar: ' + (err.response?.data || err.message));
            }
        }
    };

    const PostCard = ({ post, currentUser, isAdmin, onLike, onDelete, onComment }) => {
        const [comment, setComment] = useState('');
        const theme = useTheme();

        // Verifica se o post é válido
        if (!post || !post.author) {
            return null;
        }

        const isAuthor = currentUser?.id === post?.author?.id;

        return (
            <Card 
                sx={{ 
                    mb: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'white',
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                        boxShadow: theme.shadows[4]
                    }
                }}
            >
                <CardHeader
                    avatar={
                        <Avatar 
                            src={post.author.avatar}
                            sx={{ 
                                bgcolor: theme.palette.primary.main,
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate(`/profile/${post.author.id}`)}
                        >
                            {post.author.name?.[0] || '?'}
                        </Avatar>
                    }
                    action={
                        (isAdmin || isAuthor) && (
                            <IconButton onClick={() => onDelete(post.id)}>
                                <DeleteIcon />
                            </IconButton>
                        )
                    }
                    title={
                        <Typography 
                            variant="subtitle1" 
                            component="span"
                            sx={{ 
                                fontWeight: 'bold',
                                color: theme.palette.text.primary,
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate(`/profile/${post.author.id}`)}
                        >
                            {post.author.name}
                        </Typography>
                    }
                    subheader={
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                            {new Date(post.createdAt).toLocaleString()}
                            <Chip 
                                size="small" 
                                label={post.author.experienceLevel} 
                                sx={{ 
                                    bgcolor: theme.palette.mode === 'dark' 
                                        ? alpha(theme.palette.primary.main, 0.2) 
                                        : alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main
                                }}
                            />
                        </Typography>
                    }
                />
                <CardContent>
                    <Typography 
                        variant="body1" 
                        color="text.primary"
                        sx={{ whiteSpace: 'pre-wrap', mb: 2 }}
                    >
                        {post.content}
                    </Typography>

                    {post.code && post.language && (
                        <Paper 
                            elevation={3} 
                            sx={{
                                mb: 2, 
                                overflow: 'hidden',
                                bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5'
                            }}
                        >
                            <Box sx={{ 
                                p: 1, 
                                bgcolor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#e0e0e0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography 
                                    variant="caption"
                                    sx={{ 
                                        color: theme.palette.mode === 'dark' ? '#cccccc' : '#666666',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                                    {post.language}
                                </Typography>
                            </Box>
                            <Box sx={{
                                maxHeight: '300px',
                                overflow: 'auto'
                            }}>
                                <SyntaxHighlighter
                                    language={post.language.toLowerCase()}
                                    style={theme.palette.mode === 'dark' ? vscDarkPlus : vs}
                                    customStyle={{
                                        margin: 0,
                                        padding: '16px',
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    {post.code}
                                </SyntaxHighlighter>
                            </Box>
                        </Paper>
                    )}
                </CardContent>
                <CardActions disableSpacing>
                    <IconButton 
                        onClick={() => onLike(post.id)}
                        color={post.likes?.includes(currentUser?.id) ? "primary" : "default"}
                    >
                        <Favorite />
                    </IconButton>
                    <Typography color="text.secondary">
                        {post.likes?.length || 0}
                    </Typography>
                    <IconButton
                        sx={{ ml: 1 }}
                        onClick={() => {
                            const commentInput = document.querySelector(`#comment-input-${post.id}`);
                            if (commentInput) {
                                commentInput.focus();
                            }
                        }}
                    >
                        <CommentIcon />
                    </IconButton>
                    <Typography color="text.secondary">
                        {post.comments?.length || 0}
                    </Typography>
                </CardActions>

                {post.comments && post.comments.length > 0 && (
                    <Box sx={{ px: 2, pb: 2 }}>
                        {post.comments.map((comment, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    mb: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: theme.palette.mode === 'dark' 
                                        ? alpha(theme.palette.primary.main, 0.1)
                                        : alpha(theme.palette.primary.main, 0.05)
                                }}
                            >
                                <Avatar
                                    src={comment.author.avatar}
                                    sx={{ 
                                        width: 24, 
                                        height: 24, 
                                        mr: 1,
                                        bgcolor: theme.palette.primary.main,
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate(`/profile/${comment.author.id}`)}
                                >
                                    {comment.author.name?.[0]}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography 
                                        variant="subtitle2" 
                                        component="span"
                                        sx={{ 
                                            fontWeight: 'bold',
                                            color: theme.palette.text.primary,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => navigate(`/profile/${comment.author.id}`)}
                                    >
                                        {comment.author.name}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        color="text.primary"
                                        sx={{ ml: 1 }}
                                    >
                                        {comment.content}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}

                <Box sx={{ p: 2, pt: 0 }}>
                    <TextField
                        id={`comment-input-${post.id}`}
                        fullWidth
                        size="small"
                        placeholder="Escreva um comentário..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (comment.trim()) {
                                    onComment(post.id, comment);
                                    setComment('');
                                }
                            }
                        }}
                        InputProps={{
                            endAdornment: comment.trim() && (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => {
                                            onComment(post.id, comment);
                                            setComment('');
                                        }}
                                        color="primary"
                                        size="small"
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: theme.palette.mode === 'dark' 
                                    ? alpha(theme.palette.common.white, 0.05)
                                    : alpha(theme.palette.common.black, 0.05)
                            }
                        }}
                    />
                </Box>
            </Card>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Filtros e Lista de Desenvolvedores */}
                <Grid item xs={12} md={3}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Desenvolvedores
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <TextField
                                label="Buscar desenvolvedor"
                                variant="outlined"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                size="small"
                                fullWidth
                            />
                        </Box>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                            <InputLabel>Nível de Experiência</InputLabel>
                            <Select
                                value={experienceLevel}
                                label="Nível de Experiência"
                                onChange={(e) => setExperienceLevel(e.target.value)}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="JUNIOR">Júnior</MenuItem>
                                <MenuItem value="PLENO">Pleno</MenuItem>
                                <MenuItem value="SENIOR">Sênior</MenuItem>
                            </Select>
                        </FormControl>
                        {developers.map(developer => (
                            <Card key={developer.id} sx={{ mb: 1 }}>
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar
                                            src={`https://github.com/${developer.github}.png`}
                                            sx={{ width: 32, height: 32, mr: 1 }}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2">
                                                {developer.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {developer.experienceLevel}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}

                        {totalPages > 1 && (
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    count={totalPages}
                                    page={page + 1}
                                    onChange={(e, value) => setPage(value - 1)}
                                    color="primary"
                                    size="small"
                                />
                            </Box>
                        )}
                    </Box>

                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Trending Developers
                        </Typography>
                        {trending.map(developer => (
                            <Card key={developer.id} sx={{ mb: 1 }}>
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar
                                            src={`https://github.com/${developer.github}.png`}
                                            sx={{ width: 32, height: 32, mr: 1 }}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2">
                                                {developer.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {developer.experienceLevel}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Grid>

                {/* Feed de Posts */}
                <Grid item xs={12} md={6}>
                    <CreatePost onPostCreated={fetchPosts} />
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {posts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    currentUser={JSON.parse(localStorage.getItem('user'))}
                                    isAdmin={JSON.parse(localStorage.getItem('user'))?.roles?.includes('ROLE_ADMIN')}
                                    onLike={handleLike}
                                    onDelete={handleDelete}
                                    onComment={handleComment}
                                />
                            ))}
                        </>
                    )}
                </Grid>

                {/* Área de Sugestões */}
                <Grid item xs={12} md={3}>
                    <Typography variant="h6" gutterBottom>
                        Sugestões para você
                    </Typography>
                    {/* Adicione aqui sugestões de desenvolvedores para seguir */}
                </Grid>
            </Grid>
        </Container>
    );
}

export default Feed; 