import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  // Upload Previews
  const [profilePreview, setProfilePreview] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  const handleImageChange = (e, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const goToStep = (targetStep) => {
    // Validate current step before moving forward
    if (targetStep > step) {
      if (step === 1 && (!fullName || !mobileNumber || !email)) {
        alert('Please fill out all personal details.');
        return;
      }
      if (step === 2 && (!businessName || !address)) {
        alert('Please fill out all business details.');
        return;
      }
    }
    setStep(targetStep);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!aadhaarNumber) {
      alert('Please fill out your Aadhaar number.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      alert('Registration submitted successfully! Our verification team will review your documents within 24 hours.');
      setIsSubmitting(false);
      navigate('/agent/dashboard');
    }, 1500);
  };

  return (
    <div className="bg-[#faf8ff] text-[#191b23] font-body-md min-h-screen pb-24 relative">
      <style dangerouslySetInnerHTML={{__html: `
        .input-group label {
          transition: all 0.2s ease-in-out;
          pointer-events: none;
        }
        .input-field:focus ~ label,
        .input-field:not(:placeholder-shown) ~ label {
          transform: translateY(-1.5rem) scale(0.85);
          color: #003d9b;
          background: white;
          padding: 0 4px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 61, 155, 0.1);
        }
      `}} />

      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white shadow-sm border-b border-[#c3c6d6]/20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#003d9b] text-2xl font-bold">medical_services</span>
          <h1 className="text-xl font-bold text-[#003d9b]">MedCred India</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-[#f3f3fd] transition-colors duration-200">
            <span className="material-symbols-outlined text-[#434654]">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-[#0052cc] flex items-center justify-center text-white font-bold overflow-hidden border border-primary/20">
            <img 
              alt="Agent Profile" 
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDd9ThGrfGVzkidmRPTIDI9rqsV9Mu7No1auYCUdjrLGKvR0chE5rKk5qXivEhGft-ssJ52oNhXZKIqadr7z0uPvL4E27WhBMSnOMELffRrGsIpt2535LoA_D7pCM0N0F1uPv0n9EfIIQdfHgf-yTt7AC-2qpI6HPwzyDq-eXE2q72CG0qs8fdSgGQw0F-BPWWbKOYbuU-mBlamu_eTKw6z_So_NHd-C0dhjwvgRDdxW3n1ETevc-mcG8Xn9dGFYWLfwK7gljabIChN"
            />
          </div>
        </div>
      </header>

      <main className="pt-24 px-4 max-w-4xl mx-auto">
        {/* Welcome Section */}
        <section className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003d9b] mb-2">Agent Registration</h2>
          <p className="text-[#434654] text-sm md:text-base">Onboard as an authorized MedCred partner to facilitate seamless medical financing in your region.</p>
        </section>

        {/* Progress Indicator */}
        <div className="mb-8 relative max-w-lg mx-auto">
          <div className="flex justify-between items-center relative z-10">
            {/* Personal Details Step */}
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => goToStep(1)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step >= 1 ? 'bg-[#003d9b] text-white ring-4 ring-[#0052cc]/20' : 'bg-[#e1e2ec] text-[#434654]'}`}>
                <span className="material-symbols-outlined">{step > 1 ? 'check' : 'person'}</span>
              </div>
              <span className={`text-xs font-semibold ${step >= 1 ? 'text-[#003d9b]' : 'text-[#434654]'}`}>Personal</span>
            </div>

            {/* Business Details Step */}
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => goToStep(2)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step >= 2 ? 'bg-[#003d9b] text-white ring-4 ring-[#0052cc]/20' : 'bg-[#e1e2ec] text-[#434654]'}`}>
                <span className="material-symbols-outlined">{step > 2 ? 'check' : 'business_center'}</span>
              </div>
              <span className={`text-xs font-semibold ${step >= 2 ? 'text-[#003d9b]' : 'text-[#434654]'}`}>Business</span>
            </div>

            {/* Documents Step */}
            <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => goToStep(3)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step >= 3 ? 'bg-[#003d9b] text-white ring-4 ring-[#0052cc]/20' : 'bg-[#e1e2ec] text-[#434654]'}`}>
                <span className="material-symbols-outlined">description</span>
              </div>
              <span className={`text-xs font-semibold ${step >= 3 ? 'text-[#003d9b]' : 'text-[#434654]'}`}>Documents</span>
            </div>
          </div>
          
          {/* Progress Line Background */}
          <div className="absolute top-5 left-0 w-full h-[2px] bg-[#e1e2ec] -z-0"></div>
          {/* Progress Line Fill */}
          <div 
            className="absolute top-5 left-0 h-[2px] bg-[#003d9b] transition-all duration-500 ease-in-out" 
            style={{ width: `${(step - 1) * 50}%` }}
          ></div>
        </div>

        {/* Form Containers */}
        <div className="glass-card rounded-xl p-6 shadow-sm mb-12">
          
          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg md:text-xl font-bold text-[#191b23] mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative input-group">
                  <input 
                    className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                    id="full-name" 
                    placeholder=" " 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <label className="absolute left-4 top-3 text-[#434654] text-sm" htmlFor="full-name">Full Name</label>
                </div>
                
                <div className="relative input-group">
                  <input 
                    className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                    id="mobile-number" 
                    placeholder=" " 
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                  <label className="absolute left-4 top-3 text-[#434654] text-sm" htmlFor="mobile-number">Mobile Number</label>
                </div>
                
                <div className="relative input-group md:col-span-2">
                  <input 
                    className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                    id="email" 
                    placeholder=" " 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label className="absolute left-4 top-3 text-[#434654] text-sm" htmlFor="email">Email Address</label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  className="bg-[#003d9b] text-white px-8 py-3 rounded-full font-bold hover:bg-[#0052cc] transition-all active:scale-95 flex items-center gap-2 text-sm shadow-sm" 
                  onClick={() => goToStep(2)}
                >
                  Next Step <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Business Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg md:text-xl font-bold text-[#191b23] mb-4">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative input-group md:col-span-2">
                  <input 
                    className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                    id="business-name" 
                    placeholder=" " 
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                  <label className="absolute left-4 top-3 text-[#434654] text-sm" htmlFor="business-name">Business / Agency Name</label>
                </div>
                
                <div className="relative input-group md:col-span-2">
                  <textarea 
                    className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                    id="address" 
                    placeholder=" " 
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  ></textarea>
                  <label className="absolute left-4 top-3 text-[#434654] text-sm" htmlFor="address">Full Business Address</label>
                </div>
              </div>

              <div className="flex justify-between pt-4 text-sm">
                <button 
                  className="text-[#003d9b] px-6 py-3 rounded-full font-bold hover:bg-[#ededf8] transition-all flex items-center gap-2" 
                  onClick={() => goToStep(1)}
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                </button>
                <button 
                  className="bg-[#003d9b] text-white px-8 py-3 rounded-full font-bold hover:bg-[#0052cc] transition-all active:scale-95 flex items-center gap-2 shadow-sm" 
                  onClick={() => goToStep(3)}
                >
                  Next Step <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg md:text-xl font-bold text-[#191b23] mb-4">Identity Verification</h3>
              <div className="relative input-group">
                <input 
                  className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                  id="aadhaar-number" 
                  placeholder=" " 
                  type="text"
                  maxLength="12"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/[^0-9]/g, ''))}
                />
                <label className="absolute left-4 top-3 text-[#434654] text-sm" htmlFor="aadhaar-number">Aadhaar Number (12-Digits)</label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Profile Photo */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs font-semibold text-[#434654] text-center">Profile Photo</p>
                  <label className="w-full aspect-square border-2 border-dashed border-[#c3c6d6] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#003d9b] hover:bg-[#003d9b]/5 transition-all overflow-hidden group relative">
                    <input 
                      className="hidden" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, setProfilePreview)}
                    />
                    {!profilePreview ? (
                      <div className="text-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[#737685] text-4xl">account_circle</span>
                        <p className="text-xs mt-2 px-2 text-[#737685]">Click to Upload</p>
                      </div>
                    ) : (
                      <img alt="Profile Preview" className="w-full h-full object-cover animate-fade-in" src={profilePreview} />
                    )}
                  </label>
                </div>

                {/* Aadhaar Front */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs font-semibold text-[#434654] text-center">Aadhaar Front</p>
                  <label className="w-full aspect-square border-2 border-dashed border-[#c3c6d6] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#003d9b] hover:bg-[#003d9b]/5 transition-all overflow-hidden group relative">
                    <input 
                      className="hidden" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, setFrontPreview)}
                    />
                    {!frontPreview ? (
                      <div className="text-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[#737685] text-4xl">badge</span>
                        <p className="text-xs mt-2 px-2 text-[#737685]">Click to Upload</p>
                      </div>
                    ) : (
                      <img alt="Aadhaar Front" className="w-full h-full object-cover animate-fade-in" src={frontPreview} />
                    )}
                  </label>
                </div>

                {/* Aadhaar Back */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs font-semibold text-[#434654] text-center">Aadhaar Back</p>
                  <label className="w-full aspect-square border-2 border-dashed border-[#c3c6d6] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#003d9b] hover:bg-[#003d9b]/5 transition-all overflow-hidden group relative">
                    <input 
                      className="hidden" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, setBackPreview)}
                    />
                    {!backPreview ? (
                      <div className="text-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[#737685] text-4xl">credit_card</span>
                        <p className="text-xs mt-2 px-2 text-[#737685]">Click to Upload</p>
                      </div>
                    ) : (
                      <img alt="Aadhaar Back" className="w-full h-full object-cover animate-fade-in" src={backPreview} />
                    )}
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-4 text-sm">
                <button 
                  className="text-[#003d9b] px-6 py-3 rounded-full font-bold hover:bg-[#ededf8] transition-all flex items-center gap-2" 
                  type="button"
                  onClick={() => goToStep(2)}
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                </button>
                <button 
                  className="bg-[#a33500] text-[#ffc6b2] px-8 py-3 rounded-full font-bold hover:brightness-110 active:scale-95 flex items-center gap-2 shadow-lg disabled:opacity-50"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.06)] border-t border-[#c3c6d6]/20">
        <div className="flex flex-col items-center justify-center text-[#434654] px-4 py-1 cursor-pointer" onClick={() => navigate('/agent/dashboard')}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-semibold">Dashboard</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#d4e6e5] text-[#0e1e1e] rounded-xl px-4 py-1 cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
          <span className="text-[10px] font-semibold">Register</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#434654] px-4 py-1 cursor-pointer" onClick={() => navigate('/agent/customers')}>
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-semibold">Users</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#434654] px-4 py-1 cursor-pointer" onClick={() => navigate('/agent/profile')}>
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-semibold">Profile</span>
        </div>
      </nav>
    </div>
  );
}
