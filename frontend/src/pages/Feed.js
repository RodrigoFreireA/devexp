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
    Paper
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

    const fetchPosts = async () => {
        try {
            const response = await axios.get('/api/posts');
            setPosts(response.data);
        } catch (err) {
            console.error('Erro ao carregar posts:', err);
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
            if (!currentUser) {
                navigate('/auth');
                return;
            }

            await axios.post(`/api/posts/${postId}/like`, {
                userId: currentUser.id
            });
            fetchPosts();
        } catch (err) {
            console.error('Erro ao curtir post:', err);
        }
    };

    const handleDelete = async (postId) => {
        if (window.confirm('Tem certeza que deseja excluir este post?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/posts/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchPosts();
            } catch (err) {
                console.error('Erro ao deletar post:', err);
            }
        }
    };

    const handleComment = async (postId, commentText) => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            if (!currentUser) {
                navigate('/auth');
                return;
            }

            await axios.post(`/api/posts/${postId}/comment`, {
                userId: currentUser.id,
                content: commentText
            });
            fetchPosts();
        } catch (err) {
            console.error('Erro ao comentar:', err);
        }
    };

    const PostCard = ({ post }) => {
        const [comment, setComment] = useState('');
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');
        const isAuthor = post.author.id === currentUser?.id;

        return (
            <Card sx={{ mb: 3, backgroundColor: post.theme === 'dark' ? '#1E1E1E' : '#FFFFFF' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                            src={post.author.avatar}
                            sx={{ cursor: 'pointer', mr: 2 }}
                            onClick={() => navigate(`/profile/${post.author.id}`)}
                        />
                        <Box>
                            <Typography
                                variant="subtitle1"
                                sx={{ 
                                    cursor: 'pointer',
                                    color: post.theme === 'dark' ? '#FFFFFF' : 'inherit'
                                }}
                                onClick={() => navigate(`/profile/${post.author.id}`)}
                            >
                                {post.author.name}
                            </Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ color: post.theme === 'dark' ? '#CCCCCC' : 'text.secondary' }}
                            >
                                {new Date(post.createdAt).toLocaleDateString()}
                            </Typography>
                        </Box>
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                            <Chip
                                label={post.author.experienceLevel}
                                size="small"
                                color="primary"
                                sx={{ mr: 1 }}
                            />
                            {(isAdmin || isAuthor) && (
                                <IconButton
                                    onClick={() => handleDelete(post.id)}
                                    sx={{ color: post.theme === 'dark' ? '#FFFFFF' : 'inherit' }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Box>

                    <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ color: post.theme === 'dark' ? '#FFFFFF' : 'inherit' }}
                    >
                        {post.title}
                    </Typography>

                    <Typography 
                        variant="body1" 
                        sx={{ 
                            mb: 2,
                            color: post.theme === 'dark' ? '#CCCCCC' : 'inherit'
                        }}
                    >
                        {post.content}
                    </Typography>

                    {post.code && (
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                mb: 2, 
                                overflow: 'hidden',
                                backgroundColor: post.theme === 'dark' ? '#2D2D2D' : '#F5F5F5'
                            }}
                        >
                            <Box sx={{ p: 1, backgroundColor: post.theme === 'dark' ? '#1E1E1E' : '#E0E0E0' }}>
                                <Typography 
                                    variant="caption"
                                    sx={{ 
                                        color: post.theme === 'dark' ? '#CCCCCC' : '#666666',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                                    {post.language}
                                </Typography>
                            </Box>
                            <SyntaxHighlighter
                                language={post.language.toLowerCase()}
                                style={post.theme === 'dark' ? vscDarkPlus : vs}
                                customStyle={{
                                    margin: 0,
                                    padding: '16px',
                                    backgroundColor: 'transparent'
                                }}
                            >
                                {post.code}
                            </SyntaxHighlighter>
                        </Paper>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <IconButton 
                                onClick={() => handleLike(post.id)}
                                sx={{ color: post.theme === 'dark' ? '#FFFFFF' : 'inherit' }}
                            >
                                {post.isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
                            </IconButton>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    mr: 2,
                                    color: post.theme === 'dark' ? '#CCCCCC' : 'text.secondary'
                                }}
                            >
                                {post.likesCount}
                            </Typography>
                            <IconButton
                                sx={{ color: post.theme === 'dark' ? '#FFFFFF' : 'inherit' }}
                            >
                                <CommentIcon />
                            </IconButton>
                            <Typography 
                                variant="caption"
                                sx={{ 
                                    color: post.theme === 'dark' ? '#CCCCCC' : 'text.secondary'
                                }}
                            >
                                {post.commentsCount}
                            </Typography>
                        </Box>
                        <IconButton
                            sx={{ color: post.theme === 'dark' ? '#FFFFFF' : 'inherit' }}
                        >
                            <ShareIcon />
                        </IconButton>
                    </Box>

                    {/* Seção de Comentários */}
                    <Box sx={{ mt: 2 }}>
                        {post.comments && post.comments.map((comment, index) => (
                            <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                                <Avatar
                                    src={comment.author.avatar}
                                    sx={{ width: 24, height: 24, mr: 1 }}
                                />
                                <Box>
                                    <Typography variant="subtitle2" component="span">
                                        {comment.author.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                        {comment.content}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}

                        <Box sx={{ display: 'flex', mt: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Adicione um comentário..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                sx={{
                                    backgroundColor: post.theme === 'dark' ? '#2D2D2D' : '#F5F5F5',
                                    '& .MuiOutlinedInput-root': {
                                        color: post.theme === 'dark' ? '#FFFFFF' : 'inherit'
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                sx={{ ml: 1 }}
                                onClick={() => {
                                    handleComment(post.id, comment);
                                    setComment('');
                                }}
                                disabled={!comment.trim()}
                            >
                                Enviar
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
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
                                <PostCard key={post.id} post={post} />
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