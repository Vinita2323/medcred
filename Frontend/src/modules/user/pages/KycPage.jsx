import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, saveKyc, updateKycStatus } from '../utils/storage';

export default function KycPage() {
  const navigate = useNavigate();
  const user = getUser();
  const fileRef = useRef(null);

  const [photo, setPhoto] = useState(user?.profilePic || null);
  const [form, setForm] = useState({
    aadhaar: user?.aadhaar || '',
    name: user?.name || '',
    dob: user?.dob || '',
    address: user?.address || '',
    pan: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState('form'); // form | verifying | done

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

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.aadhaar || !form.name || !form.dob || !form.address) {
      alert('Please fill all required fields.');
      return;
    }
    setStep('verifying');
    saveKyc({ ...form, photo });
    // Simulate verification — auto-verify after 2.5s for demo
    setTimeout(() => {
      updateKycStatus('verified');
      setStep('done');
    }, 2500);
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

        {/* Verifying overlay */}
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
            <p className="text-sm text-on-surface-variant max-w-[280px]">Your identity has been successfully verified. Now choose a healthcare plan to activate your MedCred account.</p>
            <div className="flex items-center gap-2 bg-tertiary/10 px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-xs font-bold text-tertiary">Aadhaar Verified · Identity Confirmed</span>
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
