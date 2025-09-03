import React, { useEffect, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { 
  ChevronRight, 
  LayoutDashboard,
  Building2, 
  Users, 
  Factory,
  Settings,
  Vote,
  FileText,
  UserPlus,
  Crown,
  Users2,
  Briefcase
} from 'lucide-react';
import { 
  Box, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Collapse,
  Chip,
  useTheme,
  alpha,
  Fade,
  Divider
} from '@mui/material';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAppContext } from '../../contexts/AppContext';

const DynamicNavigation: React.FC = () => {
  const location = useLocation();
  const params = useParams();
  const theme = useTheme();
  const { 
    state, 
    toggleSection, 
    isSectionExpanded,
    setSelectedCompany,
    setSelectedTechnicalUnit,
    autoExpandBasedOnPath
  } = useNavigation();
  
  const { companies, technicalUnits } = useAppContext();

  // Auto-detect context from URL and update navigation state
  useEffect(() => {
    const path = location.pathname;
    
    // Handle company context
    if (path.includes('/companies/')) {
      const companyId = params.id || params.companyId;
      if (companyId) {
        const company = companies.find(c => c.id === companyId);
        if (company && (!state.selectedCompany || state.selectedCompany.id !== companyId)) {
          setSelectedCompany({ id: company.id, name: company.name });
        }
      }
    } else if (state.selectedCompany && !path.includes('/companies/')) {
      setSelectedCompany(null);
    }

    // Handle technical unit context
    if (path.includes('/technical-units/')) {
      const unitId = params.unitId || params.id;
      if (unitId) {
        const unit = technicalUnits.find(u => u.id === unitId);
        if (unit && (!state.selectedTechnicalUnit || state.selectedTechnicalUnit.id !== unitId)) {
          setSelectedTechnicalUnit({ 
            id: unit.id, 
            name: unit.name, 
            companyId: unit.companyId 
          });
        }
      }
    } else if (state.selectedTechnicalUnit && !path.includes('/technical-units/')) {
      setSelectedTechnicalUnit(null);
    }

    autoExpandBasedOnPath();
  }, [location.pathname, params, companies, technicalUnits, state.selectedCompany, state.selectedTechnicalUnit, setSelectedCompany, setSelectedTechnicalUnit, autoExpandBasedOnPath]);

  // Enhanced nav item renderer with cleaner styling
  const renderNavItem = (
    key: string,
    label: string,
    path: string,
    icon: React.ReactNode,
    indent: number = 0,
    expandable: boolean = false,
    children?: React.ReactNode,
    badge?: string | number,
    isSubtle: boolean = false
  ) => {
    const isActive = location.pathname === path || 
                     (path !== '/' && location.pathname.startsWith(path));
    const isExpanded = isSectionExpanded(key);
    
    const handleClick = () => {
      if (expandable) {
        toggleSection(key);
      }
    };

    // Cleaner color palette
    const getItemColor = (key: string) => {
      if (key.includes('dashboard')) return '#6366f1'; // Indigo
      if (key.includes('bedrijv') || key.includes('companies')) return '#ec4899'; // Pink
      if (key.includes('technical') || key.includes('tbu')) return '#06b6d4'; // Cyan
      if (key.includes('verkiezingen')) return '#10b981'; // Emerald
      if (key.includes('kandidaten')) return '#f59e0b'; // Amber
      if (key.includes('rapporten')) return '#8b5cf6'; // Violet
      if (key.includes('instellingen')) return '#6b7280'; // Gray
      return '#6366f1';
    };

    const itemColor = getItemColor(key);

    return (
      <Fade in={true} timeout={200 + indent * 30} key={key}>
        <Box sx={{ mb: 0.5, pl: indent * 1.5 }}>
          <ListItemButton
            component={expandable ? 'div' : Link}
            to={expandable ? undefined : path}
            onClick={handleClick}
            sx={{
              borderRadius: 2,
              minHeight: isSubtle ? 36 : 44,
              position: 'relative',
              transition: 'all 0.2s ease',
              background: 'transparent',
              border: '1px solid transparent',
              '&::before': isActive ? {
                content: '""',
                position: 'absolute',
                left: -8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 3,
                height: '70%',
                background: itemColor,
                borderRadius: '0 2px 2px 0',
                zIndex: 1,
              } : {},
              '&:hover': {
                backgroundColor: alpha(itemColor, 0.05),
                border: `1px solid ${alpha(itemColor, 0.1)}`,
                transform: 'translateX(2px)',
              },
              ...(isActive && {
                backgroundColor: alpha(itemColor, 0.08),
                border: `1px solid ${alpha(itemColor, 0.2)}`,
              }),
            }}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: isSubtle ? 32 : 36,
                color: isActive ? itemColor : theme.palette.text.secondary,
                transition: 'color 0.2s ease',
                zIndex: 2,
              }}
            >
              {icon}
            </ListItemIcon>
            
            <ListItemText 
              primary={label}
              sx={{
                zIndex: 2,
                '& .MuiListItemText-primary': {
                  fontSize: isSubtle ? '0.825rem' : '0.875rem',
                  fontWeight: isActive ? 600 : (isSubtle ? 400 : 500),
                  color: isActive ? itemColor : theme.palette.text.primary,
                  transition: 'all 0.2s ease',
                  opacity: isSubtle ? 0.9 : 1,
                }
              }}
            />

            {badge && (
              <Chip
                label={badge}
                size="small"
                sx={{
                  backgroundColor: itemColor,
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  height: 18,
                  zIndex: 2,
                  '& .MuiChip-label': {
                    px: 0.75,
                  },
                }}
              />
            )}

            {expandable && (
              <Box 
                sx={{ 
                  ml: 0.5,
                  color: isActive ? itemColor : theme.palette.text.secondary,
                  transition: 'transform 0.2s ease',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  zIndex: 2,
                }}
              >
                <ChevronRight size={16} />
              </Box>
            )}
          </ListItemButton>
          
          {expandable && (
            <Collapse in={isExpanded} timeout={200}>
              <Box sx={{ mt: 0.5 }}>
                {children}
              </Box>
            </Collapse>
          )}
        </Box>
      </Fade>
    );
  };

  // Generate intuitive breadcrumb-style navigation
  const navigationItems = useMemo(() => {
    const items: React.ReactElement[] = [];

    // Dashboard (always visible)
    items.push(renderNavItem(
      'dashboard', 
      'Dashboard', 
      '/', 
      <LayoutDashboard size={20} />
    ));

    // Add top-level overview items
    items.push(renderNavItem(
      'overview-bedrijven',
      'Overview Bedrijven',
      '/companies',
      <Briefcase size={20} />,
      0,
      false
    ));

    items.push(renderNavItem(
      'overview-technische-eenheden',
      'Overview Technische Bedrijfseenheden',
      '/technical-units',
      <Factory size={20} />,
      0,
      false
    ));

    // Context-aware breadcrumb navigation
    const isOnCompanyPage = location.pathname.includes('/companies/');
    const isOnTechnicalUnitsPage = location.pathname.includes('/technical-units/');
    const hasSelectedCompany = state.selectedCompany !== null;
    const hasSelectedTechnicalUnit = state.selectedTechnicalUnit !== null;

    // Show breadcrumb when in company context
    if (hasSelectedCompany && state.selectedCompany) {
      // Clean divider before breadcrumb
      items.push(
        <Divider key="breadcrumb-divider-1" sx={{ my: 1, mx: 1, opacity: 0.4 }} />
      );

      // Company breadcrumb
      items.push(renderNavItem(
        `company-breadcrumb`,
        `${state.selectedCompany.name}`,
        `/companies/${state.selectedCompany.id}`,
        <Building2 size={18} />,
        0,
        hasSelectedTechnicalUnit,
        hasSelectedTechnicalUnit && state.selectedTechnicalUnit && (
          <>
            {/* Technical Unit in company context */}
            {renderNavItem(
              `tech-unit-breadcrumb`,
              `${state.selectedTechnicalUnit.name}`,
              `/companies/${state.selectedCompany.id}/technical-units/${state.selectedTechnicalUnit.id}`,
              <Factory size={16} />,
              1,
              true,
              isSectionExpanded('tech-unit-breadcrumb') && (
                <>
                  {renderNavItem(
                    'company-unit-personeel',
                    'Personeel',
                    `/companies/${state.selectedCompany.id}/technical-units/${state.selectedTechnicalUnit.id}/personeel`,
                    <Users size={16} />,
                    2
                  )}
                  {renderNavItem(
                    'company-unit-leidinggevenden',
                    'Leidinggevenden',
                    `/companies/${state.selectedCompany.id}/technical-units/${state.selectedTechnicalUnit.id}/leidinggevenden`,
                    <Crown size={16} />,
                    2
                  )}
                  {renderNavItem(
                    'company-unit-ondernemingsraad',
                    'Ondernemingsraad',
                    `/companies/${state.selectedCompany.id}/technical-units/${state.selectedTechnicalUnit.id}/ondernemingsraad`,
                    <Users2 size={16} />,
                    2
                  )}
                </>
              )
            )}
          </>
        )
      ));
    } 
    
    // Show breadcrumb when in standalone technical unit context (not under a company)
    else if (hasSelectedTechnicalUnit && isOnTechnicalUnitsPage && !isOnCompanyPage && state.selectedTechnicalUnit) {
      // Clean divider before breadcrumb
      items.push(
        <Divider key="breadcrumb-divider-2" sx={{ my: 1, mx: 1, opacity: 0.4 }} />
      );

      // Find the company this technical unit belongs to
      const parentCompany = companies.find(c => c.id === state.selectedTechnicalUnit?.companyId);
      
      if (parentCompany) {
        // Show: Company → Technical Unit → subitems
        items.push(renderNavItem(
          'standalone-company-breadcrumb',
          parentCompany.name,
          `/companies/${parentCompany.id}`,
          <Building2 size={16} />,
          0,
          false,
          undefined,
          undefined,
          true
        ));
      }

      // Technical Unit breadcrumb
      items.push(renderNavItem(
        `standalone-tech-unit-breadcrumb`,
        `${state.selectedTechnicalUnit.name}`,
        `/technical-units/${state.selectedTechnicalUnit.id}`,
        <Factory size={18} />,
        parentCompany ? 1 : 0,
        true,
        isSectionExpanded('standalone-tech-unit-breadcrumb') && (
          <>
            {renderNavItem(
              'standalone-unit-personeel',
              'Personeel',
              `/technical-units/${state.selectedTechnicalUnit.id}/personeel`,
              <Users size={16} />,
              1,
              false,
              undefined,
              undefined,
              true
            )}
            {renderNavItem(
              'standalone-unit-leidinggevenden',
              'Leidinggevenden',
              `/technical-units/${state.selectedTechnicalUnit.id}/leidinggevenden`,
              <Crown size={16} />,
              1,
              false,
              undefined,
              undefined,
              true
            )}
            {renderNavItem(
              'standalone-unit-ondernemingsraad',
              'Ondernemingsraad',
              `/technical-units/${state.selectedTechnicalUnit.id}/ondernemingsraad`,
              <Users2 size={16} />,
              1,
              false,
              undefined,
              undefined,
              true
            )}
          </>
        )
      ));
    }

    // Main navigation items - cleaner
    items.push(
      <Divider key="main-divider" sx={{ my: 1.5, mx: 1, opacity: 0.6 }} />
    );

    items.push(renderNavItem(
      'verkiezingen',
      'Verkiezingen',
      '/elections',
      <Vote size={20} />
    ));

    items.push(renderNavItem(
      'kandidaten',
      'Kandidaten',
      '/candidates',
      <UserPlus size={20} />
    ));

    items.push(renderNavItem(
      'rapporten',
      'Rapporten',
      '/reports',
      <FileText size={20} />
    ));

    // Bottom divider
    items.push(
      <Divider key="bottom-divider" sx={{ my: 1.5, mx: 1, opacity: 0.6 }} />
    );

    items.push(renderNavItem(
      'instellingen',
      'Instellingen',
      '/settings',
      <Settings size={20} />
    ));

    return items;
  }, [location.pathname, state.selectedCompany, state.selectedTechnicalUnit, companies, technicalUnits, isSectionExpanded, theme.palette.text]);

  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Box 
        sx={{ 
          py: 1.5, 
          px: 1, 
          maxHeight: '100%', 
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: 4,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.primary.main, 0.2),
            borderRadius: 2,
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.3),
            }
          },
        }}
      >
        {navigationItems}
      </Box>
    </Box>
  );
};

export default DynamicNavigation;
