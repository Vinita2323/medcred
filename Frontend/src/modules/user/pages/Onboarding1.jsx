import React from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import onboardingAnimation from '../../../assets/Lotties/onbording.json';

export default function Onboarding1() {
  const navigate = useNavigate();

  return (
    <div className="flex-grow flex flex-col bg-white min-h-screen overflow-hidden">
      {/* Illustration area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-2">
        {/* Lottie Animation */}
        <div className="w-64 h-64 mb-4 mt-2">
          <Lottie animationData={onboardingAnimation} loop={true} />
        </div>

        {/* Text content */}
        <div className="text-center space-y-2 max-w-[300px]">
          <span className="inline-block bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Healthcare Protection</span>
          <h1 className="text-xl font-black text-on-surface leading-tight">
            Complete Healthcare Protection
          </h1>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Get covered for hospital stays, surgeries, OPD visits, and emergency care — all under one affordable annual membership.
          </p>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {['Hospital Claims', 'OPD Cover', 'Emergency Care', 'Ambulance'].map(f => (
            <div key={f} className="flex items-center gap-1.5 bg-surface-container-low border border-outline-variant/40 px-3 py-1.5 rounded-full">
              <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </span>
              <span className="text-[10px] font-bold text-on-surface">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="px-6 pb-10 space-y-4 mt-auto w-full md:max-w-md md:mx-auto">
        <button
          onClick={() => {
            console.log('Bypassing login, navigating directly to dashboard');
            navigate('/dashboard');
          }}
          className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer text-sm"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
