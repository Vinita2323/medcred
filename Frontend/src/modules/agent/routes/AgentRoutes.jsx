import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Agent Pages
import AgentSplashPage from '../pages/AgentSplashPage';
import AgentLoginPage from '../pages/AgentLoginPage';
import AgentOtpPage from '../pages/AgentOtpPage';
import AgentRegisterPage from '../pages/AgentRegisterPage';
import AgentForgotPasswordPage from '../pages/AgentForgotPasswordPage';
import AgentDashboardPage from '../pages/AgentDashboardPage';
import AgentCustomersPage from '../pages/AgentCustomersPage';
import AgentProfilePage from '../pages/AgentProfilePage';
import AgentLoanFormPage from '../pages/AgentLoanFormPage';
import AgentOnboardCustomerPage from '../pages/AgentOnboardCustomerPage';
import AgentWalletPage from '../pages/AgentWalletPage';
import AgentTeamPage from '../pages/AgentTeamPage';
import AgentAdminPage from '../pages/AgentAdminPage';
import AgentReferralsPage from '../pages/AgentReferralsPage';

import AgentLayout from '../components/AgentLayout';

export default function AgentRoutes() {
  return (
    <Routes>
      <Route path="/agent"           element={<AgentSplashPage />} />
      <Route path="/agent/splash"    element={<AgentSplashPage />} />
      <Route path="/agent/login"     element={<AgentLoginPage />} />
      <Route path="/agent/forgot-password" element={<AgentForgotPasswordPage />} />
      <Route path="/agent/otp"       element={<AgentOtpPage />} />
      <Route path="/agent/register"  element={<AgentRegisterPage />} />
      
      {/* Authenticated Dashboard Pages wrapped in AgentLayout */}
      <Route element={<AgentLayout />}>
        <Route path="/agent/dashboard" element={<AgentDashboardPage />} />
        <Route path="/agent/customers" element={<AgentCustomersPage />} />
        <Route path="/agent/profile"   element={<AgentProfilePage />} />
        <Route path="/agent/apply-loan" element={<AgentLoanFormPage />} />
        <Route path="/agent/register-customer" element={<AgentOnboardCustomerPage />} />
        <Route path="/agent/wallet" element={<AgentWalletPage />} />
        <Route path="/agent/team" element={<AgentTeamPage />} />
        <Route path="/agent/admin" element={<AgentAdminPage />} />
        <Route path="/agent/referrals" element={<AgentReferralsPage />} />
      </Route>
    </Routes>
  );
}
