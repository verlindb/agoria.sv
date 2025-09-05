import React, { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Chip, Divider, Tooltip } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import CustomGridToolbar from '../common/CustomGridToolbar';
import { MoreVert, Edit, Delete, Visibility, Close } from '@mui/icons-material';
import { Employee } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

interface ORGridProps {
  members: Employee[];
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
  onView: (emp: Employee) => void;
  onRemoveFromOR: (emp: Employee) => void;
  onBulkRemoveFromOR?: (employeeIds: string[]) => void;
  cardView?: boolean;
  onToggleCardView?: (cardView: boolean) => void;
}

export const ORGrid: React.FC<ORGridProps> = ({ members, onEdit, onDelete, onView, onRemoveFromOR, onBulkRemoveFromOR, cardView = false, onToggleCardView }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const { gridDensity, setGridDensity } = useAppContext();

  const closeMenu = () => { setAnchorEl(null); setSelected(null); };

  const columns: GridColDef[] = [
    { field: 'lastName', headerName: 'Naam', flex: 1, minWidth: 180, valueGetter: (p) => `${p.row.lastName} ${p.row.firstName}` },
    { field: 'email', headerName: 'E-mail', flex: 1, minWidth: 200 },
    { field: 'phone', headerName: 'Telefoon', width: 160 },
    { field: 'role', headerName: 'Rol/Functie', width: 180 },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (p: GridRenderCellParams) => <Chip label={p.value === 'active' ? 'Actief' : 'Inactief'} color={p.value === 'active' ? 'success' : 'default'} size="small"/> },
    { field: 'actions', headerName: 'Acties', width: 90, sortable: false, renderCell: (p: GridRenderCellParams) => (
        <IconButton onClick={(e) => { setAnchorEl(e.currentTarget); setSelected(p.row as Employee); }}>
          <MoreVert />
        </IconButton>
      )},
  ];

  return (
    <Box sx={{ height: 520, width: '100%' }}>
      <DataGrid
        rows={members}
        columns={columns}
        onCellClick={(params: any, event: any) => {
          // Don't navigate if clicking on actions column or checkbox column
          if (params.field !== 'actions' && params.field !== '__check__') {
            // Don't navigate if clicking on interactive elements like chips, buttons, or their children
            const target = event.target as HTMLElement;
            if (target.closest('.MuiChip-root') || 
                target.closest('.MuiIconButton-root') ||
                target.closest('.MuiButton-root') ||
                target.closest('[role="button"]') ||
                target.classList.contains('MuiChip-deleteIcon') ||
                target.classList.contains('MuiSvgIcon-root')) {
              return;
            }
            onView(params.row as Employee);
          }
        }}
        pageSizeOptions={[5,10,25,50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 }}}}
        density={gridDensity}
        rowHeight={36}
        columnHeaderHeight={40}
        checkboxSelection
        disableRowSelectionOnClick
        slots={{ toolbar: CustomGridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true, onDensityChange: setGridDensity, density: gridDensity, onViewToggle: onToggleCardView, cardView } as any }}
        onRowSelectionModelChange={(ids) => setSelection(ids as string[])}
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
      />
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={() => { if (selected) onView(selected); closeMenu(); }}>
          <ListItemIcon><Visibility fontSize="small"/></ListItemIcon>
          <ListItemText>Bekijken</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (selected) onEdit(selected); closeMenu(); }}>
          <ListItemIcon><Edit fontSize="small"/></ListItemIcon>
          <ListItemText>Bewerken</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (selected) onRemoveFromOR(selected); closeMenu(); }}>
          <ListItemIcon><Close fontSize="small"/></ListItemIcon>
          <ListItemText>Verwijderen uit OR</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { if (selected) onDelete(selected); closeMenu(); }}>
          <ListItemIcon><Delete fontSize="small"/></ListItemIcon>
          <ListItemText>Medewerker verwijderen</ListItemText>
        </MenuItem>
      </Menu>

      {/* Bulk verwijderen uit OR */}
      {onBulkRemoveFromOR && selection.length > 0 && (
        <Box sx={{ position: 'absolute', right: 16, bottom: 16 }}>
          <Tooltip title={`Verwijderen uit OR (${selection.length})`}>
            <IconButton size="small" color="primary" onClick={() => onBulkRemoveFromOR(selection)}>
              <Close />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default ORGrid;
