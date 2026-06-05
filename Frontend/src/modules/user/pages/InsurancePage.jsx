import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';

export default function InsurancePage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [success, setSuccess] = useState(false);

  const plans = [
    {
      id: 1,
      name: 'HDFC Ergo Optima Secure',
      provider: 'HDFC Ergo',
      cover: '₹10,00,000',
      premium: 420,
      features: ['2x Instant Coverage Benefit', 'Unlimited Restore of Sum Insured', 'Cashless at 10,000+ Hospitals'],
      logo: '🛡️'
    },
    {
      id: 2,
      name: 'Aditya Birla Activ Health',
      provider: 'Aditya Birla',
      cover: '₹5,00,000',
      premium: 290,
      features: ['Up to 100% HealthReturns™', 'In-built Chronic Management', 'Zero Co-payment at networks'],
      logo: '💚'
    },
    {
      id: 3,
      name: 'Care Supreme Plan',
      provider: 'Care Health',
      cover: '₹15,00,000',
      premium: 380,
      features: ['Up to 500% No Claim Bonus', 'Unlimited Automatic Recharge', 'Free annual health checkup'],
      logo: '💎'
    }
  ];

  const handleBuyPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const confirmPurchase = () => {
    setSuccess(true);
  };

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-24">
      {/* TopAppBar */}
      <header className="flex justify-between items-center pl-2 pr-4 w-full h-20 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity active:scale-95 duration-150 cursor-pointer"
          >
            arrow_back
          </button>
          <h1 className="text-sm font-bold text-primary">Health Insurance</h1>
        </div>
        <button className="material-symbols-outlined text-primary p-2 hover:bg-surface-variant rounded-full cursor-pointer">notifications</button>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-4 space-y-6 max-w-md mx-auto w-full animate-fade-in">
        {success ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-on-surface">Policy Issued</h3>
              <p className="text-xs text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
                Your top-up policy <span className="font-bold text-primary">{selectedPlan?.name}</span> has been successfully purchased and linked to your MedCred profile. The premium of <span className="font-bold text-primary">₹{(selectedPlan?.premium * 12).toLocaleString('en-IN')}/year</span> was settled using your MedCred credit line.
              </p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-primary text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition-all mt-4"
            >
              Back to Dashboard
            </button>
          </div>
        ) : selectedPlan ? (
          <section className="bg-white border border-outline-variant/50 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedPlan.logo}</span>
              <div>
                <h3 className="font-bold text-sm text-on-surface">{selectedPlan.name}</h3>
                <p className="text-[10px] text-on-surface-variant">{selectedPlan.provider} • Cover: {selectedPlan.cover}</p>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl space-y-2 border border-outline-variant/30 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Annual Premium</span>
                <span className="font-bold text-on-surface">₹{(selectedPlan.premium * 12).toLocaleString('en-IN')}/yr</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-outline">
                <span>Financed via MedCred Limit</span>
                <span className="font-bold text-tertiary">Available</span>
              </div>
              <div className="border-t border-outline-variant/30 pt-2 flex justify-between items-center font-bold text-on-surface">
                <span>First Installment</span>
                <span className="text-primary text-sm">₹{selectedPlan.premium}/mo</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Policy Highlights</p>
              <ul className="space-y-2">
                {selectedPlan.features.map((f, i) => (
                  <li key={i} className="flex gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-tertiary text-sm">check</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setSelectedPlan(null)}
                className="flex-1 border border-outline text-on-surface-variant text-xs font-bold py-2.5 rounded-xl hover:bg-surface-container-low cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmPurchase}
                className="flex-1 bg-primary text-white text-xs font-bold py-2.5 rounded-xl shadow hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Confirm Pay
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Recommended Health Top-Ups</h3>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Financed instantly with your MedCred pre-approved credit line.</p>
              </div>

              <div className="space-y-3 pt-2">
                {plans.map((p) => (
                  <div 
                    key={p.id}
                    className="p-4 bg-white border border-outline-variant/50 rounded-2xl flex flex-col justify-between shadow-sm space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <span className="text-2xl mt-0.5">{p.logo}</span>
                        <div>
                          <h4 className="font-bold text-xs text-on-surface">{p.name}</h4>
                          <p className="text-[9px] text-on-surface-variant">{p.provider}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-primary">₹{p.premium}/mo</p>
                        <p className="text-[8px] text-outline">or yearly premium</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant">
                      <span>Cover Amount: <span className="font-bold text-on-surface">{p.cover}</span></span>
                      <span>No Paperwork Required</span>
                    </div>

                    <button 
                      onClick={() => handleBuyPlan(p)}
                      className="w-full bg-primary/10 text-primary text-xs font-bold py-2.5 rounded-xl hover:bg-primary hover:text-white transition-colors cursor-pointer"
                    >
                      Explore &amp; Buy
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
