import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Box,
  IconButton,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputAdornment,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Company, TechnicalBusinessUnit } from '../../types';

interface TechnicalUnitFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  unit?: TechnicalBusinessUnit | null;
  mode: 'create' | 'edit' | 'view';
  companyId?: string;
  companies?: Company[];
  allowCompanySelection?: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Naam is verplicht'),
  code: Yup.string().required('Code is verplicht'),
  description: Yup.string(),
  numberOfEmployees: Yup.number()
    .min(0, 'Minimum 0 werknemers')
    .required('Aantal werknemers is verplicht'),
  manager: Yup.string().required('Manager is verplicht'),
  department: Yup.string().required('Afdeling is verplicht'),
  status: Yup.string().required('Status is verplicht'),
  language: Yup.mixed<'N'|'F'|'N+F'|'D'>().oneOf(['N','F','N+F','D']).required('Taal is verplicht'),
  pcWorkers: Yup.string().required('PC arbeiders is verplicht'),
  pcClerks: Yup.string().required('PC bedienden is verplicht'),
  fodDossierBase: Yup.string().matches(/^\d{5}$/, 'Vijf cijfers verplicht').required('Dossiernummer (5 cijfers) is verplicht'),
  fodDossierSuffix: Yup.mixed<'1'|'2'>().oneOf(['1','2']).required(),
  electionBodies: Yup.object({
    cpbw: Yup.boolean(),
    or: Yup.boolean(),
    sdWorkers: Yup.boolean(),
    sdClerks: Yup.boolean(),
  }),
  location: Yup.object({
    street: Yup.string().required('Straat is verplicht'),
    number: Yup.string().required('Nummer is verplicht'),
    postalCode: Yup.string().required('Postcode is verplicht'),
    city: Yup.string().required('Stad is verplicht'),
    country: Yup.string().required('Land is verplicht'),
  }),
});

