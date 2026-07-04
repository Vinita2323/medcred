import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { ENDPOINTS, SERVER_URL } from '../../../services/types';

const KYC_COLORS = {
  Verified: 'bg-green-100 text-green-700',
  Pending:  'bg-yellow-100 text-yellow-700',
  Rejected: 'bg-red-100 text-red-700',
};
const CARD_COLORS = {
  Active:    'bg-green-100 text-green-700',
  Pending:   'bg-yellow-100 text-yellow-700',
  Expired:   'bg-orange-100 text-orange-700',
  Suspended: 'bg-red-100 text-red-700',
  Blocked:   'bg-gray-100 text-gray-700',
};
const STATUS_COLORS = {
  Active:  'bg-[#dae2ff] text-[#003d9b]',
  Blocked: 'bg-red-100 text-red-700',
};

export default function AdminUsersPage() {
  const [users, setUsers]         = useState([]);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilter] = useState('All');
  const [filterKYC, setFilterKYC] = useState('All');
  const [drawer, setDrawer]       = useState(null);   // user object
  const [loading, setLoading]     = useState(false);

  const [drawerDetails, setDrawerDetails] = useState({ familyMembers: [], claims: [] });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.ADMIN_USERS);
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openDrawer = async (user) => {
    setDrawer(user);
    setDrawerDetails({ familyMembers: [], claims: [] }); // Reset while loading
    try {
      const res = await api.get(ENDPOINTS.ADMIN_USER_DETAILS(user.dbId));
      if (res.data?.success) {
        setDrawerDetails(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user details', error);
    }
  };

  const blockToggle = async (user) => {
    const newStatus = user.status === 'Blocked' ? 'active' : 'blocked';
    try {
      const res = await api.patch(ENDPOINTS.ADMIN_USER_STATUS(user.dbId), { status: newStatus });
      if (res.data?.success) {
        fetchUsers();
        if (drawer?.id === user.id) setDrawer(null); // Close drawer to refresh state properly
      }
    } catch (error) {
      console.error('Failed to update user status', error);
      alert('Failed to update user status');
    }
  };

  const verifyKYC = async (user) => {
    try {
      const endpoint = (user.kycRef && user.kycRef._id)
        ? ENDPOINTS.ADMIN_KYC_UPDATE(user.kycRef._id)
        : ENDPOINTS.ADMIN_USER_VERIFY_KYC(user.dbId);

      const res = await api.patch(endpoint, { status: 'verified' });
      
      if (res.data?.success) {
        // Refresh users
        fetchUsers();
        if (drawer?.id === user.id) setDrawer({ ...drawer, kyc: 'Verified' });
      } else {
        alert(res.data?.message || 'Failed to verify KYC');
      }
    } catch (err) {
      console.error('Error verifying KYC', err);
      alert('Error verifying KYC');
    }
  };

  const activateCard = async (user) => {
    try {
      const res = await api.patch(ENDPOINTS.ADMIN_USER_ACTIVATE_CARD(user.dbId));
      if (res.data?.success) {
        fetchUsers();
        if (drawer?.id === user.id) setDrawer(null); // Close drawer to refresh state properly
      }
    } catch (error) {
      console.error('Failed to activate card', error);
      alert('Failed to activate card');
    }
  };

  const toggleLoanBypass = async (user) => {
    try {
      const res = await api.patch(ENDPOINTS.ADMIN_USER_TOGGLE_LOAN_BYPASS(user.dbId));
      if (res.data?.success) {
        fetchUsers();
        if (drawer?.id === user.id) {
          setDrawer({ ...drawer, bypassLoanWaitingPeriod: res.data.data.bypassLoanWaitingPeriod });
        }
      }
    } catch (error) {
      console.error('Failed to toggle urgent loan bypass status', error);
      alert('Failed to update urgent loan bypass status');
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || u.name.toLowerCase().includes(q) || u.mobile.includes(q) || u.email.toLowerCase().includes(q);
    const matchS  = filterStatus === 'All' || u.status === filterStatus;
    const matchK  = filterKYC === 'All' || u.kyc === filterKYC;
    return matchQ && matchS && matchK;
  });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Admin Control</span>
          <h2 className="text-xl font-extrabold mt-1">User Management</h2>
          <p className="text-sm text-white/80 mt-1">View, verify, block and manage all registered users and their healthcare cards.</p>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',   value: users.length,                                         color: 'text-[#003d9b]', bg: 'bg-[#dae2ff]', icon: 'group' },
          { label: 'Active Cards',  value: users.filter(u=>u.cardStatus==='Active').length,      color: 'text-green-700',  bg: 'bg-green-100',  icon: 'credit_card' },
          { label: 'Pending KYC',   value: users.filter(u=>u.kyc==='Pending').length,            color: 'text-yellow-700', bg: 'bg-yellow-100', icon: 'verified_user' },
          { label: 'Blocked Users', value: users.filter(u=>u.status==='Blocked').length,         color: 'text-red-700',    bg: 'bg-red-100',    icon: 'block' },
        ].map((s,i) => (
          <div key={i} className="bg-white rounded-xl border border-[#c3c6d6]/20 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${s.bg} ${s.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-[#516161] font-semibold">{s.label}</p>
              <p className="text-xl font-extrabold text-[#191b23]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737685] text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search by name, mobile or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl text-sm focus:outline-none focus:border-[#003d9b] transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilter(e.target.value)}
          className="bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
        >
          {['All','Active','Blocked'].map(v=><option key={v}>{v}</option>)}
        </select>
        <select
          value={filterKYC}
          onChange={e => setFilterKYC(e.target.value)}
          className="bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
        >
          {['All','Verified','Pending','Rejected'].map(v=><option key={v}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#c3c6d6]/20 flex items-center justify-between">
          <h3 className="font-extrabold text-[#191b23]">All Users <span className="text-sm font-semibold text-[#516161]">({filtered.length})</span></h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">KYC</th>
                <th className="px-5 py-3">Card</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d6]/10">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-[#faf8ff]/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#dae2ff] text-[#003d9b] font-bold text-xs flex items-center justify-center shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#191b23]">{user.name}</p>
                        <p className="text-[10px] text-[#737685] font-mono">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs">
                    <p className="font-semibold text-[#191b23]">{user.mobile}</p>
                    <p className="text-[#737685]">{user.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${KYC_COLORS[user.kyc]}`}>{user.kyc}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${CARD_COLORS[user.cardStatus]}`}>{user.cardStatus}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-[#516161]">{user.plan}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[user.status]}`}>{user.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5 justify-center flex-wrap">
                      <button
                        onClick={() => openDrawer(user)}
                        className="bg-[#f0f4ff] hover:bg-[#dae2ff] text-[#003d9b] px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        View
                      </button>
                      {user.kyc === 'Pending' && (
                        <button
                          onClick={() => verifyKYC(user)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Verify KYC
                        </button>
                      )}
                      <button
                        onClick={() => blockToggle(user)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          user.status === 'Blocked'
                            ? 'bg-green-50 hover:bg-green-100 text-green-700'
                            : 'bg-red-50 hover:bg-red-100 text-red-600'
                        }`}
                      >
                        {user.status === 'Blocked' ? 'Unblock' : 'Block'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#516161] text-sm">
                    <span className="material-symbols-outlined text-3xl block mb-2 text-[#c3c6d6]">search_off</span>
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── User Detail Drawer ─────────────────────────────── */}
      {drawer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end sm:items-start sm:p-4" onClick={() => setDrawer(null)}>
          <div
            className="w-full max-w-[320px] bg-white h-full sm:h-fit sm:max-h-full sm:rounded-2xl overflow-y-auto shadow-2xl flex flex-col animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white border-b border-[#c3c6d6]/20 px-4 py-2.5 flex justify-between items-center z-10">
              <h3 className="font-extrabold text-[#191b23] text-sm">User Profile</h3>
              <button onClick={() => setDrawer(null)} className="material-symbols-outlined text-[#737685] hover:text-[#191b23] cursor-pointer text-[18px]">
                close
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-3.5 space-y-3.5">
              {/* Avatar & Name */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#dae2ff] text-[#003d9b] font-extrabold text-base flex items-center justify-center shrink-0">
                  {drawer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-[13px] font-extrabold text-[#191b23] leading-tight">{drawer.name}</h4>
                  <p className="text-[9px] text-[#516161] font-mono">{drawer.id}</p>
                  <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold ${STATUS_COLORS[drawer.status]}`}>{drawer.status}</span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Mobile',     value: drawer.mobile },
                  { label: 'Email',      value: drawer.email },
                  { label: 'KYC',        value: drawer.kyc },
                  { label: 'Card',       value: drawer.cardStatus },
                  { label: 'Plan',       value: drawer.plan },
                  { label: 'Registered', value: drawer.registeredAt },
                  { label: 'Loan Access', value: drawer.bypassLoanWaitingPeriod ? 'Urgent Access' : '30-Day Waiting' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#f5f8ff] rounded-lg p-2 border border-[#c3c6d6]/10">
                    <p className="text-[8px] text-[#737685] font-bold uppercase tracking-wider">{item.label}</p>
                    <p className="text-[11px] font-bold text-[#191b23] mt-0.5 truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* KYC Documents */}
              {drawerDetails.kycImages && (drawerDetails.kycImages.selfie || drawerDetails.kycImages.aadhaarFront || drawerDetails.kycImages.aadhaarBack) && (
                <div>
                  <h5 className="text-[9px] font-bold text-[#516161] uppercase tracking-wider mb-1">KYC Documents</h5>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {drawerDetails.kycImages.selfie && (
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden group relative">
                        <img src={`${SERVER_URL}${drawerDetails.kycImages.selfie}`} alt="Selfie" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[8px] text-white font-bold cursor-pointer" onClick={() => window.open(`${SERVER_URL}${drawerDetails.kycImages.selfie}`, '_blank')}>View</div>
                      </div>
                    )}
                    {drawerDetails.kycImages.aadhaarFront && (
                      <div className="flex-shrink-0 w-24 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden group relative">
                        <img src={`${SERVER_URL}${drawerDetails.kycImages.aadhaarFront}`} alt="Aadhaar Front" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[8px] text-white font-bold cursor-pointer" onClick={() => window.open(`${SERVER_URL}${drawerDetails.kycImages.aadhaarFront}`, '_blank')}>Aadhaar Front</div>
                      </div>
                    )}
                    {drawerDetails.kycImages.aadhaarBack && (
                      <div className="flex-shrink-0 w-24 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden group relative">
                        <img src={`${SERVER_URL}${drawerDetails.kycImages.aadhaarBack}`} alt="Aadhaar Back" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[8px] text-white font-bold cursor-pointer" onClick={() => window.open(`${SERVER_URL}${drawerDetails.kycImages.aadhaarBack}`, '_blank')}>Aadhaar Back</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Family Members */}
              <div>
                <h5 className="text-[9px] font-bold text-[#516161] uppercase tracking-wider mb-1">Family Members</h5>
                {drawerDetails.familyMembers.length === 0 ? (
                  <p className="text-[11px] text-[#737685]">No family members registered.</p>
                ) : (
                  <div className="space-y-1">
                    {drawerDetails.familyMembers.map((m, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#f5f8ff] border border-[#c3c6d6]/10 rounded-lg px-2.5 py-1.5">
                        <div>
                          <p className="text-[11px] font-bold text-[#191b23]">{m.memberName}</p>
                          <p className="text-[8px] text-[#737685]">{m.relation}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${KYC_COLORS[m.aadhaarStatus] || 'text-[#737685]'}`}>{m.aadhaarStatus}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Claims */}
              <div>
                <h5 className="text-[9px] font-bold text-[#516161] uppercase tracking-wider mb-1">Claim History</h5>
                {drawerDetails.claims.length === 0 ? (
                  <p className="text-[11px] text-[#737685]">No claims submitted.</p>
                ) : (
                  <div className="space-y-1">
                    {drawerDetails.claims.map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#f5f8ff] border border-[#c3c6d6]/10 rounded-lg px-2.5 py-1.5">
                        <div>
                          <p className="text-[10px] font-bold text-[#191b23]">{c.id} — {c.type}</p>
                          <p className="text-[8px] text-[#737685]">₹{c.amount?.toLocaleString('en-IN')} · {c.submittedAt}</p>
                        </div>
                        <span className="text-[8px] font-bold text-[#003d9b] bg-[#dae2ff] px-1.5 py-0.5 rounded">{c.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-[#c3c6d6]/20 p-3 flex flex-col gap-2">
              {(drawer.kyc === 'Pending' || drawer.cardStatus === 'Pending') && (
                <div className="flex gap-2">
                  {drawer.kyc === 'Pending' && (
                    <button
                      onClick={() => verifyKYC(drawer)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Verify KYC
                    </button>
                  )}
                  {drawer.cardStatus === 'Pending' && (
                    <button
                      onClick={() => activateCard(drawer)}
                      className="flex-1 bg-[#003d9b] hover:bg-[#0052cc] text-white py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Activate Card
                    </button>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleLoanBypass(drawer)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors border ${
                    drawer.bypassLoanWaitingPeriod
                      ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                      : 'border-blue-200 text-[#003d9b] hover:bg-blue-50'
                  }`}
                >
                  {drawer.bypassLoanWaitingPeriod ? 'Disable Urgent' : 'Enable Urgent'}
                </button>
                <button
                  onClick={() => blockToggle(drawer)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors border ${
                    drawer.status === 'Blocked'
                      ? 'border-green-300 text-green-700 hover:bg-green-50'
                      : 'border-red-200 text-red-600 hover:bg-red-50'
                  }`}
                >
                  {drawer.status === 'Blocked' ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
