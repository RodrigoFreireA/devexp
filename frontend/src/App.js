import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import Feed from './pages/Feed';
import VerifyEmail from './pages/VerifyEmail';
import Groups from './pages/Groups';
import Developers from './pages/Developers';
import { Box } from '@mui/material';

function App() {
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
      },
    },
  }), [mode]);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/auth" />;
  }

  function AdminRoute({ children }) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    return isAdmin ? children : <Navigate to="/" />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar onToggleTheme={toggleTheme} currentTheme={mode} />
          <Box component="main" sx={{ flexGrow: 1, py: 3, bgcolor: 'background.default' }}>
            <Routes>
              <Route path="/" element={
                localStorage.getItem('token') ? (
                  <Navigate to="/feed" replace />
                ) : (
                  <Navigate to="/auth" replace />
                )
              } />
              <Route path="/auth" element={<Auth />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile/:id"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/feed"
                element={
                  <PrivateRoute>
                    <Feed />
                  </PrivateRoute>
                }
              />
              <Route
                path="/groups"
                element={
                  <PrivateRoute>
                    <Groups />
                  </PrivateRoute>
                }
              />
              <Route
                path="/developers"
                element={
                  <PrivateRoute>
                    <Developers />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 