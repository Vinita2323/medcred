import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

const STATUS_COLORS = {
  Active:   'bg-green-100 text-green-700',
  Pending:  'bg-yellow-100 text-yellow-700',
  Inactive: 'bg-gray-100 text-gray-700',
  Rejected: 'bg-red-100 text-red-700',
};

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilter] = useState('All');
  const [showAdd, setShowAdd]     = useState(false);
  const [editTarget, setEdit]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const emptyForm = { name: '', location: '', contact: '', claimEnabled: false, network: false };
  const [form, setForm] = useState(emptyForm);

  // ── Fetch ───────────────────────────────────────────────────────
  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.ADMIN_HOSPITALS);
      if (res.data?.success) setHospitals(res.data.data);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHospitals(); }, []);

  // ── Add / Edit ──────────────────────────────────────────────────
  const submitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        location: form.location,
        contact: form.contact,
        claimEnabled: form.claimEnabled,
        network: form.network,
      };

      let res;
      if (editTarget) {
        res = await api.patch(ENDPOINTS.ADMIN_HOSPITAL_UPDATE(editTarget.id), payload);
      } else {
        res = await api.post(ENDPOINTS.ADMIN_HOSPITALS, payload);
      }

      if (res.data?.success) {
        fetchHospitals();
        setShowAdd(false);
        setEdit(null);
        setForm(emptyForm);
      }
    } catch (error) {
      console.error('Failed to save hospital:', error);
      alert('Failed to save hospital');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (h) => {
    setForm({ name: h.name, location: h.location, contact: h.contact, claimEnabled: h.claimEnabled, network: h.network });
    setEdit(h);
    setShowAdd(true);
  };

  // ── Status Actions ──────────────────────────────────────────────
  const approveHospital = async (h) => {
    try {
      const res = await api.patch(ENDPOINTS.ADMIN_HOSPITAL_STATUS(h.id), { status: 'active' });
      if (res.data?.success) fetchHospitals();
    } catch (error) {
      console.error('Failed to approve hospital:', error);
    }
  };

  const deactivate = async (h) => {
    try {
      const res = await api.patch(ENDPOINTS.ADMIN_HOSPITAL_STATUS(h.id), { status: 'inactive' });
      if (res.data?.success) fetchHospitals();
    } catch (error) {
      console.error('Failed to deactivate hospital:', error);
    }
  };

  // ── Toggle Flags ────────────────────────────────────────────────
  const toggleClaim = async (h) => {
    try {
      const res = await api.patch(ENDPOINTS.ADMIN_HOSPITAL_TOGGLE(h.id), { field: 'isClaimEnabled' });
      if (res.data?.success) fetchHospitals();
    } catch (error) {
      console.error('Failed to toggle claim:', error);
    }
  };

  const toggleNetwork = async (h) => {
    try {
      const res = await api.patch(ENDPOINTS.ADMIN_HOSPITAL_TOGGLE(h.id), { field: 'isNetworkHospital' });
      if (res.data?.success) fetchHospitals();
    } catch (error) {
      console.error('Failed to toggle network:', error);
    }
  };

  // ── Filter (client-side on fetched data) ───────────────────────
  const filtered = hospitals.filter(h => {
    const q = search.toLowerCase();
    const matchQ = !q || h.name.toLowerCase().includes(q) || h.location.toLowerCase().includes(q);
    const matchS  = filterStatus === 'All' || h.status === filterStatus;
    return matchQ && matchS;
  });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Banner */}
      <section className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-blue-200 font-bold">Healthcare Network</span>
            <h2 className="text-xl font-extrabold mt-1">Hospital Management</h2>
            <p className="text-sm text-white/80 mt-1">Add, approve, and manage partner hospitals in the MedCred network.</p>
          </div>
          <button
            onClick={() => { setForm(emptyForm); setEdit(null); setShowAdd(true); }}
            className="flex items-center gap-2 bg-white text-[#003d9b] hover:bg-[#f0f4ff] font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-md transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Hospital
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Hospitals',  value: hospitals.length,                               color:'text-[#003d9b]', bg:'bg-[#dae2ff]', icon:'local_hospital' },
          { label: 'Active Network',   value: hospitals.filter(h=>h.status==='Active').length, color:'text-green-700', bg:'bg-green-100', icon:'check_circle' },
          { label: 'Pending Approval', value: hospitals.filter(h=>h.status==='Pending').length,color:'text-yellow-700',bg:'bg-yellow-100',icon:'hourglass_empty' },
          { label: 'Claim Enabled',    value: hospitals.filter(h=>h.claimEnabled).length,      color:'text-blue-700', bg:'bg-blue-100',  icon:'verified' },
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

      {/* Filters */}
      <div className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737685] text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search by hospital name or location…"
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
          {['All','Active','Pending','Inactive'].map(v=><option key={v}>{v}</option>)}
        </select>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-[#516161] text-sm gap-2">
          <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
          Loading hospitals...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(h => (
            <div key={h.id} className="bg-white border border-[#c3c6d6]/20 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#dae2ff] text-[#003d9b] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings:"'FILL' 1" }}>local_hospital</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#191b23] text-sm leading-tight">{h.name}</h4>
                    <p className="text-[11px] text-[#737685] font-mono">{h.hospitalId}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${STATUS_COLORS[h.status]}`}>{h.status}</span>
              </div>

              <div className="space-y-1.5 text-xs mb-4">
                <div className="flex items-center gap-2 text-[#516161]">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  <span className="font-semibold">{h.location || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#516161]">
                  <span className="material-symbols-outlined text-[14px]">call</span>
                  <span className="font-semibold">{h.contact || 'N/A'}</span>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${h.claimEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {h.claimEnabled ? '✓ Claim Enabled' : '✗ No Claims'}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${h.network ? 'bg-[#dae2ff] text-[#003d9b]' : 'bg-gray-100 text-gray-600'}`}>
                  {h.network ? '✓ Network' : 'Not Network'}
                </span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {h.status === 'Pending' && (
                  <button onClick={() => approveHospital(h)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">Approve</button>
                )}
                {h.status === 'Active' && (
                  <button onClick={() => deactivate(h)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">Deactivate</button>
                )}
                <button onClick={() => toggleClaim(h)} className="bg-[#f0f4ff] hover:bg-[#dae2ff] text-[#003d9b] px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                  {h.claimEnabled ? 'Disable Claims' : 'Enable Claims'}
                </button>
                <button onClick={() => openEdit(h)} className="bg-[#f5f8ff] hover:bg-[#dae2ff] text-[#516161] px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-3 text-center py-16 text-[#516161] text-sm">
              <span className="material-symbols-outlined text-4xl block mb-2 text-[#c3c6d6]">local_hospital</span>
              No hospitals found. Add a new hospital to get started.
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowAdd(false); setEdit(null); }}>
          <form onSubmit={submitForm} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-fade-in" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#c3c6d6]/20 pb-3">
              <h3 className="font-extrabold text-[#191b23]">{editTarget ? 'Edit Hospital' : 'Add New Hospital'}</h3>
              <button type="button" onClick={() => { setShowAdd(false); setEdit(null); }} className="material-symbols-outlined text-[#737685] cursor-pointer">close</button>
            </div>
            {[
              { label: 'Hospital Name', key: 'name', placeholder: 'e.g. Apollo Hospitals' },
              { label: 'Location',      key: 'location', placeholder: 'City, State' },
              { label: 'Contact',       key: 'contact', placeholder: '+91-XX-XXXX-XXXX' },
            ].map(f => (
              <div key={f.key} className="space-y-1">
                <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">{f.label}</label>
                <input
                  required={f.key === 'name'}
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#003d9b]"
                />
              </div>
            ))}
            <div className="flex gap-4">
              {[
                { label: 'Claim Enabled', key: 'claimEnabled' },
                { label: 'Network Hospital', key: 'network' },
              ].map(t => (
                <label key={t.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[t.key]}
                    onChange={e => setForm(prev => ({ ...prev, [t.key]: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#003d9b] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[#516161]">{t.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowAdd(false); setEdit(null); }} className="flex-1 border border-[#c3c6d6]/40 text-[#434654] py-2.5 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#003d9b] hover:bg-[#0052cc] text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? <><span className="animate-spin material-symbols-outlined text-[14px]">progress_activity</span> Saving...</> : (editTarget ? 'Save Changes' : 'Add Hospital')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
