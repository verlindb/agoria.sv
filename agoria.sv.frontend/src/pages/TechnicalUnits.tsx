import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Avatar,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Fade,
  Grow,
  Grid,
  Breadcrumbs,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Search,
  ViewModule,
  ViewList,
  Download,
  Upload,
  Factory,
  Business,
  Home,
  NavigateNext,
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import { TechnicalUnitGrid } from '../components/TechnicalUnits/TechnicalUnitGrid';
import { TechnicalUnitCardView } from '../components/TechnicalUnits/TechnicalUnitCardView';
import { TechnicalUnitFormModal } from '../components/TechnicalUnits/TechnicalUnitFormModal';
import { parseTechnicalUnitsFromExcel, downloadExcelTemplate, exportTechnicalUnitsToExcel } from '../utils/excelImport';
import { TechnicalBusinessUnit } from '../types';

export const TechnicalUnits: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    companies,
    technicalUnits,
  employees,
    addTechnicalUnit,
    updateTechnicalUnit,
    deleteTechnicalUnit,
    importTechnicalUnits,
    searchTechnicalUnits,
  } = useAppContext();

  const [viewMode, setViewMode] = useState<'grid' | 'card'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<TechnicalBusinessUnit | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [filteredUnits, setFilteredUnits] = useState<TechnicalBusinessUnit[]>(technicalUnits);
  const [searchLoading, setSearchLoading] = useState(false);

  // Update filtered units when technical units change or search is empty
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUnits(technicalUnits);
    }
  }, [technicalUnits, searchQuery]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const query = searchQuery.trim();
      if (!query) {
        setFilteredUnits(technicalUnits);
        return;
      }

      setSearchLoading(true);
      try {
        const results = await searchTechnicalUnits(query);
        setFilteredUnits(results);
      } catch (error) {
        console.error('Search failed:', error);
        // Fallback to showing all technical units
        setFilteredUnits(technicalUnits);
      } finally {
        setSearchLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchTechnicalUnits, technicalUnits]);

  const handleAdd = () => {
    setSelectedUnit(null);
    setFormMode('create');
    setSelectedCompanyId('');
    setFormOpen(true);
  };

  const handleEdit = (unit: TechnicalBusinessUnit) => {
    setSelectedUnit(unit);
    setFormMode('edit');
    setSelectedCompanyId(unit.companyId);
    setFormOpen(true);
  };

  const handleView = (unit: TechnicalBusinessUnit) => {
    navigate(`/technical-units/${unit.id}`);
  };

  const handleDuplicate = (unit: TechnicalBusinessUnit) => {
    const duplicated = { ...unit, name: `${unit.name} (kopie)`, code: `${unit.code}_COPY` };
    delete (duplicated as any).id;
    delete (duplicated as any).createdAt;
    delete (duplicated as any).updatedAt;
    addTechnicalUnit(duplicated);
    setSnackbar({ 
      open: true, 
      message: 'Technische eenheid gedupliceerd', 
      severity: 'success' 
    });
  };

  const handleDeleteClick = (unit: TechnicalBusinessUnit) => {
    setSelectedUnit(unit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedUnit) {
      deleteTechnicalUnit(selectedUnit.id);
      setSnackbar({ 
        open: true, 
        message: 'Technische eenheid verwijderd', 
        severity: 'success' 
      });
    }
    setDeleteDialogOpen(false);
    setSelectedUnit(null);
  };

  const handleFormSubmit = (values: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (formMode === 'create') {
      addTechnicalUnit(values);
      setSnackbar({ 
        open: true, 
        message: 'Technische eenheid toegevoegd', 
        severity: 'success' 
      });
    } else if (formMode === 'edit' && selectedUnit) {
      updateTechnicalUnit(selectedUnit.id, values);
      setSnackbar({ 
        open: true, 
        message: 'Technische eenheid bijgewerkt', 
        severity: 'success' 
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedCompanyId) {
      try {
        const units = await parseTechnicalUnitsFromExcel(file, selectedCompanyId);
        importTechnicalUnits(units);
        setSnackbar({ 
          open: true, 
          message: `${units.length} technische eenheden geïmporteerd`, 
          severity: 'success' 
        });
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: 'Selecteer eerst een bedrijf voor het importeren', 
          severity: 'error' 
        });
      }
    } else {
      setSnackbar({ 
        open: true, 
        message: 'Selecteer eerst een bedrijf voor het importeren', 
        severity: 'error' 
      });
    }
  };

  // Statistics
  const stats = {
    total: technicalUnits.length,
    active: technicalUnits.filter(u => u.status === 'active').length,
    inactive: technicalUnits.filter(u => u.status === 'inactive').length,
    companies: [...new Set(technicalUnits.map(u => u.companyId))].length,
  };

  return (
    <Box>
      <Fade in={true} timeout={500}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNext fontSize="small" />} sx={{ mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              size="small" 
              icon={<Home />} 
              label="Dashboard" 
              onClick={() => navigate('/')} 
              clickable 
              variant="outlined"
              data-testid="breadcrumb-dashboard-tech"
              aria-label="Navigate to Dashboard from breadcrumb"
            />
            <Chip 
              size="small" 
              icon={<Factory />} 
              label="Technische eenheden" 
              color="primary" 
              variant="filled"
              data-testid="breadcrumb-technical-units"
            />
          </Breadcrumbs>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Technische Bedrijfseenheden
          </Typography>
          
          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={600}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                    <Factory />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Totaal Eenheden
                  </Typography>
                </Paper>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={800}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                    <Factory />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Actieve Eenheden
                  </Typography>
                </Paper>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={1000}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 2 }}>
                    <Factory />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.inactive}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Inactieve Eenheden
                  </Typography>
                </Paper>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={1200}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                    <Business />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.companies}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gekoppelde Bedrijven
                  </Typography>
                </Paper>
              </Grow>
            </Grid>
          </Grid>

          {/* Toolbar */}
          <Paper sx={{ mb: 3 }}>
            <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Zoek technische eenheden..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{ flexGrow: 1, minWidth: 200, maxWidth: 400 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {searchLoading ? <CircularProgress size={16} /> : <Search />}
                    </InputAdornment>
                  ),
                }}
              />
              
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="grid">
                  <ViewList />
                </ToggleButton>
                <ToggleButton value="card">
                  <ViewModule />
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => downloadExcelTemplate('technicalUnits')}
              >
                Template
              </Button>

              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => exportTechnicalUnitsToExcel(filteredUnits, companies)}
              >
                Exporteer
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
              
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => fileInputRef.current?.click()}
              >
                Importeer
              </Button>
              
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAdd}
              >
                Nieuwe Eenheid
              </Button>
            </Toolbar>
          </Paper>

          {/* Units Grid/Card View */}
          <Paper>
            {viewMode === 'grid' ? (
              <TechnicalUnitGrid
                units={filteredUnits}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onView={handleView}
                onDuplicate={handleDuplicate}
                showCompany={true}
                companies={companies}
                employees={employees}
              />
            ) : (
              <Box p={2}>
                <TechnicalUnitCardView
                  units={filteredUnits}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onView={handleView}
                  onDuplicate={handleDuplicate}
                  showCompany={true}
                  companies={companies}
                  employees={employees}
                />
              </Box>
            )}
          </Paper>

          {/* Form Modal */}
          <TechnicalUnitFormModal
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSubmit={handleFormSubmit}
            unit={selectedUnit}
            mode={formMode}
            companyId={selectedCompanyId}
            companies={companies}
            allowCompanySelection={true}
          />

          {/* Delete Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>
              Technische Eenheid Verwijderen
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Weet u zeker dat u {selectedUnit?.name} wilt verwijderen?
                Deze actie kan niet ongedaan worden gemaakt.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
                Annuleren
              </Button>
              <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                Verwijderen
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert 
              severity={snackbar.severity} 
              onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Fade>
    </Box>
  );
};
