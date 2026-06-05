import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding2() {
  const navigate = useNavigate();

  const familyMembers = [
    { icon: 'person', label: 'Self', color: 'bg-primary/10 text-primary' },
    { icon: 'favorite', label: 'Spouse', color: 'bg-error/10 text-error' },
    { icon: 'child_care', label: 'Children', color: 'bg-tertiary/10 text-tertiary' },
    { icon: 'elderly', label: 'Parents', color: 'bg-secondary/10 text-secondary' },
  ];

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

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        {/* Family grid illustration */}
        <div className="w-52 h-52 rounded-[40px] bg-gradient-to-br from-[#EAF2FF] to-[#C5DAFF] flex items-center justify-center mb-8 shadow-xl relative">
          <div className="grid grid-cols-2 gap-3 p-4">
            {familyMembers.map(m => (
              <div key={m.label} className={`w-20 h-20 rounded-2xl ${m.color.split(' ')[0]} flex flex-col items-center justify-center gap-1`}>
                <span className={`material-symbols-outlined text-3xl ${m.color.split(' ')[1]}`} style={{ fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
                <span className={`text-[9px] font-black ${m.color.split(' ')[1]}`}>{m.label}</span>
              </div>
            ))}
          </div>
          <div className="absolute -top-3 -right-3 bg-white rounded-2xl shadow-lg px-3 py-2 border border-outline-variant/30">
            <p className="text-[10px] font-black text-primary">Up to 6</p>
            <p className="text-[8px] text-on-surface-variant font-semibold">Members</p>
          </div>
        </div>

        <div className="text-center space-y-3 max-w-[300px]">
          <span className="inline-block bg-secondary/10 text-secondary text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Family Coverage</span>
          <h1 className="text-2xl font-black text-on-surface leading-tight">
            Cover Your<br />Entire Family
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            One plan covers you, your spouse, children, and parents. Add up to 6 family members under a single premium family plan.
          </p>
        </div>

        {/* Plan comparison */}
        <div className="mt-6 w-full space-y-2">
          {[
            { plan: 'Individual', members: '1 Member', price: '₹999/yr', color: 'border-primary/30 bg-primary/5' },
            { plan: 'Family', members: 'Up to 4', price: '₹2,499/yr', color: 'border-primary bg-primary/10', badge: '⭐ Popular' },
            { plan: 'Premium', members: 'Up to 6', price: '₹4,999/yr', color: 'border-outline-variant bg-surface-container-low' },
          ].map(p => (
            <div key={p.plan} className={`flex items-center justify-between px-4 py-2.5 rounded-xl border-2 ${p.color}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-on-surface">{p.plan}</span>
                {p.badge && <span className="text-[9px] bg-tertiary/20 text-tertiary font-bold px-1.5 py-0.5 rounded-full">{p.badge}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-on-surface-variant">{p.members}</span>
                <span className="text-[10px] font-black text-primary">{p.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pb-10 space-y-4">
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-outline-variant rounded-full" />
          <div className="w-6 h-2 bg-primary rounded-full" />
          <div className="w-2 h-2 bg-outline-variant rounded-full" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/onboarding/1')}
            className="flex-1 py-4 border-2 border-outline-variant text-on-surface-variant font-bold rounded-2xl hover:bg-surface-container cursor-pointer transition-all text-sm"
          >
            ← Back
          </button>
          <button
            onClick={() => navigate('/onboarding/3')}
            className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer text-sm"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
