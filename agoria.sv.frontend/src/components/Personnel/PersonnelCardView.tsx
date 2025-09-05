import React, { useState } from 'react';
import { Grid, Card, CardContent, CardActions, Typography, IconButton, Chip, Box, Menu, MenuItem, ListItemIcon, ListItemText, Avatar } from '@mui/material';
import { MoreVert, Edit, Delete, Visibility, Person } from '@mui/icons-material';
import { Employee, ORCategory } from '../../types';

interface PersonnelCardViewProps {
  employees: Employee[];
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
  onView: (emp: Employee) => void;
  onAddToOR?: (emp: Employee, category: ORCategory) => void;
  onRemoveFromOR?: (emp: Employee, category: ORCategory) => void;
}

export const PersonnelCardView: React.FC<PersonnelCardViewProps> = ({ employees, onEdit, onDelete, onView, onAddToOR, onRemoveFromOR }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<Employee | null>(null);
  const isMember = (cat: ORCategory) => selected?.orMembership?.[cat]?.member;

  const handleOpen = (e: React.MouseEvent<HTMLElement>, emp: Employee) => { setAnchorEl(e.currentTarget); setSelected(emp); };
  const handleClose = () => { setAnchorEl(null); setSelected(null); };

  return (
    <>
      <Grid container spacing={3}>
        {employees.map(emp => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={emp.id}>
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
              onClick={() => onView(emp)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onView(emp); }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Avatar><Person /></Avatar>
                  <Chip size="small" label={emp.status === 'active' ? 'Actief' : 'Inactief'} color={emp.status === 'active' ? 'success' : 'default'} />
                </Box>
                <Typography variant="h6">{emp.lastName} {emp.firstName}</Typography>
                <Typography variant="body2" color="text.secondary">{emp.role}</Typography>
                <Typography variant="body2" color="text.secondary">{emp.email}</Typography>
                <Typography variant="body2" color="text.secondary">{emp.phone}</Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={(e) => { e.stopPropagation(); onView(emp); }} size="small"><Visibility /></IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); onEdit(emp); }} size="small"><Edit /></IconButton>
                <IconButton onClick={(e) => { e.stopPropagation(); handleOpen(e, emp); }} size="small" sx={{ ml: 'auto' }}><MoreVert /></IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => { if (selected) onView(selected); handleClose(); }}>
          <ListItemIcon><Visibility fontSize="small"/></ListItemIcon>
          <ListItemText>Bekijken</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (selected) onEdit(selected); handleClose(); }}>
          <ListItemIcon><Edit fontSize="small"/></ListItemIcon>
          <ListItemText>Bewerken</ListItemText>
        </MenuItem>
    {onAddToOR && selected && (
          <>
      {!isMember('arbeiders') && (
      <MenuItem onClick={() => { onAddToOR(selected, 'arbeiders'); handleClose(); }}>
              <ListItemText>Toevoegen aan OR Arbeiders</ListItemText>
      </MenuItem>
      )}
      {!isMember('bedienden') && (
      <MenuItem onClick={() => { onAddToOR(selected, 'bedienden'); handleClose(); }}>
              <ListItemText>Toevoegen aan OR Bedienden</ListItemText>
      </MenuItem>
      )}
      {!isMember('kaderleden') && (
      <MenuItem onClick={() => { onAddToOR(selected, 'kaderleden'); handleClose(); }}>
              <ListItemText>Toevoegen aan OR Kaderleden</ListItemText>
      </MenuItem>
      )}
      {!isMember('jeugdige') && (
      <MenuItem onClick={() => { onAddToOR(selected, 'jeugdige'); handleClose(); }}>
              <ListItemText>Toevoegen aan OR Jeugdige</ListItemText>
      </MenuItem>
      )}
          </>
        )}
    {onRemoveFromOR && selected && (
          <>
      {isMember('arbeiders') && (
      <MenuItem onClick={() => { onRemoveFromOR(selected, 'arbeiders'); handleClose(); }}>
              <ListItemText>Verwijderen uit OR Arbeiders</ListItemText>
      </MenuItem>
      )}
      {isMember('bedienden') && (
      <MenuItem onClick={() => { onRemoveFromOR(selected, 'bedienden'); handleClose(); }}>
              <ListItemText>Verwijderen uit OR Bedienden</ListItemText>
      </MenuItem>
      )}
      {isMember('kaderleden') && (
      <MenuItem onClick={() => { onRemoveFromOR(selected, 'kaderleden'); handleClose(); }}>
              <ListItemText>Verwijderen uit OR Kaderleden</ListItemText>
      </MenuItem>
      )}
      {isMember('jeugdige') && (
      <MenuItem onClick={() => { onRemoveFromOR(selected, 'jeugdige'); handleClose(); }}>
              <ListItemText>Verwijderen uit OR Jeugdige</ListItemText>
      </MenuItem>
      )}
          </>
        )}
        <MenuItem onClick={() => { if (selected) onDelete(selected); handleClose(); }}>
          <ListItemIcon><Delete fontSize="small"/></ListItemIcon>
          <ListItemText>Verwijderen</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
