// Example: How to use the searchTechnicalUnits function in a React component

import React, { useState, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { TechnicalBusinessUnit } from '../types';

export const TechnicalUnitsSearchExample: React.FC = () => {
  const { searchTechnicalUnits } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TechnicalBusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const results = await searchTechnicalUnits(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchTechnicalUnits]);

  return (
    <div>
      <h2>Search Technical Business Units</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, code, description, manager..."
          style={{ padding: '8px', marginRight: '8px', width: '300px' }}
        />
        <button 
          onClick={handleSearch} 
          disabled={loading || !searchQuery.trim()}
          style={{ padding: '8px 16px' }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div>
          <h3>Search Results ({searchResults.length} found):</h3>
          <ul>
            {searchResults.map((unit) => (
              <li key={unit.id} style={{ marginBottom: '8px' }}>
                <strong>{unit.name}</strong> ({unit.code}) - {unit.department}
                <br />
                <small>{unit.location.city}, {unit.status}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Usage in any component:
// const { searchTechnicalUnits } = useAppContext();
// const results = await searchTechnicalUnits('IT');
// console.log('Found technical units:', results);
