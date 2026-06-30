import React from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import UserRoutes from './modules/user/routes/UserRoutes'
import AgentRoutes from './modules/agent/routes/AgentRoutes'
import AdminRoutes from './modules/admin/routes/AdminRoutes'
import ScrollToTop from './modules/user/components/Navigation/ScrollToTop'
import usePushNotifications from './hooks/usePushNotifications'

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isAgent = location.pathname.startsWith('/agent');

  // Initialize push notifications
  usePushNotifications();

  return (
    <>
      <ScrollToTop />
      {isAdmin ? <AdminRoutes /> : isAgent ? <AgentRoutes /> : <UserRoutes />}
    </>
  )
}


function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
