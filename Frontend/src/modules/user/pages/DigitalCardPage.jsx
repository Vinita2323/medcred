import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';
import { getUser } from '../utils/storage';

export default function DigitalCardPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await api.get(ENDPOINTS.MY_CARD);
        if (res.data.success) {
          setCard(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch card:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, []);

  const handleMouseMove = (e) => {
    const cardEl = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - cardEl.left - cardEl.width / 2;
    const y = e.clientY - cardEl.top - cardEl.height / 2;
    // Limit rotation to ~10 degrees
    setRotate({
      x: -y / 15,
      y: x / 15
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-24 items-center justify-center min-h-screen">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        <p className="mt-4 font-bold text-on-surface-variant">Loading your card...</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-24">
        <header className="flex justify-between items-center pl-2 pr-4 w-full h-20 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity active:scale-95 duration-150 cursor-pointer"
            >
              arrow_back
            </button>
            <h1 className="text-sm font-bold text-primary">MedCred India</h1>
          </div>
          <img 
            alt="MedCred Logo" 
            className="h-16 w-auto object-contain" 
            src="/FinalLogo.png"
          />
        </header>
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center text-primary/40 mb-2">
            <span className="material-symbols-outlined text-4xl">no_sim</span>
          </div>
          <h2 className="text-xl font-bold">No Active Card Found</h2>
          <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
            You don't have an active MedCred healthcare membership yet.
          </p>
          <button 
            onClick={() => navigate('/membership-plans')}
            className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all"
          >
            Explore Plans
          </button>
        </main>
        <BottomNavBar />
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-24">
      <header className="flex justify-between items-center pl-2 pr-4 w-full h-20 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity active:scale-95 duration-150 cursor-pointer"
          >
            arrow_back
          </button>
          <h1 className="text-sm font-bold text-primary">MedCred India</h1>
        </div>
        <img 
          alt="MedCred Logo" 
          className="h-16 w-auto object-contain" 
          src="/FinalLogo.png"
        />
      </header>

      {/* Main Card View */}
      <main className="flex-grow overflow-y-auto p-4 space-y-6 max-w-md mx-auto w-full animate-fade-in">
        {/* Card Canvas */}
        <section className="space-y-6 pt-2">
          {/* Health Card with 3D Mouse Tilt and Shimmer */}
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
              transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
              transition: rotate.x === 0 && rotate.y === 0 ? 'all 0.5s ease' : 'none'
            }}
            className="relative w-full aspect-[1.58/1] rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
          >
            {/* Card Content & Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container p-5 flex flex-col justify-between text-white select-none">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-semibold text-on-primary-container opacity-85 tracking-wider">HEALTH CARD</p>
                  <h2 className="text-base font-bold tracking-tight">{card.planName}</h2>
                </div>
                <span className="material-symbols-outlined text-3xl opacity-90" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
              </div>
              
              <div className="flex items-end justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="text-[8px] text-on-primary-container opacity-70 uppercase">Card Holder</p>
                    <p className="text-base font-bold">{user?.fullName || 'Member'}</p>
                  </div>
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[8px] text-on-primary-container opacity-70 uppercase">Card ID</p>
                      <p className="text-xs font-semibold tracking-wider font-mono">{card.cardId}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-on-primary-container opacity-70 uppercase">Validity</p>
                      <p className="text-xs font-semibold font-mono">
                        {new Date(card.validTill).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-lg bg-white/20 backdrop-blur-md p-1 border border-white/30">
                  <img 
                    alt="Mini QR" 
                    className="w-full h-full object-contain filter invert opacity-90" 
                    src={card.qrCodeUrl || "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + card.cardId}
                  />
                </div>
              </div>
            </div>

            {/* Interactive Shimmer Overlay */}
            <div className="absolute inset-0 shimmer-bg opacity-30 pointer-events-none rounded-2xl"></div>
          </div>

          {/* Details Bento Style Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* QR Focus Card */}
            <div className="col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex flex-col items-center justify-center space-y-3 shadow-sm">
              <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Scan at Reception</p>
              <div className="p-3 bg-white border-4 border-surface-container-high rounded-xl">
                <img 
                  alt="Large QR Code" 
                  className="w-40 h-40" 
                  src={card.qrCodeUrl || "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + card.cardId}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant text-center max-w-[200px]">Hold this QR code steady for the healthcare provider's scanner</p>
            </div>

            {/* Plan Card */}
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-base">family_restroom</span>
                <p className="text-[9px] font-bold tracking-wider">PLAN TYPE</p>
              </div>
              <p className="text-xs font-bold text-on-surface">{card.planName}</p>
              <p className="text-[9px] text-on-surface-variant font-medium">Up to {card.planId?.maxMembers || 1} members</p>
            </div>

            {/* Status Card */}
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <p className="text-[9px] font-bold tracking-wider">STATUS</p>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-on-surface capitalize">{card.status}</p>
                {card.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>}
              </div>
              <p className="text-[9px] text-on-surface-variant font-medium">
                Renewal: {new Date(card.validTill).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/FinalLogo.png';
                link.download = `MedCred-${card.cardId}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="w-full bg-primary text-on-primary py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Download Card
            </button>
            <button 
              onClick={() => alert(`Renewal options will be presented 30 days prior to ${new Date(card.validTill).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}.`)}
              className="w-full bg-transparent border-2 border-primary text-primary py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary-fixed/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">autorenew</span>
              Renew Card
            </button>
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}
