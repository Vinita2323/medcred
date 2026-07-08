import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import { getMembership, hasMembership, getMembershipDaysRemaining, getDaysActive, isLoanEligible, getDaysUntilLoanEligible, DEFAULT_PLANS as PLANS, getUser, isLoggedIn } from '../utils/storage';
import api from '../../../services/api';
import { ENDPOINTS, getImageUrl } from '../../../services/types';
import { getProductImage } from '../../../utils/getProductImage';
import imgBP from '../../../assets/Machine/Bloodpressure.webp';
import imgGlucometer from '../../../assets/Machine/Glucometer.webp';
import imgThermometer from '../../../assets/Machine/thermometer.jpg';
import imgWeighing from '../../../assets/Machine/Weighting.webp';
import imgAcupressure from '../../../assets/Machine/Acupressure.jpg';
import imgMassager from '../../../assets/Machine/Bodymassager.jpg';
import imgChatSupport from '../../../assets/chat-removebg-preview.png';
import imgBodyCheckup from '../../../assets/BodyCheckup.jpg';

export default function DashboardPage() {
  const navigate = useNavigate();

  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false);
  const user = getUser();
  const [card, setCard] = useState(null);
  const [stats, setStats] = useState({
    claimsCount: 0,
    familyCount: 0,
    walletBalance: 0,
    loanStatus: 'Waiting'
  });
  const [products, setProducts] = useState([]);
  const [dynamicPlans, setDynamicPlans] = useState([]);

  // Use user.cardId to instantly know if they have a plan to avoid flashing
  const active = user && user.cardId;

  useEffect(() => {
    const loggedIn = isLoggedIn();

    // If user has a card ID, fetch it from backend
    if (loggedIn && user && user.cardId) {
      const fetchCard = async () => {
        try {
          const res = await api.get(ENDPOINTS.MY_CARD);
          if (res.data.success) {
            setCard(res.data.data);
          }
        } catch (err) {
          console.error('Failed to fetch card:', err);
        }
      };
      fetchCard();
    }

    if (loggedIn) {
      const fetchStats = async () => {
        try {
          const res = await api.get(ENDPOINTS.USER_DASHBOARD_STATS);
          if (res.data.success) {
            setStats(res.data.data);
          }
        } catch (err) {
          console.error('Failed to fetch dashboard stats:', err);
        }
      };
      fetchStats();
    }

    const fetchProducts = async () => {
      try {
        const res = await api.get(ENDPOINTS.PRODUCTS);
        if (res.data.success) {
          setProducts(res.data.data); // Store all products to check length
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();

    const fetchPlans = async () => {
      try {
        const res = await api.get(`${ENDPOINTS.PLANS}?t=${new Date().getTime()}`);
        if (res.data.success) {
          setDynamicPlans(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch plans:', err);
      }
    };
    fetchPlans();

  }, [user?._id, user?.cardId]);

  useEffect(() => {
    if (isBenefitsModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isBenefitsModalOpen]);

  // Calculate dynamic days left
  let daysLeft = 0;
  if (card && card.validTill) {
    const end = new Date(card.validTill);
    const now = new Date();
    const diffTime = Math.abs(end - now);
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

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
      <main className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-5 lg:gap-8">

          {/* Left Column / Sidebar */}
          <div className="w-full lg:w-[340px] xl:w-[400px] flex-shrink-0 space-y-5">

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
                    <p className="text-[10px] text-on-surface-variant font-semibold">{card ? card.planName : "Loading Plan..."}</p>
                    <p className="text-xs font-bold text-on-surface">{card ? `${daysLeft} days remaining` : 'Calculating...'}</p>
                  </div>
                </div>
                <span className="membership-active">Active</span>
              </div>
            )}
            {/* Health Card Widget */}
            <section className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-4 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="relative z-10 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[9px] text-primary-fixed opacity-90 uppercase tracking-widest font-semibold">MedCred India</p>
                    <h2 className="text-base font-bold mt-0.5">Health Passport</h2>
                  </div>
                  <div className="bg-white p-1 rounded-lg">
                    <img
                      alt="Card QR Code"
                      className="w-8 h-8"
                      src={card ? (card.qrCodeUrl || "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + card.cardId) : "https://lh3.googleusercontent.com/aida-public/AB6AXuAVFKhfs1tM3Gf0ITg4jWdnRQHkrL8HDzZvFtI-B9uGiZ6xrV203DSr_6-NfcQYke-zjjy31uvCI5Jrpmcl7i7ATbS4JTae4bacfbet6Zw1YHRaeZZaNckjfnb2mqMjSSWMMk9em26YAV6gJFrCDnQOlMt6B39DT6Ax4XoKBe5vO5Dg7hWeD2gULy4mCIoRCY106MlvBRPPnswqBYtHWoCSu09-fRTpYXF8FmqmOCQ_lmCi8iK1XUfmB9YU5Sapnk2iI7QpDP8tFLyk"}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-base tracking-[0.15em] font-mono font-bold">{card ? card.cardNumber : "•••• •••• 1234"}</p>
                  <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[8px] opacity-70 uppercase font-semibold">Status</p>
                        <p className="text-[11px] font-semibold capitalize">{card ? card.status : "Active"}</p>
                      </div>
                      <div>
                        <p className="text-[8px] opacity-70 uppercase font-semibold">Type</p>
                        <p className="text-[11px] font-semibold">{card ? card.planName : "Platinum"}</p>
                      </div>
                      <div>
                        <p className="text-[8px] opacity-70 uppercase font-semibold">Valid Till</p>
                        <p className="text-[11px] font-semibold">{card ? new Date(card.validTill).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : "12/28"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-4">
                  <button
                    onClick={() => navigate('/card')}
                    className="flex-1 bg-white text-primary text-[11px] py-2 rounded-lg flex items-center justify-center gap-1 font-bold active:scale-95 transition-all cursor-pointer shadow-md"
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                    View Card
                  </button>
                  <button
                    onClick={() => alert("MedCred Passport PDF downloaded successfully.")}
                    className="flex-1 glass-effect text-white text-[11px] py-2 rounded-lg flex items-center justify-center gap-1 font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Download
                  </button>
                </div>
              </div>
            </section>

            {/* Chat Support Section */}
            <section className="bg-[#F5F8FF] border border-blue-100 rounded-2xl p-3 shadow-sm relative overflow-visible mt-2">
              {/* Chat Illustration */}
              <div className="absolute left-0 bottom-0 w-[100px] h-[110px] pointer-events-none">
                <img src={imgChatSupport} alt="Chat Support" className="w-full h-full object-contain object-bottom drop-shadow-md origin-bottom" />
              </div>

              <div className="ml-[100px] flex flex-col justify-between min-h-[85px] z-10 relative">
                <div>
                  <h3 className="text-base font-black text-[#0D1B3E] leading-tight">Need Help?</h3>
                  <p className="text-[10px] text-[#4A5568] mt-1 leading-snug">Chat with our health expert for any queries</p>
                </div>

                <div className="flex items-end justify-between mt-3">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-[#00A86B] text-[12px]">schedule</span>
                    <span className="text-[9px] font-bold text-[#00A86B]">Available 24/7</span>
                  </div>
                  <button
                    onClick={() => navigate('/support')}
                    className="bg-[#0A4DBF] text-white text-[10px] font-bold py-1.5 px-2 rounded-lg flex items-center gap-0.5 active:scale-95 transition-all shadow-[0_4px_12px_rgba(10,77,191,0.2)] cursor-pointer whitespace-nowrap"
                  >
                    Start Chat
                    <span className="material-symbols-outlined text-[12px] font-bold">arrow_forward</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Full Body Check Up Section */}
            <section className="bg-[#F5F8FF] border border-blue-100 rounded-2xl p-3 shadow-sm relative overflow-hidden mt-3">
              <div className="absolute left-0 bottom-0 w-[100px] h-[110px] pointer-events-none">
                <img src={imgBodyCheckup} alt="Full Body Checkup" className="w-full h-full object-contain object-bottom drop-shadow-md origin-bottom" />
              </div>

              <div className="ml-[100px] flex flex-col justify-between min-h-[85px] z-10 relative">
                <div>
                  <h3 className="text-base font-black text-[#0D1B3E] leading-tight">Full Body Check Up</h3>
                  <p className="text-[10px] text-[#4A5568] mt-1 leading-snug">Comprehensive health screening at your doorstep</p>
                </div>

                <div className="flex items-end justify-between mt-3">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-[#00A86B] text-[12px]">verified</span>
                    <span className="text-[9px] font-bold text-[#00A86B]">NABL Certified</span>
                  </div>
                  <button
                    onClick={() => window.open('https://share.google/GmrxI3vR1GPf7yrPE', '_blank')}
                    className="bg-[#0A4DBF] text-white text-[10px] font-bold py-1.5 px-2 rounded-lg flex items-center gap-0.5 active:scale-95 transition-all shadow-[0_4px_12px_rgba(10,77,191,0.2)] cursor-pointer whitespace-nowrap"
                  >
                    Book Now
                    <span className="material-symbols-outlined text-[12px] font-bold">arrow_forward</span>
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column / Main Content */}
          <div className="w-full flex-1 space-y-5 lg:space-y-8 mt-5 lg:mt-0">

            {/* Medical Equipment Grid */}
            <section className="space-y-3 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  Medical Equipment
                </h3>
                <button
                  onClick={() => navigate('/products')}
                  className="text-xs font-bold text-primary active:scale-95 transition-all cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {products.slice(0, 6).map((item) => (
                  <button
                    key={item.productId}
                    onClick={() => navigate('/product-details', { state: { product: item } })}
                    className="relative overflow-hidden bg-white rounded-xl border border-outline-variant active:scale-95 transition-all group cursor-pointer hover:shadow-md h-24"
                  >
                    <img src={getProductImage(item.imageUrl, item.category)} alt={item.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.src = getProductImage(null, item.category); }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90"></div>
                    <span className="absolute bottom-2 inset-x-1 text-[10px] text-center font-bold text-white line-clamp-1 drop-shadow-md tracking-wide">{item.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Summary Bento Grid */}
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2.5 md:gap-4">
              <div
                onClick={() => navigate('/claims')}
                className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant hover:shadow-md transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 bg-primary-container/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-base">description</span>
                </div>
                <div>
                  <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Claims</p>
                  <p className="text-sm font-black text-primary leading-none mt-0.5">{stats.claimsCount.toString().padStart(2, '0')}</p>
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
                  <p className="text-sm font-black text-primary leading-none mt-0.5">{stats.familyCount.toString().padStart(2, '0')}</p>
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
                  <p className="text-sm font-black text-primary leading-none mt-0.5">₹{stats.walletBalance.toLocaleString('en-IN')}</p>
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
                  <p className="text-sm font-black text-primary leading-none mt-0.5">{stats.loanStatus}</p>
                </div>
              </div>

              <div
                onClick={() => navigate('/hospitals')}
                className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant hover:shadow-md transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 bg-error/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-error text-base">local_hospital</span>
                </div>
                <div>
                  <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Hospitals</p>
                  <p className="text-sm font-black text-primary leading-none mt-0.5">Network</p>
                </div>
              </div>

              <div
                onClick={() => navigate('/support')}
                className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant hover:shadow-md transition-all cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-warning text-base">support_agent</span>
                </div>
                <div>
                  <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Support</p>
                  <p className="text-sm font-black text-primary leading-none mt-0.5">Helpdesk</p>
                </div>
              </div>
            </section>

            {/* Recommended Carousel */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-on-surface">Recommended for You</h3>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {(dynamicPlans.length > 0 ? dynamicPlans : Object.values(PLANS)).map((plan, idx) => (
                  <div
                    key={plan.planId || plan.id}
                    onClick={() => navigate('/membership-plans', { state: { preSelectedPlanId: plan.planId || plan.id } })}
                    className={`min-w-[260px] p-4 rounded-2xl flex flex-col justify-between h-36 cursor-pointer hover:shadow-md transition-all active:scale-[0.99] ${idx === 0 ? 'bg-[#1565C0] text-white' :
                        idx === 1 ? 'bg-[#062E8A] text-white' :
                          'bg-[#0D1B3E] text-white'
                      }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold">{plan.name}</h4>
                        {plan.isPopular && <span className="text-[8px] bg-tertiary px-1.5 py-0.5 rounded font-black tracking-wider">POPULAR</span>}
                      </div>
                      <p className="text-xl font-black mt-1">₹{plan.price.toLocaleString()}<span className="text-[10px] font-normal opacity-80 ml-1">/{plan.validity || 'yr'}</span></p>
                      <p className="text-[10px] opacity-80 mt-1 line-clamp-1">{plan.features?.[0]} • Coverage: {plan.coverageAmount ? `₹${plan.coverageAmount.toLocaleString()}` : plan.coverage}</p>
                    </div>
                    <div className="text-[11px] font-bold flex items-center gap-1 uppercase tracking-wider cursor-pointer mt-2 opacity-90 hover:opacity-100">
                      View Plan Details <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Benefits Modal */}
      {isBenefitsModalOpen && card && (
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
              <h3 className="text-lg font-black text-on-surface">{card.planName}</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Active until {new Date(card.validTill).toLocaleDateString()}</p>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Included Benefits</h4>
              {PLANS[card.cardType]?.features.map((feature, idx) => (
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
