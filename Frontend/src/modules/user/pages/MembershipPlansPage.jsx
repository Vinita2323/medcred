import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

const planIcons = { individual: 'person', family: 'group', premium: 'workspace_premium' };
const planGradients = {
  individual: 'from-[#1565C0] to-[#0A4DBF]',
  family:     'from-[#062E8A] via-[#0A4DBF] to-[#1565C0]',
  premium:    'from-[#0D1B3E] via-[#062E8A] to-[#0A4DBF]',
};

export default function MembershipPlansPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const fromRenew = location.state?.renew;

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [sourceType, setSourceType] = useState('self'); // 'self' or 'agent'
  const [referralCode, setReferralCode] = useState('');
  const [agentDetail, setAgentDetail] = useState('');
  const [isCodeApplied, setIsCodeApplied] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get(ENDPOINTS.PLANS);
        if (res.data.success) {
          setPlans(res.data.data);
          // Auto-select family plan if available, else first plan
          const defaultPlan = res.data.data.find(p => p.planId === 'family') || res.data.data[0];
          if (defaultPlan) setSelectedPlanId(defaultPlan.planId);
        }
      } catch (err) {
        console.error('Failed to fetch plans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    if (isReferralModalOpen) {
      document.body.classList.add('overflow-hidden');
      document.documentElement.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, [isReferralModalOpen]);

  const handlePurchaseClick = () => {
    setIsReferralModalOpen(true);
  };

  const applyCode = () => {
    if (referralCode.trim().length > 3) {
      // Future: Could validate code with backend here
      setIsCodeApplied(true);
    } else {
      alert('Please enter a valid Referral Code (e.g. AGENT123).');
    }
  };

  const selectedPlan = plans.find(p => p.planId === selectedPlanId);

  const handleProceedToPayment = () => {
    if (!selectedPlan) return;
    
    const basePrice = selectedPlan.price;
    const finalPrice = isCodeApplied && sourceType === 'agent' ? basePrice - 200 : basePrice;
    
    // Pass the discounted price, code, and agent info to the payment page
    navigate('/payment', { 
      state: { 
        planId: selectedPlan.planId, 
        planObjId: selectedPlan._id,
        price: finalPrice, 
        discount: isCodeApplied ? 200 : 0,
        agentDetail: sourceType === 'agent' ? agentDetail : null,
        referralCode: isCodeApplied ? referralCode : null,
        planName: selectedPlan.name,
        validity: selectedPlan.validity,
        coverage: `₹${(selectedPlan.coverageAmount / 100000).toFixed(1)}L`,
        members: selectedPlan.maxMembers
      } 
    });
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#F8FAFF] min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          <p className="text-sm font-bold text-on-surface-variant">Loading Plans...</p>
        </div>
      </div>
    );
  }

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

      <main className="flex-grow overflow-y-auto px-4 pt-6 pb-28 max-w-md mx-auto w-full space-y-6">

        {/* Title */}
        <div className="text-center animate-slide-up">
          <h1 className="text-2xl font-black text-on-surface">Choose Your Plan</h1>
          <p className="text-sm text-on-surface-variant mt-1 mb-2">
            {fromRenew ? 'Renew or upgrade your healthcare membership.' : 'Activate your MedCred healthcare membership to unlock all benefits.'}
          </p>
        </div>

        {/* Plan Cards */}
        <div className="space-y-3">
          {plans.map((plan, idx) => {
            const isSelected = selectedPlanId === plan.planId;
            return (
              <div
                key={plan.planId}
                onClick={() => setSelectedPlanId(plan.planId)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-primary shadow-xl scale-[1.01]' : 'shadow-md hover:shadow-lg hover:scale-[1.005]'}`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Popular badge */}
                {plan.isPopular && (
                  <div className="absolute top-0 left-0 right-0 flex justify-center">
                    <div className="bg-tertiary text-white text-[9px] font-black px-3 py-0.5 rounded-b-xl tracking-wider">
                      ⭐ MOST POPULAR
                    </div>
                  </div>
                )}

                {/* Card header gradient */}
                <div className={`bg-gradient-to-br ${planGradients[plan.planId] || planGradients['individual']} p-3.5 text-white ${plan.isPopular ? 'pt-6' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="material-symbols-outlined text-white/80 text-lg">{planIcons[plan.planId] || 'health_and_safety'}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{plan.name}</span>
                      </div>
                      <p className="text-2xl font-black mt-0.5">₹{plan.price.toLocaleString()}</p>
                      <p className="text-[10px] opacity-70 mt-0">per year · {plan.validity}</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 rounded-lg px-2 py-1.5 text-center">
                        <p className="text-[8px] opacity-80 uppercase font-bold">Coverage</p>
                        <p className="text-sm font-black">₹{(plan.coverageAmount / 100000).toFixed(1)}L</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2.5">
                    <div className="bg-white/15 rounded-lg px-2 py-1.5 flex-1 text-center">
                      <p className="text-[8px] opacity-80 font-bold uppercase">Members</p>
                      <p className="text-sm font-black">Up to {plan.maxMembers}</p>
                    </div>
                    <div className="bg-white/15 rounded-lg px-2 py-1.5 flex-1 text-center">
                      <p className="text-[8px] opacity-80 font-bold uppercase">Validity</p>
                      <p className="text-sm font-black">{plan.validity}</p>
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
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/30 px-4 py-4 z-50 pb-safe">
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePurchaseClick}
            disabled={!selectedPlan}
            className="w-full py-3 bg-primary text-white font-black rounded-xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm px-2 whitespace-nowrap disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">shopping_cart</span>
            {selectedPlan && <span>Purchase {selectedPlan.name} — ₹{selectedPlan.price.toLocaleString()}</span>}
          </button>
        </div>
      </div>

      {/* Referral Modal */}
      {isReferralModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
            <button 
              onClick={() => setIsReferralModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
            
            <div className="text-center mb-4 mt-1">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-2xl">loyalty</span>
              </div>
              <h3 className="text-lg font-black text-on-surface">How did you find us?</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Help us serve you better</p>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => { setSourceType('self'); setIsCodeApplied(false); setReferralCode(''); }}
                className={`flex-1 py-2.5 px-2 border-2 rounded-xl text-sm font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  sourceType === 'self' ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined">person</span>
                Self
              </button>
              <button
                onClick={() => setSourceType('agent')}
                className={`flex-1 py-2.5 px-2 border-2 rounded-xl text-sm font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  sourceType === 'agent' ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined">support_agent</span>
                Via Agent
              </button>
            </div>

            {sourceType === 'agent' && (
              <div className="space-y-3 mb-4 animate-fade-in text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Agent Name / Number</label>
                  <input
                    type="text"
                    value={agentDetail}
                    onChange={(e) => setAgentDetail(e.target.value)}
                    placeholder="Enter Agent Details"
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Agent Referral Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                    value={referralCode}
                    onChange={(e) => {
                      setReferralCode(e.target.value.toUpperCase());
                      setIsCodeApplied(false);
                    }}
                    placeholder="Enter Code"
                    className="flex-1 w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all uppercase"
                  />
                  <button
                    onClick={applyCode}
                    disabled={!referralCode || isCodeApplied}
                    className={`px-4 font-bold rounded-xl text-xs transition-all ${
                      isCodeApplied 
                        ? 'bg-tertiary text-white cursor-default' 
                        : 'bg-primary text-white hover:opacity-90 active:scale-95 cursor-pointer'
                    }`}
                  >
                    {isCodeApplied ? 'APPLIED' : 'APPLY'}
                  </button>
                </div>
                {isCodeApplied && (
                  <p className="text-[10px] font-bold text-tertiary flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Flat ₹200 Discount applied successfully!
                  </p>
                )}
                </div>
              </div>
            )}

            <button
              onClick={handleProceedToPayment}
              className="w-full py-3 bg-primary text-white font-black rounded-xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex justify-center items-center gap-2 mt-2"
            >
              <span>Proceed to Pay</span>
              <span className="font-extrabold text-lg">
                ₹{sourceType === 'agent' && isCodeApplied ? (selectedPlan.price - 200).toLocaleString() : selectedPlan.price.toLocaleString()}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
