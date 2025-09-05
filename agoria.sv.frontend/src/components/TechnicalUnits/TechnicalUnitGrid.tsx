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
import { Company, TechnicalBusinessUnit, Employee } from '../../types';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface TechnicalUnitGridProps {
  units: TechnicalBusinessUnit[];
  onEdit: (unit: TechnicalBusinessUnit) => void;
  onDelete: (unit: TechnicalBusinessUnit) => void;
  onView: (unit: TechnicalBusinessUnit) => void;
  onDuplicate: (unit: TechnicalBusinessUnit) => void;
  showCompany?: boolean;
  companies?: Company[];
  employees?: Employee[];
}

export const TechnicalUnitGrid: React.FC<TechnicalUnitGridProps> = ({
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
  const { gridDensity, setGridDensity, gridCardView, setGridCardView } = useAppContext();
  const [bulkAnchor, setBulkAnchor] = useState<null | HTMLElement>(null);
  const [selection, setSelection] = useState<string[]>([]);

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

  const columns: GridColDef[] = [
    { 
      field: 'code', 
      headerName: 'Code', 
      width: 100,
    },
    { 
      field: 'name', 
      headerName: 'Naam', 
      flex: 1,
      minWidth: 180,
    },
    ...(showCompany ? [{
      field: 'companyId',
      headerName: 'Bedrijf',
      width: 200,
      valueGetter: (params: any) => getCompanyName(params.row.companyId),
    }] : []),
    { 
      field: 'department', 
      headerName: 'Afdeling', 
      width: 140,
    },
    { 
      field: 'manager', 
      headerName: 'Manager', 
      width: 200,
      valueGetter: (params: any) => getManagerName(params.row.manager),
    },
    {
      field: 'numberOfEmployees',
      headerName: '#',
      width: 70,
      type: 'number',
    },
    {
      field: 'language',
      headerName: 'Taal',
      width: 80,
      valueFormatter: (params) => {
        const v = params.value as TechnicalBusinessUnit['language'];
        if (v === 'N') return 'N';
        if (v === 'F') return 'F';
        if (v === 'N+F') return 'N+F';
        if (v === 'D') return 'D';
        return v || '';
      },
    },
    {
      field: 'pc',
      headerName: 'PC',
      width: 120,
      valueGetter: (params) => {
        const a = params.row.pcWorkers || '';
        const b = params.row.pcClerks || '';
        if (a && b) return `A:${a} | B:${b}`;
        if (a) return `A:${a}`;
        if (b) return `B:${b}`;
        return '';
      },
    },
    {
      field: 'fodDossier',
      headerName: 'FOD',
      width: 110,
      valueGetter: (params) => `${params.row.fodDossierBase || ''}-${params.row.fodDossierSuffix || ''}`,
    },
    {
      field: 'electionBodies',
      headerName: 'Organen',
      width: 170,
      renderCell: (params: GridRenderCellParams) => {
        const eb = params.row.electionBodies as TechnicalBusinessUnit['electionBodies'];
        const chips: React.ReactNode[] = [];
        if (eb?.cpbw) chips.push(<Chip key="cpbw" label="CP" size="small" color="info" sx={{ mr: 0.5 }} />);
        if (eb?.or) chips.push(<Chip key="or" label="OR" size="small" color="secondary" sx={{ mr: 0.5 }} />);
        if (eb?.sdWorkers) chips.push(<Chip key="sdw" label="SDA" size="small" variant="outlined" sx={{ mr: 0.5 }} />);
        if (eb?.sdClerks) chips.push(<Chip key="sdb" label="SDB" size="small" variant="outlined" sx={{ mr: 0.5 }} />);
        return <Box sx={{ display: 'flex', alignItems: 'center' }}>{chips.length ? chips : <span>-</span>}</Box>;
      }
    },
    { 
      field: 'location', 
      headerName: 'Locatie', 
      width: 130,
      valueGetter: (params) => {
        const location = params.row.location;
        return `${location.city}`;
      },
    },
    { 
      field: 'status', 
      headerName: 'Status', 
  width: 110,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as TechnicalBusinessUnit['status'];
        const color = status === 'active' ? 'success' : 'error';
        const label = status === 'active' ? 'Actief' : 'Inactief';
        return <Chip label={label} color={color} size="small" />;
      },
    },
    { 
      field: 'createdAt', 
      headerName: 'Aangemaakt', 
  width: 130,
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
          onClick={(e) => handleMenuOpen(e, params.row as TechnicalBusinessUnit)}
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
  <DataGrid
        data-testid="technical-units-grid"
        rows={units}
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
            onView(params.row as TechnicalBusinessUnit);
          }
        }}
        onRowDoubleClick={(params) => onView(params.row as TechnicalBusinessUnit)}
        density={gridDensity}
        rowHeight={36}
        columnHeaderHeight={40}
        slots={{ toolbar: CustomGridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: false, onDensityChange: setGridDensity, density: gridDensity, onViewToggle: setGridCardView, cardView: gridCardView } as any }}
        aria-label="Technische eenheden tabel"
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
          columns: {
            columnVisibilityModel: {
              createdAt: false,
            },
          },
        }}
        pageSizeOptions={[5, 10, 25, 50]}
  checkboxSelection
  disableRowSelectionOnClick
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
      {selection.length > 0 && (
        <Box sx={{ position: 'absolute', right: 16, bottom: 16 }}>
          <IconButton size="small" onClick={(e) => setBulkAnchor(e.currentTarget)}>
            <MoreVert />
          </IconButton>
          <Menu anchorEl={bulkAnchor} open={Boolean(bulkAnchor)} onClose={() => setBulkAnchor(null)}>
            <MenuItem onClick={() => { setBulkAnchor(null); }}>Bulk actie 1 ({selection.length})</MenuItem>
            <MenuItem onClick={() => { setBulkAnchor(null); }}>Bulk actie 2 ({selection.length})</MenuItem>
          </Menu>
        </Box>
      )}
  {/* Bulk actions placeholder - selection available via `selection` state */}
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
    </Box>
  );
};
