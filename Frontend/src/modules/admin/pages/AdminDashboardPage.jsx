import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Seed mock data into localStorage if absent ─────────── */
function seedData() {
  if (!localStorage.getItem('medcred_users')) {
    const users = [
      { id: 'USR001', name: 'Arjun Mehta',    mobile: '9876543210', email: 'arjun@email.com', kyc: 'Verified',  cardStatus: 'Active',   plan: 'Premium', registeredAt: '2026-01-10', status: 'Active' },
      { id: 'USR002', name: 'Priya Sharma',   mobile: '9123456780', email: 'priya@email.com', kyc: 'Pending',   cardStatus: 'Pending',  plan: 'Basic',   registeredAt: '2026-02-14', status: 'Active' },
      { id: 'USR003', name: 'Rohan Gupta',    mobile: '9988776655', email: 'rohan@email.com', kyc: 'Verified',  cardStatus: 'Active',   plan: 'Elite',   registeredAt: '2026-01-22', status: 'Active' },
      { id: 'USR004', name: 'Sneha Patil',    mobile: '8877665544', email: 'sneha@email.com', kyc: 'Rejected',  cardStatus: 'Suspended',plan: 'None',    registeredAt: '2026-03-05', status: 'Blocked' },
      { id: 'USR005', name: 'Vikram Singh',   mobile: '7766554433', email: 'vikram@email.com',kyc: 'Verified',  cardStatus: 'Active',   plan: 'Premium', registeredAt: '2026-02-28', status: 'Active' },
      { id: 'USR006', name: 'Anjali Desai',   mobile: '6655443322', email: 'anjali@email.com',kyc: 'Pending',   cardStatus: 'Pending',  plan: 'Basic',   registeredAt: '2026-04-01', status: 'Active' },
      { id: 'USR007', name: 'Karan Patel',    mobile: '5544332211', email: 'karan@email.com', kyc: 'Verified',  cardStatus: 'Active',   plan: 'Elite',   registeredAt: '2026-03-18', status: 'Active' },
      { id: 'USR008', name: 'Meera Joshi',    mobile: '9090909090', email: 'meera@email.com', kyc: 'Verified',  cardStatus: 'Expired',  plan: 'Basic',   registeredAt: '2025-12-01', status: 'Active' },
    ];
    localStorage.setItem('medcred_users', JSON.stringify(users));
  }

  if (!localStorage.getItem('medcred_claims')) {
    const claims = [
      { id: 'CLM001', userId: 'USR001', userName: 'Arjun Mehta',  type: 'Hospital',      amount: 85000,  status: 'Under Review',  submittedAt: '2026-06-01', documents: ['Hospital Bill', 'Discharge Summary'] },
      { id: 'CLM002', userId: 'USR003', userName: 'Rohan Gupta',  type: 'Home Treatment', amount: 22000,  status: 'Submitted',     submittedAt: '2026-06-05', documents: ['Medicine Bills', 'Consultation Docs'] },
      { id: 'CLM003', userId: 'USR005', userName: 'Vikram Singh', type: 'Hospital',      amount: 150000, status: 'Approved',      submittedAt: '2026-05-20', documents: ['Hospital Bill', 'Medical Reports'] },
      { id: 'CLM004', userId: 'USR007', userName: 'Karan Patel',  type: 'Home Treatment', amount: 45000,  status: 'Rejected',      submittedAt: '2026-05-28', documents: ['Medicine Bills'] },
      { id: 'CLM005', userId: 'USR002', userName: 'Priya Sharma', type: 'Hospital',      amount: 120000, status: 'Verification Pending', submittedAt: '2026-06-10', documents: ['Hospital Bill', 'Prescription'] },
      { id: 'CLM006', userId: 'USR001', userName: 'Arjun Mehta',  type: 'Home Treatment', amount: 18000,  status: 'Completed',     submittedAt: '2026-04-15', documents: ['Medicine Bills'] },
    ];
    localStorage.setItem('medcred_claims', JSON.stringify(claims));
  }

  if (!localStorage.getItem('medcred_loans')) {
    const loans = [
      { id: 'LN001', userId: 'USR001', userName: 'Arjun Mehta',  cardPurchaseDate: '2026-01-10', status: 'Eligible',     applicationStatus: 'Applied',   amount: 250000 },
      { id: 'LN002', userId: 'USR002', userName: 'Priya Sharma', cardPurchaseDate: '2026-02-14', status: 'Waiting',      applicationStatus: 'Not Applied', daysLeft: 12 },
      { id: 'LN003', userId: 'USR003', userName: 'Rohan Gupta',  cardPurchaseDate: '2026-01-22', status: 'Eligible',     applicationStatus: 'Approved',  amount: 300000 },
      { id: 'LN004', userId: 'USR005', userName: 'Vikram Singh', cardPurchaseDate: '2026-02-28', status: 'Eligible',     applicationStatus: 'Applied',   amount: 200000 },
      { id: 'LN005', userId: 'USR006', userName: 'Anjali Desai', cardPurchaseDate: '2026-04-01', status: 'Not Eligible', applicationStatus: 'Not Applied', daysLeft: 16 },
    ];
    localStorage.setItem('medcred_loans', JSON.stringify(loans));
  }

  if (!localStorage.getItem('medcred_hospitals')) {
    const hospitals = [
      { id: 'HOS001', name: 'Apollo Hospitals',       location: 'Mumbai, Maharashtra',    contact: '+91-22-6676-0000', claimEnabled: true,  status: 'Active',  network: true  },
      { id: 'HOS002', name: 'Fortis Healthcare',      location: 'Bangalore, Karnataka',   contact: '+91-80-6621-4444', claimEnabled: true,  status: 'Active',  network: true  },
      { id: 'HOS003', name: 'Narayana Health',        location: 'Kolkata, West Bengal',   contact: '+91-33-7122-2222', claimEnabled: true,  status: 'Active',  network: true  },
      { id: 'HOS004', name: 'Max Super Speciality',   location: 'New Delhi',              contact: '+91-11-2651-5050', claimEnabled: false, status: 'Pending', network: false },
      { id: 'HOS005', name: 'Manipal Hospitals',      location: 'Pune, Maharashtra',      contact: '+91-20-6672-4444', claimEnabled: true,  status: 'Active',  network: true  },
      { id: 'HOS006', name: 'Kokilaben Hospital',     location: 'Mumbai, Maharashtra',    contact: '+91-22-3069-9999', claimEnabled: false, status: 'Pending', network: false },
    ];
    localStorage.setItem('medcred_hospitals', JSON.stringify(hospitals));
  }

  if (!localStorage.getItem('medcred_family_members')) {
    const members = [
      { id: 'FM001', primaryUser: 'Arjun Mehta', primaryId: 'USR001', memberName: 'Sunita Mehta',  relation: 'Spouse', aadhaarStatus: 'Verified', status: 'Active' },
      { id: 'FM002', primaryUser: 'Arjun Mehta', primaryId: 'USR001', memberName: 'Ravi Mehta',    relation: 'Father', aadhaarStatus: 'Verified', status: 'Active' },
      { id: 'FM003', primaryUser: 'Rohan Gupta', primaryId: 'USR003', memberName: 'Anita Gupta',   relation: 'Spouse', aadhaarStatus: 'Pending',  status: 'Pending' },
      { id: 'FM004', primaryUser: 'Vikram Singh',primaryId: 'USR005', memberName: 'Kavita Singh',  relation: 'Spouse', aadhaarStatus: 'Verified', status: 'Active' },
      { id: 'FM005', primaryUser: 'Vikram Singh',primaryId: 'USR005', memberName: 'Aryan Singh',   relation: 'Child',  aadhaarStatus: 'Verified', status: 'Active' },
      { id: 'FM006', primaryUser: 'Karan Patel', primaryId: 'USR007', memberName: 'Rekha Patel',   relation: 'Mother', aadhaarStatus: 'Rejected', status: 'Suspended' },
    ];
    localStorage.setItem('medcred_family_members', JSON.stringify(members));
  }
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [activities, setActivities] = useState([]);
  const [claimBreakdown, setClaimBreakdown] = useState([]);
  const [topAgents, setTopAgents] = useState([]);

  useEffect(() => {
    seedData();
    const users    = JSON.parse(localStorage.getItem('medcred_users') || '[]');
    const claims   = JSON.parse(localStorage.getItem('medcred_claims') || '[]');
    const agents   = JSON.parse(localStorage.getItem('medcred_agents') || '[]');
    const hospitals= JSON.parse(localStorage.getItem('medcred_hospitals') || '[]');

    const activeCards   = users.filter(u => u.cardStatus === 'Active').length;
    const pendingClaims = claims.filter(c => ['Submitted','Under Review','Verification Pending'].includes(c.status)).length;
    const activeAgents  = agents.filter(a => a.status === 'Approved').length;
    const revenue       = claims.filter(c => c.status === 'Approved' || c.status === 'Completed').reduce((s, c) => s + c.amount, 0);
    const pendingKYC    = users.filter(u => u.kyc === 'Pending').length;

    setStats([
      { label: 'Total Users',          value: users.length,    icon: 'group',               color: 'text-[#003d9b]', bg: 'bg-[#dae2ff]', route: '/admin/users' },
      { label: 'Active Cards',         value: activeCards,     icon: 'credit_card',         color: 'text-green-700', bg: 'bg-green-100', route: '/admin/users' },
      { label: 'Pending Claims',       value: pendingClaims,   icon: 'description',         color: 'text-orange-600',bg: 'bg-orange-100', route: '/admin/claims' },
      { label: 'Active Agents',        value: activeAgents,    icon: 'badge',               color: 'text-[#0c56d0]', bg: 'bg-[#d4e6ff]', route: '/admin/agents' },
      { label: 'Total Revenue',        value: `₹${(revenue/100000).toFixed(1)}L`, icon: 'payments', color: 'text-purple-700', bg: 'bg-purple-100', route: '/admin/reports' },
      { label: 'Pending Verifications',value: pendingKYC,      icon: 'verified_user',       color: 'text-red-600',   bg: 'bg-red-100',   route: '/admin/users' },
    ]);

    const breakdown = [
      { label: 'Submitted',           count: claims.filter(c => c.status === 'Submitted').length,           color: 'bg-blue-500' },
      { label: 'Under Review',        count: claims.filter(c => c.status === 'Under Review').length,        color: 'bg-yellow-500' },
      { label: 'Verification Pending',count: claims.filter(c => c.status === 'Verification Pending').length,color: 'bg-orange-500' },
      { label: 'Approved',            count: claims.filter(c => c.status === 'Approved').length,            color: 'bg-green-500' },
      { label: 'Rejected',            count: claims.filter(c => c.status === 'Rejected').length,            color: 'bg-red-500' },
      { label: 'Completed',           count: claims.filter(c => c.status === 'Completed').length,           color: 'bg-teal-500' },
    ];
    setClaimBreakdown(breakdown);

    const approvedAgents = agents.filter(a => a.status === 'Approved').slice(0, 4);
    setTopAgents(approvedAgents);

    setActivities([
      { icon: 'person_add',    bg: 'bg-[#dae2ff]', text: 'text-[#003d9b]', title: 'New User Registered',    desc: 'Anjali Desai completed registration via Agent portal.', time: '5 min ago' },
      { icon: 'description',   bg: 'bg-orange-100',text: 'text-orange-700',title: 'Claim Submitted',         desc: 'CLM005 — Priya Sharma submitted a ₹1,20,000 hospital claim.', time: '18 min ago' },
      { icon: 'verified_user', bg: 'bg-green-100', text: 'text-green-700',  title: 'KYC Verified',           desc: 'Karan Patel\'s Aadhaar verification completed successfully.', time: '1 hr ago' },
      { icon: 'badge',         bg: 'bg-purple-100',text: 'text-purple-700', title: 'Agent Pending Approval', desc: 'New field agent Suresh Kumar awaiting admin approval.', time: '2 hr ago' },
      { icon: 'local_hospital',bg: 'bg-[#d4e6ff]', text: 'text-[#0c56d0]', title: 'Hospital Added',          desc: 'Kokilaben Hospital, Mumbai submitted for network approval.', time: '3 hr ago' },
    ]);
  }, []);

  const quickActions = [
    { label: 'Review Claims',    icon: 'description',  route: '/admin/claims',        color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
    { label: 'Approve Agents',   icon: 'how_to_reg',   route: '/admin/agents',        color: 'bg-[#f0f4ff] text-[#003d9b] hover:bg-[#dae2ff]' },
    { label: 'Verify Users',     icon: 'verified_user',route: '/admin/users',         color: 'bg-green-50 text-green-700 hover:bg-green-100' },
    { label: 'Add Hospital',     icon: 'local_hospital',route: '/admin/hospitals',    color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
    { label: 'Send Notification',icon: 'send',          route: '/admin/notifications',color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
    { label: 'View Reports',     icon: 'analytics',     route: '/admin/reports',      color: 'bg-red-50 text-red-700 hover:bg-red-100' },
  ];

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-[#516161]">
        <span className="animate-spin material-symbols-outlined text-3xl text-[#003d9b] mr-3">progress_activity</span>
        Loading dashboard...
      </div>
    );
  }

  const totalClaims = claimBreakdown.reduce((s, c) => s + c.count, 0) || 1;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Hero Banner ───────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#001a4d] via-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-20 -mb-20 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">
              MedCred India · Control Center
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin Dashboard</h2>
            <p className="text-sm text-white/80 max-w-lg">
              Complete oversight of users, claims, agents, hospitals, and financials across the MedCred platform.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-white/60 font-semibold">Last updated</p>
              <p className="text-sm font-bold">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                admin_panel_settings
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── KPI Stats Grid ───────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            onClick={() => navigate(stat.route)}
            className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className={`w-11 h-11 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
            <p className="text-xs text-[#516161] font-semibold">{stat.label}</p>
            <p className="text-2xl font-extrabold text-[#191b23] mt-1">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* ── Middle Row: Quick Actions + Claims Breakdown ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Quick Actions */}
        <section className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-extrabold text-[#191b23] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((qa, i) => (
              <button
                key={i}
                onClick={() => navigate(qa.route)}
                className={`flex items-center gap-3 p-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${qa.color}`}
              >
                <span className="material-symbols-outlined text-[20px]">{qa.icon}</span>
                {qa.label}
              </button>
            ))}
          </div>
        </section>

        {/* Claims Status Breakdown */}
        <section className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-extrabold text-[#191b23]">Claims Overview</h3>
            <button onClick={() => navigate('/admin/claims')} className="text-xs font-bold text-[#0052cc] hover:underline cursor-pointer">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {claimBreakdown.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <p className="text-xs font-semibold text-[#516161] w-40 shrink-0">{item.label}</p>
                <div className="flex-1 bg-[#f5f8ff] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${item.color} transition-all duration-700`}
                    style={{ width: `${Math.round((item.count / totalClaims) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-extrabold text-[#191b23] w-5 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Bottom Row: Top Agents + Activity Feed ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Performing Agents */}
        <section className="bg-white border border-[#c3c6d6]/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex justify-between items-center px-5 py-4 border-b border-[#c3c6d6]/20">
            <h3 className="text-base font-extrabold text-[#191b23]">Top Performing Agents</h3>
            <button onClick={() => navigate('/admin/agents')} className="text-xs font-bold text-[#0052cc] hover:underline cursor-pointer">View All</button>
          </div>
          {topAgents.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#516161]">
              <span className="material-symbols-outlined text-3xl mb-2 block text-[#c3c6d6]">badge</span>
              No approved agents yet. Approve agents to see them here.
            </div>
          ) : (
            <div className="divide-y divide-[#c3c6d6]/10">
              {topAgents.map((agent, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#faf8ff] transition-colors">
                  <div className="w-9 h-9 rounded-full bg-[#dae2ff] text-[#003d9b] font-extrabold text-sm flex items-center justify-center shrink-0">
                    {agent.fullName?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-[#191b23] truncate">{agent.fullName}</p>
                    <p className="text-[11px] text-[#516161]">{agent.role} · {agent.salesCount || 0} sales</p>
                  </div>
                  <span className="text-xs font-extrabold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full shrink-0">
                    ₹{((agent.earnings || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Activity Feed */}
        <section className="bg-white border border-[#c3c6d6]/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#c3c6d6]/20">
            <h3 className="text-base font-extrabold text-[#191b23]">Recent Activity</h3>
          </div>
          <div className="divide-y divide-[#c3c6d6]/10">
            {activities.map((act, i) => (
              <div key={i} className="flex gap-3 px-5 py-3.5 hover:bg-[#faf8ff] transition-colors">
                <div className={`w-9 h-9 ${act.bg} ${act.text} rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-[18px]">{act.icon}</span>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-[#191b23]">{act.title}</p>
                    <span className="text-[10px] text-[#737685] font-semibold shrink-0 ml-2">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-[#516161] mt-0.5 leading-relaxed">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
