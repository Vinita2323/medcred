import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';
import { compressImage } from '../../../utils/compressImage';

export default function KycPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null); // Actual File object
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [aadhaarBackFile, setAadhaarBackFile] = useState(null);
  
  const [form, setForm] = useState({
    aadhaar: '',
    name: '',
    dob: '',
    address: '',
    pan: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState('loading'); // loading | form | verifying | done | pending | rejected
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch initial KYC status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get(ENDPOINTS.KYC_STATUS);
        if (res.data?.success) {
          const status = res.data.data.status;
          if (status === 'verified') setStep('done');
          else if (status === 'pending') setStep('pending');
          else if (status === 'rejected') {
            setStep('rejected');
            setRejectionReason(res.data.data.rejectionReason);
          } else {
            setStep('form');
          }
        } else {
          setStep('form');
        }
      } catch (err) {
        console.error('Failed to get KYC status', err);
        setStep('form');
      }
    };
    checkStatus();
  }, []);

  const formatAadhaar = (val) => {
    let clean = val.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    let out = '';
    for (let i = 0; i < clean.length; i++) {
      if (i > 0 && i % 4 === 0) out += ' ';
      out += clean[i];
    }
    return out;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'aadhaar' ? formatAadhaar(value) : value }));
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setPhotoFile(compressed);
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(compressed);
  };

  const handleAadhaarFront = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setAadhaarFrontFile(compressed);
    const reader = new FileReader();
    reader.onload = (ev) => setAadhaarFront(ev.target.result);
    reader.readAsDataURL(compressed);
  };

  const handleAadhaarBack = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setAadhaarBackFile(compressed);
    const reader = new FileReader();
    reader.onload = (ev) => setAadhaarBack(ev.target.result);
    reader.readAsDataURL(compressed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.aadhaar || !form.name || !form.dob || !form.address) {
      alert('Please fill all required fields.');
      return;
    }
    setStep('verifying');

    try {
      const formData = new FormData();
      formData.append('aadhaarNumber', form.aadhaar.replace(/\s/g, ''));
      formData.append('name', form.name);
      formData.append('dob', form.dob);
      formData.append('address', form.address);
      if (form.pan) formData.append('pan', form.pan);
      if (photoFile) formData.append('photo', photoFile);
      if (aadhaarFrontFile) formData.append('aadhaarFront', aadhaarFrontFile);
      if (aadhaarBackFile) formData.append('aadhaarBack', aadhaarBackFile);

      const res = await api.post(ENDPOINTS.KYC_SUBMIT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setStep('pending');
      } else {
        alert(res.data?.message || 'Failed to submit KYC');
        setStep('form');
      }
    } catch (err) {
      console.error('KYC submission error', err);
      alert('Error submitting KYC');
      setStep('form');
    }
  };

  return (
    <div className="flex-grow flex flex-col bg-white text-on-surface font-body-md min-h-screen">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-16 sticky top-0 z-40 bg-white border-b border-outline-variant/30 shadow-sm">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>
        <img src="/FinalLogo.png" alt="MedCred" className="h-10 w-auto object-contain" />
      </header>

      <main className="flex-grow overflow-y-auto px-4 py-6 max-w-md mx-auto w-full">

        {/* Loading state */}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-on-surface-variant font-medium text-sm">Checking KYC Status...</p>
          </div>
        )}

        {/* Verifying overlay (uploading) */}
        {step === 'verifying' && (
          <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-ring">
              <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">Verifying Identity</h3>
            <p className="text-sm text-on-surface-variant text-center max-w-[260px]">Checking your Aadhaar details through government databases…</p>
          </div>
        )}

        {/* Success state */}
        {step === 'done' && (
          <div className="flex flex-col items-center text-center py-8 animate-scale-up gap-4">
            <div className="w-24 h-24 rounded-full bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-5xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            </div>
            <h2 className="text-2xl font-black text-on-surface">KYC Verified!</h2>
            <p className="text-sm text-on-surface-variant max-w-[280px]">Your identity has been successfully verified by an Admin. You have full access to MedCred.</p>
            <div className="flex items-center gap-2 bg-tertiary/10 px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-xs font-bold text-tertiary">Identity Confirmed</span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 w-full h-13 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer py-4"
            >
              <span>Go to Dashboard</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Pending state */}
        {step === 'pending' && (
          <div className="flex flex-col items-center text-center py-8 animate-scale-up gap-4">
            <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
            </div>
            <h2 className="text-2xl font-black text-on-surface">Under Review</h2>
            <p className="text-sm text-on-surface-variant max-w-[280px]">Your KYC documents have been submitted and are currently under review by our team.</p>
            <div className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              <span className="text-xs font-bold text-secondary">Awaiting Approval</span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 w-full h-13 bg-surface-container text-on-surface font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all cursor-pointer py-4"
            >
              <span>Return to Dashboard</span>
            </button>
          </div>
        )}

        {/* Rejected state */}
        {step === 'rejected' && (
          <div className="flex flex-col items-center text-center py-8 animate-scale-up gap-4">
            <div className="w-24 h-24 rounded-full bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            </div>
            <h2 className="text-2xl font-black text-on-surface text-error">KYC Rejected</h2>
            <p className="text-sm text-on-surface-variant max-w-[280px]">Your previous KYC submission was rejected.</p>
            {rejectionReason && (
              <div className="bg-error/10 p-3 rounded-lg text-error text-xs font-medium w-full text-left border border-error/20">
                <strong>Reason:</strong> {rejectionReason}
              </div>
            )}
            <button
              onClick={() => { setStep('form'); setForm({ aadhaar: '', name: '', dob: '', address: '', pan: '' }); }}
              className="mt-4 w-full h-13 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer py-4"
            >
              <span>Resubmit KYC</span>
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
        )}

        {/* KYC Form */}
        {step === 'form' && (
          <>
            {/* Page title */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black">3</span>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Step 3 of 4</span>
              </div>
              <h1 className="text-2xl font-black text-on-surface">KYC Verification</h1>
              <p className="text-sm text-on-surface-variant mt-1">Verify your identity to unlock healthcare benefits.</p>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1.5 mb-6">
              {[1,2,3,4].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 3 ? 'bg-primary' : 'bg-surface-container-highest'}`} />
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photo upload */}
              <div className="flex flex-col items-center gap-2">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-surface-container border-2 border-dashed border-primary/40 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-all relative"
                >
                  {photo ? (
                    <img src={photo} alt="KYC" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-primary/50">
                      <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                      <span className="text-[9px] font-bold">PHOTO</span>
                    </div>
                  )}
                  {photo && (
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow">
                      <span className="material-symbols-outlined text-white text-sm">edit</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                <span className="text-xs font-semibold text-primary">Upload Profile Photo</span>
              </div>

              {/* Fields */}
              {[
                { label: 'Full Name (as per Aadhaar)', name: 'name', type: 'text', placeholder: 'e.g. Rahul Kumar Sharma', required: true },
                { label: 'Date of Birth', name: 'dob', type: 'date', required: true },
              ].map(field => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{field.label}</label>
                  <input
                    name={field.name} type={field.type} placeholder={field.placeholder}
                    value={form[field.name]} onChange={handleChange} required={field.required}
                    className="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              ))}

              {/* Aadhaar */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Aadhaar Number *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 text-xl">fingerprint</span>
                  <input
                    name="aadhaar" type="text" placeholder="0000 0000 0000"
                    maxLength={14} value={form.aadhaar} onChange={handleChange} required
                    className="w-full h-12 pl-12 pr-4 bg-surface-container-low border border-outline-variant rounded-2xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Aadhaar Photos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Aadhaar Front *</label>
                  <label className="w-full h-24 bg-surface-container-low border border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden relative">
                    {aadhaarFront ? (
                      <img src={aadhaarFront} alt="Aadhaar Front" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-primary/50 text-2xl">front_hand</span>
                        <span className="text-[10px] text-on-surface-variant mt-1 font-semibold">Upload Front</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAadhaarFront} required />
                  </label>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Aadhaar Back *</label>
                  <label className="w-full h-24 bg-surface-container-low border border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden relative">
                    {aadhaarBack ? (
                      <img src={aadhaarBack} alt="Aadhaar Back" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-primary/50 text-2xl">flip_to_back</span>
                        <span className="text-[10px] text-on-surface-variant mt-1 font-semibold">Upload Back</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAadhaarBack} required />
                  </label>
                </div>
              </div>

              {/* PAN (optional) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">PAN Number <span className="normal-case font-normal">(optional)</span></label>
                <input
                  name="pan" type="text" placeholder="ABCDE1234F"
                  maxLength={10} value={form.pan} onChange={handleChange}
                  className="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-2xl text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Permanent Address *</label>
                <textarea
                  name="address" placeholder="Street, Area, City, State, PIN"
                  value={form.address} onChange={handleChange} required rows={3}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Security note */}
              <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-4">
                <span className="material-symbols-outlined text-primary text-xl shrink-0">security</span>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Your data is encrypted and verified through UIDAI government servers. MedCred never stores raw Aadhaar data.
                </p>
              </div>

              <button
                type="submit"
                className="w-full h-13 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer py-4 text-sm"
              >
                <span className="material-symbols-outlined">verified_user</span>
                Verify My Identity
              </button>

              <p className="text-center text-[11px] text-on-surface-variant">
                🔒 256-bit SSL encrypted · RBI Compliant
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
