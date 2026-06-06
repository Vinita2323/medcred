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
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>
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
          <h1 className="text-2xl font-black text-on-surface">Choose Your Plan</h1>
          <p className="text-sm text-on-surface-variant mt-1 mb-2">
            {fromRenew ? 'Renew or upgrade your healthcare membership.' : 'Activate your MedCred healthcare membership to unlock all benefits.'}
          </p>
        </div>

        {/* Plan Cards */}
        <div className="space-y-3">
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
                    <div className="bg-tertiary text-white text-[9px] font-black px-3 py-0.5 rounded-b-xl tracking-wider">
                      ⭐ MOST POPULAR
                    </div>
                  </div>
                )}

                {/* Card header gradient */}
                <div className={`bg-gradient-to-br ${planGradients[planId]} p-3.5 text-white ${plan.popular ? 'pt-6' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="material-symbols-outlined text-white/80 text-lg">{planIcons[planId]}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{plan.name}</span>
                      </div>
                      <p className="text-2xl font-black mt-0.5">₹{plan.price.toLocaleString()}</p>
                      <p className="text-[10px] opacity-70 mt-0">per year · {plan.validity}</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 rounded-lg px-2 py-1.5 text-center">
                        <p className="text-[8px] opacity-80 uppercase font-bold">Coverage</p>
                        <p className="text-sm font-black">{plan.coverage}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2.5">
                    <div className="bg-white/15 rounded-lg px-2 py-1.5 flex-1 text-center">
                      <p className="text-[8px] opacity-80 font-bold uppercase">Members</p>
                      <p className="text-sm font-black">Up to {plan.members}</p>
                    </div>
                    <div className="bg-white/15 rounded-lg px-2 py-1.5 flex-1 text-center">
                      <p className="text-[8px] opacity-80 font-bold uppercase">Validity</p>
                      <p className="text-sm font-black">1 Year</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white p-3 space-y-1.5">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      </span>
                      <span className="text-[11px] font-semibold text-on-surface">{f}</span>
                    </div>
                  ))}
                  {/* Select indicator */}
                  <div className={`mt-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                    {isSelected ? (
                      <>
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>radio_button_checked</span>
                        <span className="text-[11px] font-bold">Selected</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-xs">radio_button_unchecked</span>
                        <span className="text-[11px] font-semibold">Select Plan</span>
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
            className="w-full py-3 bg-primary text-white font-black rounded-xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm px-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-lg">shopping_cart</span>
            <span>Purchase {PLANS[selected].name} — ₹{PLANS[selected].price.toLocaleString()}</span>
          </button>
          <p className="text-center text-[10px] text-on-surface-variant mt-2">
            Cancel anytime · Auto-renewal can be disabled in settings
          </p>
        </div>
      </main>
    </div>
  );
}
