import React from 'react';
import { Box, Paper, Typography, IconButton, Chip, Tooltip } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DroppableProvided } from '@hello-pangea/dnd';
import { Employee, ORCategory } from '../../types';
import { DragIndicator, Close } from '@mui/icons-material';

interface ORListProps {
  members: Employee[]; // must be OR members of a unit, pre-sorted by orOrder
  category?: ORCategory; // current category context (optional)
  onReorder: (orderedIds: string[]) => void;
  onRemove?: (employeeId: string) => void;
}

export const ORList: React.FC<ORListProps> = ({ members, onReorder, onRemove }) => {
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(members);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onReorder(items.map(i => i.id));
  };

  return (
    <Paper>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="or-list">
          {(provided: DroppableProvided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {members.map((m, idx) => (
                <Draggable key={m.id} draggableId={m.id} index={idx}>
                  {(prov: DraggableProvided) => (
                    <Box ref={prov.innerRef} {...prov.draggableProps} display="flex" alignItems="center" px={2} py={1} sx={{ borderBottom: '1px solid', borderColor: 'divider', userSelect: 'none' }}>
                      <IconButton size="small" {...prov.dragHandleProps}><DragIndicator /></IconButton>
                      <Box flexGrow={1} ml={1}>
                        <Typography variant="body1">{m.lastName} {m.firstName}</Typography>
                        <Typography variant="body2" color="text.secondary">{m.role} • {m.email}</Typography>
                      </Box>
                      <Chip size="small" label={m.status === 'active' ? 'Actief' : 'Inactief'} color={m.status === 'active' ? 'success' : 'default'} sx={{ mr: 1 }} />
                      {onRemove && (
                        <Tooltip title="Verwijderen uit Ondernemingsraad">
                          <IconButton size="small" onClick={() => onRemove(m.id)} aria-label={`remove-${m.id}`}>
                            <Close fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Paper>
  );
}
