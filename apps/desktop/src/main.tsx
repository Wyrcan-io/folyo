import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { sampleWorkspace } from '@folyo/sample-data';
import { FolyoWorkspace } from '@folyo/ui';
import '@folyo/ui/styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FolyoWorkspace initialWorkspace={sampleWorkspace} productSurface="desktop" enableImport />
  </StrictMode>,
);
