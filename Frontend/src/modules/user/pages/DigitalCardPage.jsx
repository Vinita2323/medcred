import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';

export default function DigitalCardPage() {
  const navigate = useNavigate();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

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
                  <h2 className="text-base font-bold tracking-tight">MedCred Premium</h2>
                </div>
                <span className="material-symbols-outlined text-3xl opacity-90" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
              </div>
              
              <div className="flex items-end justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="text-[8px] text-on-primary-container opacity-70 uppercase">Card Holder</p>
                    <p className="text-base font-bold">Rahul Sharma</p>
                  </div>
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[8px] text-on-primary-container opacity-70 uppercase">Card ID</p>
                      <p className="text-xs font-semibold tracking-wider font-mono">MC-9928-1004</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-on-primary-container opacity-70 uppercase">Validity</p>
                      <p className="text-xs font-semibold font-mono">12/28</p>
                    </div>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-lg bg-white/20 backdrop-blur-md p-1 border border-white/30">
                  <img 
                    alt="Mini QR" 
                    className="w-full h-full object-contain filter invert opacity-90" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfaYSloTfsRjaeCcbBphJHf9p5KUmii-ZyE0_szQUYqXXoRSPCkL-ZKbO85I3wk5v_7DnjYGcyqeC4fJNL2v5N5XIbIBJuuM0GjZORoqemGE6LnWhUeifhhrNhCahtogWXSyupNMIkIHD8SqcvK-sYm0zrrUo1kZsP4jucM4WlRnVDTTppPjaSwThM4pf08VIL4Vt-0h0bnuA-4AKGEtL0xhiAmbmuJ7MjIcjnyO9YKe1jz-6cHI2A9N_8HUIu94GGd97hwH7Q2i1Q"
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
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwI8n2SafwjLly_dNM4lxvbdSZsBJaLtBYUnhVPSTvtygARmrUspTBATM7giYJUk7wBHRmlcMrLiUNsy-GXY7FwT6H9OQM_R9GMpUV6eLTpDBRtwYSW6JUrsQWEBvRQdhfja__k9tJgQXfUNZI_p3VPujMFMl6BzBXjWe1qNE2NWdtdtm71jwmSSoaiaHj5mP_6RwCqPVtyr9udMczsJl6WqGtp9le5S_KX-doicRIo4X4yi_iT2qv_PpN7KqYPk1xw1aH8ItqDdh6"
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
              <p className="text-xs font-bold text-on-surface">Family Premium</p>
              <p className="text-[9px] text-on-surface-variant font-medium">Up to 4 dependents</p>
            </div>

            {/* Status Card */}
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <p className="text-[9px] font-bold tracking-wider">STATUS</p>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-on-surface">Active</p>
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
              </div>
              <p className="text-[9px] text-on-surface-variant font-medium">Renewal: Dec 2028</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button 
              onClick={() => alert("Card PDF copy downloaded to your device.")}
              className="w-full bg-primary text-on-primary py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Download Card
            </button>
            <button 
              onClick={() => alert("Renewal options will be presented 30 days prior to Dec 2028.")}
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
