import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DetectionProvider } from '@/context/DetectionContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DetectionProvider>
      <App />
    </DetectionProvider>
  </StrictMode>,
);
