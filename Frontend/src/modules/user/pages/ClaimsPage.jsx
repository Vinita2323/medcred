import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';
import { compressImage } from '../../../utils/compressImage';

const TYPE_META = {
  medical_services: { icon: 'medical_services', bg: 'bg-primary-fixed', text: 'text-primary' },
  emergency:        { icon: 'emergency',         bg: 'bg-error-container/50', text: 'text-error' },
  diagnostic:       { icon: 'biotech',           bg: 'bg-secondary-container/20', text: 'text-secondary' },
  pharmacy:         { icon: 'medication',        bg: 'bg-tertiary-fixed', text: 'text-tertiary' },
};

const STATUS_CLASS = {
  pending:  'bg-secondary-container/20 text-on-secondary-container border border-secondary-container/30',
  approved: 'bg-tertiary-fixed/20 text-on-tertiary-fixed-variant border border-tertiary-fixed/30',
  rejected: 'bg-error-container text-on-error-container',
};

export default function ClaimsPage() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasCard, setHasCard] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    hospitalName: '',
    claimAmount: '5000',
    claimType: 'medical_services',
    description: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Check card
      const cardRes = await api.get(ENDPOINTS.MY_CARD);
      if (cardRes.data?.success && cardRes.data.data?.status === 'active') {
        setHasCard(true);
      }
      // Fetch claims
      const claimsRes = await api.get(ENDPOINTS.MY_CLAIMS);
      if (claimsRes.data?.success) {
        setClaims(claimsRes.data.data);
        if (claimsRes.data.data.length > 0) {
          setSelectedClaimId(claimsRes.data.data[0]._id);
        }
      }
    } catch {
      // If no card found, hasCard stays false
    } finally {
      setLoading(false);
    }
  };

  const handleNewClaim = () => {
    setFormData({ hospitalName: '', claimAmount: '5000', claimType: 'medical_services', description: '' });
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleFileSelect = async (e) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      if (selectedFiles.length + filesArr.length > 5) {
        alert("You can only upload up to 5 documents.");
        return;
      }
      const compressed = await Promise.all(filesArr.map(f => compressImage(f)));
      setSelectedFiles([...selectedFiles, ...compressed]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const submitNewClaim = async () => {
    if (!formData.hospitalName || !formData.claimAmount) {
      alert('Please fill out Hospital Name and Claim Amount.');
      return;
    }
    if (selectedFiles.length === 0) {
      alert('Please upload at least 1 document (e.g. Prescription or Bill).');
      return;
    }
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('hospitalName', formData.hospitalName);
      payload.append('claimAmount', formData.claimAmount);
      payload.append('claimType', formData.claimType);
      if (formData.description) {
        payload.append('description', formData.description);
      }
      selectedFiles.forEach((file) => {
        payload.append('documents', file);
      });

      const res = await api.post(ENDPOINTS.CLAIMS_SUBMIT, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setClaims([res.data.data, ...claims]);
        setSelectedClaimId(res.data.data._id);
        setIsModalOpen(false);
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to submit claim. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClaim = claims.find(c => c._id === selectedClaimId) || claims[0];

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-surface">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className={`flex-grow flex flex-col bg-surface lg:bg-[#F4F7FD] text-on-surface font-body-md relative min-h-screen ${isModalOpen ? 'h-screen overflow-hidden' : 'pb-24 lg:pb-0'}`}>
      {/* Decorative desktop backgrounds */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxjaXJjbGUgY3g9IjMiIGN5PSIzIiByPSIxIiBmaWxsPSIjZDVkOWU0Ij48L2NpcmNsZT4KPC9zdmc+')] [mask-image:radial-gradient(ellipse_at_top_left,black_20%,transparent_70%)]"></div>

      {!isModalOpen && (
        <header className="flex justify-between items-center pl-2 pr-4 lg:px-8 w-full h-20 lg:h-20 sticky top-0 z-40 bg-surface lg:bg-white shadow-sm border-b border-outline-variant/30">
          <div className="flex items-center gap-4">
            <img alt="MedCred Logo" className="h-16 lg:h-14 w-auto object-contain" src="/FinalLogo.png" />
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary">notifications</span>
          </button>
        </header>
      )}

      <main className={`flex-grow p-4 lg:p-8 space-y-4 lg:space-y-0 lg:max-w-6xl lg:mx-auto w-full animate-fade-in relative z-10 ${isModalOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <div className="lg:bg-white lg:shadow-xl lg:rounded-[32px] lg:p-8 lg:border lg:border-blue-100">

        {/* Membership / Card Gate */}
        {!hasCard && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-4xl">lock</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-on-surface">Claims Locked</h3>
              <p className="text-sm text-on-surface-variant mt-1 max-w-[260px] mx-auto leading-relaxed">
                Purchase a healthcare membership to unlock claim submission and management.
              </p>
            </div>
            <button
              onClick={() => navigate('/membership-plans')}
              className="bg-primary text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:opacity-90 cursor-pointer active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">health_and_safety</span>
              Activate Membership
            </button>
            <p className="text-[11px] text-on-surface-variant">Starting from ₹999/year</p>
          </div>
        )}

        {hasCard && <>
          {/* Welcome & CTA */}
          <section className="flex items-center justify-between gap-4 border-b border-outline-variant/30 pb-4 mb-4 lg:mb-6">
            <div>
              <p className="text-[10px] lg:text-[11px] text-secondary font-bold uppercase tracking-wider">Dashboard Overview</p>
              <h2 className="text-xl lg:text-2xl font-bold text-on-surface mt-0.5">Manage Claims</h2>
            </div>
            <button
              onClick={handleNewClaim}
              className="bg-primary text-on-primary text-xs lg:text-sm py-2.5 px-4 lg:px-5 rounded-xl lg:rounded-2xl shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-base lg:text-lg">add_circle</span>
              New Claim
            </button>
          </section>

          <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start space-y-4 lg:space-y-0">
            {/* Left Column (Desktop) */}
            <div className="lg:col-span-5 space-y-4 lg:space-y-6">
          {/* Stats */}
          <section className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-lowest border border-outline-variant p-3.5 rounded-xl shadow-sm">
              <p className="text-[10px] font-bold text-on-surface-variant">Total Claims</p>
              <p className="text-2xl font-bold text-primary mt-1">{claims.length}</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant p-3.5 rounded-xl shadow-sm">
              <p className="text-[10px] font-bold text-on-surface-variant">Pending</p>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-2xl font-bold text-secondary">{claims.filter(c => c.status === 'pending').length}</p>
                {claims.some(c => c.status === 'pending') && <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>}
              </div>
            </div>
          </section>

          {/* Selected Claim Tracker */}
          {selectedClaim && (
            <aside className="space-y-3">
              <h3 className="text-xs font-bold text-on-surface px-1">Tracking Claim #{selectedClaim.claimId}</h3>
              <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
                <div className="relative z-10 space-y-5">
                  <div className="relative pl-8 space-y-5">
                    <div className="absolute left-3.5 top-1 bottom-1 w-0.5 bg-outline-variant"></div>
                    <div className="relative">
                      <div className="absolute -left-8 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                        <span className="material-symbols-outlined text-xs">check</span>
                      </div>
                      <p className="text-xs font-bold text-on-surface">Submitted</p>
                      <p className="text-[10px] text-on-surface-variant">
                        {new Date(selectedClaim.submittedAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-8 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                        <span className="material-symbols-outlined text-xs">check</span>
                      </div>
                      <p className="text-xs font-bold text-on-surface">Under Review</p>
                      <p className="text-[10px] text-on-surface-variant">Assessment in progress</p>
                    </div>
                    <div className="relative">
                      <div className={`absolute -left-8 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                        selectedClaim.status === 'approved' ? 'bg-primary text-white' :
                        selectedClaim.status === 'rejected' ? 'bg-error text-white' :
                        'bg-white border-2 border-primary text-primary'
                      }`}>
                        {selectedClaim.status === 'approved' ? (
                          <span className="material-symbols-outlined text-xs">check</span>
                        ) : selectedClaim.status === 'rejected' ? (
                          <span className="material-symbols-outlined text-xs">close</span>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-on-surface">Verification</p>
                      <p className="text-[10px] text-on-surface-variant">
                        {selectedClaim.status === 'approved' ? 'Verification successful' :
                         selectedClaim.status === 'rejected' ? `Rejected: ${selectedClaim.rejectionReason || 'See details'}` :
                         'In progress'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
          </div>

          {/* Right Column (Desktop) */}
          <div className="lg:col-span-7 space-y-4 lg:space-y-6">

          {/* Claims List */}
          {claims.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-outline">receipt_long</span>
              <p className="text-sm font-bold text-on-surface">No claims yet</p>
              <p className="text-xs text-on-surface-variant">Submit your first claim using the button above.</p>
            </div>
          ) : (
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-on-surface px-1">Recent Claims</h3>
              <div className="space-y-3">
                {claims.map((claim) => {
                  const meta = TYPE_META[claim.claimType] || TYPE_META.medical_services;
                  return (
                    <div
                      key={claim._id}
                      onClick={() => setSelectedClaimId(claim._id)}
                      className={`border p-4 rounded-xl hover:bg-surface-container transition-all cursor-pointer shadow-sm flex justify-between items-start ${
                        selectedClaimId === claim._id ? 'border-primary bg-surface-container-low' : 'border-outline-variant bg-surface-container-lowest'
                      }`}
                    >
                      <div className="flex gap-3.5">
                        <div className={`w-10 h-10 rounded-lg ${meta.bg} flex items-center justify-center ${meta.text}`}>
                          <span className="material-symbols-outlined text-xl">{meta.icon}</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface">{claim.hospitalName}</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">Claim #{claim.claimId} • {new Date(claim.submittedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-sm font-bold text-primary mt-1">₹{Number(claim.claimAmount).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full tracking-wider ${STATUS_CLASS[claim.status] || ''}`}>
                        {claim.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Support Card */}
          <section className="bg-primary p-4 lg:p-6 rounded-xl lg:rounded-2xl text-on-primary space-y-2 lg:space-y-3 relative overflow-hidden shadow-md">
            <div className="relative z-10 space-y-2">
              <p className="text-sm lg:text-base font-bold">Need help?</p>
              <p className="text-xs lg:text-sm opacity-90 leading-normal max-w-[80%]">Talk to our medical claim experts for faster processing.</p>
              <button
                onClick={() => navigate('/support')}
                className="bg-white text-primary text-xs lg:text-sm font-bold px-4 py-2 rounded-lg lg:rounded-xl cursor-pointer hover:bg-slate-100 transition-colors shadow-sm"
              >
                Contact Support
              </button>
            </div>
          </section>
          </div>
          </div>

          {/* New Claim Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center py-6 bg-[#0D1B3E]/60 backdrop-blur-sm animate-fade-in px-4 overflow-y-auto">
              <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl animate-slide-up my-auto">
                <h3 className="text-lg font-bold text-on-surface mb-4">Submit New Claim</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Hospital Name *</label>
                    <input
                      type="text"
                      value={formData.hospitalName}
                      onChange={e => setFormData({...formData, hospitalName: e.target.value})}
                      placeholder="e.g. Apollo Hospitals"
                      className="w-full h-12 px-4 mt-1 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Claim Amount (INR) *</label>
                    <input
                      type="number"
                      value={formData.claimAmount}
                      onChange={e => setFormData({...formData, claimAmount: e.target.value})}
                      placeholder="5000"
                      className="w-full h-12 px-4 mt-1 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Claim Type</label>
                    <select
                      value={formData.claimType}
                      onChange={e => setFormData({...formData, claimType: e.target.value})}
                      className="w-full h-12 px-4 mt-1 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                    >
                      <option value="medical_services">Medical Services</option>
                      <option value="emergency">Emergency</option>
                      <option value="diagnostic">Diagnostic</option>
                      <option value="pharmacy">Pharmacy</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Description (Optional)</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Brief description of the treatment..."
                      rows={2}
                      className="w-full px-4 py-3 mt-1 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Documents (Max 5) *</label>
                    <div className="mt-1 relative w-full h-16 bg-surface-container-lowest border-2 border-outline-variant border-dashed rounded-xl flex items-center justify-center overflow-hidden hover:bg-surface-container-low transition-colors">
                      <input 
                        type="file" 
                        multiple
                        accept="image/*,.pdf" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileSelect}
                      />
                      <div className="flex flex-col items-center justify-center pointer-events-none text-primary">
                        <span className="material-symbols-outlined text-2xl">upload_file</span>
                        <span className="text-[10px] font-bold">Tap to attach Prescription, Bills etc.</span>
                      </div>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex justify-between items-center bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/50">
                            <span className="text-[10px] text-on-surface font-semibold truncate max-w-[200px]">{file.name}</span>
                            <button onClick={() => removeFile(index)} className="text-error hover:text-error/80 cursor-pointer">
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitNewClaim}
                      disabled={submitting}
                      className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>}
        </div>
      </main>

      {!isModalOpen && <BottomNavBar />}
    </div>
  );
}
