import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { MainLayout } from './components/Layout/MainLayout';
import { Companies } from './pages/Companies';
import { CompanyDetail } from './pages/CompanyDetail';
import { Dashboard } from './pages/Dashboard';
import { TechnicalUnits } from './pages/TechnicalUnits'; // Add this import
import { TechnicalUnitDetail } from './pages/TechnicalUnitDetail';

// Placeholder components
const Elections = () => <div>Elections - Coming Soon</div>;
const Candidates = () => <div>Candidates - Coming Soon</div>;
const Reports = () => <div>Reports - Coming Soon</div>;
const Settings = () => <div>Settings - Coming Soon</div>;

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="companies" element={<Companies />} />
              <Route path="companies/:id" element={<CompanyDetail />} />
              <Route path="technical-units" element={<TechnicalUnits />} /> {/* Add this route */}
              <Route path="technical-units/:id" element={<TechnicalUnitDetail />} />
              <Route path="elections" element={<Elections />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
