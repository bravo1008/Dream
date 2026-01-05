import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const DreamGallery = ({ dreams, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress sx={{ color: '#00ffcc' }} />
      </Box>
    );
  }

  if (!dreams || dreams.length === 0) {
    return (
      <Box sx={{
        p: 2,
        textAlign: 'center',
        bgcolor: '#1a1a1a',
        border: '1px solid #444',
        borderRadius: '8px',
        color: '#aaa',
        fontSize: '14px',
      }}>
        <Typography variant="body2">
          还没有生成任何梦境 🌙
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        pb: 1,
        px: 1,
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        border: '1px solid #444',
        padding: '16px',
      }}
    >
      {dreams.map((dream, index) => (
        <Box
          key={dream._id || index}
          sx={{
            minWidth: '180px',
            height: '180px',
            flexShrink: 0,
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative',
            background: '#1e1e1e',
            ml:2.5
          }}
        >
          <img
            src={dream.imageUrl}
            alt={`梦境 ${index + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'rgba(0,0,0,0.7)',
              p: '4px 8px',
              fontSize: '10px',
              color: '#ccc',
              textAlign: 'center',
            }}
          >
            {new Date(dream.createdAt).toLocaleDateString()}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default DreamGallery;