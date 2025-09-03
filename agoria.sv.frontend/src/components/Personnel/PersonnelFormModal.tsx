import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  IconButton,
  Typography,
  MenuItem,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Employee } from '../../types';

interface PersonnelFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<Employee, 'id'>) => void;
  employee?: Employee | null;
  mode: 'create' | 'edit' | 'view';
  technicalBusinessUnitId: string;
}

const validationSchema = Yup.object({
  firstName: Yup.string().required('Voornaam is verplicht'),
  lastName: Yup.string().required('Achternaam is verplicht'),
  email: Yup.string().email('Ongeldig e-mailadres').required('E-mail is verplicht'),
  phone: Yup.string(),
  role: Yup.string().required('Rol is verplicht'),
  startDate: Yup.date().required('Startdatum is verplicht'),
  status: Yup.mixed<'active' | 'inactive'>().oneOf(['active', 'inactive']).required(),
});

export const PersonnelFormModal: React.FC<PersonnelFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  employee,
  mode,
  technicalBusinessUnitId,
}) => {
  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Nieuwe Medewerker' : mode === 'edit' ? 'Medewerker Bewerken' : 'Medewerker Details';

  const initialValues: Omit<Employee, 'id'> = employee ? {
    ...employee,
  } : {
    technicalBusinessUnitId,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    startDate: new Date(),
    status: 'active',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <IconButton aria-label="Sluiten" onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={!isReadOnly ? validationSchema : undefined}
        onSubmit={(values) => { onSubmit(values); onClose(); }}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="firstName"
                    label="Voornaam"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstName && Boolean(errors.firstName)}
                    helperText={touched.firstName && errors.firstName}
                    disabled={isReadOnly}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="lastName"
                    label="Achternaam"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.lastName && Boolean(errors.lastName)}
                    helperText={touched.lastName && errors.lastName}
                    disabled={isReadOnly}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="email"
                    label="E-mail"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    disabled={isReadOnly}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="phone"
                    label="Telefoon"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isReadOnly}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="role"
                    label="Rol/Functie"
                    value={values.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.role && Boolean(errors.role)}
                    helperText={touched.role && errors.role}
                    disabled={isReadOnly}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="startDate"
                    label="Startdatum"
                    type="date"
                    value={new Date(values.startDate).toISOString().slice(0,10)}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isReadOnly}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
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
                    disabled={isReadOnly}
                    fullWidth
                  >
                    <MenuItem value="active">Actief</MenuItem>
                    <MenuItem value="inactive">Inactief</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="inherit">{isReadOnly ? 'Sluiten' : 'Annuleren'}</Button>
              {!isReadOnly && <Button type="submit" variant="contained">{mode === 'create' ? 'Toevoegen' : 'Opslaan'}</Button>}
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
