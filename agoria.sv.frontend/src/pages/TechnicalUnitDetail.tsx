import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, Typography, Button, Grid, Chip, Breadcrumbs, Toolbar, ToggleButtonGroup, ToggleButton, TextField, InputAdornment, Snackbar, Alert, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ArrowBack, Factory, Person, Business, LocationOn, Search, ViewList, ViewModule, Add, Download, Upload, ExpandMore, NavigateNext, Home, Group, SupervisorAccount, Gavel } from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import { PersonnelGrid } from '../components/Personnel/PersonnelGrid';
import { PersonnelCardView } from '../components/Personnel/PersonnelCardView';
import { PersonnelFormModal } from '../components/Personnel/PersonnelFormModal';
import { Employee, ORCategory } from '../types';
import { parseEmployeesFromExcel, downloadEmployeeTemplate, downloadManagerTemplate, downloadORTemplate, parseORFromExcel } from '../utils/excelImport';
import { ORGrid } from '../components/Ondernemingsraad/ORGrid';

export const TechnicalUnitDetail: React.FC = () => {
  const { id, unitId, companyId } = useParams<{ id?: string; unitId?: string; companyId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { technicalUnits, companies, getEmployeesByTechnicalUnit, searchEmployees, addEmployee, importEmployees, updateEmployee, deleteEmployee, addToOndernemingsraad, removeFromOndernemingsraad, bulkAddToOndernemingsraad, setManagerForUnit, clearManagerForUnit } = useAppContext();

  // Support both URL patterns: /technical-units/:id and /companies/:companyId/technical-units/:unitId
  const actualUnitId = unitId || id;
  const unit = useMemo(() => technicalUnits.find(u => u.id === actualUnitId), [technicalUnits, actualUnitId]);
  const company = useMemo(() => {
    if (companyId) {
      return companies.find(c => c.id === companyId);
    }
    return companies.find(c => c.id === unit?.companyId);
  }, [companies, unit, companyId]);
  const [viewMode, setViewMode] = useState<'grid' | 'card'>('grid');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create'|'edit'|'view'>('create');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isPersonnelOpen, setIsPersonnelOpen] = useState(true);
  const [isManagersOpen, setIsManagersOpen] = useState(true);
  const [isOROpen, setIsOROpen] = useState(true);
  const [orViewMode, setOrViewMode] = useState<'grid' | 'card'>('grid');
  const [orCategory, setOrCategory] = useState<ORCategory>('arbeiders');
  const [orUploading, setOrUploading] = useState(false);
  const orFileInputRef = React.useRef<HTMLInputElement>(null);
  const [visibleSection, setVisibleSection] = useState<'all' | 'personeel' | 'leidinggevenden' | 'ondernemingsraad'>('all');
  // Removed assignment board mode (no drag & drop); use standard grid/card actions

  // Anchor refs for smooth scrolling
  const personnelRef = useRef<HTMLDivElement>(null);
  const managersRef = useRef<HTMLDivElement>(null);
  const orRef = useRef<HTMLDivElement>(null);

  // Effect to handle URL-based section visibility
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/personeel')) {
      setVisibleSection('personeel');
      setIsPersonnelOpen(true);
      setIsManagersOpen(false);
      setIsOROpen(false);
    } else if (path.includes('/leidinggevenden')) {
      setVisibleSection('leidinggevenden');
      setIsPersonnelOpen(false);
      setIsManagersOpen(true);
      setIsOROpen(false);
    } else if (path.includes('/ondernemingsraad')) {
      setVisibleSection('ondernemingsraad');
      setIsPersonnelOpen(false);
      setIsManagersOpen(false);
      setIsOROpen(true);
    } else {
      setVisibleSection('all');
      setIsPersonnelOpen(true);
      setIsManagersOpen(true);
      setIsOROpen(true);
    }
  }, [location.pathname]);

  const scrollTo = (key: 'personeel' | 'leidinggevenden' | 'ondernemingsraad') => {
    if (key === 'personeel') {
      setVisibleSection('personeel');
      setIsPersonnelOpen(true);
      setTimeout(() => personnelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    } else if (key === 'leidinggevenden') {
      setVisibleSection('leidinggevenden');
      setIsManagersOpen(true);
      setTimeout(() => managersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    } else {
      setVisibleSection('ondernemingsraad');
      setIsOROpen(true);
      setTimeout(() => orRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    }
  };

  const expandAll = () => {
    setIsPersonnelOpen(true);
    setIsManagersOpen(true);
    setIsOROpen(true);
    setVisibleSection('all');
  };

  const employees = useMemo(() => (actualUnitId ? getEmployeesByTechnicalUnit(actualUnitId) : []), [actualUnitId, getEmployeesByTechnicalUnit]);
  
  // Search functionality with backend API
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const query = search.trim();
      if (!query) {
        setSearchResults([]);
        return;
      }

      try {
        const results = await searchEmployees(query, actualUnitId);
        setSearchResults(results);
      } catch (error) {
        console.error('Employee search failed:', error);
        // Fallback to local filtering
        const localResults = employees.filter(e => 
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
          e.email.toLowerCase().includes(query.toLowerCase()) ||
          e.role.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(localResults);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [search, searchEmployees, employees, actualUnitId]);

  // Use search results when searching, otherwise use all employees for the unit
  const filtered = search.trim() ? searchResults : employees;

  // Managers (Leidinggevenden)
  const [mgrViewMode, setMgrViewMode] = useState<'grid' | 'card'>('grid');
  const [mgrSearch, setMgrSearch] = useState('');
  const [mgrUploading, setMgrUploading] = useState(false);
  const mgrFileInputRef = React.useRef<HTMLInputElement>(null);
  const managers = useMemo(() => {
    const lower = (s: string) => s.toLowerCase();
    return employees.filter(e => {
      const r = lower(e.role || '');
      return r.includes('manager') || r.includes('leiding');
    });
  }, [employees]);
  const currentManagerId = unit?.manager || '';
  const isEmpManager = (e: Employee) => e.id === currentManagerId;
  const filteredManagers = useMemo(() => {
    const q = mgrSearch.toLowerCase();
    return managers.filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.role.toLowerCase().includes(q));
  }, [managers, mgrSearch]);

  // Ondernemingsraad members derived from employees
  const orMembers = useMemo(() => {
    return employees
      .filter(e => e.orMembership?.[orCategory]?.member)
      .sort((a, b) => (a.orMembership?.[orCategory]?.order ?? 0) - (b.orMembership?.[orCategory]?.order ?? 0));
  }, [employees, orCategory]);

  if (!unit) {
    return (
      <Box>
        <Alert severity="error">Technische eenheid niet gevonden</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/technical-units')} sx={{ mt: 2 }}>Terug naar overzicht</Button>
      </Box>
    );
  }

  const onAdd = () => { setSelected(null); setModalMode('create'); setModalOpen(true); };
  const onEdit = (e: Employee) => { setSelected(e); setModalMode('edit'); setModalOpen(true); };
  const onView = (e: Employee) => { setSelected(e); setModalMode('view'); setModalOpen(true); };
  const onDelete = (e: Employee) => { deleteEmployee(e.id); setSnackbar({ open: true, message: 'Medewerker verwijderd', severity: 'success' }); };

  const onSubmit = (values: Omit<Employee, 'id'>) => {
    if (modalMode === 'create') { addEmployee(values); setSnackbar({ open: true, message: 'Medewerker toegevoegd', severity: 'success' }); }
    if (modalMode === 'edit' && selected) { updateEmployee(selected.id, values); setSnackbar({ open: true, message: 'Medewerker bijgewerkt', severity: 'success' }); }
  };

  const onDownloadTemplate = () => {
    downloadEmployeeTemplate();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !actualUnitId) return;
    try {
      setUploading(true);
      const imported = await parseEmployeesFromExcel(file, actualUnitId);
      importEmployees(imported);
      setSnackbar({ open: true, message: `${imported.length} medewerkers geïmporteerd`, severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Fout bij importeren van medewerkers', severity: 'error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 1,
          mb: 2,
          boxShadow: (theme) => theme.shadows[1],
        }}
      >
        <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNext fontSize="small" />} sx={{ mb: 1, flexWrap: 'wrap' }}>
          <Chip size="small" icon={<Home />} label="Terug" onClick={() => navigate('/')} clickable variant="outlined" />
          <Chip size="small" icon={<Business />} label={`Bedrijven: ${company?.name || 'Onbekend'}`} onClick={() => company?.id ? navigate(`/companies/${company.id}`) : navigate('/companies')} clickable variant="outlined" />
          <Chip size="small" icon={<Factory />} label={`Technische eenheden: ${unit.name}`} onClick={expandAll} clickable color="primary" variant="filled" />
        </Breadcrumbs>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h1" sx={{ cursor: 'pointer' }} onClick={expandAll}>{unit.name}</Typography>
          <Box>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mr: 2 }}>Terug naar hoofdmenu</Button>
          </Box>
        </Box>

  {/* Section quick nav moved into details card under Status */}

  {/* Full technical unit details (sticky) */}
        <Paper sx={{ p: 3, mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" mb={2}>
                <Factory sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Code</Typography>
                  <Typography variant="body1">{unit.code}</Typography>
                </Box>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">Afdeling</Typography>
                <Typography variant="body1">{unit.department}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip label={unit.status === 'active' ? 'Actief' : 'Inactief'} color={unit.status === 'active' ? 'success' : 'default'} size="small" />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
        <Box display="flex" alignItems="center" mb={2}>
                <Person sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Manager</Typography>
          <Typography variant="body1">{employees.find(e => e.id === unit.manager) ? `${employees.find(e => e.id === unit.manager)!.lastName} ${employees.find(e => e.id === unit.manager)!.firstName}` : (unit.manager || '-')}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Werknemers</Typography>
                <Typography variant="body1">{unit.numberOfEmployees}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">Taal</Typography>
                <Typography variant="body1">{
                  unit.language === 'N' ? 'Vlaanderen (N)' :
                  unit.language === 'F' ? 'Wallonië (F)' :
                  unit.language === 'N+F' ? 'Brussel (N en F)' :
                  'Duitstalig gewest (D)'
                }</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" mb={2}>
                <Business sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Juridische Entiteit</Typography>
                  <Typography variant="body1">{company?.name}</Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center">
                <LocationOn sx={{ mr: 2, color: 'action.active' }} />
                <Typography variant="body1">{unit.location.city}, {unit.location.country}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">Paritaire Comité’s</Typography>
                <Typography variant="body2">PC Arbeiders: {unit.pcWorkers || '-'}</Typography>
                <Typography variant="body2">PC Bedienden: {unit.pcClerks || '-'}</Typography>
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Dossiernummer FOD Werk</Typography>
              <Typography variant="body1">{unit.fodDossierBase ? `${unit.fodDossierBase}-${unit.fodDossierSuffix}` : '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Overlegorganen (verkiezingen)</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                {unit.electionBodies?.cpbw && <Chip size="small" label="CPBW" />}
                {unit.electionBodies?.or && <Chip size="small" label="OR" />}
                {unit.electionBodies?.sdWorkers && <Chip size="small" label="SD Arbeiders" />}
                {unit.electionBodies?.sdClerks && <Chip size="small" label="SD Bedienden" />}            
              </Box>
            </Grid>
          </Grid>
          {/* Divider + full-width section quick nav chips */}
          <Box sx={{ mt: 2 }}>
            <Box component="hr" aria-hidden="true" style={{ border: 0, borderTop: '1px solid', borderColor: 'rgba(0,0,0,0.12)' }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              <Chip
                size="small"
                icon={<Group />}
                label="Personeel"
                onClick={() => scrollTo('personeel')}
                clickable
                color={visibleSection === 'personeel' ? 'primary' : 'default'}
                variant={visibleSection === 'personeel' ? 'filled' : 'outlined'}
              />
              <Chip
                size="small"
                icon={<SupervisorAccount />}
                label="Leidinggevenden"
                onClick={() => scrollTo('leidinggevenden')}
                clickable
                color={visibleSection === 'leidinggevenden' ? 'primary' : 'default'}
                variant={visibleSection === 'leidinggevenden' ? 'filled' : 'outlined'}
              />
              <Chip
                size="small"
                icon={<Gavel />}
                label="Ondernemingsraad"
                onClick={() => scrollTo('ondernemingsraad')}
                clickable
                color={visibleSection === 'ondernemingsraad' ? 'primary' : 'default'}
                variant={visibleSection === 'ondernemingsraad' ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>
        </Paper>
      </Box>


  {(visibleSection === 'all' || visibleSection === 'personeel') && (
  <Accordion id="personeel" ref={personnelRef} expanded={isPersonnelOpen} onChange={(_, e) => setIsPersonnelOpen(Boolean(e))} sx={{ mb: 3, scrollMarginTop: { xs: '360px', sm: '320px', md: '280px' } }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h5" component="h2">Personeel</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ mb: 3 }}>
            <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Zoek medewerkers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{ flexGrow: 1, minWidth: 200, maxWidth: 400 }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }}
              />
              <ToggleButtonGroup value={viewMode} exclusive onChange={(_, m) => m && setViewMode(m)} size="small">
                <ToggleButton value="grid"><ViewList /></ToggleButton>
                <ToggleButton value="card"><ViewModule /></ToggleButton>
              </ToggleButtonGroup>
              {/* Assignment mode removed: standard grid/card only */}
              <Button variant="outlined" startIcon={<Download />} onClick={onDownloadTemplate}>Template</Button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx,.xls" onChange={onFileChange} />
              <Button variant="outlined" startIcon={<Upload />} onClick={() => fileInputRef.current?.click()} disabled={uploading}>Importeer</Button>
              <Button variant="contained" startIcon={<Add />} onClick={onAdd}>Nieuwe Medewerker</Button>
            </Toolbar>
          </Paper>
          <Paper>
            {viewMode === 'grid' ? (
              <PersonnelGrid
                employees={filtered}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
                onAddToOR={(e, c)=> addToOndernemingsraad(e.id, c, unit.id)}
                onRemoveFromOR={(e, c)=> removeFromOndernemingsraad(e.id, c, unit.id)}
                onBulkAddToOR={(ids, c) => bulkAddToOndernemingsraad(ids, c, unit.id)}
              />
            ) : (
              <Box p={2}><PersonnelCardView employees={filtered} onEdit={onEdit} onDelete={onDelete} onView={onView} onAddToOR={(e, c: ORCategory)=> addToOndernemingsraad(e.id,c, unit.id)} onRemoveFromOR={(e, c: ORCategory)=> removeFromOndernemingsraad(e.id,c, unit.id)} /></Box>
            )}
          </Paper>
        </AccordionDetails>
    </Accordion>
  )}

      <PersonnelFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={onSubmit} employee={selected || undefined} mode={modalMode} technicalBusinessUnitId={unit.id} />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>

  {/* Leidinggevenden Section */}
  {(visibleSection === 'all' || visibleSection === 'leidinggevenden') && (
  <Accordion id="leidinggevenden" ref={managersRef} expanded={isManagersOpen} onChange={(_, e) => setIsManagersOpen(Boolean(e))} sx={{ mb: 3, scrollMarginTop: { xs: '360px', sm: '320px', md: '280px' } }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h5" component="h2">Leidinggevenden</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ mb: 3 }}>
            <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Zoek leidinggevenden..."
                value={mgrSearch}
                onChange={(e) => setMgrSearch(e.target.value)}
                size="small"
                sx={{ flexGrow: 1, minWidth: 200, maxWidth: 400 }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }}
              />
              <ToggleButtonGroup value={mgrViewMode} exclusive onChange={(_, m) => m && setMgrViewMode(m)} size="small">
                <ToggleButton value="grid"><ViewList /></ToggleButton>
                <ToggleButton value="card"><ViewModule /></ToggleButton>
              </ToggleButtonGroup>
              <Button variant="outlined" startIcon={<Download />} onClick={downloadManagerTemplate}>Template</Button>
              <input type="file" ref={mgrFileInputRef} style={{ display: 'none' }} accept=".xlsx,.xls" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !actualUnitId) return;
                try {
                  setMgrUploading(true);
                  const imported = await parseEmployeesFromExcel(file, actualUnitId);
                  imported.forEach(emp => addEmployee({ ...emp, role: emp.role || 'Manager' }));
                  setSnackbar({ open: true, message: `${imported.length} leidinggevenden geïmporteerd`, severity: 'success' });
                } catch (err) {
                  setSnackbar({ open: true, message: 'Fout bij importeren van leidinggevenden', severity: 'error' });
                } finally {
                  setMgrUploading(false);
                  if (mgrFileInputRef.current) mgrFileInputRef.current.value = '';
                }
              }} />
              <Button variant="outlined" startIcon={<Upload />} onClick={() => mgrFileInputRef.current?.click()} disabled={mgrUploading}>Importeer</Button>
            </Toolbar>
          </Paper>
          <Paper>
            {mgrViewMode === 'grid' ? (
              <PersonnelGrid
                employees={filteredManagers}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
                onAddToOR={(e,c)=> addToOndernemingsraad(e.id,c, unit.id)}
                onRemoveFromOR={(e,c)=> removeFromOndernemingsraad(e.id,c, unit.id)}
                onBulkAddToOR={(ids, c) => bulkAddToOndernemingsraad(ids, c, unit.id)}
                onSetAsManager={(e) => { if (unit) { setManagerForUnit(unit.id, e.id); setSnackbar({ open: true, message: `${e.firstName} ${e.lastName} is nu manager`, severity: 'success' }); } }}
                onClearManager={() => { if (unit) { clearManagerForUnit(unit.id); setSnackbar({ open: true, message: `Manager verwijderd`, severity: 'success' }); } }}
                isManager={isEmpManager}
              />
            ) : (
              <Box p={2}><PersonnelCardView employees={filteredManagers} onEdit={onEdit} onDelete={onDelete} onView={onView} onAddToOR={(e, c: ORCategory)=> addToOndernemingsraad(e.id,c, unit.id)} onRemoveFromOR={(e, c: ORCategory)=> removeFromOndernemingsraad(e.id,c, unit.id)} /></Box>
            )}
          </Paper>
        </AccordionDetails>
    </Accordion>
  )}

      {/* Ondernemingsraad Section */}
  {(visibleSection === 'all' || visibleSection === 'ondernemingsraad') && (
  <Accordion id="ondernemingsraad" ref={orRef} expanded={isOROpen} onChange={(_, e) => setIsOROpen(Boolean(e))} sx={{ mb: 3, scrollMarginTop: { xs: '360px', sm: '320px', md: '280px' } }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h5" component="h2">Ondernemingsraad</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ mb: 2 }}>
            <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>Leden: {orMembers.length}</Typography>
              <ToggleButtonGroup value={orCategory} exclusive onChange={(_, v) => v && setOrCategory(v)} size="small">
                <ToggleButton value="arbeiders">Arbeiders</ToggleButton>
                <ToggleButton value="bedienden">Bedienden</ToggleButton>
                <ToggleButton value="kaderleden">Kaderleden</ToggleButton>
                <ToggleButton value="jeugdige">Jeugdige</ToggleButton>
              </ToggleButtonGroup>
              <ToggleButtonGroup value={orViewMode} exclusive onChange={(_, m) => m && setOrViewMode(m)} size="small">
                <ToggleButton value="grid"><ViewList /></ToggleButton>
                <ToggleButton value="card"><ViewModule /></ToggleButton>
              </ToggleButtonGroup>
              <Button variant="outlined" startIcon={<Download />} onClick={downloadORTemplate}>Template</Button>
              <input type="file" ref={orFileInputRef} style={{ display: 'none' }} accept=".xlsx,.xls" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !id) return;
                try {
                  setOrUploading(true);
                  const rows = await parseORFromExcel(file);
                  let imported = 0;
                  let skipped = 0;
                  for (const row of rows) {
                    const emp = employees.find(emp => emp.technicalBusinessUnitId === actualUnitId && emp.email.toLowerCase() === row.email.toLowerCase());
                    if (emp) {
                      addToOndernemingsraad(emp.id, row.category, unit.id);
                      imported++;
                    } else {
                      skipped++;
                    }
                  }
                  setSnackbar({ open: true, message: `OR import voltooid: ${imported} toegevoegd${skipped ? `, ${skipped} overgeslagen (niet gevonden)` : ''}`, severity: 'success' });
                } catch (err) {
                  setSnackbar({ open: true, message: 'Fout bij importeren van OR-leden', severity: 'error' });
                } finally {
                  setOrUploading(false);
                  if (orFileInputRef.current) orFileInputRef.current.value = '';
                }
              }} />
              <Button variant="outlined" startIcon={<Upload />} onClick={() => orFileInputRef.current?.click()} disabled={orUploading}>Importeer</Button>
            </Toolbar>
          </Paper>
          {orViewMode === 'grid' ? (
            <Paper>
              <ORGrid
                members={orMembers}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
                onRemoveFromOR={(e) => removeFromOndernemingsraad(e.id, orCategory, unit.id)}
                onBulkRemoveFromOR={(ids) => ids.forEach(empId => removeFromOndernemingsraad(empId, orCategory, unit.id))}
                cardView={false}
                onToggleCardView={(cv) => setOrViewMode(cv ? 'card' : 'grid')}
              />
            </Paper>
          ) : (
            <Paper>
              <Box p={2}>
                <PersonnelCardView
                  employees={orMembers}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  onRemoveFromOR={(e) => removeFromOndernemingsraad(e.id, orCategory, unit.id)}
                />
              </Box>
            </Paper>
          )}
        </AccordionDetails>
  </Accordion>
  )}
    </Box>
  );
}
