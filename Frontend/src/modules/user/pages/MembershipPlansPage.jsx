import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PLANS, saveMembership } from '../utils/storage';

const planOrder = ['individual', 'family', 'premium'];

const planIcons = { individual: 'person', family: 'group', premium: 'workspace_premium' };
const planGradients = {
  individual: 'from-[#1565C0] to-[#0A4DBF]',
  family:     'from-[#062E8A] via-[#0A4DBF] to-[#1565C0]',
  premium:    'from-[#0D1B3E] via-[#062E8A] to-[#0A4DBF]',
};

export default function MembershipPlansPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState('family');
  const fromRenew = location.state?.renew;

  const handlePurchase = () => {
    navigate('/payment', { state: { planId: selected } });
  };

  return (
    <div className="flex-grow flex flex-col bg-[#F8FAFF] min-h-screen">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-16 sticky top-0 z-40 bg-white border-b border-outline-variant/30 shadow-sm">
        {fromRenew && (
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
        )}
        <img src="/FinalLogo.png" alt="MedCred" className="h-10 w-auto object-contain" />
        {!fromRenew && (
          <div className="ml-auto">
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full">Step 4 of 4</span>
          </div>
        )}
      </header>

      <main className="flex-grow overflow-y-auto px-4 py-6 max-w-md mx-auto w-full space-y-6">

        {/* Title */}
        <div className="text-center animate-slide-up">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">health_and_safety</span>
          </div>
          <h1 className="text-2xl font-black text-on-surface">Choose Your Plan</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {fromRenew ? 'Renew or upgrade your healthcare membership.' : 'Activate your MedCred healthcare membership to unlock all benefits.'}
          </p>
        </div>

        {/* Plan Cards */}
        <div className="space-y-4">
          {planOrder.map((planId, idx) => {
            const plan = PLANS[planId];
            const isSelected = selected === planId;
            return (
              <div
                key={planId}
                onClick={() => setSelected(planId)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-primary shadow-xl scale-[1.01]' : 'shadow-md hover:shadow-lg hover:scale-[1.005]'}`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 flex justify-center">
                    <div className="bg-tertiary text-white text-[10px] font-black px-4 py-1 rounded-b-xl tracking-wider">
                      ⭐ MOST POPULAR
                    </div>
                  </div>
                )}

                {/* Card header gradient */}
                <div className={`bg-gradient-to-br ${planGradients[planId]} p-5 text-white ${plan.popular ? 'pt-8' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-white/80 text-xl">{planIcons[planId]}</span>
                        <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">{plan.name}</span>
                      </div>
                      <p className="text-3xl font-black mt-1">₹{plan.price.toLocaleString()}</p>
                      <p className="text-xs opacity-70 mt-0.5">per year · {plan.validity}</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
                        <p className="text-[9px] opacity-80 uppercase font-bold">Coverage</p>
                        <p className="text-base font-black">{plan.coverage}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <div className="bg-white/15 rounded-xl px-3 py-2 flex-1 text-center">
                      <p className="text-[9px] opacity-80 font-bold uppercase">Members</p>
                      <p className="text-base font-black">Up to {plan.members}</p>
                    </div>
                    <div className="bg-white/15 rounded-xl px-3 py-2 flex-1 text-center">
                      <p className="text-[9px] opacity-80 font-bold uppercase">Validity</p>
                      <p className="text-base font-black">1 Year</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white p-4 space-y-2">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      </span>
                      <span className="text-xs font-semibold text-on-surface">{f}</span>
                    </div>
                  ))}
                  {/* Select indicator */}
                  <div className={`mt-3 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                    {isSelected ? (
                      <>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>radio_button_checked</span>
                        <span className="text-xs font-bold">Selected</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">radio_button_unchecked</span>
                        <span className="text-xs font-semibold">Select Plan</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="flex justify-center gap-6 opacity-60">
          {[
            { icon: 'security', label: 'Secure Payment' },
            { icon: 'verified_user', label: 'IRDAI Approved' },
            { icon: 'lock', label: 'SSL Encrypted' },
          ].map(b => (
            <div key={b.label} className="flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-primary text-xl">{b.icon}</span>
              <span className="text-[9px] font-bold text-on-surface-variant text-center">{b.label}</span>
            </div>
          ))}
        </div>

        {/* Sticky CTA */}
        <div className="sticky bottom-0 bg-[#F8FAFF] pt-2 pb-4">
          <button
            onClick={handlePurchase}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-3 text-base"
          >
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
            Purchase {PLANS[selected].name} — ₹{PLANS[selected].price.toLocaleString()}
          </button>
          <p className="text-center text-[10px] text-on-surface-variant mt-2">
            Cancel anytime · Auto-renewal can be disabled in settings
          </p>
        </div>
      </main>
    </div>
  );
}
