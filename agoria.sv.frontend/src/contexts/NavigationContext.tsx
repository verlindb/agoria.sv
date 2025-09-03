import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export interface NavigationItem {
  key: string;
  label: string;
  path: string;
  icon?: ReactNode;
  indent: number;
  expandable: boolean;
  expanded?: boolean;
  children?: NavigationItem[];
}

export interface NavigationState {
  selectedCompany: { id: string; name: string } | null;
  selectedTechnicalUnit: { id: string; name: string; companyId: string } | null;
  expandedSections: Set<string>;
  currentPath: string;
  breadcrumbs: Array<{ label: string; path: string }>;
}

interface NavigationContextType {
  state: NavigationState;
  setSelectedCompany: (company: { id: string; name: string } | null) => void;
  setSelectedTechnicalUnit: (unit: { id: string; name: string; companyId: string } | null) => void;
  toggleSection: (sectionKey: string) => void;
  isSectionExpanded: (sectionKey: string) => boolean;
  expandSection: (sectionKey: string) => void;
  collapseSection: (sectionKey: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path: string }>) => void;
  autoExpandBasedOnPath: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const STORAGE_KEY = 'agoria-navigation-state';

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const location = useLocation();
  
  const [state, setState] = useState<NavigationState>(() => {
    // Try to load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          expandedSections: new Set(parsed.expandedSections || []),
          currentPath: location.pathname,
        };
      } catch (e) {
        console.warn('Failed to parse stored navigation state:', e);
      }
    }
    
    return {
      selectedCompany: null,
      selectedTechnicalUnit: null,
      expandedSections: new Set<string>(),
      currentPath: location.pathname,
      breadcrumbs: [],
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    const stateToStore = {
      ...state,
      expandedSections: Array.from(state.expandedSections),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
  }, [state]);

  // Update current path when location changes
  useEffect(() => {
    setState(prev => ({ ...prev, currentPath: location.pathname }));
  }, [location.pathname]);

  const setSelectedCompany = (company: { id: string; name: string } | null) => {
    setState(prev => ({ 
      ...prev, 
      selectedCompany: company,
      // Clear technical unit when company changes
      selectedTechnicalUnit: company && prev.selectedTechnicalUnit?.companyId !== company.id 
        ? null 
        : prev.selectedTechnicalUnit
    }));
  };

  const setSelectedTechnicalUnit = (unit: { id: string; name: string; companyId: string } | null) => {
    setState(prev => ({ ...prev, selectedTechnicalUnit: unit }));
  };

  const toggleSection = (sectionKey: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedSections);
      if (newExpanded.has(sectionKey)) {
        newExpanded.delete(sectionKey);
      } else {
        newExpanded.add(sectionKey);
      }
      return { ...prev, expandedSections: newExpanded };
    });
  };

  const isSectionExpanded = (sectionKey: string): boolean => {
    return state.expandedSections.has(sectionKey);
  };

  const expandSection = (sectionKey: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedSections);
      newExpanded.add(sectionKey);
      return { ...prev, expandedSections: newExpanded };
    });
  };

  const collapseSection = (sectionKey: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedSections);
      newExpanded.delete(sectionKey);
      return { ...prev, expandedSections: newExpanded };
    });
  };

  const setBreadcrumbs = (breadcrumbs: Array<{ label: string; path: string }>) => {
    setState(prev => ({ ...prev, breadcrumbs }));
  };

  const autoExpandBasedOnPath = () => {
    const path = location.pathname;
    const sectionsToExpand: string[] = [];

    // Parse the current path to determine what should be expanded
    if (path.includes('/companies/')) {
      sectionsToExpand.push('bedrijven');
      
      const companyMatch = path.match(/\/companies\/([^/]+)/);
      if (companyMatch) {
        const companyId = companyMatch[1];
        sectionsToExpand.push(`bedrijf-${companyId}`);
        
        if (path.includes('/technical-units/')) {
          sectionsToExpand.push('technische-eenheden');
          
          const unitMatch = path.match(/\/technical-units\/([^/]+)/);
          if (unitMatch) {
            const unitId = unitMatch[1];
            sectionsToExpand.push(`tbu-${unitId}`);
          }
        }
      }
    } else if (path.includes('/technical-units/')) {
      sectionsToExpand.push('technische-eenheden-main');
      
      const unitMatch = path.match(/\/technical-units\/([^/]+)/);
      if (unitMatch) {
        const unitId = unitMatch[1];
        sectionsToExpand.push(`tbu-${unitId}`);
      }
    }

    // Expand all relevant sections
    setState(prev => {
      const newExpanded = new Set(prev.expandedSections);
      sectionsToExpand.forEach(section => newExpanded.add(section));
      return { ...prev, expandedSections: newExpanded };
    });
  };

  const value: NavigationContextType = {
    state,
    setSelectedCompany,
    setSelectedTechnicalUnit,
    toggleSection,
    isSectionExpanded,
    expandSection,
    collapseSection,
    setBreadcrumbs,
    autoExpandBasedOnPath,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
