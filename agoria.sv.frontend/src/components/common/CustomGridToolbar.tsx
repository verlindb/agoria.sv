import React, { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { GridToolbar, GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton } from '@mui/x-data-grid';
import { Settings, ViewList, ViewModule } from '@mui/icons-material';
import type { GridToolbarProps } from '@mui/x-data-grid';

interface CustomGridToolbarProps extends GridToolbarProps {
  onDensityChange?: (d: 'compact'|'standard'|'comfortable') => void;
  density?: 'compact'|'standard'|'comfortable';
  onViewToggle?: (cardView: boolean) => void;
  cardView?: boolean;
}

export const CustomGridToolbar: React.FC<CustomGridToolbarProps> = (props) => {
  const { onDensityChange, density = 'compact', onViewToggle, cardView = false } = props as CustomGridToolbarProps;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', px: 1 }}>
      <Box sx={{ flex: 1 }}>
        <GridToolbar {...props} />
      </Box>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Grid settings">
        <Settings fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem>
          <ListItemText primary="Density" />
          <ToggleButtonGroup
            value={density}
            exclusive
            onChange={(_, v) => { if (v && onDensityChange) onDensityChange(v); }}
            size="small"
          >
            <ToggleButton value="compact">Compact</ToggleButton>
            <ToggleButton value="standard">Standard</ToggleButton>
            <ToggleButton value="comfortable">Comfortable</ToggleButton>
          </ToggleButtonGroup>
        </MenuItem>
        <MenuItem onClick={() => { onViewToggle?.(!cardView); setAnchorEl(null); }}>
          <ListItemIcon>
            {cardView ? <ViewList fontSize="small"/> : <ViewModule fontSize="small"/>}
          </ListItemIcon>
          <ListItemText>{cardView ? 'Switch to table' : 'Switch to card view'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <GridToolbarColumnsButton />
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <GridToolbarFilterButton />
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <GridToolbarExport />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CustomGridToolbar;
