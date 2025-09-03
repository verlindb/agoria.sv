import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  ContentCopy,
  Factory,
  People,
  LocationOn,
  Person,
  Business,
} from '@mui/icons-material';
import { Company, TechnicalBusinessUnit, Employee } from '../../types';

interface TechnicalUnitCardViewProps {
  units: TechnicalBusinessUnit[];
  onEdit: (unit: TechnicalBusinessUnit) => void;
  onDelete: (unit: TechnicalBusinessUnit) => void;
  onView: (unit: TechnicalBusinessUnit) => void;
  onDuplicate: (unit: TechnicalBusinessUnit) => void;
  showCompany?: boolean;
  companies?: Company[];
  employees?: Employee[];
}

export const TechnicalUnitCardView: React.FC<TechnicalUnitCardViewProps> = ({
  units,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  showCompany = false,
  companies = [],
  employees = [],
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUnit, setSelectedUnit] = useState<TechnicalBusinessUnit | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, unit: TechnicalBusinessUnit) => {
    setAnchorEl(event.currentTarget);
    setSelectedUnit(unit);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUnit(null);
  };

  const handleAction = (action: (unit: TechnicalBusinessUnit) => void) => {
    if (selectedUnit) {
      action(selectedUnit);
    }
    handleMenuClose();
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || 'Niet gekoppeld';
  };
  const getManagerName = (managerId: string) => {
    if (!managerId) return '';
    const emp = employees.find(e => e.id === managerId);
    return emp ? `${emp.lastName} ${emp.firstName}` : managerId;
  };

  return (
    <>
      <Grid container spacing={3}>
        {units.map((unit) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={unit.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => onView(unit)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onView(unit); }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Factory color="primary" sx={{ fontSize: 40 }} />
                  <Chip
                    label={unit.status === 'active' ? 'Actief' : 'Inactief'}
                    color={unit.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {unit.code}
                </Typography>
                <Typography variant="h6" component="h3" gutterBottom>
                  {unit.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {unit.department}
                </Typography>
                
                <Box display="flex" alignItems="center" mt={2} mb={1}>
                  <Person sx={{ mr: 1, fontSize: 18 }} color="action" />
                  <Typography variant="body2">
                    {getManagerName(unit.manager)}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <People sx={{ mr: 1, fontSize: 18 }} color="action" />
                  <Typography variant="body2">
                    {unit.numberOfEmployees} werknemers
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn sx={{ mr: 1, fontSize: 18 }} color="action" />
                  <Typography variant="body2">
                    {unit.location.city}
                  </Typography>
                </Box>

                {showCompany && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <Business sx={{ mr: 1, fontSize: 18 }} color="action" />
                    <Typography variant="body2">
                      {getCompanyName(unit.companyId)}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <IconButton
                  aria-label="Bekijk eenheid"
                  onClick={(e) => { e.stopPropagation(); onView(unit); }}
                  size="small"
                >
                  <Visibility />
                </IconButton>
                <IconButton
                  aria-label="Bewerk eenheid"
                  onClick={(e) => { e.stopPropagation(); onEdit(unit); }}
                  size="small"
                >
                  <Edit />
                </IconButton>
                <IconButton
                  aria-label="Meer acties"
                  onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, unit); }}
                  size="small"
                  sx={{ marginLeft: 'auto' }}
                >
                  <MoreVert />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction(onView)}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Bekijken</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction(onEdit)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Bewerken</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction(onDuplicate)}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dupliceren</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction(onDelete)}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Verwijderen</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
