import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import ContentCuration from './pages/ContentCuration'
import EventManagement from './pages/EventManagement'
import EngagementTracking from './pages/EngagementTracking'
import FeedbackCollection from './pages/FeedbackCollection'
import Rewards from './pages/Rewards'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import { ProtectedRoute, useAuth } from './contexts/AuthContext'
import EmbeddedView from './components/EmbeddedView'

function App() {
  const { isAuthenticated } = useAuth();
  const [isEmbedded, setIsEmbedded] = useState(false);
  const location = useLocation();
  
  // Check if we're in embedded mode on mount or URL change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const embedded = searchParams.has('embed');
    
    setIsEmbedded(embedded);
    
    // Add embedded class to body if in embedded mode
    if (embedded) {
      document.body.classList.add('embedded-mode');
    } else {
      document.body.classList.remove('embedded-mode');
    }
  }, [location]);
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
      
      {/* Protected Routes - viewable by all authorized users */}
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/events" element={
        <ProtectedRoute>
          <EventManagement />
        </ProtectedRoute>
      } />
      <Route path="/engagement" element={
        <ProtectedRoute>
          <EngagementTracking />
        </ProtectedRoute>
      } />
      
      {/* Editor/Admin Routes - require editor or admin role */}
      <Route path="/onboarding" element={
        <ProtectedRoute requiredRole="editor">
          <Onboarding />
        </ProtectedRoute>
      } />
      <Route path="/content" element={
        <ProtectedRoute requiredRole="editor">
          <ContentCuration />
        </ProtectedRoute>
      } />
      <Route path="/feedback" element={
        <ProtectedRoute requiredRole="editor">
          <FeedbackCollection />
        </ProtectedRoute>
      } />
      
      {/* Admin-only Routes */}
      <Route path="/rewards" element={
        <ProtectedRoute requiredRole="admin">
          <Rewards />
        </ProtectedRoute>
      } />
      
      {/* Embedded View - public route */}
      <Route path="/embedded" element={
        isEmbedded ? <EmbeddedView /> : <Navigate to="/" replace />
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App