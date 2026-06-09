import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import { hasMembership, isLoanEligible, getDaysUntilLoanEligible, getDaysActive } from '../utils/storage';

export default function LoanPage() {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState(200000);
  const [tenure, setTenure] = useState(12);
  const [applied, setApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const isMember = hasMembership();
  const loanEligible = isLoanEligible();
  const daysUntilEligible = getDaysUntilLoanEligible();
  const daysActive = getDaysActive();
  const progressPct = Math.min(100, Math.round((daysActive / 30) * 100));

  const maxLimit = 500000;
  const minAmount = 10000;

  const handleSliderChange = (e) => {
    setLoanAmount(Number(e.target.value));
  };

  const calculateEMI = () => {
    return Math.round(loanAmount / tenure);
  };

  const handleApply = () => {
    setIsApplying(true);
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
          <h1 className="text-sm font-bold text-primary">Medical Loan</h1>
        </div>
        <button className="material-symbols-outlined text-primary p-2 hover:bg-surface-variant rounded-full cursor-pointer">notifications</button>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-4 space-y-6 max-w-md mx-auto w-full animate-fade-in">

        {/* No membership gate */}
        {!isMember && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-4xl">lock</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-on-surface">Loan Access Locked</h3>
              <p className="text-sm text-on-surface-variant mt-1 max-w-[260px] mx-auto leading-relaxed">
                Purchase a healthcare membership to unlock loan eligibility.
              </p>
            </div>
            <button
              onClick={() => navigate('/membership-plans')}
              className="bg-primary text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:opacity-90 cursor-pointer active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">health_and_safety</span>
              Activate Membership
            </button>
          </div>
        )}

        {/* 30-day waiting period */}
        {isMember && !loanEligible && (
          <div className="flex flex-col items-center text-center space-y-3 py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-ring">
              <span className="material-symbols-outlined text-primary text-3xl">hourglass_top</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-on-surface">Almost There!</h3>
              <p className="text-xs text-on-surface-variant mt-1 max-w-[260px] mx-auto leading-relaxed">
                Loan eligibility unlocks after 30 days of active membership.
              </p>
            </div>
            <div className="w-full bg-white border border-outline-variant rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-on-surface">Eligibility Progress</span>
                <span className="font-black text-primary">{progressPct}%</span>
              </div>
              <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-on-surface-variant">
                <span>Day {daysActive} of 30</span>
                <span className="font-bold text-primary">{daysUntilEligible} days remaining</span>
              </div>
              <div className="bg-primary/5 rounded-lg p-2.5 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-base">calendar_today</span>
                <p className="text-[10px] text-on-surface font-semibold text-left">
                  Unlocks in <span className="text-primary font-black">{daysUntilEligible} days</span>. Keep membership active!
                </p>
              </div>
            </div>
          </div>
        )}

        {isMember && loanEligible && applied ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-on-surface">Application Submitted</h3>
              <p className="text-xs text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
                Your medical loan of <span className="font-bold text-primary">₹{loanAmount.toLocaleString('en-IN')}</span> for a tenure of <span className="font-bold text-primary">{tenure} Months</span> is under pre-approval. Payout will be processed directly to the hospital billing desk.
              </p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-primary text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition-all mt-4"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Approved Limit Cards */}
            <section className="grid grid-cols-2 gap-3">
              {/* Home Treatment Card */}
              <div 
                onClick={() => navigate('/loan-details', { state: { type: 'Home Treatment', limit: 100000 } })}
                className="bg-gradient-to-br from-[#0A4DBF] to-[#1976D2] rounded-2xl p-4 text-white shadow-lg relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="relative z-10">
                  <span className="inline-block whitespace-nowrap text-[9px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Home Treatment</span>
                  <div className="mt-3">
                    <p className="text-xl font-black tracking-tight">₹1,00,000</p>
                    <p className="text-[9px] opacity-80 mt-0.5">Max Payout Limit</p>
                  </div>
                </div>
                <div className="relative z-10 flex justify-between items-end mt-4 pt-3 border-t border-white/20">
                  <div>
                    <p className="text-[8px] opacity-70">Interest Rate</p>
                    <p className="font-bold text-[11px] mt-0.5">0%</p>
                  </div>
                  <div>
                    <p className="text-[8px] opacity-70">Proc. Fee</p>
                    <p className="font-bold text-[11px] mt-0.5">₹0</p>
                  </div>
                </div>
              </div>

              {/* Hospitalization Card */}
              <div 
                onClick={() => navigate('/loan-details', { state: { type: 'Hospitalization', limit: 200000 } })}
                className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-4 text-white shadow-lg relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="relative z-10">
                  <span className="inline-block whitespace-nowrap text-[9px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Hospitalization</span>
                  <div className="mt-3">
                    <p className="text-xl font-black tracking-tight">₹2,00,000</p>
                    <p className="text-[9px] opacity-80 mt-0.5">Max Payout / Member</p>
                  </div>
                </div>
                <div className="relative z-10 flex justify-between items-end mt-4 pt-3 border-t border-white/20">
                  <div>
                    <p className="text-[8px] opacity-70">Interest Rate</p>
                    <p className="font-bold text-[11px] mt-0.5">0%</p>
                  </div>
                  <div>
                    <p className="text-[8px] opacity-70">Proc. Fee</p>
                    <p className="font-bold text-[11px] mt-0.5">₹0</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Interactive Calculator */}
            <section className="bg-white border border-outline-variant/50 rounded-2xl p-5 shadow-sm space-y-5">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Configure Loan Details</h3>
              
              {/* Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-on-surface-variant">Required Amount</span>
                  <span className="text-lg font-extrabold text-primary">₹{loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <input 
                  type="range"
                  min={minAmount}
                  max={maxLimit}
                  step={10000}
                  value={loanAmount}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[9px] text-outline font-semibold">
                  <span>Min: ₹10,000</span>
                  <span>Max: ₹5,00,000</span>
                </div>
              </div>

              {/* Tenure Selector */}
              <div className="space-y-2">
                <span className="text-xs text-on-surface-variant">Repayment Tenure</span>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 6, 12, 18].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTenure(m)}
                      className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        tenure === m 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {m} Mo
                    </button>
                  ))}
                </div>
              </div>

              {/* EMI Calculation Summary Box */}
              <div className="bg-surface-container-low p-4 rounded-xl space-y-2 border border-outline-variant/30 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Monthly EMI (Principal)</span>
                  <span className="font-extrabold text-on-surface text-sm">₹{calculateEMI().toLocaleString('en-IN')} / mo</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-outline">
                  <span>Interest Charges (0%)</span>
                  <span className="font-bold text-tertiary">₹0</span>
                </div>
                <div className="border-t border-outline-variant/30 pt-2 flex justify-between items-center font-bold text-on-surface">
                  <span>Total Repayable</span>
                  <span className="text-primary text-sm">₹{loanAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </section>

            {/* Quick Benefits */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">MedCred Benefits</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl space-y-1">
                  <span className="material-symbols-outlined text-primary text-xl">speed</span>
                  <p className="font-bold text-on-surface">Instant Settlement</p>
                  <p className="text-[9px] text-on-surface-variant">Paid directly to the hospital desk in 15 mins.</p>
                </div>
                <div className="p-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl space-y-1">
                  <span className="material-symbols-outlined text-primary text-xl">description</span>
                  <p className="font-bold text-on-surface">Zero Paperwork</p>
                  <p className="text-[9px] text-on-surface-variant">100% digital verification via Aadhaar.</p>
                </div>
              </div>
            </section>

            {/* Apply Action */}
            <button
              onClick={handleApply}
              disabled={isApplying}
              className={`w-full ${isApplying ? 'bg-primary/80 cursor-wait' : 'bg-primary hover:opacity-90 cursor-pointer'} text-white py-3 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs`}
            >
              {isApplying ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">send</span>
                  Apply Instantly
                </>
              )}
            </button>
          </>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
