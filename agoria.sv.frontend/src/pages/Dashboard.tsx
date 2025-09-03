import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
  alpha,
  Fade,
  Grow,
} from '@mui/material';
import {
  TrendingUp,
  Business,
  People,
  HowToVote,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';
import { AnimatedCounter } from '../components/common/AnimatedCounter';

const StatCard = ({ title, value, change, icon, color, delay }: any) => {
  const isPositive = change >= 0;

  return (
    <Grow in={true} timeout={1000 + delay}>
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: alpha('#fff', 0.1),
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: alpha('#fff', 0.2),
                width: 56,
                height: 56,
              }}
            >
              {icon}
            </Avatar>
            <IconButton size="small" sx={{ color: 'white' }}>
              <MoreVert />
            </IconButton>
          </Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
            {title}
          </Typography>
          <AnimatedCounter end={value} variant="h4" />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {isPositive ? (
              <ArrowUpward sx={{ fontSize: 20, mr: 0.5 }} />
            ) : (
              <ArrowDownward sx={{ fontSize: 20, mr: 0.5 }} />
            )}
            <Typography variant="body2">
              {Math.abs(change)}% vs vorige maand
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
};

export const Dashboard: React.FC = () => {
  const theme = useTheme();

  const stats = [
    { title: 'Totaal Bedrijven', value: 156, change: 12, icon: <Business />, color: '#5E35B1' },
    { title: 'Actieve Verkiezingen', value: 8, change: -5, icon: <HowToVote />, color: '#00ACC1' },
    { title: 'Kandidaten', value: 342, change: 18, icon: <People />, color: '#10B981' },
    { title: 'Voltooiingspercentage', value: 73, change: 7, icon: <TrendingUp />, color: '#F59E0B' },
  ];

  const recentActivities = [
    { id: 1, title: 'Nieuwe verkiezing aangemaakt', company: 'TechCorp BV', time: '2 uur geleden', status: 'success' },
    { id: 2, title: 'Kandidaat registratie', company: 'InnoVate NV', time: '4 uur geleden', status: 'info' },
    { id: 3, title: 'Documenten geüpload', company: 'DataSys VZW', time: '6 uur geleden', status: 'warning' },
    { id: 4, title: 'Verkiezing voltooid', company: 'CloudNet BV', time: '1 dag geleden', status: 'success' },
  ];

  return (
    <Box>
      <Fade in={true} timeout={500}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welkom terug! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hier is een overzicht van uw sociale verkiezingen platform
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <StatCard {...stat} delay={index * 200} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Fade in={true} timeout={1200}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Verkiezingsvoortgang
                  </Typography>
                  <Chip label="Deze week" size="small" />
                </Box>
                
                {[
                  { name: 'TechCorp BV', progress: 85, color: 'success' },
                  { name: 'InnoVate NV', progress: 60, color: 'info' },
                  { name: 'DataSys VZW', progress: 45, color: 'warning' },
                  { name: 'CloudNet BV', progress: 30, color: 'error' },
                ].map((item, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.progress}
                      color={item.color as any}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Fade in={true} timeout={1400}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Recente Activiteiten
                </Typography>
                <List>
                  {recentActivities.map((activity) => (
                    <ListItem key={activity.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: alpha(
                              activity.status === 'success' ? theme.palette.success.main :
                              activity.status === 'info' ? theme.palette.info.main :
                              activity.status === 'warning' ? theme.palette.warning.main :
                              theme.palette.error.main,
                              0.1
                            ),
                            color: 
                              activity.status === 'success' ? theme.palette.success.main :
                              activity.status === 'info' ? theme.palette.info.main :
                              activity.status === 'warning' ? theme.palette.warning.main :
                              theme.palette.error.main,
                          }}
                        >
                          {activity.status === 'success' ? <CheckCircle /> : <Schedule />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <Box>
                            <Typography variant="caption" component="span">
                              {activity.company}
                            </Typography>
                            <Typography variant="caption" component="span" sx={{ mx: 1 }}>
                              •
                            </Typography>
                            <Typography variant="caption" component="span" color="text.secondary">
                              {activity.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};
