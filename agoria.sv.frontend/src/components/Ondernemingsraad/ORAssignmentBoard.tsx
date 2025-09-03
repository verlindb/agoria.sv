import React, { useMemo } from 'react';
import { Box, Paper, Typography, IconButton, Chip, Grid } from '@mui/material';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { Employee, ORCategory } from '../../types';
import { DragIndicator, Close } from '@mui/icons-material';

type MembersMap = Record<ORCategory, Employee[]>;

interface ORAssignmentBoardProps {
  unitId: string;
  employees: Employee[]; // all employees of the unit (pool)
  onAdd: (employeeId: string, category: ORCategory, technicalUnitId: string) => void;
  onRemove: (employeeId: string, category: ORCategory, technicalUnitId: string) => void;
  onReorder: (category: ORCategory, orderedIds: string[]) => void;
}

const categories: ORCategory[] = ['arbeiders', 'bedienden', 'kaderleden', 'jeugdige'];

export const ORAssignmentBoard: React.FC<ORAssignmentBoardProps> = ({ unitId, employees, onAdd, onRemove, onReorder }) => {
  const membersByCategory: MembersMap = useMemo(() => {
    const base: MembersMap = { arbeiders: [], bedienden: [], kaderleden: [], jeugdige: [] };
    employees.forEach(e => {
      categories.forEach(cat => {
        if (e.orMembership?.[cat]?.member) base[cat].push(e);
      });
    });
    categories.forEach(cat => base[cat].sort((a, b) => (a.orMembership?.[cat]?.order ?? 0) - (b.orMembership?.[cat]?.order ?? 0)));
    return base;
  }, [employees]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    // draggableId pattern: `${listKey}-${employeeId}` where listKey is 'pool' or category
    const [, employeeId] = draggableId.split('::');
    const srcList = source.droppableId as 'pool' | ORCategory;
    const dstList = destination.droppableId as 'pool' | ORCategory;

    if (srcList === 'pool' && dstList !== 'pool') {
      // add to category
      onAdd(employeeId, dstList as ORCategory, unitId);
      return;
    }
    if (srcList !== 'pool' && dstList === 'pool') {
      // remove from category
      onRemove(employeeId, srcList as ORCategory, unitId);
      return;
    }
    if (srcList !== 'pool' && dstList !== 'pool') {
      if (srcList === dstList) {
        // reorder within same category
        const list = membersByCategory[srcList as ORCategory].slice();
        const [moved] = list.splice(source.index, 1);
        list.splice(destination.index, 0, moved);
        onReorder(srcList as ORCategory, list.map(e => e.id));
      } else {
        // move between categories => interpret as add to the destination category (keep source membership)
        onAdd(employeeId, dstList as ORCategory, unitId);
      }
    }
  };

  const renderEmployeeRow = (e: Employee) => (
    <Box display="flex" alignItems="center" px={1} py={0.75} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <DragIndicator fontSize="small" style={{ opacity: 0.5, marginRight: 8 }} />
      <Box flexGrow={1} minWidth={0}>
        <Typography variant="body2" noWrap>{e.lastName} {e.firstName}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap>{e.role} • {e.email}</Typography>
      </Box>
    </Box>
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Grid container spacing={2}>
        {/* Pool */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper>
            <Box px={2} py={1.5} display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2">Personeel</Typography>
              <Chip label={employees.length} size="small" />
            </Box>
            <Droppable droppableId="pool" isDropDisabled>
              {(provided) => (
                <Box ref={provided.innerRef} {...provided.droppableProps}>
                  {employees.map((e, idx) => (
                    <Draggable draggableId={`pool::${e.id}`} index={idx} key={`pool::${e.id}`}>
                      {(prov) => (
                        <Box ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                          {renderEmployeeRow(e)}
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Paper>
        </Grid>

        {/* Categories */}
        <Grid item xs={12} md={8} lg={9}>
          <Grid container spacing={2}>
            {categories.map(cat => (
              <Grid item xs={12} sm={6} md={6} lg={3} key={cat}>
                <Paper>
                  <Box px={2} py={1.5} display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle2">
                      {cat === 'arbeiders' && 'OR Arbeiders'}
                      {cat === 'bedienden' && 'OR Bedienden'}
                      {cat === 'kaderleden' && 'OR Kaderleden'}
                      {cat === 'jeugdige' && 'OR Jeugdige'}
                    </Typography>
                    <Chip label={membersByCategory[cat].length} size="small" color="primary" variant="outlined" />
                  </Box>
                  <Droppable droppableId={cat}>
                    {(provided) => (
                      <Box ref={provided.innerRef} {...provided.droppableProps}>
                        {membersByCategory[cat].map((e, idx) => (
                          <Draggable draggableId={`${cat}::${e.id}`} index={idx} key={`${cat}::${e.id}`}>
                            {(prov) => (
                              <Box ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} display="flex" alignItems="center">
                                <Box flexGrow={1}>{renderEmployeeRow(e)}</Box>
                                <IconButton size="small" onClick={() => onRemove(e.id, cat, unitId)} aria-label={`remove-${cat}-${e.id}`}><Close fontSize="small" /></IconButton>
                              </Box>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </DragDropContext>
  );
};
