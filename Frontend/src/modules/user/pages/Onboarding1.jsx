import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding1() {
  const navigate = useNavigate();

  return (
    <div className="flex-grow flex flex-col bg-white min-h-screen overflow-hidden">
      {/* Skip */}
      <div className="flex justify-end px-5 pt-5">
        <button
          onClick={() => navigate('/login')}
          className="text-xs font-bold text-on-surface-variant bg-surface-container px-4 py-2 rounded-full hover:bg-surface-container-high cursor-pointer transition-all"
        >
          Skip
        </button>
      </div>

      {/* Illustration area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        {/* Large icon */}
        <div className="relative mb-8">
          <div className="w-52 h-52 rounded-[40px] bg-gradient-to-br from-[#EAF2FF] to-[#C5DAFF] flex items-center justify-center shadow-xl">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '96px', fontVariationSettings: "'FILL' 1" }}>
              health_and_safety
            </span>
          </div>
          {/* Floating badges */}
          <div className="absolute -top-3 -right-3 bg-white rounded-2xl shadow-lg px-3 py-2 border border-outline-variant/30 animate-float">
            <p className="text-[10px] font-black text-primary">IRDAI</p>
            <p className="text-[8px] text-on-surface-variant font-semibold">Approved</p>
          </div>
          <div className="absolute -bottom-3 -left-3 bg-white rounded-2xl shadow-lg px-3 py-2 border border-outline-variant/30">
            <p className="text-[10px] font-black text-tertiary">₹5 Lakh</p>
            <p className="text-[8px] text-on-surface-variant font-semibold">Max Coverage</p>
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-3 max-w-[300px]">
          <span className="inline-block bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Healthcare Protection</span>
          <h1 className="text-2xl font-black text-on-surface leading-tight">
            Complete Healthcare<br />Protection
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Get covered for hospital stays, surgeries, OPD visits, and emergency care — all under one affordable annual membership.
          </p>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
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
      <div className="px-6 pb-10 space-y-4">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          <div className="w-6 h-2 bg-primary rounded-full" />
          <div className="w-2 h-2 bg-outline-variant rounded-full" />
          <div className="w-2 h-2 bg-outline-variant rounded-full" />
        </div>
        <button
          onClick={() => navigate('/onboarding/2')}
          className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer text-sm"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
