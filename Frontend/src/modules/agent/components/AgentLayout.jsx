import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { STORAGE_KEYS, ENDPOINTS, getImageUrl } from '../../../services/types';
import api from '../../../services/api';

export default function AgentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const handleFocusIn = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        setIsKeyboardOpen(true);
      }
    };
    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  useEffect(() => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userJson) {
      setCurrentUser(JSON.parse(userJson));
      // Silently fetch latest profile data from DB so promotions/rank upgrades reflect immediately on refresh
      api.get(ENDPOINTS.AGENT_PROFILE).then(res => {
        if (res.data?.success) {
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(res.data.data));
          setCurrentUser(res.data.data);
        }
      }).catch(err => console.error('Failed to refresh agent profile:', err));
    } else {
      setCurrentUser({ fullName: 'Mock Super Agent', role: 'Super Agent', rank: 'Platinum' });
    }
  }, []);

  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileDrawerOpen]);

  const getMenuItems = () => {
    if (!currentUser) return [];

    if (currentUser.role === 'Admin') {
      return [
        { label: 'Dashboard', icon: 'dashboard', route: '/agent/dashboard' },
        { label: 'Approvals & Engine', icon: 'how_to_reg', route: '/agent/admin' },
        { label: 'Company Wallet', icon: 'account_balance_wallet', route: '/agent/wallet' },
        { label: 'Admin Profile', icon: 'account_circle', route: '/agent/profile' },
      ];
    }

    const baseItems = [
      { label: 'Dashboard', icon: 'dashboard', route: '/agent/dashboard' },
      { label: 'Register Customer', icon: 'person_add', route: '/agent/register-customer' },
      { label: 'Apply Loan', icon: 'payments', route: '/agent/apply-loan' },
      { label: 'Customer Directory', icon: 'group', route: '/agent/customers' },
      { label: 'Refer & Earn', icon: 'share', route: '/agent/referrals' }
    ];

    if (currentUser.role !== 'Field Agent') {
      baseItems.splice(4, 0, { label: 'Team Management', icon: 'partner_exchange', route: '/agent/team' });
    }

    baseItems.push(
      { label: 'Agent Wallet', icon: 'account_balance_wallet', route: '/agent/wallet' },
      { label: 'Agent Profile', icon: 'account_circle', route: '/agent/profile' }
    );

    return baseItems;
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    try {
      await api.post(ENDPOINTS.AUTH_LOGOUT);
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      navigate('/agent/login');
    }
  };

  // Determine header title based on route
  const getHeaderTitle = () => {
    switch (location.pathname) {
      case '/agent/dashboard':
        return 'Agent Workspace';
      case '/agent/register-customer':
        return 'Register Customer';
      case '/agent/wallet':
        return currentUser?.role === 'Admin' ? 'Company Commission Pool' : 'Agent Wallet & Earnings';
      case '/agent/customers':
        return 'Customer Directory';
      case '/agent/profile':
        return currentUser?.role === 'Admin' ? 'Admin Profile Settings' : 'Agent Profile';
      case '/agent/apply-loan':
        return 'Apply for Medical Loan';
      case '/agent/team':
        return 'Team Management';
      case '/agent/admin':
        return 'Roster & Approvals';
      case '/agent/referrals':
        return 'Refer & Earn';
      default:
        return 'Agent Portal';
    }
  };

  return (
    <div className="bg-[#faf8ff] text-[#191b23] min-h-screen font-body-md flex flex-col md:flex-row">

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#c3c6d6]/20 h-screen fixed top-0 left-0 z-40">
        {/* Brand/Logo */}
        <div className="h-32 flex flex-col justify-center items-center border-b border-[#c3c6d6]/20 py-3 bg-[#fdfcff]">
          <img src="/Logo (5).png" alt="MedCred Logo" className="h-20 w-auto object-contain" />
          <span className="text-[11px] font-extrabold text-[#003d9b] uppercase tracking-widest mt-1">Agent Panel</span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-grow py-6 px-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.route;
            return (
              <button
                key={idx}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${isActive
                  ? 'bg-[#003d9b] text-white shadow-sm'
                  : 'text-[#434654] hover:bg-[#f3f3fd] hover:text-[#003d9b]'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / Agent Profile Summary */}
        <div className="p-4 border-t border-[#c3c6d6]/20 bg-[#faf8ff]">
          <div 
            onClick={() => navigate('/agent/profile')}
            className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-[#f3f3fd] p-1.5 rounded-lg transition-all"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#003d9b]/20 flex-shrink-0 bg-[#003d9b]/10 flex items-center justify-center font-bold text-[#003d9b] text-sm">
              {currentUser?.profilePhotoUrl ? (
                <img 
                  src={getImageUrl(currentUser.profilePhotoUrl)} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(''); }}
                />
              ) : (
                currentUser ? currentUser.fullName.charAt(0) : 'A'
              )}
            </div>
            <div className="min-w-0 flex-grow">
              <p className="text-xs font-bold text-[#191b23] truncate">{currentUser ? currentUser.fullName : 'Loading...'}</p>
              <p className="text-[10px] text-[#0052cc] font-semibold">{currentUser ? `${currentUser.role} (${currentUser.rank || 'Partner'})` : 'Partner'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar/Drawer Menu Overlay (hidden on desktop) */}
      {isMobileDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div
            className="w-64 bg-white h-full flex flex-col shadow-2xl animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-32 flex items-start justify-between px-4 border-b border-[#c3c6d6]/20 py-4 relative bg-[#fdfcff]">
              <div className="flex flex-col items-center w-full mt-1">
                <img src="/Logo (5).png" alt="MedCred Logo" className="h-18 w-auto object-contain" />
                <span className="text-[10px] font-extrabold text-[#003d9b] uppercase tracking-widest mt-1">Agent Panel</span>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="absolute right-3 top-3 material-symbols-outlined text-[#434654] p-1.5 hover:bg-[#f3f3fd] rounded-full"
              >
                close
              </button>
            </div>
            <nav className="flex-grow py-4 px-3 space-y-1">
              {menuItems.map((item, idx) => {
                const isActive = location.pathname === item.route;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      navigate(item.route);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${isActive ? 'bg-[#003d9b] text-white' : 'text-[#434654] hover:bg-[#f3f3fd]'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-3 border-t border-[#c3c6d6]/20 bg-[#faf8ff]">
              <div 
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  navigate('/agent/profile');
                }}
                className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-[#f3f3fd] p-1.5 rounded-lg transition-all"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#003d9b]/20 flex-shrink-0 bg-[#003d9b]/10 flex items-center justify-center font-bold text-[#003d9b] text-sm">
                  {currentUser?.profilePhotoUrl ? (
                    <img 
                      src={getImageUrl(currentUser.profilePhotoUrl)} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(''); }}
                    />
                  ) : (
                    currentUser ? currentUser.fullName.charAt(0) : 'A'
                  )}
                </div>
                <div className="min-w-0 flex-grow">
                  <p className="text-xs font-bold text-[#191b23] truncate">{currentUser ? currentUser.fullName : 'Loading...'}</p>
                  <p className="text-[10px] text-[#0052cc] font-semibold">{currentUser ? `${currentUser.role} (${currentUser.rank || 'Partner'})` : 'Partner'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col md:pl-64 min-h-screen">

        {/* Dynamic Top Header */}
        <header className="fixed top-0 left-0 md:left-64 right-0 w-auto z-30 flex justify-between items-center px-4 md:px-8 h-16 bg-white shadow-sm border-b border-[#c3c6d6]/20">
          <div className="flex items-center gap-3">
            {/* Hamburger menu for mobile drawer */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden material-symbols-outlined text-[#434654] p-1.5 hover:bg-[#f3f3fd] rounded-full cursor-pointer"
            >
              menu
            </button>
            <h2 className="text-base md:text-lg font-bold text-[#191b23] tracking-tight">{getHeaderTitle()}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div
              onClick={() => navigate('/agent/profile')}
              className="w-9 h-9 overflow-hidden rounded-full bg-[#0052cc] flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-90 transition-opacity text-sm shadow-sm"
            >
              {currentUser?.profilePhotoUrl ? (
                <img 
                  src={getImageUrl(currentUser.profilePhotoUrl)} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(''); }}
                />
              ) : (
                currentUser ? currentUser.fullName.charAt(0) : 'A'
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-grow pt-20 px-4 md:px-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Sticky Mobile Bottom Navigation (hidden on desktop) */}
        {!isKeyboardOpen && (
          <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 py-3 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.06)] border-t border-[#c3c6d6]/20">
            {menuItems.slice(0, 4).map((item, idx) => {
              const isActive = location.pathname === item.route;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(item.route)}
                  className={`flex flex-col items-center justify-center px-4 py-1 cursor-pointer transition-colors ${isActive ? 'text-[#003d9b]' : 'text-[#434654]'
                    }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-semibold">{item.label.split(' ')[0]}</span>
                </div>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
