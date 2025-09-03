import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Paper,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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
  Business,
  Home,
  NavigateNext,
} from '@mui/icons-material';
import { useAppContext } from '@contexts/AppContext';
import { CompanyGrid } from '@components/Companies/CompanyGrid';
import { CompanyCardView } from '@components/Companies/CompanyCardView';
import { CompanyFormModal } from '@components/Companies/CompanyFormModal';
import { Company } from '../types';
import { parseCompaniesFromExcel, downloadExcelTemplate, exportCompaniesToExcel } from '@utils/excelImport';

export const Companies: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    companies,
    viewMode,
    searchQuery,
    setViewMode,
    setSearchQuery,
    addCompany,
    updateCompany,
    deleteCompany,
    importCompanies,
    searchCompanies,
  } = useAppContext();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(companies);
  const [searchLoading, setSearchLoading] = useState(false);

  // Update filtered companies when companies change or search is empty
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCompanies(companies);
    }
  }, [companies, searchQuery]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const query = searchQuery.trim();
      if (!query) {
        setFilteredCompanies(companies);
        return;
      }

      setSearchLoading(true);
      try {
        const results = await searchCompanies(query);
        setFilteredCompanies(results);
      } catch (error) {
        console.error('Search failed:', error);
        // Fallback to showing all companies
        setFilteredCompanies(companies);
      } finally {
        setSearchLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCompanies, companies]);

  const handleAdd = () => {
    setSelectedCompany(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleView = (company: Company) => {
    navigate(`/companies/${company.id}`);
  };

  const handleDuplicate = (company: Company) => {
    const duplicated = { ...company, name: `${company.name} (kopie)` };
    delete (duplicated as any).id;
    delete (duplicated as any).createdAt;
    delete (duplicated as any).updatedAt;
    addCompany(duplicated);
  };

  const handleDeleteClick = (company: Company) => {
    setSelectedCompany(company);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCompany) {
      deleteCompany(selectedCompany.id);
    }
    setDeleteDialogOpen(false);
    setSelectedCompany(null);
  };

  const handleFormSubmit = (values: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (formMode === 'create') {
      addCompany(values);
    } else if (formMode === 'edit' && selectedCompany) {
      updateCompany(selectedCompany.id, values);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const companies = await parseCompaniesFromExcel(file);
        importCompanies(companies);
      } catch (error) {
        console.error('Error importing file:', error);
      }
    }
  };

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNext fontSize="small" />} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Chip 
          size="small" 
          icon={<Home />} 
          label="Dashboard" 
          onClick={() => navigate('/')} 
          clickable 
          variant="outlined"
          data-testid="breadcrumb-dashboard"
          aria-label="Navigate to Dashboard from breadcrumb"
        />
        <Chip 
          size="small" 
          icon={<Business />} 
          label="Bedrijven" 
          color="primary" 
          variant="filled"
          data-testid="breadcrumb-companies"
        />
      </Breadcrumbs>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        Bedrijven
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Zoek bedrijven..."
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
              'aria-label': 'Zoek bedrijven',
            }}
          />
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            aria-label="Weergave modus"
            size="small"
          >
            <ToggleButton value="grid" aria-label="Tabel weergave">
              <ViewList />
            </ToggleButton>
            <ToggleButton value="card" aria-label="Kaart weergave">
              <ViewModule />
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => downloadExcelTemplate('companies')}
            aria-label="Download template"
          >
            Template
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
            aria-label="Importeer bedrijven"
          >
            Importeer
          </Button>

          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => exportCompaniesToExcel(filteredCompanies)}
            aria-label="Exporteer bedrijven"
          >
            Exporteer
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            aria-label="Nieuw bedrijf toevoegen"
          >
            Nieuw Bedrijf
          </Button>
        </Toolbar>
      </Paper>

    <Paper>
        {viewMode === 'grid' ? (
      <CompanyGrid
            companies={filteredCompanies}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onView={handleView}
            onDuplicate={handleDuplicate}
          />
        ) : (
          <Box p={2}>
            <CompanyCardView
              companies={filteredCompanies}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onView={handleView}
              onDuplicate={handleDuplicate}
            />
          </Box>
        )}
      </Paper>

      <CompanyFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        company={selectedCompany}
        mode={formMode}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Bedrijf verwijderen
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Weet u zeker dat u {selectedCompany?.name} wilt verwijderen?
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
    </Box>
  );
};
