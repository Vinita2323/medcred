import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function LoanPage() {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState(200000);
  const [tenure, setTenure] = useState(12);
  const [applied, setApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loanType, setLoanType] = useState('Hospitalization');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Backend state
  const [isMember, setIsMember] = useState(false);
  const [loanEligible, setLoanEligible] = useState(false);
  const [daysUntilEligible, setDaysUntilEligible] = useState(0);
  const [daysActive, setDaysActive] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [requiredWaitDays, setRequiredWaitDays] = useState(30);
  const [maxLimit, setMaxLimit] = useState(200000);
  const [activeLoan, setActiveLoan] = useState(null);
  const [loanHistory, setLoanHistory] = useState([]);

  const minAmount = 10000;

  useEffect(() => {
    fetchEligibility();
  }, []);

  const fetchEligibility = async () => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.LOAN_ELIGIBILITY);
      if (res.data.success) {
        const {
          hasCard,
          isEligible,
          daysActive: dActive,
          daysRemaining: dRemaining,
          progressPct: pPct,
          requiredWaitDays: reqWaitDays,
          maxLoanAmount,
          activeLoan: aLoan,
        } = res.data.data;

        setIsMember(hasCard);
        setLoanEligible(isEligible);
        setDaysActive(dActive || 0);
        setDaysUntilEligible(dRemaining || 0);
        setProgressPct(pPct || 0);
        setRequiredWaitDays(reqWaitDays !== undefined ? reqWaitDays : 30);
        if (maxLoanAmount) setMaxLimit(maxLoanAmount);
        
        if (aLoan) {
          setApplied(true);
          setActiveLoan(aLoan);
        }
      }
      
      const historyRes = await api.get(ENDPOINTS.LOAN_HISTORY);
      if (historyRes.data.success) {
        setLoanHistory(historyRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching loan eligibility/history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (e) => {
    setLoanAmount(Number(e.target.value));
  };

  const calculateEMI = () => {
    // Flat 12% annual interest rate
    const interest = loanAmount * 0.12 * (tenure / 12);
    const totalRepayment = loanAmount + interest;
    const emi = totalRepayment / tenure;
    return Math.round(emi);
  };

  const handleApply = () => {
    if (!isMember) {
      alert("Please activate a membership plan to proceed with the loan application.");
      return;
    }
    if (!loanEligible) {
      alert(`Your loan eligibility is locked. Please complete the ${requiredWaitDays}-day waiting period.`);
      return;
    }
    navigate('/loan-application-form', { state: { type: loanType, limit: maxLimit, amount: loanAmount, tenure } });
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-surface pb-24">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }
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
        <button 
          onClick={() => navigate('/notifications')}
          className="material-symbols-outlined text-primary p-2 hover:bg-surface-variant rounded-full cursor-pointer"
        >
          notifications
        </button>
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
                Loan eligibility unlocks after {requiredWaitDays} days of active membership.
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
                <span>Day {daysActive} of {requiredWaitDays}</span>
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
                Your medical loan is currently in <span className="font-bold text-primary">{activeLoan?.applicationStatus?.replace('_', ' ')}</span> status. Payout will be processed directly to the hospital billing desk.
              </p>
            </div>
            <button 
              onClick={() => navigate('/loan-details')}
              className="bg-primary text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition-all mt-4"
            >
              View Loan Status
            </button>
          </div>
        ) : (
          <>
            {/* Approved Limit Cards */}
            <section className="grid grid-cols-2 gap-3">
              {/* Home Treatment Card */}
              <div 
                onClick={() => {
                  setLoanType('Home Treatment');
                  setMaxLimit(100000);
                  if (loanAmount > 100000) setLoanAmount(100000);
                  setModalData({
                    title: 'Home Treatment',
                    maxLimit: 100000,
                    interestRate: '12% p.a.',
                    procFee: '₹0',
                    desc: 'Ideal for treatments that do not require hospitalization, such as diagnostic tests, dental work, and post-operative home care.',
                  });
                  setShowModal(true);
                }}
                className={`bg-gradient-to-br from-[#0A4DBF] to-[#1976D2] rounded-2xl p-4 text-white shadow-lg relative overflow-hidden flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] ${loanType === 'Home Treatment' ? 'ring-4 ring-primary ring-offset-2' : ''}`}
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
                    <p className="font-bold text-[11px] mt-0.5">12%</p>
                  </div>
                  <div>
                    <p className="text-[8px] opacity-70">Proc. Fee</p>
                    <p className="font-bold text-[11px] mt-0.5">₹0</p>
                  </div>
                </div>
              </div>

              {/* Hospitalization Card */}
              <div 
                onClick={() => {
                  setLoanType('Hospitalization');
                  setMaxLimit(200000);
                  setModalData({
                    title: 'Hospitalization',
                    maxLimit: 200000,
                    interestRate: '12% p.a.',
                    procFee: '₹0',
                    desc: 'Covers major surgical procedures, extended hospital stays, and comprehensive emergency care treatments.',
                  });
                  setShowModal(true);
                }}
                className={`bg-gradient-to-br from-primary to-secondary rounded-2xl p-4 text-white shadow-lg relative overflow-hidden flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] ${loanType === 'Hospitalization' ? 'ring-4 ring-primary ring-offset-2' : ''}`}
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
                    <p className="font-bold text-[11px] mt-0.5">12%</p>
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
                  {[
                    { val: 6, label: '6 Mo' },
                    { val: 12, label: '1 Yr' },
                    { val: 24, label: '2 Yr' },
                    { val: 36, label: '3 Yr' }
                  ].map((m) => (
                    <button
                      key={m.val}
                      type="button"
                      onClick={() => setTenure(m.val)}
                      className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        tenure === m.val 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* EMI Calculation Summary Box */}
              <div className="bg-surface-container-low p-4 rounded-xl space-y-2 border border-outline-variant/30 text-xs">
                <div className="flex justify-between items-center text-[10px] text-outline">
                  <span>Requested Loan Amount</span>
                  <span className="font-bold text-on-surface-variant">₹{loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-outline">
                  <span>Interest Charges (Flat 12% p.a.)</span>
                  <span className="font-bold text-tertiary">₹{(calculateEMI() * tenure - loanAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Monthly EMI</span>
                  <span className="font-extrabold text-on-surface text-sm">₹{calculateEMI().toLocaleString('en-IN')} / mo</span>
                </div>
                <div className="border-t border-outline-variant/30 pt-2 flex justify-between items-center font-bold text-on-surface">
                  <span>Total Repayable (Principal + Interest)</span>
                  <span className="text-primary text-sm">₹{(calculateEMI() * tenure).toLocaleString('en-IN')}</span>
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
              disabled={isApplying || !isMember || !loanEligible}
              className={`w-full ${isApplying || !isMember || !loanEligible ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:opacity-90 cursor-pointer'} text-white py-3 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs`}
            >
              {isApplying ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">send</span>
                  Continue to Application
                </>
              )}
            </button>
          </>
        )}

        {/* Loan History Section */}
        {loanHistory.length > 0 && (
          <section className="mt-8 space-y-4 pt-6 border-t border-outline-variant/30">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Loan History</h3>
            <div className="space-y-3">
              {loanHistory.map((historyItem) => (
                <div key={historyItem._id} className="bg-white border border-outline-variant/50 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-on-surface text-sm">₹{historyItem.loanAmount?.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">{new Date(historyItem.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      {historyItem.applicationStatus === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-md text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[12px]">cancel</span> Rejected
                        </span>
                      ) : historyItem.applicationStatus === 'disbursed' ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span> Disbursed
                        </span>
                      ) : historyItem.applicationStatus === 'closed' ? (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[12px]">task_alt</span> Closed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant px-2 py-1 rounded-md text-[10px] font-bold capitalize">
                          {historyItem.applicationStatus?.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  {historyItem.applicationStatus === 'rejected' && historyItem.rejectionReason && (
                    <div className="bg-red-50 p-2 rounded text-[10px] text-red-700 mt-1">
                      <span className="font-bold">Reason:</span> {historyItem.rejectionReason.slice(0, 50)}{historyItem.rejectionReason.length > 50 ? '...' : ''}
                    </div>
                  )}
                  <button 
                    onClick={() => navigate(`/loan-details/${historyItem._id}`)}
                    className="mt-1 w-full bg-surface-container-low hover:bg-surface-container-high py-2 rounded-lg text-xs font-bold text-primary transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Details Modal */}
      {showModal && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-primary p-5 text-white flex justify-between items-start">
              <div>
                <h3 className="font-black text-xl">{modalData.title}</h3>
                <p className="text-xs opacity-80 mt-1">Loan Plan Details</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="material-symbols-outlined text-white hover:bg-white/20 p-1.5 rounded-full cursor-pointer transition-colors"
              >
                close
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {modalData.desc}
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-surface-container-lowest border border-outline-variant/50 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-outline tracking-wider">Max Payout</span>
                  <p className="font-black text-primary text-base mt-0.5">₹{modalData.maxLimit.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/50 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-outline tracking-wider">Interest Rate</span>
                  <p className="font-black text-on-surface text-base mt-0.5">{modalData.interestRate}</p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/50 p-3 rounded-xl col-span-2 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-outline tracking-wider">Processing Fee</span>
                  <p className="font-black text-on-surface text-base">{modalData.procFee}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowModal(false)}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all mt-2 cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}
