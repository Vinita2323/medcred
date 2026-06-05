import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import { getMembership, hasMembership, getMembershipDaysRemaining, getDaysActive, isLoanEligible, getDaysUntilLoanEligible } from '../utils/storage';

export default function DashboardPage() {
  const navigate = useNavigate();
  const membership = getMembership();
  const active = hasMembership();
  const daysLeft = getMembershipDaysRemaining();
  const loanReady = isLoanEligible();
  const loanDays = getDaysUntilLoanEligible();

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-20">
      {/* TopAppBar */}
      <header className="flex justify-between items-center pl-2 pr-4 w-full h-20 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <img 
            alt="MedCred Logo" 
            className="h-16 w-auto object-contain" 
            src="/FinalLogo.png"
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/notifications')} 
            className="p-2 rounded-full hover:bg-surface-variant transition-colors relative cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-surface"></span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Scroll Area */}
      <main className="flex-grow overflow-y-auto p-4 space-y-5 animate-fade-in">

        {/* ── Membership Status Banner ─────────────────────── */}
        {!active && (
          <div
            onClick={() => navigate('/membership-plans')}
            className="bg-gradient-to-r from-[#0A4DBF] to-[#1976D2] rounded-2xl p-4 text-white cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-xl">health_and_safety</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-wider opacity-80">No Active Plan</p>
                <p className="text-sm font-bold mt-0.5">Activate Membership to unlock all benefits</p>
              </div>
              <span className="material-symbols-outlined text-white/80">arrow_forward_ios</span>
            </div>
          </div>
        )}

        {active && (
          <div className="flex items-center justify-between bg-white border border-outline-variant rounded-2xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <div>
                <p className="text-[10px] text-on-surface-variant font-semibold">{membership?.planName}</p>
                <p className="text-xs font-bold text-on-surface">{daysLeft} days remaining</p>
              </div>
            </div>
            <span className="membership-active">Active</span>
          </div>
        )}
        {/* Health Card Widget */}
        <section className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] text-primary-fixed opacity-90 uppercase tracking-widest font-semibold">MedCred India</p>
                <h2 className="text-lg font-bold mt-0.5">Health Passport</h2>
              </div>
              <div className="bg-white p-1 rounded-lg">
                <img 
                  alt="Card QR Code" 
                  className="w-10 h-10" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVFKhfs1tM3Gf0ITg4jWdnRQHkrL8HDzZvFtI-B9uGiZ6xrV203DSr_6-NfcQYke-zjjy31uvCI5Jrpmcl7i7ATbS4JTae4bacfbet6Zw1YHRaeZZaNckjfnb2mqMjSSWMMk9em26YAV6gJFrCDnQOlMt6B39DT6Ax4XoKBe5vO5Dg7hWeD2gULy4mCIoRCY106MlvBRPPnswqBYtHWoCSu09-fRTpYXF8FmqmOCQ_lmCi8iK1XUfmB9YU5Sapnk2iI7QpDP8tFLyk"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-lg tracking-[0.2em] font-mono font-bold">•••• •••• 1234</p>
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div>
                    <p className="text-[9px] opacity-70 uppercase font-semibold">Status</p>
                    <p className="text-xs font-semibold">Active</p>
                  </div>
                  <div>
                    <p className="text-[9px] opacity-70 uppercase font-semibold">Type</p>
                    <p className="text-xs font-semibold">Platinum</p>
                  </div>
                  <div>
                    <p className="text-[9px] opacity-70 uppercase font-semibold">Valid Till</p>
                    <p className="text-xs font-semibold">12/28</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => navigate('/card')}
                className="flex-1 bg-white text-primary text-xs py-2.5 rounded-lg flex items-center justify-center gap-1 font-bold active:scale-95 transition-all cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                View Card
              </button>
              <button 
                onClick={() => alert("MedCred Passport PDF downloaded successfully.")}
                className="flex-1 glass-effect text-white text-xs py-2.5 rounded-lg flex items-center justify-center gap-1 font-bold active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Download
              </button>
            </div>
          </div>
        </section>

        {/* Summary Bento Grid */}
        <section className="grid grid-cols-2 gap-3">
          <div 
            onClick={() => navigate('/claims')}
            className="bg-surface-container-low p-4 rounded-xl border border-outline-variant hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-9 h-9 bg-primary-container/10 rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-primary text-lg">description</span>
            </div>
            <p className="text-[10px] text-on-surface-variant font-semibold">Active Claims</p>
            <p className="text-lg font-bold text-primary">02</p>
          </div>
          
          <div 
            onClick={() => navigate('/family')}
            className="bg-surface-container-low p-4 rounded-xl border border-outline-variant hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-9 h-9 bg-secondary-container/10 rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-secondary text-lg">group</span>
            </div>
            <p className="text-[10px] text-on-surface-variant font-semibold">Family Members</p>
            <p className="text-lg font-bold text-primary">04</p>
          </div>

          <div 
            onClick={() => navigate('/wallet')}
            className="bg-surface-container-low p-4 rounded-xl border border-outline-variant hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-9 h-9 bg-tertiary-fixed/10 rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-tertiary text-lg">account_balance_wallet</span>
            </div>
            <p className="text-[10px] text-on-surface-variant font-semibold">Wallet Balance</p>
            <p className="text-lg font-bold text-primary">₹12,500</p>
          </div>

          <div 
            onClick={() => navigate('/loan')}
            className="bg-surface-container-low p-4 rounded-xl border border-outline-variant hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-9 h-9 bg-on-primary-fixed-variant/10 rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-on-primary-fixed-variant text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <p className="text-[10px] text-on-surface-variant font-semibold">Eligibility</p>
            <p className="text-lg font-bold text-primary">Eligible</p>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            Quick Actions
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => navigate('/family')}
              className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-outline-variant active:scale-95 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">family_restroom</span>
              </div>
              <span className="text-[10px] text-center font-bold text-on-surface-variant">Family Members</span>
            </button>
            <button 
              onClick={() => navigate('/claims')}
              className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-outline-variant active:scale-95 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">post_add</span>
              </div>
              <span className="text-[10px] text-center font-bold text-on-surface-variant">Submit Claim</span>
            </button>
            <button 
              onClick={() => navigate('/loan')}
              className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-outline-variant active:scale-95 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">payments</span>
              </div>
              <span className="text-[10px] text-center font-bold text-on-surface-variant">Loan eligibility</span>
            </button>
            <button 
              onClick={() => navigate('/wallet')}
              className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-outline-variant active:scale-95 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
              </div>
              <span className="text-[10px] text-center font-bold text-on-surface-variant">Wallet</span>
            </button>
            <button 
              onClick={() => navigate('/hospitals')}
              className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-outline-variant active:scale-95 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">local_hospital</span>
              </div>
              <span className="text-[10px] text-center font-bold text-on-surface-variant">Hospitals</span>
            </button>
            <button 
              onClick={() => navigate('/support')}
              className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-outline-variant active:scale-95 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">support_agent</span>
              </div>
              <span className="text-[10px] text-center font-bold text-on-surface-variant">Support</span>
            </button>
          </div>
        </section>

        {/* Recommended Carousel */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">Recommended for You</h3>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            <div 
              onClick={() => navigate('/insurance')}
              className="min-w-[260px] bg-secondary-fixed text-on-secondary-fixed p-4 rounded-2xl flex flex-col justify-between h-36 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div>
                <h4 className="text-sm font-bold">Health Insurance</h4>
                <p className="text-[11px] opacity-80 mt-1">Check top-up plans for better coverage.</p>
              </div>
              <div className="text-[11px] font-bold flex items-center gap-1 uppercase tracking-wider cursor-pointer">
                Explore <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </div>
            </div>
            
            <div 
              onClick={() => navigate('/book-checkup')}
              className="min-w-[260px] bg-tertiary-fixed text-on-tertiary-fixed p-4 rounded-2xl flex flex-col justify-between h-36 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div>
                <h4 className="text-sm font-bold">Free Checkup</h4>
                <p className="text-[11px] opacity-80 mt-1">Book your annual full body checkup now.</p>
              </div>
              <div className="text-[11px] font-bold flex items-center gap-1 uppercase tracking-wider cursor-pointer">
                Book Now <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}
