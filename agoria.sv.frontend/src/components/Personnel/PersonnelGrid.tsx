import React, { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Chip, Divider, Checkbox, Tooltip } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CustomGridToolbar from '../common/CustomGridToolbar';
import { MoreVert, Edit, Delete, Visibility, Groups, GroupAdd, Construction, Badge, WorkspacePremium, EmojiPeople, ChevronRight } from '@mui/icons-material';
import { Employee, ORCategory } from '../../types';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface PersonnelGridProps {
  employees: Employee[];
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
  onView: (emp: Employee) => void;
  onAddToOR?: (emp: Employee, category: ORCategory) => void;
  onRemoveFromOR?: (emp: Employee, category: ORCategory) => void;
  onBulkAddToOR?: (empIds: string[], category: ORCategory) => void;
  // Leadership actions (optional, shown when provided)
  onSetAsManager?: (emp: Employee) => void;
  onClearManager?: (emp: Employee) => void;
  isManager?: (emp: Employee) => boolean;
  // bulk removal moved to inline chip delete per row; keep only bulk add via toolbar
}

export const PersonnelGrid: React.FC<PersonnelGridProps> = ({ employees, onEdit, onDelete, onView, onAddToOR, onRemoveFromOR, onBulkAddToOR, onSetAsManager, onClearManager, isManager }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const [orMenuAnchor, setOrMenuAnchor] = useState<null | HTMLElement>(null);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null);
  const isMember = (cat: ORCategory) => selected?.orMembership?.[cat]?.member;
  const closeMenu = () => { setAnchorEl(null); setSelected(null); };
  const closeAllMenus = () => { setAnchorEl(null); setOrMenuAnchor(null); setBulkMenuAnchor(null); setSelected(null); };

  const columns: GridColDef[] = [
    { field: 'lastName', headerName: 'Naam', flex: 1, minWidth: 180, valueGetter: (p) => `${p.row.lastName} ${p.row.firstName}` },
    { field: 'email', headerName: 'E-mail', flex: 1, minWidth: 200 },
    { field: 'phone', headerName: 'Telefoon', width: 160 },
    { field: 'role', headerName: 'Rol/Functie', width: 220, renderCell: (p: GridRenderCellParams) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <span>{p.value}</span>
        {isManager && isManager(p.row as Employee) && <Chip size="small" color="secondary" label="Manager" />}
      </Box>
    ) },
    { field: 'startDate', headerName: 'Startdatum', width: 140, valueFormatter: (p) => format(new Date(p.value), 'dd MMM yyyy', { locale: nl }) },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (p: GridRenderCellParams) => <Chip label={p.value === 'active' ? 'Actief' : 'Inactief'} color={p.value === 'active' ? 'success' : 'default'} size="small"/> },
    { field: 'or', headerName: 'OR', width: 300, sortable: false, renderCell: (p: GridRenderCellParams) => {
      const emp = p.row as Employee;
      const m = emp.orMembership;
      const chips: Array<{ key: ORCategory; label: string; title: string; color: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' }> = [];
      if (m?.arbeiders?.member) chips.push({ key: 'arbeiders', label: 'Arb', title: 'Arbeiders', color: 'info' });
      if (m?.bedienden?.member) chips.push({ key: 'bedienden', label: 'Bed', title: 'Bedienden', color: 'primary' });
      if (m?.kaderleden?.member) chips.push({ key: 'kaderleden', label: 'Kad', title: 'Kaderleden', color: 'warning' });
      if (m?.jeugdige?.member) chips.push({ key: 'jeugdige', label: 'Jeug', title: 'Jeugdige werknemers', color: 'success' });
      return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {chips.map(({ key, label, title, color }) => {
            const chip = (
              <Chip
                key={key}
                size="small"
                label={label}
                color={color}
                variant="outlined"
                onDelete={onRemoveFromOR ? () => onRemoveFromOR(emp, key) : undefined}
              />
            );
            return title ? <Tooltip key={key} title={title} arrow>{chip}</Tooltip> : chip;
          })}
        </Box>
      );
    }},
  { field: 'actions', headerName: 'Acties', width: 80, sortable: false, renderCell: (p: GridRenderCellParams) => (
      <IconButton onClick={(e) => { setAnchorEl(e.currentTarget); setSelected(p.row as Employee); }}>
        <MoreVert />
      </IconButton>
    )},
  ];

  return (
    <Box sx={{ height: 520, width: '100%' }}>
  <DataGrid
        rows={employees}
        columns={columns}
        pageSizeOptions={[5,10,25,50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 }}}}
        density="compact"
        rowHeight={36}
        columnHeaderHeight={40}
        checkboxSelection
  onRowSelectionModelChange={(ids) => setSelection(ids as string[])}
        disableRowSelectionOnClick
        sx={{
          borderRadius: 2,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: (theme) => theme.palette.background.paper,
          },
          '& .MuiDataGrid-row:nth-of-type(odd)': {
            backgroundColor: (theme) => theme.palette.action.hover,
          },
          '& .MuiDataGrid-cell': {
            py: 0.25,
          },
        }}
  slots={{ toolbar: CustomGridToolbar }}
  slotProps={{ toolbar: { showQuickFilter: true } as any }}
      />
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeAllMenus}>
        <MenuItem onClick={() => { if (selected) onView(selected); closeMenu(); }}>
          <ListItemIcon><Visibility fontSize="small"/></ListItemIcon>
          <ListItemText>Bekijken</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (selected) onEdit(selected); closeMenu(); }}>
          <ListItemIcon><Edit fontSize="small"/></ListItemIcon>
          <ListItemText>Bewerken</ListItemText>
        </MenuItem>
        {(onSetAsManager || onClearManager) && (
          <>
            <Divider />
            {onSetAsManager && (
              <MenuItem onClick={() => { if (selected) onSetAsManager(selected); closeAllMenus(); }}>
                <ListItemIcon><Badge fontSize="small"/></ListItemIcon>
                <ListItemText>Wijs aan als Manager</ListItemText>
              </MenuItem>
            )}
            {onClearManager && (
              <MenuItem disabled={!selected || !(isManager && isManager(selected))} onClick={() => { if (selected) onClearManager(selected); closeAllMenus(); }}>
                <ListItemIcon><Badge fontSize="small"/></ListItemIcon>
                <ListItemText>Verwijder Manager</ListItemText>
              </MenuItem>
            )}
          </>
        )}
        {(onAddToOR || onRemoveFromOR) && (
          <>
            <Divider />
            <MenuItem onClick={(e) => setOrMenuAnchor(e.currentTarget)}>
              <ListItemIcon><Groups fontSize="small"/></ListItemIcon>
              <ListItemText primary="Ondernemingsraad" secondary={selected ? `${selected.lastName} ${selected.firstName}` : undefined} />
              <ChevronRight fontSize="small"/>
            </MenuItem>
            {onBulkAddToOR && selection.length > 0 && (
              <MenuItem onClick={(e) => setBulkMenuAnchor(e.currentTarget)}>
                <ListItemIcon><GroupAdd fontSize="small"/></ListItemIcon>
                <ListItemText primary="Bulk acties" secondary={`${selection.length} geselecteerd`} />
                <ChevronRight fontSize="small"/>
              </MenuItem>
            )}
          </>
        )}
        <MenuItem onClick={() => { if (selected) onDelete(selected); closeMenu(); }}>
          <ListItemIcon><Delete fontSize="small"/></ListItemIcon>
          <ListItemText>Verwijderen</ListItemText>
        </MenuItem>
      </Menu>

      {/* OR Submenu */}
      <Menu
        anchorEl={orMenuAnchor}
        open={Boolean(orMenuAnchor)}
        onClose={() => setOrMenuAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={() => { if (!selected) return; isMember('arbeiders') ? onRemoveFromOR?.(selected, 'arbeiders') : onAddToOR?.(selected, 'arbeiders'); closeAllMenus(); }}>
          <ListItemIcon><Construction fontSize="small" color="primary"/></ListItemIcon>
          <ListItemText>Arbeiders</ListItemText>
          <Checkbox edge="end" checked={Boolean(isMember('arbeiders'))} tabIndex={-1} disableRipple />
        </MenuItem>
        <MenuItem onClick={() => { if (!selected) return; isMember('bedienden') ? onRemoveFromOR?.(selected, 'bedienden') : onAddToOR?.(selected, 'bedienden'); closeAllMenus(); }}>
          <ListItemIcon><Badge fontSize="small" color="primary"/></ListItemIcon>
          <ListItemText>Bedienden</ListItemText>
          <Checkbox edge="end" checked={Boolean(isMember('bedienden'))} tabIndex={-1} disableRipple />
        </MenuItem>
        <MenuItem onClick={() => { if (!selected) return; isMember('kaderleden') ? onRemoveFromOR?.(selected, 'kaderleden') : onAddToOR?.(selected, 'kaderleden'); closeAllMenus(); }}>
          <ListItemIcon><WorkspacePremium fontSize="small" color="primary"/></ListItemIcon>
          <ListItemText>Kaderleden</ListItemText>
          <Checkbox edge="end" checked={Boolean(isMember('kaderleden'))} tabIndex={-1} disableRipple />
        </MenuItem>
        <MenuItem onClick={() => { if (!selected) return; isMember('jeugdige') ? onRemoveFromOR?.(selected, 'jeugdige') : onAddToOR?.(selected, 'jeugdige'); closeAllMenus(); }}>
          <ListItemIcon><EmojiPeople fontSize="small" color="primary"/></ListItemIcon>
          <ListItemText>Jeugdige</ListItemText>
          <Checkbox edge="end" checked={Boolean(isMember('jeugdige'))} tabIndex={-1} disableRipple />
        </MenuItem>
      </Menu>

      {/* Bulk Submenu */}
      <Menu
        anchorEl={bulkMenuAnchor}
        open={Boolean(bulkMenuAnchor)}
        onClose={() => setBulkMenuAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={() => { onBulkAddToOR?.(selection, 'arbeiders'); closeAllMenus(); }}>
          <ListItemIcon><GroupAdd fontSize="small"/></ListItemIcon>
          <ListItemText>Toevoegen aan Arbeiders</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onBulkAddToOR?.(selection, 'bedienden'); closeAllMenus(); }}>
          <ListItemIcon><GroupAdd fontSize="small"/></ListItemIcon>
          <ListItemText>Toevoegen aan Bedienden</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onBulkAddToOR?.(selection, 'kaderleden'); closeAllMenus(); }}>
          <ListItemIcon><GroupAdd fontSize="small"/></ListItemIcon>
          <ListItemText>Toevoegen aan Kaderleden</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onBulkAddToOR?.(selection, 'jeugdige'); closeAllMenus(); }}>
          <ListItemIcon><GroupAdd fontSize="small"/></ListItemIcon>
          <ListItemText>Toevoegen aan Jeugdige</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
