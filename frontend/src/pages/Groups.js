import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Avatar,
    Chip,
    Divider,
    Alert,
    CircularProgress,
    Paper,
    Container,
    Fab,
    Tooltip,
    useTheme,
    alpha
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Group as GroupIcon,
    PersonAdd as PersonAddIcon,
    PersonRemove as PersonRemoveIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [openMembersDialog, setOpenMembersDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    
    const navigate = useNavigate();
    const theme = useTheme();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');

    useEffect(() => {
        fetchGroups();
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/groups', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const validGroups = response.data.map(group => ({
                ...group,
                members: group.members || [],
                membersCount: group.members?.length || 0,
                createdBy: group.createdBy || { name: 'Usuário Desconhecido' }
            }));
            setGroups(validGroups);
        } catch (err) {
            console.error('Erro ao buscar grupos:', err);
            setError('Erro ao carregar grupos');
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const validUsers = response.data
                .filter(user => user && user.id)
                .map(user => ({
                    id: user.id,
                    name: user.name || user.username || 'Usuário',
                    email: user.email,
                    experienceLevel: user.experienceLevel || 'Não definido',
                    avatar: user.avatar || null,
                    bio: user.bio || ''
                }));
            setUsers(validUsers);
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
            setUsers([]);
        }
    };

    const handleCreateGroup = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            await axios.post('/api/groups', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSuccess('Grupo criado com sucesso!');
            setOpenDialog(false);
            setFormData({ name: '', description: '' });
            fetchGroups();
        } catch (err) {
            setError(err.response?.data || 'Erro ao criar grupo');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateGroup = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            await axios.put(`/api/groups/${selectedGroup.id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSuccess('Grupo atualizado com sucesso!');
            setOpenDialog(false);
            setSelectedGroup(null);
            setFormData({ name: '', description: '' });
            fetchGroups();
        } catch (err) {
            setError(err.response?.data || 'Erro ao atualizar grupo');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm('Tem certeza que deseja excluir este grupo?')) return;
        
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            await axios.delete(`/api/groups/${groupId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSuccess('Grupo excluído com sucesso!');
            fetchGroups();
        } catch (err) {
            setError(err.response?.data || 'Erro ao excluir grupo');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (groupId, userId) => {
        try {
            if (selectedGroup?.members?.some(m => m.id === userId)) {
                setError('Este usuário já é membro do grupo');
                return;
            }

            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            await axios.post(`/api/groups/${groupId}/members`, { userId }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSuccess('Membro adicionado com sucesso!');
            fetchGroups();
            setOpenMembersDialog(false);
        } catch (err) {
            if (err.response?.status === 409) {
                setError('Este usuário já é membro do grupo');
            } else {
                setError(err.response?.data || 'Erro ao adicionar membro');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (groupId, userId) => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            await axios.delete(`/api/groups/${groupId}/members/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSuccess('Membro removido com sucesso!');
            fetchGroups();
        } catch (err) {
            setError(err.response?.data || 'Erro ao remover membro');
        } finally {
            setLoading(false);
        }
    };

    const handleEditGroup = (group) => {
        setSelectedGroup(group);
        setFormData({
            name: group.name,
            description: group.description || ''
        });
        setOpenDialog(true);
    };

    const handleOpenMembersDialog = (group) => {
        setSelectedGroup(group);
        setOpenMembersDialog(true);
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        Grupos de Desenvolvedores
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                        Conecte-se com outros desenvolvedores e compartilhe conhecimento
                    </Typography>

                    <Box sx={{ 
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        mt: 3
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
                                placeholder="Buscar grupos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                variant="standard"
                                InputProps={{ disableUnderline: true }}
                            />
                        </Paper>
                        
                        {isAdmin && (
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setSelectedGroup(null);
                                    setFormData({ name: '', description: '' });
                                    setOpenDialog(true);
                                }}
                                sx={{
                                    bgcolor: 'white',
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.common.white, 0.9)
                                    }
                                }}
                            >
                                Criar Novo Grupo
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: 3,
                    mb: 4
                }}>
                    {filteredGroups.map((group) => (
                        <Card 
                            key={group.id}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: theme.shadows[8]
                                }
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    mb: 2,
                                    pb: 2,
                                    borderBottom: 1,
                                    borderColor: 'divider'
                                }}>
                                    <Avatar 
                                        sx={{ 
                                            bgcolor: theme.palette.primary.main,
                                            width: 48,
                                            height: 48,
                                            mr: 2
                                        }}
                                    >
                                        <GroupIcon />
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" component="div">
                                            {group.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Criado por {group.createdBy?.name || 'Usuário Desconhecido'}
                                        </Typography>
                                    </Box>
                                    {isAdmin && (
                                        <Box>
                                            <Tooltip title="Editar grupo">
                                                <IconButton 
                                                    onClick={() => handleEditGroup(group)}
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Excluir grupo">
                                                <IconButton 
                                                    onClick={() => handleDeleteGroup(group.id)}
                                                    size="small"
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    )}
                                </Box>

                                <Typography 
                                    color="text.secondary" 
                                    sx={{ 
                                        mb: 2,
                                        minHeight: 60,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {group.description || 'Sem descrição'}
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Membros ({group.membersCount})
                                    </Typography>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexWrap: 'wrap', 
                                        gap: 1,
                                        maxHeight: 100,
                                        overflow: 'auto'
                                    }}>
                                        {group.members?.map((member) => (
                                            <Chip
                                                key={member.id}
                                                avatar={
                                                    <Avatar src={member.avatar}>
                                                        {member.name ? member.name[0] : '?'}
                                                    </Avatar>
                                                }
                                                label={member.name || 'Usuário'}
                                                onDelete={isAdmin ? () => handleRemoveMember(group.id, member.id) : undefined}
                                                variant="outlined"
                                                size="small"
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                {isAdmin && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<PersonAddIcon />}
                                        onClick={() => handleOpenMembersDialog(group)}
                                        fullWidth
                                    >
                                        Adicionar Membros
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* Dialog para criar/editar grupo */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ 
                    bgcolor: theme.palette.primary.main, 
                    color: 'white',
                    pb: 2
                }}>
                    {selectedGroup ? 'Editar Grupo' : 'Criar Novo Grupo'}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nome do Grupo"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Descrição"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={selectedGroup ? handleUpdateGroup : handleCreateGroup}
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                    >
                        {selectedGroup ? 'Atualizar' : 'Criar Grupo'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog para gerenciar membros */}
            <Dialog 
                open={openMembersDialog} 
                onClose={() => setOpenMembersDialog(false)} 
                maxWidth="sm" 
                fullWidth
            >
                <DialogTitle sx={{ 
                    bgcolor: theme.palette.primary.main, 
                    color: 'white'
                }}>
                    Adicionar Membros - {selectedGroup?.name}
                </DialogTitle>
                <DialogContent>
                    {users.length === 0 ? (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                                Nenhum usuário disponível para adicionar
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ pt: 2 }}>
                            {users
                                .filter(user => !selectedGroup?.members?.some(m => m.id === user.id))
                                .map((user) => (
                                    <ListItem 
                                        key={user.id}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.1)
                                            },
                                            borderRadius: 1,
                                            mb: 1
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar 
                                                src={user.avatar}
                                                sx={{
                                                    bgcolor: theme.palette.primary.main
                                                }}
                                            >
                                                {user.name ? user.name[0] : '?'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={user.name}
                                            secondary={
                                                <>
                                                    <Chip 
                                                        label={user.experienceLevel}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    {user.bio && (
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                display: 'block',
                                                                mt: 0.5,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {user.bio}
                                                        </Typography>
                                                    )}
                                                </>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Tooltip title="Adicionar ao grupo">
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleAddMember(selectedGroup.id, user.id)}
                                                    color="primary"
                                                >
                                                    <PersonAddIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenMembersDialog(false)} variant="outlined">
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Groups; 