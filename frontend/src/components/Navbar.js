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
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Navbar() {
  const navigate = useNavigate();
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
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          DevExp
        </Typography>
        
        {user ? (
          <>
            <Button color="inherit" onClick={() => navigate('/')}>
              Feed
            </Button>
            
            {isAdmin && (
              <Button color="inherit" onClick={() => navigate('/admin')}>
                Área Admin
              </Button>
            )}
            
            <IconButton onClick={handleMenu} sx={{ ml: 2 }}>
              <Avatar src={user.avatar} alt={user.name}>
                {user.name?.charAt(0)}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => {
                handleClose();
                navigate('/profile');
              }}>
                Meu Perfil
              </MenuItem>
              <MenuItem onClick={handleLogout}>Sair</MenuItem>
            </Menu>
          </>
        ) : (
          <Button color="inherit" onClick={() => navigate('/auth')}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 