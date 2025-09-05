import React, { useState } from 'react';
import { useAppContext } from '@contexts/AppContext';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import CustomGridToolbar from '../common/CustomGridToolbar';
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  ContentCopy,
} from '@mui/icons-material';
import { Company } from '../../types';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface CompanyGridProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
  onView: (company: Company) => void;
  onDuplicate: (company: Company) => void;
}

export const CompanyGrid: React.FC<CompanyGridProps> = ({
  companies,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const { gridDensity, setGridDensity, gridCardView, setGridCardView } = useAppContext();
  const [bulkAnchor, setBulkAnchor] = useState<null | HTMLElement>(null);

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

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Naam', 
      flex: 1,
      minWidth: 200,
    },
    { 
      field: 'legalName', 
      headerName: 'Juridische Naam', 
      flex: 1,
      minWidth: 200,
    },
    { 
      field: 'ondernemingsnummer', 
      headerName: 'Ondernemingsnummer', 
      width: 180,
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 100,
    },
    { 
      field: 'numberOfEmployees', 
      headerName: 'Werknemers', 
      width: 120,
      type: 'number',
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as Company['status'];
        const color = status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'warning';
        const label = status === 'active' ? 'Actief' : status === 'inactive' ? 'Inactief' : 'In afwachting';
        return <Chip label={label} color={color} size="small" />;
      },
    },
    { 
      field: 'createdAt', 
      headerName: 'Aangemaakt', 
      width: 150,
      valueFormatter: (params) => {
        return format(new Date(params.value), 'dd MMM yyyy', { locale: nl });
      },
    },
    {
      field: 'actions',
      headerName: 'Acties',
      width: 90,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          aria-label="Meer acties"
          aria-haspopup="true"
          onClick={(e) => handleMenuOpen(e, params.row as Company)}
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        data-testid="companies-grid"
        rows={companies}
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
            onView(params.row as Company);
          }
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        checkboxSelection
        disableRowSelectionOnClick
        aria-label="Bedrijven tabel"
        rowHeight={36}
        columnHeaderHeight={40}
        slots={{ toolbar: CustomGridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true, onDensityChange: setGridDensity, density: gridDensity, onViewToggle: setGridCardView, cardView: gridCardView } as any }}
        onRowSelectionModelChange={(ids) => setSelection(ids as string[])}
        density={gridDensity}
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
      {/* Bulk actions placeholder - show when selection present */}
      {selection.length > 0 && (
        <Box sx={{ position: 'absolute', right: 16, bottom: 16 }}>
          <IconButton size="small" aria-label="Bulk acties" data-testid="bulk-actions-toggle" onClick={(e) => setBulkAnchor(e.currentTarget)}>
            <MoreVert />
          </IconButton>
          <Menu anchorEl={bulkAnchor} open={Boolean(bulkAnchor)} onClose={() => setBulkAnchor(null)} aria-label="Bulk acties menu">
            <MenuItem onClick={() => { /* placeholder */ setBulkAnchor(null); }}>Bulk actie 1 ({selection.length})</MenuItem>
            <MenuItem onClick={() => { /* placeholder */ setBulkAnchor(null); }}>Bulk actie 2 ({selection.length})</MenuItem>
          </Menu>
        </Box>
      )}
    </Box>
  );
};