export const TechnicalUnitFormModal: React.FC<TechnicalUnitFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  unit,
  mode,
  companyId,
  companies = [],
  allowCompanySelection = false,
}) => {
  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Nieuwe Technische Eenheid' : mode === 'edit' ? 'Technische Eenheid Bewerken' : 'Technische Eenheid Details';

  const initialValues: Omit<TechnicalBusinessUnit, 'id' | 'createdAt' | 'updatedAt'> = unit || {
    companyId: companyId || '',
    name: '',
    code: '',
    description: '',
    numberOfEmployees: 0,
    manager: '',
    department: '',
    status: 'active',
  language: 'N',
  pcWorkers: '',
  pcClerks: '',
  fodDossierBase: '',
  fodDossierSuffix: '1',
  electionBodies: { cpbw: true, or: true, sdWorkers: false, sdClerks: false },
    location: {
      street: '',
      number: '',
      postalCode: '',
      city: '',
      country: 'België',
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <IconButton
            aria-label="Sluiten"
            onClick={onClose}
            size="small"
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={!isReadOnly ? validationSchema : undefined}
        onSubmit={(values) => {
          onSubmit(values);
          onClose();
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {allowCompanySelection && (
                  <Grid item xs={12}>
                    <TextField
                      select
                      name="companyId"
                      label="Juridische Entiteit"
                      value={values.companyId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.companyId && Boolean(errors.companyId)}
                      helperText={touched.companyId && errors.companyId}
                      disabled={isReadOnly}
                      fullWidth
                      required
                    >
                      <MenuItem value="">
                        <em>Selecteer een bedrijf</em>
                      </MenuItem>
                      {companies.map((company) => (
                        <MenuItem key={company.id} value={company.id}>
                          {company.name} ({company.ondernemingsnummer})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Algemene Informatie
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="code"
                    label="Code"
                    value={values.code}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.code && Boolean(errors.code)}
                    helperText={touched.code && errors.code}
                    disabled={isReadOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="name"
                    label="Naam"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    disabled={isReadOnly}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Beschrijving"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    disabled={isReadOnly}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="department"
                    label="Afdeling"
                    value={values.department}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.department && Boolean(errors.department)}
                    helperText={touched.department && errors.department}
                    disabled={isReadOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="manager"
                    label="Manager (Employee ID)"
                    value={values.manager}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.manager && Boolean(errors.manager)}
                    helperText={(touched.manager && (errors.manager as any)) || 'Vul het medewerkers-ID in of wijs aan via Leidinggevenden' }
                    disabled={isReadOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="numberOfEmployees"
                    label="Aantal Werknemers"
                    type="number"
                    value={values.numberOfEmployees}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.numberOfEmployees && Boolean(errors.numberOfEmployees)}
                    helperText={touched.numberOfEmployees && errors.numberOfEmployees}
                    disabled={isReadOnly}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Locatie
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    name="location.street"
                    label="Straat"
                    value={values.location.street}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.location?.street && Boolean(errors.location?.street)}
                    helperText={touched.location?.street && errors.location?.street}
                    disabled={isReadOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="location.number"
                    label="Nummer"
                    value={values.location.number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.location?.number && Boolean(errors.location?.number)}
                    helperText={touched.location?.number && errors.location?.number}
                    disabled={isReadOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="location.postalCode"
                    label="Postcode"
                    value={values.location.postalCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.location?.postalCode && Boolean(errors.location?.postalCode)}
                    helperText={touched.location?.postalCode && errors.location?.postalCode}
                    disabled={isReadOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="location.city"
                    label="Stad"
                    value={values.location.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.location?.city && Boolean(errors.location?.city)}
                    helperText={touched.location?.city && errors.location?.city}
                    disabled={isReadOnly}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="location.country"
                    label="Land"
                    value={values.location.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.location?.country && Boolean(errors.location?.country)}
                    helperText={touched.location?.country && errors.location?.country}
                    disabled={isReadOnly}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    name="status"
                    label="Status"
                    value={values.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.status && Boolean(errors.status)}
                    helperText={touched.status && errors.status}
                    disabled={isReadOnly}
                    fullWidth
                  >
                    <MenuItem value="active">Actief</MenuItem>
                    <MenuItem value="inactive">Inactief</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Wettelijke Gegevens
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    name="language"
                    label="Taal van de TBE"
                    value={values.language}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.language && Boolean(errors.language)}
                    helperText={touched.language && errors.language}
                    disabled={isReadOnly}
                    fullWidth
                  >
                    <MenuItem value="N">Vlaanderen (N)</MenuItem>
                    <MenuItem value="F">Wallonië (F)</MenuItem>
                    <MenuItem value="N+F">Brussel (N en F)</MenuItem>
                    <MenuItem value="D">Duitstalig gewest (D)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    name="pcWorkers"
                    label="PC Arbeiders"
                    value={values.pcWorkers}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.pcWorkers && Boolean(errors.pcWorkers)}
                    helperText={touched.pcWorkers && (errors as any).pcWorkers}
                    disabled={isReadOnly}
                    fullWidth
                  >
                    {/* Example options; replace with real list */}
                    <MenuItem value="">Selecteer PC</MenuItem>
                    <MenuItem value="100">PC 100</MenuItem>
                    <MenuItem value="111">PC 111</MenuItem>
                    <MenuItem value="124">PC 124</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    name="pcClerks"
                    label="PC Bedienden"
                    value={values.pcClerks}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.pcClerks && Boolean(errors.pcClerks)}
                    helperText={touched.pcClerks && (errors as any).pcClerks}
                    disabled={isReadOnly}
                    fullWidth
                  >
                    {/* Example options; replace with real list */}
                    <MenuItem value="">Selecteer PC</MenuItem>
                    <MenuItem value="200">PC 200</MenuItem>
                    <MenuItem value="209">PC 209</MenuItem>
                    <MenuItem value="226">PC 226</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    name="fodDossierBase"
                    label="Dossiernummer FOD Werk (eerste 5 cijfers)"
                    value={values.fodDossierBase}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 5);
                      (e.target as any).value = onlyDigits;
                      handleChange(e);
                    }}
                    onBlur={handleBlur}
                    error={touched.fodDossierBase && Boolean((errors as any).fodDossierBase)}
                    helperText={touched.fodDossierBase && (errors as any).fodDossierBase}
                    disabled={isReadOnly}
                    fullWidth
                    inputProps={{ inputMode: 'numeric', pattern: '\\d{5}', maxLength: 5 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">- {values.fodDossierSuffix}</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    name="fodDossierSuffix"
                    label="FOD Dossier Suffix"
                    value={values.fodDossierSuffix}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.fodDossierSuffix && Boolean((errors as any).fodDossierSuffix)}
                    helperText={touched.fodDossierSuffix && (errors as any).fodDossierSuffix}
                    disabled={isReadOnly}
                    fullWidth
                  >
                    <MenuItem value="1">-1</MenuItem>
                    <MenuItem value="2">-2</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <FormGroup row>
                    <FormControlLabel
                      control={<Checkbox name="electionBodies.cpbw" checked={values.electionBodies.cpbw} onChange={handleChange} disabled={isReadOnly} />}
                      label="[COMITÉ] (CPBW)"
                    />
                    <FormControlLabel
                      control={<Checkbox name="electionBodies.or" checked={values.electionBodies.or} onChange={handleChange} disabled={isReadOnly} />}
                      label="[ONDERNEMINGSRAAD] (OR)"
                    />
                    <FormControlLabel
                      control={<Checkbox name="electionBodies.sdWorkers" checked={values.electionBodies.sdWorkers} onChange={handleChange} disabled={isReadOnly} />}
                      label="[SYNDICALE DELEGATIE] arbeiders"
                    />
                    <FormControlLabel
                      control={<Checkbox name="electionBodies.sdClerks" checked={values.electionBodies.sdClerks} onChange={handleChange} disabled={isReadOnly} />}
                      label="[SYNDICALE DELEGATIE] bedienden"
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="inherit">
                {isReadOnly ? 'Sluiten' : 'Annuleren'}
              </Button>
              {!isReadOnly && (
                <Button type="submit" variant="contained" color="primary">
                  {mode === 'create' ? 'Toevoegen' : 'Opslaan'}
                </Button>
              )}
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};
