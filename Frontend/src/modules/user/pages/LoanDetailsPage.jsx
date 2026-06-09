import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function LoanDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || { type: 'Individual', limit: 100000 };

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md min-h-screen pb-20 animate-fade-in">
      <header className="flex items-center gap-3 px-4 h-16 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>
        <h1 className="font-bold text-base text-primary">Loan Details</h1>
      </header>

      <main className="p-4 space-y-6 max-w-md mx-auto w-full">
        <div className={`rounded-2xl p-6 text-white shadow-xl relative overflow-hidden ${state.type === 'Family' ? 'bg-gradient-to-br from-primary to-secondary' : 'bg-gradient-to-br from-[#0A4DBF] to-[#1976D2]'}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="relative z-10">
            <span className="text-xs bg-white/20 text-white font-bold px-3 py-1 rounded-full uppercase tracking-wider">{state.type} Loan</span>
            <div className="mt-4">
              <p className="text-3xl font-black tracking-tight">₹{state.limit.toLocaleString('en-IN')}</p>
              <p className="text-xs opacity-80 mt-1">Approved Credit Limit</p>
            </div>
            
            <div className="mt-6 flex justify-between items-center text-xs border-t border-white/20 pt-4">
              <div>
                <p className="opacity-70">Interest Rate</p>
                <p className="font-bold text-sm mt-0.5">0% (Interest-Free)</p>
              </div>
              <div>
                <p className="opacity-70">Processing Fee</p>
                <p className="font-bold text-sm mt-0.5">₹0 (Zero Charges)</p>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border border-outline-variant/50 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Features & Benefits</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">bolt</span>
              <div>
                <p className="font-bold text-on-surface text-sm">Instant Approval</p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">Funds are disbursed directly to the hospital in under 15 minutes.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">event_available</span>
              <div>
                <p className="font-bold text-on-surface text-sm">Flexible Repayment</p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">Choose repayment tenures ranging from 3 to 18 months.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">shield</span>
              <div>
                <p className="font-bold text-on-surface text-sm">Zero Hidden Charges</p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">No pre-closure fees, no processing fees, absolutely 0% interest.</p>
              </div>
            </li>
          </ul>
        </section>

        <button 
          onClick={() => navigate('/loan-application-form', { state })}
          className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
        >
          Proceed with {state.type} Loan
        </button>
      </main>
    </div>
  );
}
