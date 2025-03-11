import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Box,
  TextField,
  CircularProgress,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment as CommentIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/api';
import CreatePost from '../components/CreatePost';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState({});
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await postService.getPosts();
      setPosts(response.data);
    } catch (err) {
      setError('Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      await postService.likePost(postId);
      loadPosts(); // Recarrega os posts para atualizar o número de likes
    } catch (err) {
      console.error('Erro ao curtir post:', err);
    }
  };

  const handleComment = async (postId) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!comments[postId]) return;

    try {
      await postService.comment(postId, { content: comments[postId] });
      setComments({ ...comments, [postId]: '' });
      loadPosts();
    } catch (err) {
      console.error('Erro ao comentar:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <CreatePost onPostCreated={loadPosts} />
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {posts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    src={post.author.avatar}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/profile/${post.author.id}`)}
                  />
                  <Box ml={2}>
                    <Typography
                      variant="subtitle1"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/profile/${post.author.id}`)}
                    >
                      {post.author.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={post.author.experienceLevel}
                    size="small"
                    color={
                      post.author.experienceLevel === 'SENIOR'
                        ? 'primary'
                        : post.author.experienceLevel === 'PLENO'
                        ? 'secondary'
                        : 'default'
                    }
                    sx={{ ml: 'auto' }}
                  />
                </Box>

                <Typography variant="h6" gutterBottom>
                  {post.title}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {post.content}
                </Typography>

                {post.tags && (
                  <Box mt={1}>
                    {post.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>

              <Divider />

              <CardActions>
                <IconButton
                  onClick={() => handleLike(post.id)}
                  color={user && post.likes?.includes(user.id) ? 'primary' : 'default'}
                >
                  {user && post.likes?.includes(user.id) ? (
                    <Favorite />
                  ) : (
                    <FavoriteBorder />
                  )}
                </IconButton>
                <Typography variant="body2">
                  {post.likes?.length || 0} curtidas
                </Typography>

                <IconButton>
                  <CommentIcon />
                </IconButton>
                <Typography variant="body2">
                  {post.comments?.length || 0} comentários
                </Typography>

                <IconButton>
                  <ShareIcon />
                </IconButton>
              </CardActions>

              <Box p={2}>
                {post.comments?.map((comment) => (
                  <Box key={comment.id} mb={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        src={comment.author.avatar}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      />
                      <Typography variant="subtitle2">
                        {comment.author.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 4 }}>
                      {comment.content}
                    </Typography>
                  </Box>
                ))}

                <Box display="flex" mt={2}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Adicione um comentário..."
                    value={comments[post.id] || ''}
                    onChange={(e) =>
                      setComments({
                        ...comments,
                        [post.id]: e.target.value
                      })
                    }
                  />
                  <Button
                    variant="contained"
                    sx={{ ml: 1 }}
                    onClick={() => handleComment(post.id)}
                    disabled={!comments[post.id]}
                  >
                    Enviar
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Home; 