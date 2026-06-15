import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminLoginPage from '../pages/AdminLoginPage';
import AdminLayout from '../components/AdminLayout';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AdminFamilyCardsPage from '../pages/AdminFamilyCardsPage';
import AdminClaimsPage from '../pages/AdminClaimsPage';
import AdminLoansPage from '../pages/AdminLoansPage';
import AdminAgentsPage from '../pages/AdminAgentsPage';
import AdminHospitalsPage from '../pages/AdminHospitalsPage';
import AdminNotificationsPage from '../pages/AdminNotificationsPage';
import AdminReportsPage from '../pages/AdminReportsPage';
import AdminSettlementsPage from '../pages/AdminSettlementsPage';
import AdminTransactionsPage from '../pages/AdminTransactionsPage';
import AdminSecurityPage from '../pages/AdminSecurityPage';
import AdminSupportPage from '../pages/AdminSupportPage';
import AdminSettingsPage from '../pages/AdminSettingsPage';

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/admin"         element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login"   element={<AdminLoginPage />} />

      {/* Protected — wrapped in AdminLayout */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard"      element={<AdminDashboardPage />} />
        <Route path="/admin/users"          element={<AdminUsersPage />} />
        <Route path="/admin/family-cards"   element={<AdminFamilyCardsPage />} />
        <Route path="/admin/claims"         element={<AdminClaimsPage />} />
        <Route path="/admin/loans"          element={<AdminLoansPage />} />
        <Route path="/admin/agents"         element={<AdminAgentsPage />} />
        <Route path="/admin/hospitals"      element={<AdminHospitalsPage />} />
        <Route path="/admin/settlements"    element={<AdminSettlementsPage />} />
        <Route path="/admin/transactions"   element={<AdminTransactionsPage />} />
        <Route path="/admin/security"       element={<AdminSecurityPage />} />
        <Route path="/admin/support"        element={<AdminSupportPage />} />
        <Route path="/admin/notifications"  element={<AdminNotificationsPage />} />
        <Route path="/admin/reports"        element={<AdminReportsPage />} />
        <Route path="/admin/settings"       element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
}
