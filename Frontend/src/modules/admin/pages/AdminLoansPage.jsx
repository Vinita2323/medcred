import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { ENDPOINTS, SERVER_URL } from '../../../services/types';

const ELIGIBILITY_COLORS = {
  eligible:     'bg-green-100 text-green-700',
  not_eligible: 'bg-red-100 text-red-700',
  waiting:       'bg-yellow-100 text-yellow-700',
};
const APPLICATION_COLORS = {
  applied:       'bg-blue-100 text-blue-700',
  under_review:  'bg-yellow-100 text-yellow-700',
  approved:      'bg-green-100 text-green-700',
  disbursed:     'bg-green-200 text-green-800',
  rejected:      'bg-red-100 text-red-700',
  closed:        'bg-gray-100 text-gray-700',
};

export default function AdminLoansPage() {
  const [loans, setLoans]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterElig, setFilter] = useState('All');

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await api.get(ENDPOINTS.ADMIN_LOANS);
      if (res.data.success) {
        setLoans(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch loans:', err);
    }
  };

  const updateApp = async (id, appStatus) => {
    try {
      const payload = { status: appStatus };
      if (appStatus === 'rejected') {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;
        payload.rejectionReason = reason;
      }
      const res = await api.patch(ENDPOINTS.ADMIN_LOAN_UPDATE(id), payload);
      if (res.data.success) {
        setLoans(loans.map(l => l._id === id ? res.data.data : l));
        if (selected?._id === id) setSelected(res.data.data);
      }
    } catch (err) {
      alert('Failed to update loan status');
    }
  };

  const blockDuplicate = async (id) => {
    await updateApp(id, 'rejected');
  };

  const filtered = loans.filter(l => {
    const q = search.toLowerCase();
    const matchQ = !q || l.userName.toLowerCase().includes(q) || l.loanId.toLowerCase().includes(q);
    const matchF  = filterElig === 'All' || l.eligibilityStatus === filterElig;
    return matchQ && matchF;
  });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Financial Control</span>
          <h2 className="text-xl font-extrabold mt-1">Loan Eligibility Monitor</h2>
          <p className="text-sm text-white/80 mt-1">
            Track loan eligibility (30-day waiting period), view applications, approve/reject, and block duplicates.
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: loans.length,                                   color:'text-[#003d9b]',  bg:'bg-[#dae2ff]',  icon:'payments' },
          { label: 'Eligible',           value: loans.filter(l=>l.eligibilityStatus==='eligible').length,  color:'text-green-700',  bg:'bg-green-100',  icon:'check_circle' },
          { label: 'Waiting Period',     value: loans.filter(l=>l.eligibilityStatus==='waiting').length,   color:'text-yellow-700', bg:'bg-yellow-100', icon:'hourglass_empty' },
          { label: 'Applied',            value: loans.filter(l=>l.applicationStatus==='applied').length, color:'text-blue-700', bg:'bg-blue-100', icon:'description' },
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

      {/* Info Box */}
      <div className="bg-[#f0f4ff] border border-[#dae2ff] rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-[#003d9b] text-[22px] shrink-0">info</span>
        <div>
          <p className="text-sm font-bold text-[#003d9b]">Loan Eligibility Rules (FRD §9)</p>
          <ul className="text-xs text-[#516161] mt-1 space-y-1">
            <li>• Users can apply only <strong>30 days after card purchase</strong>.</li>
            <li>• <strong>Only one active loan</strong> is allowed per user — duplicates are automatically flagged.</li>
            <li>• Admin must manually approve or reject pending applications.</li>
          </ul>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737685] text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search by user name or loan ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl text-sm focus:outline-none focus:border-[#003d9b]"
          />
        </div>
        <select
          value={filterElig}
          onChange={e => setFilter(e.target.value)}
          className="bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
        >
          {['All','eligible','not_eligible','waiting'].map(v=><option key={v}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#c3c6d6]/20">
          <h3 className="font-extrabold text-[#191b23]">Loan Applications <span className="text-sm font-semibold text-[#516161]">({filtered.length})</span></h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                <th className="px-5 py-3">Loan ID</th>
                <th className="px-5 py-3">User Name</th>
                <th className="px-5 py-3">Card Purchase</th>
                <th className="px-5 py-3">Eligibility</th>
                <th className="px-5 py-3">Application</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d6]/10">
              {filtered.map(l => (
                <tr key={l._id} className={`hover:bg-[#faf8ff]/60 transition-colors ${l.isDuplicate ? 'bg-red-50/30' : ''}`}>
                  <td className="px-5 py-3.5 font-mono font-bold text-xs text-[#003d9b]">{l.loanId}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-[#191b23]">{l.userName}</p>
                    {l.isDuplicate && (
                      <span className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">warning</span> Blocked as Duplicate
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#516161] font-semibold">{new Date(l.cardPurchaseDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ELIGIBILITY_COLORS[l.eligibilityStatus] || 'bg-gray-100'}`}>
                        {l.eligibilityStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${APPLICATION_COLORS[l.applicationStatus] || 'bg-gray-100'}`}>
                      {l.applicationStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={() => setSelected(l)} className="bg-[#f0f4ff] hover:bg-[#dae2ff] text-[#003d9b] px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">View</button>
                      {l.applicationStatus === 'applied' && (
                        <>
                          <button onClick={() => updateApp(l._id, 'approved')} className="bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Approve</button>
                          <button onClick={() => updateApp(l._id, 'rejected')} className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Reject</button>
                          <button onClick={() => blockDuplicate(l._id)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Block Dup.</button>
                        </>
                      )}
                      {l.applicationStatus === 'approved' && (
                        <button onClick={() => updateApp(l._id, 'disbursed')} className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Disburse</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-[#516161] text-sm">
                  <span className="material-symbols-outlined text-3xl block mb-2 text-[#c3c6d6]">payments</span>
                  No loan records found.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#c3c6d6]/20 px-6 py-4">
              <h3 className="font-extrabold text-[#191b23]">Loan Details — {selected.id}</h3>
              <button onClick={() => setSelected(null)} className="material-symbols-outlined text-[#737685] hover:text-[#191b23] cursor-pointer">close</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Loan ID',      value: selected.loanId },
                  { label: 'User',         value: selected.userName },
                  { label: 'Card Purchase',value: new Date(selected.cardPurchaseDate).toLocaleDateString() },
                  { label: 'Eligibility',  value: selected.eligibilityStatus },
                  { label: 'Application',  value: selected.applicationStatus },
                  { label: 'Amount',       value: selected.loanAmount ? `₹${selected.loanAmount.toLocaleString('en-IN')}` : 'N/A' },
                ].map((item,i)=>(
                  <div key={i} className="bg-[#f5f8ff] rounded-xl p-3">
                    <p className="text-[10px] text-[#516161] font-semibold uppercase">{item.label}</p>
                    <p className="text-sm font-bold text-[#191b23] mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
              
              {selected.patients && selected.patients.length > 0 && (
                <div className="mt-4 border-t border-[#c3c6d6]/20 pt-4">
                  <h4 className="text-xs font-bold text-[#516161] uppercase mb-2">Patients & Documents</h4>
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                    {selected.patients.map((p, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 text-xs">
                        <p className="font-bold text-[#191b23]">{p.patientName} <span className="text-gray-500 font-normal">({p.relationship})</span></p>
                        <p className="text-gray-600 mt-1">Hospital: {p.hospitalName}</p>
                        <div className="flex gap-2 mt-2">
                          {p.prescriptionFileUrl && (
                            <a href={`${SERVER_URL}${p.prescriptionFileUrl}`} target="_blank" rel="noopener noreferrer" className="text-[#003d9b] hover:underline font-bold">View Prescription</a>
                          )}
                          {p.estimatedBillUrl && (
                            <a href={`${SERVER_URL}${p.estimatedBillUrl}`} target="_blank" rel="noopener noreferrer" className="text-[#003d9b] hover:underline font-bold">View Bill</a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.applicationStatus === 'applied' && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => updateApp(selected._id, 'approved')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer">Approve</button>
                  <button onClick={() => updateApp(selected._id, 'rejected')} className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-xs font-bold cursor-pointer">Reject</button>
                </div>
              )}
              {selected.applicationStatus === 'approved' && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => updateApp(selected._id, 'disbursed')} className="w-full bg-[#003d9b] hover:bg-[#002f7a] text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer">Mark as Disbursed</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
