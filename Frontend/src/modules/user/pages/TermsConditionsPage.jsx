import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TermsConditionsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center px-4 w-full h-16 shrink-0 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <button onClick={() => navigate(-1)} className="material-symbols-outlined text-on-surface hover:bg-surface-variant p-2 rounded-full -ml-2 transition-colors cursor-pointer">
          arrow_back
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-on-surface pr-8">Terms & Conditions</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-5 space-y-5">
        <div className="space-y-4 text-sm text-on-surface-variant">
          <p className="font-bold text-on-surface">Effective Date: October 2023</p>
          
          <p>
            Welcome to MedCred India. By accessing or using our mobile application and services, you agree to comply with and be bound by the following Terms and Conditions.
          </p>

          <h3 className="font-bold text-base text-on-surface mt-6">1. Acceptance of Terms</h3>
          <p>
            These Terms apply to all users of the platform. If you do not agree with any part of these terms, you may not use our services.
          </p>

          <h3 className="font-bold text-base text-on-surface mt-6">2. Eligibility</h3>
          <p>
            You must be at least 18 years old and capable of forming a binding contract to use MedCred services, including healthcare loans, insurance purchases, and claiming features.
          </p>

          <h3 className="font-bold text-base text-on-surface mt-6">3. User Responsibilities</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during the registration and KYC verification process.
          </p>

          <h3 className="font-bold text-base text-on-surface mt-6">4. Financial Services & Loans</h3>
          <p>
            Any financial services, including medical loans provided through the platform, are subject to approval by our lending partners. MedCred India acts solely as a facilitator and does not guarantee loan approval or specific interest rates.
          </p>

          <h3 className="font-bold text-base text-on-surface mt-6">5. Limitation of Liability</h3>
          <p>
            MedCred India shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services, including delays in medical treatments or insurance claim rejections.
          </p>
        </div>
      </main>
    </div>
  );
}
