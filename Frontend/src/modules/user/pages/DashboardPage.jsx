import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import { getMembership, hasMembership, getMembershipDaysRemaining, getDaysActive, isLoanEligible, getDaysUntilLoanEligible, getPlatformPlans } from '../utils/storage';
import imgBP from '../../../assets/Machine/Bloodpressure.webp';
import imgGlucometer from '../../../assets/Machine/Glucometer.webp';
import imgThermometer from '../../../assets/Machine/thermometer.jpg';
import imgWeighing from '../../../assets/Machine/Weighting.webp';
import imgAcupressure from '../../../assets/Machine/Acupressure.jpg';
import imgMassager from '../../../assets/Machine/Bodymassager.jpg';

export default function DashboardPage() {
  const navigate = useNavigate();
  const PLANS = getPlatformPlans();
  const membership = getMembership();
  const active = hasMembership();
  const daysLeft = getMembershipDaysRemaining();
  const loanReady = isLoanEligible();
  const loanDays = getDaysUntilLoanEligible();
  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false);

  useEffect(() => {
    if (isBenefitsModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isBenefitsModalOpen]);

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
          <div 
            onClick={() => setIsBenefitsModalOpen(true)}
            className="flex items-center justify-between bg-white border border-outline-variant rounded-2xl px-4 py-3 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
          >
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

        {/* Medical Equipment Grid */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              Medical Equipment
            </h3>
            <button className="text-xs font-bold text-primary active:scale-95 transition-all cursor-pointer">
              View All
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'BP Monitor', img: imgBP },
              { label: 'Glucometer', img: imgGlucometer },
              { label: 'Thermometer', img: imgThermometer },
              { label: 'Weighing Scale', img: imgWeighing },
              { label: 'Acupressure', img: imgAcupressure },
              { label: 'Body Massager', img: imgMassager },
            ].map((item) => (
              <button 
                key={item.label}
                onClick={() => navigate('/product-details', { state: { product: item } })}
                className="relative overflow-hidden bg-white rounded-xl border border-outline-variant active:scale-95 transition-all group cursor-pointer hover:shadow-md h-24"
              >
                <img src={item.img} alt={item.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90"></div>
                <span className="absolute bottom-2 inset-x-1 text-[10px] text-center font-bold text-white line-clamp-1 drop-shadow-md tracking-wide">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Summary Bento Grid */}
        <section className="grid grid-cols-2 gap-2.5">
          <div 
            onClick={() => navigate('/claims')}
            className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant hover:shadow-md transition-all cursor-pointer flex items-center gap-2.5"
          >
            <div className="w-8 h-8 bg-primary-container/10 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-base">description</span>
            </div>
            <div>
              <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Claims</p>
              <p className="text-sm font-black text-primary leading-none mt-0.5">02</p>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/family')}
            className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant hover:shadow-md transition-all cursor-pointer flex items-center gap-2.5"
          >
            <div className="w-8 h-8 bg-secondary-container/10 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary text-base">group</span>
            </div>
            <div>
              <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Family</p>
              <p className="text-sm font-black text-primary leading-none mt-0.5">04</p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/wallet')}
            className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant hover:shadow-md transition-all cursor-pointer flex items-center gap-2.5"
          >
            <div className="w-8 h-8 bg-tertiary-fixed/10 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-tertiary text-base">account_balance_wallet</span>
            </div>
            <div>
              <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Wallet</p>
              <p className="text-sm font-black text-primary leading-none mt-0.5">₹12.5k</p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/loan')}
            className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant hover:shadow-md transition-all cursor-pointer flex items-center gap-2.5"
          >
            <div className="w-8 h-8 bg-on-primary-fixed-variant/10 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary-fixed-variant text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <div>
              <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Status</p>
              <p className="text-sm font-black text-primary leading-none mt-0.5">Eligible</p>
            </div>
          </div>
        </section>

        {/* Recommended Carousel */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-on-surface">Recommended for You</h3>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {Object.values(PLANS).map((plan, idx) => (
              <div 
                key={plan.id}
                onClick={() => navigate('/membership-plans')}
                className={`min-w-[260px] p-4 rounded-2xl flex flex-col justify-between h-36 cursor-pointer hover:shadow-md transition-all active:scale-[0.99] ${
                  idx === 0 ? 'bg-[#1565C0] text-white' : 
                  idx === 1 ? 'bg-[#062E8A] text-white' : 
                  'bg-[#0D1B3E] text-white'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold">{plan.name}</h4>
                    {plan.popular && <span className="text-[8px] bg-tertiary px-1.5 py-0.5 rounded font-black tracking-wider">POPULAR</span>}
                  </div>
                  <p className="text-xl font-black mt-1">₹{plan.price.toLocaleString()}<span className="text-[10px] font-normal opacity-80 ml-1">/yr</span></p>
                  <p className="text-[10px] opacity-80 mt-1 line-clamp-1">{plan.features[0]} • Coverage: {plan.coverage}</p>
                </div>
                <div className="text-[11px] font-bold flex items-center gap-1 uppercase tracking-wider cursor-pointer mt-2 opacity-90 hover:opacity-100">
                  View Plan Details <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Benefits Modal */}
      {isBenefitsModalOpen && membership && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
            <button 
              onClick={() => setIsBenefitsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
            
            <div className="mb-4 mt-1">
              <div className="w-12 h-12 bg-tertiary/10 text-tertiary rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <h3 className="text-lg font-black text-on-surface">{membership.planName}</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Active until {new Date(membership.expiresAt).toLocaleDateString()}</p>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Included Benefits</h4>
              {PLANS[membership.planId]?.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-xs text-on-surface font-semibold leading-snug">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsBenefitsModalOpen(false)}
              className="w-full py-3 bg-surface-container-low text-on-surface font-bold rounded-xl hover:bg-surface-container-high active:scale-[0.98] transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}
