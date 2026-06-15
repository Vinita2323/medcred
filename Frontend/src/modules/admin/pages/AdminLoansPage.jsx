import React, { useState, useEffect } from 'react';

const ELIGIBILITY_COLORS = {
  Eligible:     'bg-green-100 text-green-700',
  'Not Eligible':'bg-red-100 text-red-700',
  Waiting:       'bg-yellow-100 text-yellow-700',
};
const APPLICATION_COLORS = {
  'Not Applied': 'bg-gray-100 text-gray-700',
  Applied:       'bg-blue-100 text-blue-700',
  Approved:      'bg-green-100 text-green-700',
  Rejected:      'bg-red-100 text-red-700',
};

export default function AdminLoansPage() {
  const [loans, setLoans]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterElig, setFilter] = useState('All');

  useEffect(() => {
    const raw = localStorage.getItem('medcred_loans');
    setLoans(raw ? JSON.parse(raw) : []);
  }, []);

  const save = (updated) => {
    setLoans(updated);
    localStorage.setItem('medcred_loans', JSON.stringify(updated));
  };

  const updateApp = (id, appStatus) => {
    const updated = loans.map(l => l.id === id ? { ...l, applicationStatus: appStatus } : l);
    save(updated);
    if (selected?.id === id) setSelected(updated.find(l => l.id === id));
  };

  const blockDuplicate = (id) => {
    const loan = loans.find(l => l.id === id);
    if (!loan) return;
    const duplicate = loans.find(l => l.userId === loan.userId && l.id !== id && l.applicationStatus === 'Applied');
    if (!duplicate) { alert('No duplicate found for this user.'); return; }
    const updated = loans.map(l => l.id === id ? { ...l, applicationStatus: 'Rejected', blockedAsDuplicate: true } : l);
    save(updated);
    if (selected?.id === id) setSelected(updated.find(l => l.id === id));
  };

  const filtered = loans.filter(l => {
    const q = search.toLowerCase();
    const matchQ = !q || l.userName.toLowerCase().includes(q) || l.id.toLowerCase().includes(q);
    const matchF  = filterElig === 'All' || l.status === filterElig;
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
          { label: 'Eligible',           value: loans.filter(l=>l.status==='Eligible').length,  color:'text-green-700',  bg:'bg-green-100',  icon:'check_circle' },
          { label: 'Waiting Period',     value: loans.filter(l=>l.status==='Waiting').length,   color:'text-yellow-700', bg:'bg-yellow-100', icon:'hourglass_empty' },
          { label: 'Applied',            value: loans.filter(l=>l.applicationStatus==='Applied').length, color:'text-blue-700', bg:'bg-blue-100', icon:'description' },
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
          {['All','Eligible','Not Eligible','Waiting'].map(v=><option key={v}>{v}</option>)}
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
                <tr key={l.id} className={`hover:bg-[#faf8ff]/60 transition-colors ${l.blockedAsDuplicate ? 'bg-red-50/30' : ''}`}>
                  <td className="px-5 py-3.5 font-mono font-bold text-xs text-[#003d9b]">{l.id}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-[#191b23]">{l.userName}</p>
                    {l.blockedAsDuplicate && (
                      <span className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">warning</span> Blocked as Duplicate
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#516161] font-semibold">{l.cardPurchaseDate}</td>
                  <td className="px-5 py-3.5">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ELIGIBILITY_COLORS[l.status]}`}>
                        {l.status}
                      </span>
                      {l.daysLeft && (
                        <p className="text-[10px] text-[#737685] mt-0.5">{l.daysLeft} days remaining</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${APPLICATION_COLORS[l.applicationStatus]}`}>
                      {l.applicationStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={() => setSelected(l)} className="bg-[#f0f4ff] hover:bg-[#dae2ff] text-[#003d9b] px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">View</button>
                      {l.applicationStatus === 'Applied' && (
                        <>
                          <button onClick={() => updateApp(l.id, 'Approved')} className="bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Approve</button>
                          <button onClick={() => updateApp(l.id, 'Rejected')} className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Reject</button>
                          <button onClick={() => blockDuplicate(l.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Block Dup.</button>
                        </>
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
                  { label: 'Loan ID',      value: selected.id },
                  { label: 'User',         value: selected.userName },
                  { label: 'Card Purchase',value: selected.cardPurchaseDate },
                  { label: 'Eligibility',  value: selected.status },
                  { label: 'Application',  value: selected.applicationStatus },
                  { label: 'Amount',       value: selected.amount ? `₹${selected.amount.toLocaleString('en-IN')}` : 'N/A' },
                ].map((item,i)=>(
                  <div key={i} className="bg-[#f5f8ff] rounded-xl p-3">
                    <p className="text-[10px] text-[#516161] font-semibold uppercase">{item.label}</p>
                    <p className="text-sm font-bold text-[#191b23] mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
              {selected.applicationStatus === 'Applied' && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => updateApp(selected.id, 'Approved')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer">Approve</button>
                  <button onClick={() => updateApp(selected.id, 'Rejected')} className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-xs font-bold cursor-pointer">Reject</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
