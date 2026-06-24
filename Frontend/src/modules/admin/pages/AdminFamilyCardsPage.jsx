import React, { useState, useEffect } from 'react';

const STATUS_COLORS = {
  Active:    'bg-green-100 text-green-700',
  Pending:   'bg-yellow-100 text-yellow-700',
  Suspended: 'bg-red-100 text-red-700',
};
const AADHAAR_COLORS = {
  Verified: 'bg-green-100 text-green-700',
  Pending:  'bg-yellow-100 text-yellow-700',
  Rejected: 'bg-red-100 text-red-700',
};

import api from '../../../services/api';
import { ENDPOINTS, SERVER_URL } from '../../../services/types';

export default function AdminFamilyCardsPage() {
  const [members, setMembers] = useState([]);
  const [search, setSearch]   = useState('');
  const [filterStatus, setFilter] = useState('All');
  const [selectedMember, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.ADMIN_FAMILY_MEMBERS);
      if (res.data.success) {
        // Map backend data to frontend model
        const mapped = res.data.data.map(m => ({
          _id: m._id,
          id: m.memberId,
          memberName: m.name,
          primaryUser: m.primaryUserName,
          relation: m.relationship,
          aadhaarStatus: m.verificationStatus === 'verified' ? 'Verified' : (m.verificationStatus === 'rejected' ? 'Rejected' : 'Pending'),
          status: m.status === 'active' ? 'Active' : (m.status === 'suspended' ? 'Suspended' : 'Pending'),
          aadhaarFront: m.aadhaarFront,
          aadhaarBack: m.aadhaarBack,
        }));
        setMembers(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyMember = async (dbId, action = 'verified') => {
    try {
      const res = await api.patch(ENDPOINTS.ADMIN_FAMILY_VERIFY(dbId), { status: action });
      if (res.data.success) {
        // Refresh or manually update
        fetchMembers();
        setSelected(null);
      }
    } catch (err) {
      console.error('Failed to verify:', err);
      alert(err.response?.data?.message || 'Failed to verify member');
    }
  };

  const suspendCard = (dbId, currentStatus) => {
    // We reuse the same endpoint for suspending for now or we can implement a status endpoint.
    // Assuming 'rejected' works as suspension in our simplified model.
    verifyMember(dbId, currentStatus === 'Suspended' ? 'verified' : 'rejected');
  };

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchQ = !q || m.memberName.toLowerCase().includes(q) || m.primaryUser.toLowerCase().includes(q) || m.relation.toLowerCase().includes(q);
    const matchS  = filterStatus === 'All' || m.status === filterStatus;
    return matchQ && matchS;
  });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Family Coverage</span>
          <h2 className="text-xl font-extrabold mt-1">Family Card Management</h2>
          <p className="text-sm text-white/80 mt-1">Verify family member records, manage Aadhaar status, and control card suspensions.</p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Members',    value: members.length,                                        color: 'text-[#003d9b]', bg: 'bg-[#dae2ff]', icon: 'family_history' },
          { label: 'Verified',         value: members.filter(m=>m.aadhaarStatus==='Verified').length, color: 'text-green-700',  bg: 'bg-green-100',  icon: 'verified' },
          { label: 'Pending Verify',   value: members.filter(m=>m.aadhaarStatus==='Pending').length,  color: 'text-yellow-700', bg: 'bg-yellow-100', icon: 'pending' },
          { label: 'Suspended Cards',  value: members.filter(m=>m.status==='Suspended').length,       color: 'text-red-700',    bg: 'bg-red-100',    icon: 'block' },
        ].map((s,i) => (
          <div key={i} className="bg-white rounded-xl border border-[#c3c6d6]/20 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-[#516161] font-semibold">{s.label}</p>
              <p className="text-xl font-extrabold text-[#191b23]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737685] text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search by member name, primary user or relation…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl text-sm focus:outline-none focus:border-[#003d9b]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilter(e.target.value)}
          className="bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
        >
          {['All','Active','Pending','Suspended'].map(v=><option key={v}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#c3c6d6]/20">
          <h3 className="font-extrabold text-[#191b23]">Family Members <span className="text-sm font-semibold text-[#516161]">({filtered.length})</span></h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#faf8ff] text-[#737685] text-xs font-bold border-b border-[#c3c6d6]/20">
                <th className="px-5 py-3">Member Name</th>
                <th className="px-5 py-3">Primary User</th>
                <th className="px-5 py-3">Relation</th>
                <th className="px-5 py-3">Aadhaar Status</th>
                <th className="px-5 py-3">Card Status</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c3c6d6]/10">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-[#faf8ff]/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#dae2ff] text-[#003d9b] font-bold text-xs flex items-center justify-center shrink-0">
                        {m.memberName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#191b23]">{m.memberName}</p>
                        <p className="text-[10px] text-[#737685] font-mono">{m.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-[#516161]">{m.primaryUser}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-[#516161]">{m.relation}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${AADHAAR_COLORS[m.aadhaarStatus]}`}>
                      {m.aadhaarStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[m.status]}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={() => setSelected(m)} className="bg-[#f0f4ff] hover:bg-[#dae2ff] text-[#003d9b] px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">View</button>
                      {m.aadhaarStatus === 'Pending' && (
                        <button onClick={() => verifyMember(m._id)} className="bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Verify</button>
                      )}
                      <button
                        onClick={() => suspendCard(m._id, m.status)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${m.status === 'Suspended' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                      >
                        {m.status === 'Suspended' ? 'Reinstate' : 'Suspend'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#516161] text-sm">
                    <span className="material-symbols-outlined text-3xl block mb-2 text-[#c3c6d6]">family_history</span>
                    No family members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-fade-in" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#c3c6d6]/20 pb-3">
              <h3 className="font-extrabold text-[#191b23]">Member Details</h3>
              <button onClick={() => setSelected(null)} className="material-symbols-outlined text-[#737685] hover:text-[#191b23] cursor-pointer">close</button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#dae2ff] text-[#003d9b] text-2xl font-extrabold flex items-center justify-center">
                {selectedMember.memberName.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-[#191b23]">{selectedMember.memberName}</h4>
                <p className="text-xs text-[#516161]">{selectedMember.relation} of {selectedMember.primaryUser}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Member ID', value: selectedMember.id },
                { label: 'Primary User', value: selectedMember.primaryUser },
                { label: 'Relation', value: selectedMember.relation },
                { label: 'Aadhaar Status', value: selectedMember.aadhaarStatus },
                { label: 'Card Status', value: selectedMember.status },
              ].map((item,i)=>(
                <div key={i} className="bg-[#f5f8ff] rounded-xl p-3">
                  <p className="text-[10px] text-[#516161] font-semibold uppercase">{item.label}</p>
                  <p className="text-sm font-bold text-[#191b23] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            
            {/* Aadhaar Documents Display */}
            <div className="space-y-2 mt-4">
              <p className="text-xs font-bold text-[#516161] uppercase tracking-wider">Aadhaar Documents</p>
              <div className="flex gap-4">
                {selectedMember.aadhaarFront ? (
                  <a href={`${SERVER_URL}${selectedMember.aadhaarFront}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl p-2 flex flex-col items-center justify-center hover:bg-[#dae2ff] transition-colors overflow-hidden">
                    <img src={`${SERVER_URL}${selectedMember.aadhaarFront}`} alt="Aadhaar Front" className="w-full h-24 object-cover rounded-lg mb-2" />
                    <p className="text-[10px] font-bold text-[#003d9b]">View Front</p>
                  </a>
                ) : (
                  <div className="flex-1 bg-[#f5f8ff] border border-[#c3c6d6]/40 border-dashed rounded-xl p-2 flex flex-col items-center justify-center h-32 opacity-60">
                    <span className="material-symbols-outlined text-[#737685]">image_not_supported</span>
                    <p className="text-[10px] text-[#737685] mt-1">No Front Image</p>
                  </div>
                )}
                
                {selectedMember.aadhaarBack ? (
                  <a href={`${SERVER_URL}${selectedMember.aadhaarBack}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl p-2 flex flex-col items-center justify-center hover:bg-[#dae2ff] transition-colors overflow-hidden">
                    <img src={`${SERVER_URL}${selectedMember.aadhaarBack}`} alt="Aadhaar Back" className="w-full h-24 object-cover rounded-lg mb-2" />
                    <p className="text-[10px] font-bold text-[#003d9b]">View Back</p>
                  </a>
                ) : (
                  <div className="flex-1 bg-[#f5f8ff] border border-[#c3c6d6]/40 border-dashed rounded-xl p-2 flex flex-col items-center justify-center h-32 opacity-60">
                    <span className="material-symbols-outlined text-[#737685]">image_not_supported</span>
                    <p className="text-[10px] text-[#737685] mt-1">No Back Image</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              {selectedMember.aadhaarStatus === 'Pending' && (
                <button onClick={()=>verifyMember(selectedMember._id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                  Verify Aadhaar
                </button>
              )}
              <button
                onClick={()=>suspendCard(selectedMember._id, selectedMember.status)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer border ${selectedMember.status==='Suspended'?'border-green-300 text-green-700 hover:bg-green-50':'border-red-200 text-red-600 hover:bg-red-50'}`}
              >
                {selectedMember.status==='Suspended'?'Reinstate Card':'Suspend Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
