import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TermsConditionsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-grow flex flex-col bg-surface md:bg-[#F8FAFF] text-on-surface font-body-md h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center px-4 w-full h-16 shrink-0 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="w-full max-w-4xl mx-auto flex items-center">
          <button onClick={() => navigate(-1)} className="material-symbols-outlined text-on-surface hover:bg-surface-variant p-2 rounded-full -ml-2 transition-colors cursor-pointer">
            arrow_back
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-on-surface pr-8">Terms & Conditions</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-5 md:p-10">
        <div className="w-full max-w-4xl mx-auto md:bg-white md:p-8 md:rounded-3xl md:border md:border-outline-variant/40 md:shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 text-sm text-on-surface-variant leading-relaxed">
          <p className="text-on-surface font-semibold text-base md:text-lg">
            Welcome to MedCred India. By accessing or using our mobile application and services, you agree to comply with and be bound by the following Terms and Conditions.
          </p>

          <h3 className="font-bold text-base text-on-surface mt-6 pt-2 border-t border-outline-variant/20">1. Acceptance of Terms</h3>
          <p>
            These Terms apply to all users of the platform. If you do not agree with any part of these terms, you may not use our services.
          </p>

          <h3 className="font-bold text-base text-on-surface mt-6 pt-2 border-t border-outline-variant/20">2. Eligibility</h3>
          <p>
            You must be at least 18 years old and capable of forming a binding contract to use MedCred services, including healthcare loans, insurance purchases, and claiming features.
          </p>

          <h3 className="font-bold text-base text-on-surface mt-6 pt-2 border-t border-outline-variant/20">3. User Responsibilities</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during the registration and KYC verification process.
          </p>

          <h3 className="font-bold text-base text-on-surface mt-6 pt-2 border-t border-outline-variant/20">4. Financial Services & Loans</h3>
          <p>
            Any financial services, including medical loans provided through the platform, are subject to approval by our lending partners. MedCred India acts solely as a facilitator and does not guarantee loan approval or specific interest rates.
          </p>

          <h3 className="font-bold text-base text-on-surface mt-6 pt-2 border-t border-outline-variant/20">5. Limitation of Liability</h3>
          <p>
            MedCred India shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services, including delays in medical treatments or insurance claim rejections.
          </p>
        </div>
      </main>
    </div>
  );
}
