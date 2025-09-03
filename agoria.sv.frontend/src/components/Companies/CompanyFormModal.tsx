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
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Company } from '../../types';

interface CompanyFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  company?: Company | null;
  mode: 'create' | 'edit' | 'view';
}

const validationSchema = Yup.object({
  name: Yup.string().required('Naam is verplicht'),
  legalName: Yup.string().required('Juridische naam is verplicht'),
  ondernemingsnummer: Yup.string()
    .matches(/^BE\d{10}$/, 'Formaat moet BE0123456789 zijn')
    .required('Ondernemingsnummer is verplicht'),
  type: Yup.string().required('Type is verplicht'),
  numberOfEmployees: Yup.number()
    .min(1, 'Minimum 1 werknemer')
    .required('Aantal werknemers is verplicht'),
  sector: Yup.string().required('Sector is verplicht'),
  status: Yup.string().required('Status is verplicht'),
  address: Yup.object({
    street: Yup.string().required('Straat is verplicht'),
    number: Yup.string().required('Nummer is verplicht'),
    postalCode: Yup.string().required('Postcode is verplicht'),
    city: Yup.string().required('Stad is verplicht'),
    country: Yup.string().required('Land is verplicht'),
  }),
  contactPerson: Yup.object({
    firstName: Yup.string().required('Voornaam is verplicht'),
    lastName: Yup.string().required('Achternaam is verplicht'),
    email: Yup.string().email('Ongeldig e-mailadres').required('E-mail is verplicht'),
    phone: Yup.string().required('Telefoon is verplicht'),
    role: Yup.string().required('Functie is verplicht'),
  }),
});

const companyTypes = ['VZW', 'NV', 'BV', 'CV', 'Andere'];

export const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  company,
  mode,
}) => {
  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Nieuw Bedrijf' : mode === 'edit' ? 'Bedrijf Bewerken' : 'Bedrijf Details';

  const initialValues: Omit<Company, 'id' | 'createdAt' | 'updatedAt'> = company || {
    name: '',
    legalName: '',
    ondernemingsnummer: '',
    type: 'BV',
    numberOfEmployees: 0,
    sector: '',
    status: 'pending',
    address: {
      street: '',
      number: '',
      postalCode: '',
      city: '',
      country: 'België',
    },
    contactPerson: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="company-form-dialog-title"
    >
      <DialogTitle id="company-form-dialog-title">
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
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Algemene Informatie
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="name"
                    label="Bedrijfsnaam"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    disabled={isReadOnly}
                    inputProps={{ 'aria-label': 'Bedrijfsnaam' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="legalName"
                    label="Juridische Naam"
                    value={values.legalName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.legalName && Boolean(errors.legalName)}
                    helperText={touched.legalName && errors.legalName}
                    disabled={isReadOnly}
                    inputProps={{ 'aria-label': 'Juridische naam' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="ondernemingsnummer"
                    label="Ondernemingsnummer"
                    value={values.ondernemingsnummer}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.ondernemingsnummer && Boolean(errors.ondernemingsnummer)}
                    helperText={touched.ondernemingsnummer && errors.ondernemingsnummer}
                    disabled={isReadOnly}
                    placeholder="BE0123456789"
                    inputProps={{ 'aria-label': 'Ondernemingsnummer' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    name="type"
                    label="Bedrijfstype"
                    value={values.type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.type && Boolean(errors.type)}
                    helperText={touched.type && errors.type}
                    disabled={isReadOnly}
                    inputProps={{ 'aria-label': 'Bedrijfstype' }}
                  >
                    {companyTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
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
                    inputProps={{ 'aria-label': 'Aantal werknemers', min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="sector"
                    label="Sector"
                    value={values.sector}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.sector && Boolean(errors.sector)}
                    helperText={touched.sector && errors.sector}
                    disabled={isReadOnly}
                    inputProps={{ 'aria-label': 'Sector' }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Adres
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    name="address.street"
                    label="Straat"
                    value={values.address.street}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.address?.street && Boolean(errors.address?.street)}
                    helperText={touched.address?.street && errors.address?.street}
                    disabled={isReadOnly}
                    inputProps={{ 'aria-label': 'Straat' }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="address.number"
                    label="Nummer"
                    value={values.address.number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.address?.number && Boolean(errors.address?.number)}
                    helperText={touched.address?.number && errors.address?.number}
                    disabled={isReadOnly}
                    inputProps={{ 'aria-label': 'Huisnummer' }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="address.postalCode"
                    label="Postcode"
                    value={values.address.postalCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.address?.postalCode && Boolean(errors.address?.postalCode)}
                    helperText={touched.address?.postalCode && errors.address?.postalCode}
                    disabled={isReadOnly}
                    inputProps={{ 'aria-label': 'Postcode' }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="address.city"
                    label="Stad"
                    value={values.address.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.address?.city && Boolean(errors.address?.city)}
                    helperText={touched.address?.city && errors.address?.city}
                    disabled={isReadOnly}
                    inputProps={{ 'aria-label': 'Stad' }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="address.country"
                    label="Land"
                    value={values.address.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.address?.country && Boolean(errors.address?.country)}
                    helperText={touched.address?.country && errors.address?.country}
                    disabled={isReadOnly}
                    inputProps={{ 'aria-label': 'Land' }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Contactpersoon
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="contactPerson.firstName"
                    label="Voornaam"
                    value={values.contactPerson.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.contactPerson?.firstName && Boolean(errors.contactPerson?.firstName)}
                    helperText={touched.contactPerson?.firstName && errors.contactPerson?.firstName}
                    disabled={isReadOnly}
                    inputProps={{ 'aria-label': 'Voornaam contactpersoon' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="contactPerson.lastName"
                    label="Achternaam"
                    value={values.contactPerson.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.contactPerson?.lastName && Boolean(errors.contactPerson?.lastName)}
                    helperText={touched.contactPerson?.lastName && errors.contactPerson?.lastName}
                    disabled={isReadOnly}
                    inputProps={{ 'aria-label': 'Achternaam contactpersoon' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="contactPerson.email"
                    label="E-mail"
                    type="email"
                    value={values.contactPerson.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.contactPerson?.email && Boolean(errors.contactPerson?.email)}
                    helperText={touched.contactPerson?.email && errors.contactPerson?.email}
                    disabled={isReadOnly}
                    inputProps={{ 'aria-label': 'E-mail contactpersoon' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="contactPerson.phone"
                    label="Telefoon"
                    value={values.contactPerson.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.contactPerson?.phone && Boolean(errors.contactPerson?.phone)}
                    helperText={touched.contactPerson?.phone && errors.contactPerson?.phone}
                    disabled={isReadOnly}
                    inputProps={{ 'aria-label': 'Telefoon contactpersoon' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="contactPerson.role"
                    label="Functie"
                    value={values.contactPerson.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.contactPerson?.role && Boolean(errors.contactPerson?.role)}
                    helperText={touched.contactPerson?.role && errors.contactPerson?.role}
                    disabled={isReadOnly}
                    inputProps={{ 'aria-label': 'Functie contactpersoon' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                    inputProps={{ 'aria-label': 'Status' }}
                  >
                    <MenuItem value="active">Actief</MenuItem>
                    <MenuItem value="inactive">Inactief</MenuItem>
                    <MenuItem value="pending">In afwachting</MenuItem>
                  </TextField>
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
