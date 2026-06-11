import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentOnboardCustomerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [relation, setRelation] = useState('Self');
  const [cardType, setCardType] = useState('Individual');
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  // OTP Verification Simulation for Aadhaar
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

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

  const handleSendOtp = () => {
    if (aadhaarNumber.length !== 12) {
      alert('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    setOtpSent(true);
    alert('Mock OTP sent to customer\'s registered mobile number linked with Aadhaar (simulated OTP: 123456).');
  };

  const handleVerifyOtp = () => {
    if (otpCode === '123456') {
      setIsVerifyingOtp(true);
      setTimeout(() => {
        setIsVerifyingOtp(false);
        setIsAadhaarVerified(true);
        alert('Aadhaar KYC verified successfully!');
      }, 1000);
    } else {
      alert('Incorrect OTP code. Please use 123456 for mockup simulation.');
    }
  };

  const goToStep = (targetStep) => {
    if (targetStep > step) {
      if (step === 1 && (!fullName || !mobileNumber || !dob || !gender)) {
        alert('Please fill out all primary customer details.');
        return;
      }
      if (step === 2 && !isAadhaarVerified) {
        alert('Please complete the Aadhaar KYC verification before moving to document upload.');
        return;
      }
    }
    setStep(targetStep);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!profilePreview || !frontPreview || !backPreview) {
      alert('Please upload all required identity documents.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      alert('Customer profile created and sent for approval successfully!');
      setIsSubmitting(false);
      navigate('/agent/customers');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <style dangerouslySetInnerHTML={{ __html: `
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
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 61, 155, 0.1);
        }
      ` }} />

      <section className="space-y-1">
        <p className="text-[#516161] text-sm md:text-base">Register a new customer for MedCred Digital Health and Medical financing cards.</p>
      </section>

      {/* Progress Tracker */}
      <div className="relative max-w-lg mx-auto py-4">
        <div className="flex justify-between items-center relative z-10">
          <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => goToStep(1)}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step >= 1 ? 'bg-[#003d9b] text-white ring-4 ring-[#0052cc]/20' : 'bg-[#e1e2ec] text-[#434654]'}`}>
              <span className="material-symbols-outlined text-[20px]">{step > 1 ? 'check' : 'person'}</span>
            </div>
            <span className={`text-xs font-semibold ${step >= 1 ? 'text-[#003d9b]' : 'text-[#434654]'}`}>Customer Info</span>
          </div>

          <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => goToStep(2)}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step >= 2 ? 'bg-[#003d9b] text-white ring-4 ring-[#0052cc]/20' : 'bg-[#e1e2ec] text-[#434654]'}`}>
              <span className="material-symbols-outlined text-[20px]">{step > 2 ? 'check' : 'verified_user'}</span>
            </div>
            <span className={`text-xs font-semibold ${step >= 2 ? 'text-[#003d9b]' : 'text-[#434654]'}`}>Aadhaar KYC</span>
          </div>

          <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => goToStep(3)}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step >= 3 ? 'bg-[#003d9b] text-white ring-4 ring-[#0052cc]/20' : 'bg-[#e1e2ec] text-[#434654]'}`}>
              <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
            </div>
            <span className={`text-xs font-semibold ${step >= 3 ? 'text-[#003d9b]' : 'text-[#434654]'}`}>Documents</span>
          </div>
        </div>
        
        <div className="absolute top-9 left-0 w-full h-[2px] bg-[#e1e2ec] -z-0"></div>
        <div 
          className="absolute top-9 left-0 h-[2px] bg-[#003d9b] transition-all duration-500 ease-in-out" 
          style={{ width: `${(step - 1) * 50}%` }}
        ></div>
      </div>

      {/* Steps Container */}
      <div className="glass-card rounded-xl p-6 shadow-sm">
        
        {/* Step 1: Customer Info */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-[#191b23] mb-4">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="relative input-group">
                <input 
                  className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                  id="full-name" 
                  placeholder=" " 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <label className="absolute left-4 top-3 text-[#434654] text-sm" htmlFor="full-name">Customer Full Name</label>
              </div>

              <div className="relative input-group">
                <input 
                  className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                  id="mobile" 
                  placeholder=" " 
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                />
                <label className="absolute left-4 top-3 text-[#434654] text-sm" htmlFor="mobile">Mobile Number</label>
              </div>

              <div className="relative input-group">
                <input 
                  className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm text-[#434654]" 
                  id="dob" 
                  placeholder=" " 
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
                <label className="absolute left-4 top-3 text-[#434654] text-sm" htmlFor="dob">Date of Birth</label>
              </div>

              <div className="relative input-group">
                <select 
                  className="block w-full px-4 py-3 bg-white border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm text-[#434654]"
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="relative input-group">
                <select 
                  className="block w-full px-4 py-3 bg-white border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm text-[#434654]"
                  id="relation"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                >
                  <option value="Self">Self (Primary Holder)</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Other">Other Family Member</option>
                </select>
              </div>

              <div className="relative input-group">
                <select 
                  className="block w-full px-4 py-3 bg-white border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm text-[#434654]"
                  id="cardType"
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                >
                  <option value="Individual">Individual Card Plan</option>
                  <option value="Family">Family Card Plan</option>
                </select>
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

              <div className="relative input-group md:col-span-2">
                <textarea 
                  className="block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                  id="address" 
                  placeholder="Full Residential Address" 
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                className="bg-[#003d9b] text-white px-8 py-3 rounded-full font-bold hover:bg-[#0052cc] transition-all active:scale-95 flex items-center gap-2 text-sm shadow-sm cursor-pointer" 
                onClick={() => goToStep(2)}
              >
                Continue to KYC <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Aadhaar KYC */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-[#191b23] mb-4">Aadhaar KYC Verification</h3>
            
            <div className="bg-[#f0f4fa] border border-[#d2e2f4] rounded-xl p-5 text-sm space-y-2">
              <p className="font-bold text-[#003d9b] flex items-center gap-2">
                <span className="material-symbols-outlined">security</span> Aadhaar Data Verification
              </p>
              <p className="text-xs text-[#516161] leading-relaxed">
                As per RBI guidelines, we verify the customer's identity via biometric or OTP verification linked with their UIDAI account. Enter their Aadhaar number to trigger authentication.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="relative input-group flex-grow">
                  <input 
                    className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm font-semibold tracking-wider" 
                    id="aadhaar-number" 
                    placeholder=" " 
                    maxLength="12"
                    value={aadhaarNumber}
                    disabled={isAadhaarVerified}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                  <label className="absolute left-4 top-3 text-[#434654] text-sm" htmlFor="aadhaar-number">12-Digit Aadhaar Number</label>
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isAadhaarVerified || aadhaarNumber.length !== 12}
                  className="bg-[#003d9b] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#0052cc] active:scale-95 transition-all shadow-sm disabled:opacity-50 cursor-pointer h-[46px] flex items-center justify-center"
                >
                  {otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>

              {otpSent && !isAadhaarVerified && (
                <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#dae2ff] space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="relative input-group flex-grow">
                      <input 
                        className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm tracking-widest text-center font-bold" 
                        id="otp-code" 
                        placeholder=" " 
                        maxLength="6"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                      <label className="absolute left-4 top-3 text-[#434654] text-sm" htmlFor="otp-code">Enter 6-Digit OTP</label>
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isVerifyingOtp || otpCode.length !== 6}
                      className="bg-[#0c56d0] text-white px-6 py-3 rounded-lg font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-sm disabled:opacity-50 cursor-pointer h-[46px] flex items-center justify-center"
                    >
                      {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#737685] font-medium">Use code <strong className="text-[#003d9b]">123456</strong> to pass verification.</p>
                </div>
              )}

              {isAadhaarVerified && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-800 animate-fade-in">
                  <span className="material-symbols-outlined text-green-600 text-3xl">verified</span>
                  <div>
                    <p className="font-bold text-sm">KYC Approved</p>
                    <p className="text-xs text-green-700">Aadhaar details fetched and matched securely.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 text-sm">
              <button 
                className="text-[#003d9b] px-6 py-3 rounded-full font-bold hover:bg-[#ededf8] transition-all flex items-center gap-2 cursor-pointer" 
                onClick={() => goToStep(1)}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span> Back
              </button>
              <button 
                className="bg-[#003d9b] text-white px-8 py-3 rounded-full font-bold hover:bg-[#0052cc] transition-all active:scale-95 flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer" 
                onClick={() => goToStep(3)}
                disabled={!isAadhaarVerified}
              >
                Upload Documents <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Document Uploads */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-[#191b23] mb-4">Upload Customer Identity Documents</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-semibold text-[#434654] text-center">Customer Photo</p>
                <label className="w-full aspect-square border-2 border-dashed border-[#c3c6d6] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#003d9b] hover:bg-[#003d9b]/5 transition-all overflow-hidden group relative">
                  <input 
                    className="hidden" 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setProfilePreview)}
                    required
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
                    required
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
                    required
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
                className="text-[#003d9b] px-6 py-3 rounded-full font-bold hover:bg-[#ededf8] transition-all flex items-center gap-2 cursor-pointer" 
                type="button"
                onClick={() => goToStep(2)}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span> Back
              </button>
              <button 
                className="bg-[#003d9b] text-white px-8 py-3 rounded-full font-bold hover:bg-[#0052cc] active:scale-95 flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Register Customer'}
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
