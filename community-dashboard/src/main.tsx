import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { initErrorLogging } from './services/errorLogging'
import { AppErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'

// Initialize error logging
initErrorLogging();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </React.StrictMode>,
)