import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Agent Pages
import AgentSplashPage from '../pages/AgentSplashPage';
import AgentLoginPage from '../pages/AgentLoginPage';
import AgentOtpPage from '../pages/AgentOtpPage';
import AgentRegisterPage from '../pages/AgentRegisterPage';
import AgentDashboardPage from '../pages/AgentDashboardPage';
import AgentCustomersPage from '../pages/AgentCustomersPage';
import AgentProfilePage from '../pages/AgentProfilePage';
import AgentLoanFormPage from '../pages/AgentLoanFormPage';

export default function AgentRoutes() {
  return (
    <Routes>
      <Route path="/agent"           element={<AgentSplashPage />} />
      <Route path="/agent/splash"    element={<AgentSplashPage />} />
      <Route path="/agent/login"     element={<AgentLoginPage />} />
      <Route path="/agent/otp"       element={<AgentOtpPage />} />
      <Route path="/agent/register"  element={<AgentRegisterPage />} />
      <Route path="/agent/dashboard" element={<AgentDashboardPage />} />
      <Route path="/agent/customers" element={<AgentCustomersPage />} />
      <Route path="/agent/profile"   element={<AgentProfilePage />} />
      <Route path="/agent/apply-loan" element={<AgentLoanFormPage />} />
    </Routes>
  );
}
