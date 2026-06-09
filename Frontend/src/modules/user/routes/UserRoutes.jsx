import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserMainLayout from '../components/Layout/UserMainLayout';

// Import Pages
import SplashPage from '../pages/SplashPage';
import Onboarding1 from '../pages/Onboarding1';
import RegisterPage from '../pages/RegisterPage';
import OtpPage from '../pages/OtpPage';
import LoginPage from '../pages/LoginPage';
import KycPage from '../pages/KycPage';
import MembershipPlansPage from '../pages/MembershipPlansPage';
import PaymentPage from '../pages/PaymentPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import FamilyManagementPage from '../pages/FamilyManagementPage';
import AddFamilyMemberPage from '../pages/AddFamilyMemberPage';
import DigitalCardPage from '../pages/DigitalCardPage';
import PurchaseCardPage from '../pages/PurchaseCardPage';
import ClaimsPage from '../pages/ClaimsPage';
import ProfilePage from '../pages/ProfilePage';
import SupportPage from '../pages/SupportPage';
import NotificationsPage from '../pages/NotificationsPage';
import LoanPage from '../pages/LoanPage';
import LoanDetailsPage from '../pages/LoanDetailsPage';
import LoanApplicationFormPage from '../pages/LoanApplicationFormPage';
import WalletPage from '../pages/WalletPage';
import InsurancePage from '../pages/InsurancePage';
import CheckupBookingPage from '../pages/CheckupBookingPage';
import HospitalsPage from '../pages/HospitalsPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import TermsConditionsPage from '../pages/TermsConditionsPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrdersPage from '../pages/OrdersPage';

export default function UserRoutes() {
  return (
    <UserMainLayout>
      <Routes>
        {/* ── Auth & Onboarding ─────────────────────────────── */}
        <Route path="/"               element={<SplashPage />} />
        <Route path="/onboarding/1"   element={<Onboarding1 />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/verify-otp"     element={<OtpPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ── KYC & Membership ─────────────────────────────── */}
        <Route path="/kyc"              element={<KycPage />} />
        <Route path="/membership-plans" element={<MembershipPlansPage />} />
        <Route path="/payment"          element={<PaymentPage />} />

        {/* ── Main App ─────────────────────────────────────── */}
        <Route path="/dashboard"  element={<DashboardPage />} />
        <Route path="/family"     element={<FamilyManagementPage />} />
        <Route path="/family/add" element={<AddFamilyMemberPage />} />
        <Route path="/card"       element={<DigitalCardPage />} />
        <Route path="/purchase-card" element={<PurchaseCardPage />} />
        <Route path="/claims"     element={<ClaimsPage />} />
        <Route path="/profile"    element={<ProfilePage />} />
        <Route path="/support"    element={<SupportPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/loan"       element={<LoanPage />} />
        <Route path="/loan-details" element={<LoanDetailsPage />} />
        <Route path="/loan-application-form" element={<LoanApplicationFormPage />} />
        <Route path="/wallet"     element={<WalletPage />} />
        <Route path="/insurance"  element={<InsurancePage />} />
        <Route path="/book-checkup" element={<CheckupBookingPage />} />
        <Route path="/hospitals"  element={<HospitalsPage />} />
        <Route path="/privacy"    element={<PrivacyPolicyPage />} />
        <Route path="/terms"      element={<TermsConditionsPage />} />
        <Route path="/product-details" element={<ProductDetailsPage />} />
        <Route path="/checkout"   element={<CheckoutPage />} />
        <Route path="/orders"     element={<OrdersPage />} />
      </Routes>
    </UserMainLayout>
  );
}
