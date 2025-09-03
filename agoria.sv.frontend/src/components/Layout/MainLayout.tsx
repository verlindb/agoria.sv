import React from 'react';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Badge,
  Tooltip,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Business,
  Dashboard,
  People,
  Settings,
  Assessment,
  HowToVote,
  Notifications,
  DarkMode,
  LightMode,
  AccountCircle,
  Logout,
  Factory, // Add this import
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

const drawerWidth = 280;
const miniDrawerWidth = 72;

const navigationItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/', color: '#5E35B1' },
  { text: 'Bedrijven', icon: <Business />, path: '/companies', color: '#00ACC1' },
  { text: 'Technische Eenheden', icon: <Factory />, path: '/technical-units', color: '#FF6B6B' }, // Add this line
  { text: 'Verkiezingen', icon: <HowToVote />, path: '/elections', color: '#10B981' },
  { text: 'Kandidaten', icon: <People />, path: '/candidates', color: '#F59E0B' },
  { text: 'Rapporten', icon: <Assessment />, path: '/reports', color: '#3B82F6' },
  { text: 'Instellingen', icon: <Settings />, path: '/settings', color: '#EF4444' },
];

export const MainLayout: React.FC = () => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { isDrawerOpen, setIsDrawerOpen } = useAppContext();

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const currentNavItem = navigationItems.find(item => item.path === location.pathname);

  const drawer = (
    <Box role="navigation" aria-label="Hoofdnavigatie" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        p: 3,
        background: theme.gradient?.primary || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: isMobile && !isDrawerOpen ? 'none' : 'flex', // Hide toolbar in mobile mini drawer
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: isMobile || isDrawerOpen ? 48 : 40,
              height: isMobile || isDrawerOpen ? 48 : 40,
              bgcolor: 'white',
              color: 'primary.main',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            SV
          </Avatar>
          {(isMobile || isDrawerOpen) && (
            <Box>
              <Typography variant="h6" noWrap component="div" sx={{ color: 'white', fontWeight: 700 }}>
                Sociale Verkiezingen
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Enterprise Edition
              </Typography>
            </Box>
          )}
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, px: isMobile || isDrawerOpen ? 2 : 1, py: 2 }}>
        {navigationItems.map((item, index) => (
          <Fade in={true} timeout={300 + index * 100} key={item.text}>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <Tooltip title={!isMobile && !isDrawerOpen ? item.text : ''} placement="right">
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                aria-current={location.pathname === item.path ? 'page' : undefined}
                aria-label={`Navigate to ${item.text}`}
                data-testid={`nav-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  justifyContent: !isMobile && !isDrawerOpen ? 'center' : 'flex-start',
                  px: !isMobile && !isDrawerOpen ? 1.5 : 2,
                  '&.Mui-selected': {
                    background: alpha(item.color, isDarkMode ? 0.2 : 0.1),
                    borderLeft: `4px solid ${item.color}`,
                    '&:hover': {
                      background: alpha(item.color, isDarkMode ? 0.3 : 0.15),
                    },
                  },
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.05),
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname === item.path ? item.color : 'inherit',
                  minWidth: !isMobile && !isDrawerOpen ? 'auto' : 48,
                }}>
                  {item.icon}
                </ListItemIcon>
                {(isMobile || isDrawerOpen) && (
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
              </Tooltip>
            </ListItem>
          </Fade>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Tooltip title={!isMobile && !isDrawerOpen ? 'Uitloggen' : ''} placement="right">
        <ListItemButton
          aria-label="Uitloggen"
          data-testid="nav-logout"
          sx={{
            borderRadius: 2,
            background: alpha(theme.palette.error.main, 0.05),
            justifyContent: !isMobile && !isDrawerOpen ? 'center' : 'flex-start',
            '&:hover': {
              background: alpha(theme.palette.error.main, 0.1),
            },
          }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <Logout />
          </ListItemIcon>
          {(isMobile || isDrawerOpen) && <ListItemText primary="Uitloggen" />}
        </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
  <AppBar
        position="fixed"
        elevation={0}
        sx={{
      width: { md: `calc(100% - ${(isDrawerOpen ? drawerWidth : miniDrawerWidth)}px)` },
      ml: { md: `${isDrawerOpen ? drawerWidth : miniDrawerWidth}px` },
          background: isDarkMode 
            ? 'rgba(30, 41, 59, 0.9)' 
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              data-testid="drawer-toggle"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Zoom in={true} timeout={500}>
              <Typography 
                variant={isMobile ? "h6" : "h5"}
                noWrap 
                component="h1"
                data-testid="page-heading"
                sx={{ 
                  fontWeight: 700,
                  background: currentNavItem 
                    ? `linear-gradient(135deg, ${currentNavItem.color} 0%, ${alpha(currentNavItem.color, 0.7)} 100%)`
                    : theme.gradient?.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'block', sm: 'block' }, // Ensure visibility on all screen sizes
                }}
              >
                {currentNavItem?.text || 'Dashboard'}
              </Typography>
            </Zoom>
          </Box>
          
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Thema wisselen">
          <IconButton 
            onClick={toggleTheme} 
            color="inherit"
            aria-label="Thema wisselen"
            data-testid="theme-toggle"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }} // Hide on very small screens
          >
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Meldingen">
          <IconButton 
            color="inherit"
            aria-label="Meldingen"
            data-testid="notifications"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }} // Hide on very small screens
          >
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Profiel">
          <IconButton 
            color="inherit"
            aria-label="Profiel"
            data-testid="profile"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }} // Hide on very small screens
          >
            <AccountCircle />
          </IconButton>
        </Tooltip>
      </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: isDrawerOpen ? drawerWidth : miniDrawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? isDrawerOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: isMobile ? drawerWidth : (isDrawerOpen ? drawerWidth : miniDrawerWidth),
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.shorter,
              }),
              background: isDarkMode 
                ? 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' 
                : 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FE 100%)',
              border: 'none',
              overflowX: 'hidden',
              // Improve mobile drawer overlay
              zIndex: isMobile ? theme.zIndex.drawer + 1 : theme.zIndex.drawer,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
    <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
      width: { md: `calc(100% - ${(isDrawerOpen ? drawerWidth : miniDrawerWidth)}px)` },
          background: isDarkMode 
            ? 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)' 
            : 'linear-gradient(180deg, #F8F9FE 0%, #FFFFFF 100%)',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Fade in={true} timeout={800}>
          <Box>
            <Outlet />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};
