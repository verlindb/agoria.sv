import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  Toolbar,
  Breadcrumbs,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Business,
  LocationOn,
  Person,
  Email,
  Phone,
  Add,
  Upload,
  Download,
  ViewList,
  ViewModule,
  Search,
  NavigateNext,
  Home,
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import { TechnicalUnitGrid } from '../components/TechnicalUnits/TechnicalUnitGrid';
import { TechnicalUnitCardView } from '../components/TechnicalUnits/TechnicalUnitCardView';
import { TechnicalUnitFormModal } from '../components/TechnicalUnits/TechnicalUnitFormModal';
import { parseTechnicalUnitsFromExcel, downloadExcelTemplate } from '../utils/excelImport';
import { TechnicalBusinessUnit } from '../types';

export const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    companies, 
    getTechnicalUnitsByCompany, 
    addTechnicalUnit,
    updateTechnicalUnit,
    deleteTechnicalUnit,
    importTechnicalUnits,
    searchTechnicalUnits
  } = useAppContext();
  
  const [viewMode, setViewMode] = useState<'grid' | 'card'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<TechnicalBusinessUnit | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [filteredUnits, setFilteredUnits] = useState<TechnicalBusinessUnit[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const company = useMemo(() => {
    return companies.find(c => c.id === id);
  }, [companies, id]);

  const technicalUnits = useMemo(() => {
    if (!id) return [];
    return getTechnicalUnitsByCompany(id);
  }, [id, getTechnicalUnitsByCompany]);

  // Update filtered units when technical units change or search is empty
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUnits(technicalUnits);
    }
  }, [technicalUnits, searchQuery]);

  // Debounced search effect - search all technical units but filter by company in the UI
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
        // Filter search results to only show units from this company
        const companyUnits = results.filter(unit => unit.companyId === id);
        setFilteredUnits(companyUnits);
      } catch (error) {
        console.error('Search failed:', error);
        // Fallback to local filtering
        const localResults = technicalUnits.filter((unit) =>
          unit.name.toLowerCase().includes(query.toLowerCase()) ||
          unit.code.toLowerCase().includes(query.toLowerCase()) ||
          unit.department.toLowerCase().includes(query.toLowerCase()) ||
          unit.manager.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredUnits(localResults);
      } finally {
        setSearchLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchTechnicalUnits, technicalUnits, id]);

  if (!company) {
    return (
      <Box>
        <Alert severity="error">Bedrijf niet gevonden</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/companies')} sx={{ mt: 2 }}>
          Terug naar bedrijven
        </Button>
      </Box>
    );
  }

  const handleAdd = () => {
    setSelectedUnit(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEdit = (unit: TechnicalBusinessUnit) => {
    setSelectedUnit(unit);
    setFormMode('edit');
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
  };

  const handleDelete = (unit: TechnicalBusinessUnit) => {
    deleteTechnicalUnit(unit.id);
    setSnackbar({ open: true, message: 'Technische eenheid verwijderd', severity: 'success' });
  };

  const handleFormSubmit = (values: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (formMode === 'create') {
      addTechnicalUnit({ ...values, companyId: company.id });
      setSnackbar({ open: true, message: 'Technische eenheid toegevoegd', severity: 'success' });
    } else if (formMode === 'edit' && selectedUnit) {
      updateTechnicalUnit(selectedUnit.id, values);
      setSnackbar({ open: true, message: 'Technische eenheid bijgewerkt', severity: 'success' });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const units = await parseTechnicalUnitsFromExcel(file, company.id);
        importTechnicalUnits(units);
        setSnackbar({ open: true, message: `${units.length} technische eenheden geïmporteerd`, severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Fout bij importeren van bestand', severity: 'error' });
      }
    }
  };

  const getStatusColor = (status: 'active' | 'inactive' | 'pending') => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNext fontSize="small" />} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Chip size="small" icon={<Home />} label="Dashboard" onClick={() => navigate('/')} clickable variant="outlined" />
        <Chip size="small" icon={<Business />} label="Bedrijven" onClick={() => navigate('/companies')} clickable variant="outlined" />
        <Chip size="small" icon={<Business />} label={company.name} color="primary" variant="filled" />
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {company.name}
        </Typography>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/companies')}
            sx={{ mr: 2 }}
          >
            Terug
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/companies/${company.id}/edit`)}
          >
            Bewerk Bedrijf
          </Button>
        </Box>
      </Box>

      {/* Company Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Bedrijfsinformatie
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <Business sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Juridische Naam
                </Typography>
                <Typography variant="body1">
                  {company.legalName}
                </Typography>
              </Box>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Ondernemingsnummer
              </Typography>
              <Typography variant="body1">
                {company.ondernemingsnummer}
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Type
              </Typography>
              <Typography variant="body1">
                {company.type}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={company.status === 'active' ? 'Actief' : company.status === 'inactive' ? 'Inactief' : 'In afwachting'}
                color={getStatusColor(company.status)}
                size="small"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Adres
                </Typography>
                <Typography variant="body1">
                  {company.address.street} {company.address.number}
                </Typography>
                <Typography variant="body1">
                  {company.address.postalCode} {company.address.city}
                </Typography>
                <Typography variant="body1">
                  {company.address.country}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Werknemers
              </Typography>
              <Typography variant="body1">
                {company.numberOfEmployees}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <Person sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Contactpersoon
                </Typography>
                <Typography variant="body1">
                  {company.contactPerson.firstName} {company.contactPerson.lastName}
                </Typography>
                <Typography variant="body2">
                  {company.contactPerson.role}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Email sx={{ mr: 2, color: 'action.active' }} />
              <Typography variant="body1">
                {company.contactPerson.email}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Phone sx={{ mr: 2, color: 'action.active' }} />
              <Typography variant="body1">
                {company.contactPerson.phone}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Technical Business Units */}
      <Typography variant="h5" component="h2" gutterBottom>
        Technische Bedrijfseenheden
      </Typography>
      
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
            Download Template
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
            Importeer Excel
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

      <Paper>
        {viewMode === 'grid' ? (
          <TechnicalUnitGrid
            units={filteredUnits}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onDuplicate={handleDuplicate}
          />
        ) : (
          <Box p={2}>
            <TechnicalUnitCardView
              units={filteredUnits}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onDuplicate={handleDuplicate}
            />
          </Box>
        )}
      </Paper>

      <TechnicalUnitFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        unit={selectedUnit}
        mode={formMode}
        companyId={company.id}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
