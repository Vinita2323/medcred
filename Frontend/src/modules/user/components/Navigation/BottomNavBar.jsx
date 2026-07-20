import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isLoggedIn, getUser } from '../../utils/storage';

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const user = getUser();
  const hasCard = user && user.cardId;

  const getTabClass = (isActive) => {
    const baseClass = "flex flex-col items-center justify-center rounded-xl py-1 px-0.5 active:scale-90 transition-all duration-200 cursor-pointer flex-1 min-w-0 text-[10px]";
    if (isActive) {
      return `${baseClass} bg-primary text-white font-bold shadow-sm`;
    }
    return `${baseClass} text-on-surface-variant hover:bg-surface-container-high font-semibold`;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-center gap-0.5 items-center px-2 py-2 pb-[calc(8px+env(safe-area-inset-bottom))] bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_12px_rgba(0,82,204,0.08)] rounded-t-xl box-sizing-border-box overflow-hidden">
      <div 
        onClick={() => navigate('/dashboard')} 
        className={getTabClass(path === '/dashboard')}
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: path === '/dashboard' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
        <span>Home</span>
      </div>

      <div 
        onClick={() => navigate(hasCard ? '/card' : '/membership-plans')} 
        className={getTabClass(path === '/membership-plans' || path === '/card')}
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: (path === '/membership-plans' || path === '/card') ? "'FILL' 1" : "'FILL' 0" }}>
          {hasCard ? 'badge' : 'add_card'}
        </span>
        <span>{hasCard ? 'My Card' : 'Buy Card'}</span>
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
        onClick={() => {
          if (isLoggedIn()) {
            navigate('/profile');
          } else {
            navigate('/login');
          }
        }} 
        className={getTabClass(path === '/profile')}
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: path === '/profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
        <span>Profile</span>
      </div>
    </nav>
  );
}
