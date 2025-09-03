import React from 'react';
import { Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.3;
  }
  33% {
    transform: translateY(-100px) rotate(120deg);
    opacity: 0.5;
  }
  66% {
    transform: translateY(-50px) rotate(240deg);
    opacity: 0.3;
  }
`;

const AnimatedGradient = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #667eea)'
    : 'linear-gradient(135deg, #667eea, #764ba2, #ffeaa7, #55a3ff, #fd79a8, #667eea)',
  backgroundSize: '400% 400%',
  animation: `${gradientAnimation} 20s ease infinite`,
  opacity: 0.05,
  zIndex: 0,
  pointerEvents: 'none',
}));

const FloatingOrb = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: theme.palette.mode === 'dark'
    ? 'radial-gradient(circle, rgba(126,87,194,0.3) 0%, rgba(126,87,194,0) 70%)'
    : 'radial-gradient(circle, rgba(102,126,234,0.2) 0%, rgba(102,126,234,0) 70%)',
  filter: 'blur(40px)',
  animation: `${floatAnimation} 15s ease-in-out infinite`,
}));

export const AnimatedBackground: React.FC = () => {
  return (
    <>
      <AnimatedGradient />
      <FloatingOrb sx={{ width: 400, height: 400, top: '10%', left: '10%' }} />
      <FloatingOrb sx={{ width: 300, height: 300, bottom: '20%', right: '15%', animationDelay: '5s' }} />
      <FloatingOrb sx={{ width: 250, height: 250, top: '50%', left: '50%', animationDelay: '10s' }} />
    </>
  );
};
