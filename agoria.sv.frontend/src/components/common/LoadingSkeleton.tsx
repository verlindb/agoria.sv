import React from 'react';
import { Box, Skeleton, Grid, Card, CardContent } from '@mui/material';

interface LoadingSkeletonProps {
  type?: 'grid' | 'card' | 'form';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'grid', 
  count = 6 
}) => {
  if (type === 'card') {
    return (
      <Grid container spacing={3}>
        {[...Array(count)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={140} sx={{ mb: 2, borderRadius: 2 }} />
                <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="circular" width={32} height={32} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
    </Box>
  );
};
