import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentSplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect immediately — no forced loading wait
    const redirectTimer = setTimeout(() => {
      const userJson = localStorage.getItem('medcred_user_data');
      if (userJson) {
        navigate('/agent/dashboard');
      } else {
        navigate('/agent/login');
      }
    }, 0);

    return () => {
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full relative bg-white overflow-hidden select-none">
      {/* Dynamic Keyframe Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .bg-pattern {
          background-image: radial-gradient(#003d9b11 1.5px, transparent 1.5px);
          background-size: 24px 24px;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0; }
          50% { opacity: 0.2; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .pulse-effect {
          position: absolute;
          width: 240px;
          height: 240px;
          border: 2px solid #003d9b;
          border-radius: 50%;
          animation: pulse-ring 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .loading-bar {
          width: 140px;
          height: 4px;
          background: #d4e6e5;
          border-radius: 9999px;
          overflow: hidden;
          position: relative;
        }

        .loading-progress {
          position: absolute;
          height: 100%;
          width: 30%;
          background: #003d9b;
          border-radius: 9999px;
          animation: loading-slide 1.5s ease-in-out infinite;
        }

        @keyframes loading-slide {
          0% { left: -30%; }
          100% { left: 100%; }
        }

        .fade-in {
          animation: fadeIn 1.2s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

      {/* Background Layers */}
      <div className="absolute inset-0 bg-pattern opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-white via-[#faf8ff] to-[#f5f8ff] opacity-60"></div>
      
      {/* Main Content Container */}
      <div className="z-10 flex flex-col items-center justify-center space-y-12 fade-in">
        {/* Animated Logo Symbol Area */}
        <div className="relative flex items-center justify-center">
          <div className="pulse-effect" style={{ animationDelay: '0s' }}></div>
          <div className="pulse-effect" style={{ animationDelay: '1.5s' }}></div>
          
          <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-full shadow-lg flex items-center justify-center border border-primary/10 transition-transform duration-300 hover:scale-105 overflow-hidden">
            <img src="/Logo (5).png" alt="MedCred India" className="w-[85%] h-[85%] object-contain" />
          </div>
        </div>

        {/* Brand Identity */}
        <div className="text-center space-y-2">
          <h1 className="text-[28px] md:text-[32px] leading-[36px] md:leading-[40px] font-bold text-[#003d9b] tracking-tight">
            MedCred India
          </h1>
          <p className="text-sm font-semibold text-[#434654] tracking-widest uppercase opacity-70">
            Agent Terminal
          </p>
        </div>
      </div>

      {/* Bottom Section: Loading & Trust Indicators */}
      <div className="absolute bottom-20 z-10 flex flex-col items-center space-y-8 fade-in" style={{ animationDelay: '0.5s' }}>
        {/* Loading Indicator */}
        <div className="flex flex-col items-center space-y-3">
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
          <p className="text-xs text-[#516161]/60 font-semibold h-4">{loadingText}</p>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center space-x-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center space-x-2">
            <span class="material-symbols-outlined text-base">shield</span>
            <span class="text-[12px] font-medium">End-to-End Encrypted</span>
          </div>
          <div className="flex items-center space-x-2">
            <span class="material-symbols-outlined text-base">account_balance</span>
            <span class="text-[12px] font-medium">RBI Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
