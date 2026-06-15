import React, { useState } from 'react';

const FLAGS = [
  { id: 'SEC-101', time: '10 mins ago', type: 'High Risk', entity: 'User: USR004', reason: 'Multiple failed login attempts from different IPs.', status: 'Investigating' },
  { id: 'SEC-102', time: '1 hour ago',  type: 'Critical',  entity: 'Claim: CLM005', reason: 'Duplicate hospital bill detected (hash match with CLM001).', status: 'Blocked' },
  { id: 'SEC-103', time: '3 hours ago', type: 'Warning',   entity: 'Agent: AG-8821',reason: 'Unusual spike in registrations (20+ in 1 hour).', status: 'Flagged' },
  { id: 'SEC-104', time: '1 day ago',   type: 'High Risk', entity: 'Loan: LN002',   reason: 'Duplicate loan application detected and blocked automatically.', status: 'Resolved' },
];

export default function AdminSecurityPage() {
  const [flags, setFlags] = useState(FLAGS);

  const resolveFlag = (id) => {
    setFlags(flags.map(f => f.id === id ? { ...f, status: 'Resolved' } : f));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="bg-gradient-to-r from-red-800 to-red-600 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-red-200 font-bold">System Integrity</span>
          <h2 className="text-xl font-extrabold mt-1">Security & Fraud Detection</h2>
          <p className="text-sm text-white/80 mt-1">Monitor automated security flags for duplicate claims, suspicious activity, and audit logs.</p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Alerts',   val: flags.filter(f=>f.status!=='Resolved').length, icon: 'warning', color: 'text-red-600 bg-red-100' },
          { label: 'Blocked Claims',  val: 12, icon: 'block',   color: 'text-orange-600 bg-orange-100' },
          { label: 'System Health',   val: '100%', icon: 'shield',  color: 'text-green-600 bg-green-100' },
        ].map((s,i)=>(
          <div key={i} className="bg-white rounded-xl border border-[#c3c6d6]/20 p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${s.color}`}>
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-[#516161] font-semibold">{s.label}</p>
              <p className="text-2xl font-extrabold text-[#191b23]">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#c3c6d6]/20">
          <h3 className="font-extrabold text-[#191b23]">Automated Security Flags</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                <th className="px-5 py-3">Alert ID</th>
                <th className="px-5 py-3">Severity</th>
                <th className="px-5 py-3">Entity</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d6]/10">
              {flags.map(f => (
                <tr key={f.id} className="hover:bg-[#faf8ff]/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-xs text-[#003d9b]">{f.id}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${f.type==='Critical'?'bg-red-100 text-red-700':f.type==='High Risk'?'bg-orange-100 text-orange-700':'bg-yellow-100 text-yellow-700'}`}>
                      {f.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-[#191b23]">{f.entity}</td>
                  <td className="px-5 py-3.5 text-xs text-[#516161] max-w-xs">{f.reason}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${f.status==='Resolved'?'bg-green-100 text-green-700':f.status==='Blocked'?'bg-red-100 text-red-700':'bg-[#dae2ff] text-[#003d9b]'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {f.status !== 'Resolved' && (
                      <button onClick={() => resolveFlag(f.id)} className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                        Mark Resolved
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
