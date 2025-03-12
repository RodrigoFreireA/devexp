import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Container,
  useTheme,
  alpha,
  Tooltip,
  Divider,
  ListItemIcon,
  Badge
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Feed as FeedIcon,
  Group as GroupIcon,
  Code as CodeIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';

const pages = [
    { title: 'Feed', path: '/feed', icon: <FeedIcon /> },
    { title: 'Grupos', path: '/groups', icon: <GroupIcon /> },
    { title: 'Desenvolvedores', path: '/developers', icon: <CodeIcon /> }
];

function Navbar({ onToggleTheme, currentTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        bgcolor: 'background.paper',
        boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.1)}`
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h5"
            component="div"
            sx={{
              mr: 4,
              fontWeight: 700,
              color: theme.palette.primary.main,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            DevExp
          </Typography>

          {user && (
            <Box sx={{ display: 'flex', flexGrow: 1, gap: 1 }}>
              {pages.map((page) => (
                <Button
                  key={page.path}
                  onClick={() => navigate(page.path)}
                  startIcon={page.icon}
                  sx={{
                    color: location.pathname === page.path ? 'primary.main' : 'text.secondary',
                    borderRadius: 2,
                    px: 2,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08)
                    },
                    ...(location.pathname === page.path && {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      fontWeight: 'bold'
                    })
                  }}
                >
                  {page.title}
                </Button>
              ))}
            </Box>
          )}

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title={`Mudar para modo ${currentTheme === 'light' ? 'escuro' : 'claro'}`}>
                <IconButton 
                  onClick={onToggleTheme} 
                  sx={{
                    color: theme.palette.mode === 'light' ? theme.palette.primary.main : 'white',
                    bgcolor: theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.2),
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.3),
                    },
                    borderRadius: 2,
                    p: 1
                  }}
                >
                  {currentTheme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>
              </Tooltip>

              {isAdmin && (
                <Tooltip title="Área Administrativa">
                  <IconButton
                    onClick={() => navigate('/admin')}
                    sx={{
                      color: location.pathname === '/admin' ? 'primary.main' : 'text.secondary',
                      bgcolor: location.pathname === '/admin' ? alpha(theme.palette.primary.main, 0.12) : 'transparent'
                    }}
                  >
                    <AdminIcon />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Menu do Usuário">
                <IconButton
                  onClick={handleMenu}
                  sx={{
                    p: 0.5,
                    border: `2px solid ${alpha(theme.palette.primary.main, location.pathname === '/profile' ? 0.5 : 0)}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    sx={{
                      width: 35,
                      height: 35,
                      bgcolor: theme.palette.primary.main
                    }}
                  >
                    {user.name?.[0] || '?'}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {user.name || 'Usuário'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                
                <Divider />
                
                <MenuItem onClick={() => navigate('/profile')} dense>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Meu Perfil
                </MenuItem>

                <MenuItem onClick={handleLogout} dense>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <Typography color="error">Sair</Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Tooltip title={`Mudar para modo ${currentTheme === 'light' ? 'escuro' : 'claro'}`}>
                <IconButton 
                  onClick={onToggleTheme} 
                  sx={{
                    color: theme.palette.mode === 'light' ? theme.palette.primary.main : 'white',
                    bgcolor: theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.2),
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.3),
                    },
                    borderRadius: 2,
                    p: 1
                  }}
                >
                  {currentTheme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                onClick={() => navigate('/auth')}
                sx={{
                  borderRadius: 2,
                  px: 3
                }}
              >
                Login
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar; 