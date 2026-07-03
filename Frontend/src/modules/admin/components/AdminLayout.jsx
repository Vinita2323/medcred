import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../../../services/types';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

const menuGroups = [
  {
    title: 'Core Management',
    items: [
      { label: 'Dashboard',       icon: 'dashboard',             route: '/admin/dashboard' },
      { label: 'User Management', icon: 'manage_accounts',       route: '/admin/users' },
      { label: 'Family Cards',    icon: 'family_history',        route: '/admin/family-cards' },
      { label: 'Products',        icon: 'inventory_2',           route: '/admin/products' },
      { label: 'Orders',          icon: 'local_shipping',        route: '/admin/orders' },
      { label: 'Agents',          icon: 'badge',                 route: '/admin/agents' },
      { label: 'Hospitals',       icon: 'local_hospital',        route: '/admin/hospitals' },
    ]
  },
  {
    title: 'Financial & Claims',
    items: [
      { label: 'Claims',          icon: 'description',           route: '/admin/claims' },
      { label: 'Loan Monitor',    icon: 'payments',              route: '/admin/loans' },
      { label: 'Settlements',     icon: 'account_balance_wallet',route: '/admin/settlements' },
      { label: 'Transactions',    icon: 'receipt_long',          route: '/admin/transactions' },
    ]
  },
  {
    title: 'System & Support',
    items: [
      { label: 'Security & Fraud',icon: 'security',              route: '/admin/security' },
      { label: 'Helpdesk Inbox',  icon: 'support_agent',         route: '/admin/support' },
      { label: 'Notifications',   icon: 'notifications_active',  route: '/admin/notifications' },
      { label: 'Reports',         icon: 'analytics',             route: '/admin/reports' },
      { label: 'Platform Settings',icon: 'settings',             route: '/admin/settings' },
    ]
  }
];

const PAGE_TITLES = {
  '/admin/dashboard':     'Admin Dashboard',
  '/admin/users':         'User Management',
  '/admin/products':      'Product Catalog',
  '/admin/orders':        'Product Orders',
  '/admin/family-cards':  'Family Card Management',
  '/admin/claims':        'Claim Management',
  '/admin/loans':         'Loan Eligibility Monitor',
  '/admin/agents':        'Agent Management',
  '/admin/hospitals':     'Hospital Network',
  '/admin/settlements':   'Agent Settlements',
  '/admin/transactions':  'Global Ledger',
  '/admin/security':      'Security & Fraud',
  '/admin/support':       'Support Helpdesk',
  '/admin/notifications': 'Notification Management',
  '/admin/reports':       'Reports & Analytics',
  '/admin/settings':      'Platform Settings',
};

export default function AdminLayout() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [adminUser, setAdminUser]   = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (raw) setAdminUser(JSON.parse(raw));
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchPendingCount();

    // Poll every 10 seconds for new orders
    const interval = setInterval(fetchPendingCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const res = await api.get(ENDPOINTS.ADMIN_ORDERS_PENDING_COUNT);
      if (res.data?.success) {
        setPendingCount(res.data.count);
      }
    } catch (err) {
      console.error('Error fetching pending count:', err);
    }
  };

  if (!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    navigate('/admin/login');
  };

  const title = PAGE_TITLES[location.pathname] || 'Admin Panel';

  const SidebarNav = ({ onNav }) => (
    <nav className="flex-grow py-6 px-4 overflow-y-auto space-y-6 hide-scrollbar">
      {menuGroups.map((group, i) => (
        <div key={i} className="space-y-1">
          <p className="px-4 text-[10px] font-bold text-[#737685] uppercase tracking-widest mb-2">{group.title}</p>
          {group.items.map((item) => {
            const active = location.pathname === item.route;
            return (
              <button
                key={item.route}
                onClick={() => { navigate(item.route); onNav && onNav(); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-[#003d9b] text-white shadow-sm'
                    : 'text-[#434654] hover:bg-[#f0f4ff] hover:text-[#003d9b]'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="bg-[#faf8ff] text-[#191b23] min-h-screen flex flex-col md:flex-row">

      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#c3c6d6]/25 h-screen fixed top-0 left-0 z-40">
        {/* Brand */}
        <div className="py-4 flex flex-col justify-center px-6 border-b border-[#c3c6d6]/20 shrink-0">
          <img src="/FinalLogo.png" alt="MedCred" className="h-8 w-auto object-contain object-left" />
          <p className="text-[10px] font-bold text-[#516161] uppercase tracking-widest mt-1.5">Admin Panel</p>
        </div>

        <SidebarNav />

        {/* User Footer */}
        <div className="p-4 border-t border-[#c3c6d6]/20 bg-[#faf8ff] shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#003d9b] text-white font-bold text-sm flex items-center justify-center shrink-0">
              {adminUser?.fullName?.charAt(0) || adminUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#191b23] truncate">{adminUser?.fullName || adminUser?.name || 'Administrator'}</p>
              <p className="text-[10px] text-[#0052cc] font-semibold">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile Drawer Overlay ─────────────────────────────── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-50"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-64 bg-white h-full flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="py-4 flex items-center justify-between px-4 border-b border-[#c3c6d6]/20">
              <div className="flex flex-col justify-center">
                <img src="/FinalLogo.png" alt="MedCred" className="h-7 w-auto object-contain object-left" />
                <span className="font-bold text-[#516161] text-[10px] uppercase tracking-widest mt-1.5">Admin Panel</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="material-symbols-outlined text-[#434654] p-1.5 hover:bg-[#f3f3fd] rounded-full cursor-pointer -mt-4"
              >
                close
              </button>
            </div>

            <SidebarNav onNav={() => setDrawerOpen(false)} />

            <div className="p-3 border-t border-[#c3c6d6]/20 shrink-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-grow flex flex-col md:pl-64 min-h-screen">

        {/* Top Header */}
        <header className="fixed top-0 left-0 md:left-64 right-0 z-30 flex justify-between items-center px-4 md:px-8 h-16 bg-white shadow-sm border-b border-[#c3c6d6]/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden material-symbols-outlined text-[#434654] p-1.5 hover:bg-[#f3f3fd] rounded-full cursor-pointer"
            >
              menu
            </button>
            <h2 className="text-base md:text-lg font-bold text-[#191b23] tracking-tight">{title}</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/notifications')}
              className="p-2 rounded-full hover:bg-[#f3f3fd] transition-colors relative cursor-pointer"
              title={pendingCount > 0 ? `${pendingCount} pending orders` : "No new orders"}
            >
              <span className="material-symbols-outlined text-[#434654]">notifications</span>
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] font-bold text-white items-center justify-center">{pendingCount}</span>
                </span>
              )}
            </button>
            <div
              onClick={() => {}}
              className="w-9 h-9 rounded-full bg-[#003d9b] flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 shadow-sm"
            >
              {adminUser?.fullName?.charAt(0) || adminUser?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow pt-20 px-4 md:px-8 pb-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
