import React, { useState, useEffect } from 'react';

const REPORT_TABS = [
  { id: 'users',    label: 'User Reports',         icon: 'group' },
  { id: 'claims',   label: 'Claim Reports',         icon: 'description' },
  { id: 'agents',   label: 'Agent Reports',         icon: 'badge' },
  { id: 'financial',label: 'Financial Reports',     icon: 'payments' },
  { id: 'verification',label:'Verification Reports',icon: 'verified_user' },
];

export default function AdminReportsPage() {
  const [activeTab, setTab] = useState('users');
  const [dateFrom, setFrom] = useState('2026-01-01');
  const [dateTo, setTo]     = useState(new Date().toISOString().split('T')[0]);
  const [data, setData]     = useState({});

  useEffect(() => {
    const users   = JSON.parse(localStorage.getItem('medcred_users')   || '[]');
    const claims  = JSON.parse(localStorage.getItem('medcred_claims')  || '[]');
    const agents  = JSON.parse(localStorage.getItem('medcred_agents')  || '[]');
    const loans   = JSON.parse(localStorage.getItem('medcred_loans')   || '[]');

    setData({
      users: {
        summary: [
          { label: 'Total Registered',   value: users.length },
          { label: 'KYC Verified',       value: users.filter(u=>u.kyc==='Verified').length },
          { label: 'Active Cards',        value: users.filter(u=>u.cardStatus==='Active').length },
          { label: 'Blocked Accounts',   value: users.filter(u=>u.status==='Blocked').length },
        ],
        rows: users.map(u => ({ id: u.id, name: u.name, date: u.registeredAt, plan: u.plan, kyc: u.kyc, card: u.cardStatus, status: u.status })),
        headers: ['User ID','Name','Registered','Plan','KYC','Card','Status'],
        keys: ['id','name','date','plan','kyc','card','status'],
      },
      claims: {
        summary: [
          { label: 'Total Claims',       value: claims.length },
          { label: 'Approved',           value: claims.filter(c=>c.status==='Approved').length },
          { label: 'Pending Review',     value: claims.filter(c=>['Submitted','Under Review','Verification Pending'].includes(c.status)).length },
          { label: 'Total Approved Value',value: `₹${claims.filter(c=>['Approved','Completed'].includes(c.status)).reduce((s,c)=>s+c.amount,0).toLocaleString('en-IN')}` },
        ],
        rows: claims.map(c => ({ id: c.id, name: c.userName, date: c.submittedAt, type: c.type, amount: `₹${c.amount.toLocaleString('en-IN')}`, status: c.status })),
        headers: ['Claim ID','Claimant','Submitted','Type','Amount','Status'],
        keys: ['id','name','date','type','amount','status'],
      },
      agents: {
        summary: [
          { label: 'Total Registered',   value: agents.length },
          { label: 'Active (Approved)',  value: agents.filter(a=>a.status==='Approved').length },
          { label: 'Pending Approval',   value: agents.filter(a=>a.status==='Pending Approval').length },
          { label: 'Total Sales',        value: agents.filter(a=>a.status==='Approved').reduce((s,a)=>s+(a.salesCount||0),0) },
        ],
        rows: agents.map(a => ({ id: a.agentId||'—', name: a.fullName, role: a.role||'—', sales: a.salesCount||0, earnings: a.earnings ? `₹${a.earnings.toLocaleString('en-IN')}` : '₹0', status: a.status })),
        headers: ['Agent ID','Name','Role','Sales','Earnings','Status'],
        keys: ['id','name','role','sales','earnings','status'],
      },
      financial: {
        summary: [
          { label: 'Total Claim Payouts',value: `₹${claims.filter(c=>['Approved','Completed'].includes(c.status)).reduce((s,c)=>s+c.amount,0).toLocaleString('en-IN')}` },
          { label: 'Agent Commissions',  value: `₹${agents.filter(a=>a.earnings).reduce((s,a)=>s+(a.earnings||0),0).toLocaleString('en-IN')}` },
          { label: 'Active Memberships', value: agents.filter(a=>a.status==='Approved').length },
          { label: 'Loan Applications',  value: loans.filter(l=>l.applicationStatus==='Applied').length },
        ],
        rows: claims.map(c => ({ id: c.id, name: c.userName, date: c.submittedAt, type: c.type, amount: `₹${c.amount.toLocaleString('en-IN')}`, status: c.status })),
        headers: ['Claim ID','User','Date','Type','Amount','Status'],
        keys: ['id','name','date','type','amount','status'],
      },
      verification: {
        summary: [
          { label: 'KYC Verified',   value: (JSON.parse(localStorage.getItem('medcred_users')||'[]')).filter(u=>u.kyc==='Verified').length },
          { label: 'KYC Pending',    value: (JSON.parse(localStorage.getItem('medcred_users')||'[]')).filter(u=>u.kyc==='Pending').length },
          { label: 'KYC Rejected',   value: (JSON.parse(localStorage.getItem('medcred_users')||'[]')).filter(u=>u.kyc==='Rejected').length },
          { label: 'Member Verified',value: (JSON.parse(localStorage.getItem('medcred_family_members')||'[]')).filter(m=>m.aadhaarStatus==='Verified').length },
        ],
        rows: users.map(u => ({ id: u.id, name: u.name, mobile: u.mobile, kyc: u.kyc, card: u.cardStatus, date: u.registeredAt })),
        headers: ['User ID','Name','Mobile','KYC Status','Card Status','Registered'],
        keys: ['id','name','mobile','kyc','card','date'],
      },
    });
  }, []);

  const report = data[activeTab];

  const handleExport = (format) => {
    alert(`Exporting ${REPORT_TABS.find(t=>t.id===activeTab)?.label} as ${format}...\n\nIn production, this would generate and download a ${format} file with ${report?.rows?.length || 0} records from ${dateFrom} to ${dateTo}.`);
  };

  const MONTHLY_DATA = [
    { month: 'Jan', users: 45, claims: 8, revenue: 125000 },
    { month: 'Feb', users: 62, claims: 12, revenue: 180000 },
    { month: 'Mar', users: 89, claims: 18, revenue: 240000 },
    { month: 'Apr', users: 104, claims: 21, revenue: 310000 },
    { month: 'May', users: 138, claims: 27, revenue: 420000 },
    { month: 'Jun', users: 167, claims: 31, revenue: 510000 },
  ];
  const maxRev = Math.max(...MONTHLY_DATA.map(d=>d.revenue));
  const maxUsers = Math.max(...MONTHLY_DATA.map(d=>d.users));

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Analytics Center</span>
            <h2 className="text-xl font-extrabold mt-1">Reports & Analytics</h2>
            <p className="text-sm text-white/80 mt-1">Generate daily, monthly, and periodic reports. Export as Excel or PDF.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleExport('Excel')} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-[16px]">table_chart</span>
              Export Excel
            </button>
            <button onClick={() => handleExport('PDF')} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              Export PDF
            </button>
          </div>
        </div>
      </section>

      {/* Monthly Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Revenue Chart */}
        <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-5 shadow-sm">
          <h3 className="font-extrabold text-[#191b23] mb-4 text-sm">Monthly Revenue Trend</h3>
          <div className="flex items-end gap-2 h-32">
            {MONTHLY_DATA.map((d,i)=>(
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-[#003d9b] to-[#0052cc] rounded-t-md transition-all duration-700"
                  style={{ height: `${Math.round((d.revenue/maxRev)*100)}%`, minHeight: 4 }}
                />
                <span className="text-[9px] text-[#737685] font-bold">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {MONTHLY_DATA.map((d,i)=>(
              <span key={i} className="text-[8px] text-[#003d9b] font-extrabold" style={{ width: `${100/MONTHLY_DATA.length}%`, textAlign:'center' }}>
                ₹{(d.revenue/1000).toFixed(0)}k
              </span>
            ))}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-5 shadow-sm">
          <h3 className="font-extrabold text-[#191b23] mb-4 text-sm">User Registration Growth</h3>
          <div className="flex items-end gap-2 h-32">
            {MONTHLY_DATA.map((d,i)=>(
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-md transition-all duration-700"
                  style={{ height: `${Math.round((d.users/maxUsers)*100)}%`, minHeight: 4 }}
                />
                <span className="text-[9px] text-[#737685] font-bold">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {MONTHLY_DATA.map((d,i)=>(
              <span key={i} className="text-[8px] text-green-700 font-extrabold" style={{ width: `${100/MONTHLY_DATA.length}%`, textAlign:'center' }}>
                {d.users}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Date Range + Tab selector */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#516161] whitespace-nowrap">From:</label>
            <input type="date" value={dateFrom} onChange={e=>setFrom(e.target.value)} className="bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#003d9b] cursor-pointer" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#516161] whitespace-nowrap">To:</label>
            <input type="date" value={dateTo} onChange={e=>setTo(e.target.value)} className="bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#003d9b] cursor-pointer" />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {REPORT_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab===tab.id ? 'bg-[#003d9b] text-white shadow-sm' : 'bg-[#f5f8ff] text-[#434654] border border-[#c3c6d6]/30 hover:bg-[#f0f4ff]'}`}
            >
              <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {report.summary.map((s, i) => (
              <div key={i} className="bg-white border border-[#c3c6d6]/20 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-[#516161] font-semibold">{s.label}</p>
                <p className="text-xl font-extrabold text-[#003d9b] mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#c3c6d6]/20">
              <h3 className="font-extrabold text-[#191b23]">
                {REPORT_TABS.find(t=>t.id===activeTab)?.label}
                <span className="text-sm font-semibold text-[#516161] ml-2">({report.rows.length} records)</span>
              </h3>
              <div className="flex gap-2">
                <button onClick={() => handleExport('Excel')} className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                  <span className="material-symbols-outlined text-[14px]">table_chart</span>Excel
                </button>
                <button onClick={() => handleExport('PDF')} className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                  <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>PDF
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                    {report.headers.map(h => <th key={h} className="px-5 py-3">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c3c6d6]/10">
                  {report.rows.map((row, ri) => (
                    <tr key={ri} className="hover:bg-[#faf8ff]/60 transition-colors">
                      {report.keys.map((key, ki) => (
                        <td key={ki} className={`px-5 py-3 text-xs ${ki===0?'font-mono font-bold text-[#003d9b]':ki===1?'font-bold text-[#191b23]':'font-semibold text-[#516161]'}`}>
                          {String(row[key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {report.rows.length === 0 && (
                    <tr><td colSpan={report.headers.length} className="text-center py-12 text-[#516161] text-sm">
                      <span className="material-symbols-outlined text-3xl block mb-2 text-[#c3c6d6]">analytics</span>
                      No data available for this report.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
