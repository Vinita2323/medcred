import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

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
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (tabId) => {
    setLoading(true);
    try {
      const res = await api.get(`${ENDPOINTS.ADMIN_REPORTS}?tab=${tabId}`);
      if (res.data?.success) {
        setReportData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  const handleExport = (format) => {
    alert(`Exporting ${REPORT_TABS.find(t=>t.id===activeTab)?.label} as ${format}...\n\nIn production, this would generate and download a ${format} file with ${reportData?.rows?.length || 0} records from ${dateFrom} to ${dateTo}.`);
  };

  const monthlyChart = reportData?.monthlyChart || [];
  const maxRev = monthlyChart.length ? Math.max(...monthlyChart.map(d=>d.revenue)) : 1;
  const maxUsers = monthlyChart.length ? Math.max(...monthlyChart.map(d=>d.users)) : 1;

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
      {loading && !monthlyChart.length ? (
        <div className="flex justify-center py-8"><span className="animate-spin material-symbols-outlined text-[#003d9b] text-3xl">progress_activity</span></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-5 shadow-sm">
            <h3 className="font-extrabold text-[#191b23] mb-4 text-sm">Monthly Revenue Trend</h3>
            <div className="flex items-end gap-2 h-32">
              {monthlyChart.map((d,i)=>(
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-[#003d9b] to-[#0052cc] rounded-t-md transition-all duration-700"
                    style={{ height: `${Math.round(((d.revenue || 0)/maxRev)*100) || 5}%`, minHeight: 4 }}
                  />
                  <span className="text-[9px] text-[#737685] font-bold">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {monthlyChart.map((d,i)=>(
                <span key={i} className="text-[8px] text-[#003d9b] font-extrabold" style={{ width: `${100/monthlyChart.length}%`, textAlign:'center' }}>
                  ₹{((d.revenue || 0)/1000).toFixed(0)}k
                </span>
              ))}
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-5 shadow-sm">
            <h3 className="font-extrabold text-[#191b23] mb-4 text-sm">User Registration Growth</h3>
            <div className="flex items-end gap-2 h-32">
              {monthlyChart.map((d,i)=>(
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-md transition-all duration-700"
                    style={{ height: `${Math.round(((d.users || 0)/maxUsers)*100) || 5}%`, minHeight: 4 }}
                  />
                  <span className="text-[9px] text-[#737685] font-bold">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {monthlyChart.map((d,i)=>(
                <span key={i} className="text-[8px] text-green-700 font-extrabold" style={{ width: `${100/monthlyChart.length}%`, textAlign:'center' }}>
                  {d.users || 0}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

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

      {loading ? (
        <div className="flex justify-center py-16"><span className="animate-spin material-symbols-outlined text-[#003d9b] text-4xl">progress_activity</span></div>
      ) : reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reportData.summary.map((s, i) => (
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
                <span className="text-sm font-semibold text-[#516161] ml-2">({reportData.rows.length} records)</span>
              </h3>
              <div className="flex gap-2">
                <button onClick={() => handleExport('Excel')} className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-[14px]">table_chart</span>Excel
                </button>
                <button onClick={() => handleExport('PDF')} className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>PDF
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                    {reportData.headers.map(h => <th key={h} className="px-5 py-3 whitespace-nowrap">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c3c6d6]/10">
                  {reportData.rows.map((row, ri) => (
                    <tr key={ri} className="hover:bg-[#faf8ff]/60 transition-colors">
                      {reportData.keys.map((key, ki) => (
                        <td key={ki} className={`px-5 py-3 text-xs whitespace-nowrap ${ki===0?'font-mono font-bold text-[#003d9b]':ki===1?'font-bold text-[#191b23]':'font-semibold text-[#516161]'}`}>
                          {String(row[key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {reportData.rows.length === 0 && (
                    <tr><td colSpan={reportData.headers.length} className="text-center py-12 text-[#516161] text-sm">
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
