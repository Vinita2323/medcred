import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/storage';

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn()) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding/1');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex-grow flex flex-col items-center justify-center relative p-6 bg-radial from-white to-surface-container-low min-h-screen animate-fade-in overflow-hidden">
      {/* Abstract Healthcare Background Illustrations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-secondary-fixed/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
        
        <div className="absolute top-1/4 left-10 opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>
          <span className="material-symbols-outlined text-[120px] text-primary">ecg_heart</span>
        </div>
        <div className="absolute bottom-1/4 right-10 opacity-10 animate-float" style={{ animationDelay: '2s' }}>
          <span className="material-symbols-outlined text-[100px] text-secondary">medical_services</span>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Premium Brand Logo */}
        <div className="mb-8 flex items-center justify-center">
          <img 
            alt="MedCred Logo" 
            className="h-28 md:h-36 w-auto object-contain animate-pulse" 
            src="/FinalLogo.png"
          />
        </div>

        {/* Typography Branding */}
        <div className="space-y-4">
          <p className="text-lg text-on-surface-variant max-w-md mx-auto leading-relaxed font-semibold">
            Healthcare Protection &amp; Financial Assistance
          </p>
        </div>

        {/* Status/Loading Indicator */}
        <div className="mt-16 w-64 h-1.5 bg-surface-container-highest rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-primary rounded-full progress-bar-fill"></div>
        </div>
        <p className="mt-3 text-xs font-semibold text-outline tracking-widest uppercase">
          Securing your future...
        </p>
      </main>

      {/* Bottom Aesthetic Detail */}
      <footer className="absolute bottom-12 w-full text-center px-4">
        <div className="flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <span className="text-sm font-semibold text-on-surface">Institutional Trust &amp; Precision Fintech</span>
        </div>
      </footer>
    </div>
  );
}
