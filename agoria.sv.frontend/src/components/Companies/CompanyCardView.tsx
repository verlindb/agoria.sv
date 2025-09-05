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
  Business,
  People,
} from '@mui/icons-material';
import { Company } from '../../types';

interface CompanyCardViewProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
  onView: (company: Company) => void;
  onDuplicate: (company: Company) => void;
}

export const CompanyCardView: React.FC<CompanyCardViewProps> = ({
  companies,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, company: Company) => {
    setAnchorEl(event.currentTarget);
    setSelectedCompany(company);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCompany(null);
  };

  const handleAction = (action: (company: Company) => void) => {
    if (selectedCompany) {
      action(selectedCompany);
    }
    handleMenuClose();
  };

  const getStatusColor = (status: Company['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      default: return 'warning';
    }
  };

  const getStatusLabel = (status: Company['status']) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'inactive': return 'Inactief';
      default: return 'In afwachting';
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        {companies.map((company) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={company.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => onView(company)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onView(company); }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Business color="primary" sx={{ fontSize: 40 }} />
                  <Chip
                    label={getStatusLabel(company.status)}
                    color={getStatusColor(company.status)}
                    size="small"
                  />
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {company.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {company.legalName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  BTW: {company.ondernemingsnummer}
                </Typography>
                <Box display="flex" alignItems="center" mt={2}>
                  <People sx={{ mr: 1, fontSize: 20 }} color="action" />
                  <Typography variant="body2">
                    {company.numberOfEmployees} werknemers
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {company.address.city}, {company.address.country}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  aria-label="Bekijk bedrijf"
                  onClick={(e) => { e.stopPropagation(); onView(company); }}
                  size="small"
                >
                  <Visibility />
                </IconButton>
                <IconButton
                  aria-label="Bewerk bedrijf"
                  onClick={(e) => { e.stopPropagation(); onEdit(company); }}
                  size="small"
                >
                  <Edit />
                </IconButton>
                <IconButton
                  aria-label="Meer acties"
                  aria-haspopup="true"
                  onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, company); }}
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
        aria-label="Bedrijf acties menu"
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
