import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const getTabClass = (isActive) => {
    if (isActive) {
      return "flex flex-col items-center justify-center bg-primary text-white rounded-xl px-2.5 py-1 active:scale-90 transition-all duration-200 cursor-pointer flex-1 max-w-[60px] mx-0.5 text-[10px] font-bold shadow-sm";
    }
    return "flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high active:scale-90 transition-all duration-200 px-2.5 py-1 rounded-xl cursor-pointer flex-1 max-w-[60px] mx-0.5 text-[10px] font-semibold";
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-center gap-1.5 items-center px-3 py-2 pb-[calc(8px+env(safe-area-inset-bottom))] bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_12px_rgba(0,82,204,0.08)] rounded-t-xl box-sizing-border-box overflow-hidden">
      <div 
        onClick={() => navigate('/dashboard')} 
        className={getTabClass(path === '/dashboard')}
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: path === '/dashboard' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
        <span>Home</span>
      </div>

      <div 
        onClick={() => navigate('/claims')} 
        className={getTabClass(path === '/claims')}
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: path === '/claims' ? "'FILL' 1" : "'FILL' 0" }}>description</span>
        <span>Claims</span>
      </div>

      <div 
        onClick={() => navigate('/loan')} 
        className={getTabClass(path === '/loan')}
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: path === '/loan' ? "'FILL' 1" : "'FILL' 0" }}>payments</span>
        <span>Loan</span>
      </div>

      <div 
        onClick={() => navigate('/wallet')} 
        className={getTabClass(path === '/wallet')}
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: path === '/wallet' ? "'FILL' 1" : "'FILL' 0" }}>account_balance_wallet</span>
        <span>Wallet</span>
      </div>

      <div 
        onClick={() => navigate('/profile')} 
        className={getTabClass(path === '/profile')}
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: path === '/profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
        <span>Profile</span>
      </div>
    </nav>
  );
}
