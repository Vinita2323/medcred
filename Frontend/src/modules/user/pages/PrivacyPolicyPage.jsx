import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center px-4 w-full h-16 shrink-0 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <button onClick={() => navigate(-1)} className="material-symbols-outlined text-on-surface hover:bg-surface-variant p-2 rounded-full -ml-2 transition-colors cursor-pointer">
          arrow_back
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-on-surface pr-8">Privacy Policy</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-5 space-y-5">
        <div className="space-y-4 text-sm text-on-surface-variant">
          <p className="font-bold text-on-surface">Last Updated: October 2023</p>
          
          <p>
            At MedCred India, we value your privacy and are committed to protecting your personal and health-related data. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
          </p>

          <h3 className="font-bold text-base text-on-surface mt-6">1. Information We Collect</h3>
          <p>
            We may collect personal information such as your name, email, phone number, and demographic data. With your explicit consent, we may also collect health information, medical history, and Aadhaar verification data required for providing our services.
          </p>

          <h3 className="font-bold text-base text-on-surface mt-6">2. How We Use Your Information</h3>
          <p>
            Your information is used to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verify your identity and provide secure access.</li>
            <li>Process memberships, claims, and healthcare loans.</li>
            <li>Improve our platform and customize your user experience.</li>
            <li>Communicate updates, alerts, and customer support.</li>
          </ul>

          <h3 className="font-bold text-base text-on-surface mt-6">3. Data Security</h3>
          <p>
            We implement advanced encryption and industry-standard security measures to ensure that your sensitive health and financial data is protected against unauthorized access, alteration, or disclosure.
          </p>

          <h3 className="font-bold text-base text-on-surface mt-6">4. Sharing of Information</h3>
          <p>
            We do not sell your personal data to third parties. We may share information with trusted healthcare providers, insurance partners, or regulatory authorities only when necessary to facilitate the services you have requested.
          </p>
        </div>
      </main>
    </div>
  );
}
