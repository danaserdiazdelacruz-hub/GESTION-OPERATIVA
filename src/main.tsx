// ============================================================================
//  CENTINELA — Entry Point
// ============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AlertProvider } from '@/context/AlertContext';
import { AuthProvider } from '@/context/AuthContext';
import { EvaluationProvider } from '@/context/EvaluationContext';
import '@/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AlertProvider>
      <AuthProvider>
        <EvaluationProvider>
          <App />
        </EvaluationProvider>
      </AuthProvider>
    </AlertProvider>
  </React.StrictMode>
);
