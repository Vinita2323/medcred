import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding3() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: 'receipt_long',
      title: 'Medical Claim Support',
      desc: 'Submit hospital and home treatment claims digitally. Track status in real-time from Submitted to Approved.',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: 'account_balance',
      title: 'Financial Assistance',
      desc: 'Unlock zero-interest medical loans up to ₹5 Lakh after 30 days of active membership. No paperwork needed.',
      color: 'text-tertiary',
      bg: 'bg-tertiary/10',
    },
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

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 space-y-6">
        {/* Dual icons */}
        <div className="flex gap-4">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#EAF2FF] to-[#C5DAFF] flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '56px', fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
          </div>
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#E8F5E9] to-[#A8F5C8] flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '56px', fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
        </div>

        <div className="text-center space-y-2 max-w-[300px]">
          <span className="inline-block bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Claims & Finance</span>
          <h1 className="text-2xl font-black text-on-surface leading-tight">
            Claims & Financial<br />Support Made Easy
          </h1>
        </div>

        {/* Benefit cards */}
        <div className="w-full space-y-3">
          {benefits.map(b => (
            <div key={b.title} className="flex items-start gap-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl p-4">
              <div className={`w-12 h-12 rounded-xl ${b.bg} flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-2xl ${b.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
              </div>
              <div>
                <p className="text-sm font-black text-on-surface">{b.title}</p>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline preview */}
        <div className="w-full bg-surface-container rounded-2xl p-4">
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-3">Claim Journey</p>
          <div className="flex items-center gap-1">
            {['Submitted', 'Review', 'Verified', 'Approved'].map((s, i, arr) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black ${i === 3 ? 'bg-tertiary text-white' : 'bg-primary text-white'}`}>
                    {i + 1}
                  </div>
                  <span className="text-[8px] text-on-surface-variant font-bold text-center">{s}</span>
                </div>
                {i < arr.length - 1 && <div className="h-0.5 flex-1 bg-primary/30 mb-3" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-10 space-y-4">
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-outline-variant rounded-full" />
          <div className="w-2 h-2 bg-outline-variant rounded-full" />
          <div className="w-6 h-2 bg-primary rounded-full" />
        </div>
        <button
          onClick={() => navigate('/register')}
          className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">health_and_safety</span>
          Get Started — It's Free
        </button>
        <p className="text-center text-xs text-on-surface-variant">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="text-primary font-black hover:underline cursor-pointer">Login</span>
        </p>
      </div>
    </div>
  );
}
