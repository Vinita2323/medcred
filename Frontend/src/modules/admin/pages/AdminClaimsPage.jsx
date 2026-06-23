import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { ENDPOINTS, SERVER_URL } from '../../../services/types';

const TABS = ['All Claims', 'Pending Review', 'Approved', 'Rejected'];

const STATUS_META = {
  'Submitted':            { color: 'bg-blue-100 text-blue-700',    icon: 'send' },
  'Under Review':         { color: 'bg-yellow-100 text-yellow-700', icon: 'manage_search' },
  'Verification Pending': { color: 'bg-orange-100 text-orange-700', icon: 'hourglass_empty' },
  'Approved':             { color: 'bg-green-100 text-green-700',   icon: 'check_circle' },
  'Rejected':             { color: 'bg-red-100 text-red-700',       icon: 'cancel' },
  'Completed':            { color: 'bg-teal-100 text-teal-700',     icon: 'done_all' },
};

const LIMITS = {
  medical_services: 200000,
  emergency:        200000,
  diagnostic:        80000,
  pharmacy:          50000,
};

export default function AdminClaimsPage() {
  const [claims, setClaims]       = useState([]);
  const [activeTab, setTab]       = useState('All Claims');
  const [reviewClaim, setReview]  = useState(null);
  const [rejectReason, setReason] = useState('');
  const [search, setSearch]       = useState('');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await api.get(ENDPOINTS.ADMIN_CLAIMS);
      if (res.data?.success) {
        // Map backend fields to frontend shape
        const mapped = res.data.data.map(c => ({
          ...c,
          id: c.claimId,
          userName: c.userId?.fullName || 'Unknown',
          type: c.claimType,
          amount: c.claimAmount,
          submittedAt: new Date(c.submittedAt).toLocaleDateString('en-IN'),
          status: c.status.charAt(0).toUpperCase() + c.status.slice(1),
        }));
        setClaims(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch claims', err);
    }
  };

  const save = (updated) => {
    setClaims(updated);
  };

  const approveClaim = async (id) => {
    try {
      const claim = claims.find(c => c.id === id);
      await api.patch(ENDPOINTS.ADMIN_CLAIM_UPDATE(claim._id), { status: 'approved' });
      const updated = claims.map(c => c.id === id ? { ...c, status: 'Approved' } : c);
      save(updated);
      setReview(null);
    } catch (err) {
      alert('Failed to approve claim');
    }
  };

  const rejectClaim = async (id) => {
    if (!rejectReason.trim()) { alert('Please provide a rejection reason.'); return; }
    try {
      const claim = claims.find(c => c.id === id);
      await api.patch(ENDPOINTS.ADMIN_CLAIM_UPDATE(claim._id), { status: 'rejected', rejectionReason: rejectReason });
      const updated = claims.map(c => c.id === id ? { ...c, status: 'Rejected', rejectReason } : c);
      save(updated);
      setReview(null);
      setReason('');
    } catch (err) {
      alert('Failed to reject claim');
    }
  };

  const filtered = claims.filter(c => {
    const q = search.toLowerCase();
    const matchQ  = !q || (c.id || '').toLowerCase().includes(q) || (c.userName || '').toLowerCase().includes(q);
    const matchTab =
      activeTab === 'All Claims'     ? true :
      activeTab === 'Pending Review' ? c.status === 'Pending' :
      activeTab === 'Approved'       ? c.status === 'Approved' :
      activeTab === 'Rejected'       ? c.status === 'Rejected' : true;
    return matchQ && matchTab;
  });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Claim Processing</span>
          <h2 className="text-xl font-extrabold mt-1">Claim Management</h2>
          <p className="text-sm text-white/80 mt-1">
            Review, approve, or reject claims. Hospital limit: ₹2,00,000 · Home treatment limit: ₹80,000.
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims',   value: claims.length,                                              color:'text-[#003d9b]',  bg:'bg-[#dae2ff]',  icon:'description' },
          { label: 'Pending Review', value: claims.filter(c=>c.status==='Pending').length,              color:'text-orange-700',bg:'bg-orange-100',icon:'hourglass_empty' },
          { label: 'Approved',       value: claims.filter(c=>c.status==='Approved').length,             color:'text-green-700',  bg:'bg-green-100',  icon:'check_circle' },
          { label: 'Rejected',       value: claims.filter(c=>c.status==='Rejected').length,             color:'text-red-700',    bg:'bg-red-100',    icon:'cancel' },
        ].map((s,i)=>(
          <div key={i} className="bg-white rounded-xl border border-[#c3c6d6]/20 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings:"'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-[#516161] font-semibold">{s.label}</p>
              <p className="text-xl font-extrabold text-[#191b23]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737685] text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search by Claim ID or claimant name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl text-sm focus:outline-none focus:border-[#003d9b]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab===tab ? 'bg-[#003d9b] text-white shadow-sm' : 'bg-[#f5f8ff] text-[#434654] border border-[#c3c6d6]/30 hover:bg-[#f0f4ff]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#c3c6d6]/20">
          <h3 className="font-extrabold text-[#191b23]">{activeTab} <span className="text-sm font-semibold text-[#516161]">({filtered.length})</span></h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                <th className="px-5 py-3">Claim ID</th>
                <th className="px-5 py-3">Claimant</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Limit Check</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d6]/10">
              {filtered.map(c => {
                const limit = LIMITS[c.type];
                const withinLimit = c.amount <= limit;
                const meta = STATUS_META[c.status] || { color: 'bg-gray-100 text-gray-700', icon: 'help' };
                return (
                  <tr key={c.id} className="hover:bg-[#faf8ff]/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-xs text-[#003d9b]">{c.id}</td>
                    <td className="px-5 py-3.5 font-bold text-[#191b23]">{c.userName}</td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-[#516161]">{c.type}</td>
                    <td className="px-5 py-3.5 font-extrabold text-[#191b23]">₹{c.amount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${withinLimit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {withinLimit ? '✓ Within Limit' : '✗ Exceeds Limit'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#516161]">{c.submittedAt}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${meta.color}`}>{c.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {['Submitted','Under Review','Verification Pending'].includes(c.status) ? (
                        <button
                          onClick={() => setReview(c)}
                          className="bg-[#003d9b] hover:bg-[#0052cc] text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Review
                        </button>
                      ) : (
                        <button
                          onClick={() => setReview(c)}
                          className="bg-[#f0f4ff] hover:bg-[#dae2ff] text-[#003d9b] px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-[#516161] text-sm">
                  <span className="material-symbols-outlined text-3xl block mb-2 text-[#c3c6d6]">description</span>
                  No claims found.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewClaim && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setReview(null); setReason(''); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#c3c6d6]/20 px-6 py-4">
              <h3 className="font-extrabold text-[#191b23]">Claim Review — {reviewClaim.id}</h3>
              <button onClick={() => { setReview(null); setReason(''); }} className="material-symbols-outlined text-[#737685] hover:text-[#191b23] cursor-pointer">close</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Claimant',   value: reviewClaim.userName },
                  { label: 'Type',       value: reviewClaim.type },
                  { label: 'Amount',     value: `₹${reviewClaim.amount.toLocaleString('en-IN')}` },
                  { label: 'Limit',      value: `₹${LIMITS[reviewClaim.type]?.toLocaleString('en-IN')}` },
                  { label: 'Submitted',  value: reviewClaim.submittedAt },
                  { label: 'Status',     value: reviewClaim.status },
                ].map((item,i)=>(
                  <div key={i} className="bg-[#f5f8ff] rounded-xl p-3">
                    <p className="text-[10px] text-[#516161] font-semibold uppercase">{item.label}</p>
                    <p className="text-sm font-bold text-[#191b23] mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Documents */}
              <div>
                <p className="text-xs font-bold text-[#516161] uppercase tracking-wider mb-2">Submitted Documents</p>
                <div className="flex flex-wrap gap-2">
                  {(reviewClaim.documents || []).map((doc, i) => (
                    <a 
                      key={i} 
                      href={`${SERVER_URL}${doc.url}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#f0f4ff] border border-[#dae2ff] rounded-lg px-3 py-1.5 hover:bg-[#dae2ff] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#003d9b] text-[14px]">
                        {doc.filename?.match(/\.(jpg|jpeg|png)$/i) ? 'image' : 'description'}
                      </span>
                      <span className="text-xs font-semibold text-[#003d9b] max-w-[200px] truncate">
                        {doc.filename || 'Document'}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Limit warning */}
              {reviewClaim.amount > LIMITS[reviewClaim.type] && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-red-500 text-[18px]">warning</span>
                  <p className="text-xs text-red-600 font-semibold">
                    Claim amount exceeds the {reviewClaim.type} limit of ₹{LIMITS[reviewClaim.type]?.toLocaleString('en-IN')}.
                  </p>
                </div>
              )}

              {/* Rejection reason (only show if not already approved/rejected) */}
              {reviewClaim.status === 'Pending' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Rejection Reason (if rejecting)</label>
                  <textarea
                    value={rejectReason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Provide a reason for rejection…"
                    rows={2}
                    className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] resize-none"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t border-[#c3c6d6]/20 px-6 py-4 flex gap-3">
              <button onClick={()=>{setReview(null);setReason('');}} className="flex-1 border border-[#c3c6d6]/40 text-[#434654] hover:bg-[#f5f8ff] py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                Close
              </button>
              {reviewClaim.status === 'Pending' && (
                <>
                  <button
                    onClick={() => rejectClaim(reviewClaim.id)}
                    className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Reject Claim
                  </button>
                  <button
                    onClick={() => approveClaim(reviewClaim.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Approve Claim
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
