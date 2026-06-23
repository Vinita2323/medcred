import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function AgentRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [role, setRole] = useState('Field Agent');

  // Upload Previews
  const [profilePreview, setProfilePreview] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  // Actual Files
  const [profileFile, setProfileFile] = useState(null);
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);

  useEffect(() => {
    const initialAgents = [
      {
        fullName: 'System Administrator',
        mobileNumber: '1000000000',
        email: 'admin@medcred.in',
        password: 'admin',
        role: 'Admin',
        agentId: 'ADMIN-001',
        referralCode: 'ADMIN10',
        reportingManager: '',
        commissionRate: 0,
        rank: 'Platinum',
        salesCount: 50,
        earnings: 125000,
        status: 'Approved',
        joiningDate: 'January 10, 2023'
      },
      {
        fullName: 'Rajesh Kumar',
        mobileNumber: '91111966732',
        email: 'rajesh.super@medcred.in',
        password: '1234abc',
        role: 'Super Agent',
        agentId: 'MC-9921',
        referralCode: 'SUPER90',
        reportingManager: 'System Administrator',
        commissionRate: 1.0,
        rank: 'Platinum',
        salesCount: 42,
        earnings: 55200,
        status: 'Approved',
        joiningDate: 'March 14, 2023'
      },
      {
        fullName: 'Sanjay Dutt',
        mobileNumber: '8000000000',
        email: 'sanjay.tl@medcred.in',
        password: 'agent',
        role: 'Agent',
        agentId: 'MC-8822',
        referralCode: 'LEADER80',
        reportingManager: 'Rajesh Kumar',
        commissionRate: 1.5,
        rank: 'Gold',
        salesCount: 18,
        earnings: 18450,
        status: 'Approved',
        joiningDate: 'June 01, 2023'
      },
      {
        fullName: 'Amit Patel',
        mobileNumber: '7000000000',
        email: 'amit.field@medcred.in',
        password: 'agent',
        role: 'Field Agent',
        agentId: 'MC-7733',
        referralCode: 'FIELD70',
        reportingManager: 'Sanjay Dutt',
        commissionRate: 2.5,
        rank: 'Silver',
        salesCount: 8,
        earnings: 8400,
        status: 'Approved',
        joiningDate: 'August 12, 2023'
      }
    ];

    const existing = localStorage.getItem('medcred_agents');
    if (!existing) {
      localStorage.setItem('medcred_agents', JSON.stringify(initialAgents));
    } else {
      const list = JSON.parse(existing);
      const hasCustom = list.find(a => a.mobileNumber === '91111966732');
      if (!hasCustom) {
        const updatedList = list.map(a => {
          if (a.fullName === 'Rajesh Kumar') {
            return {
              ...a,
              mobileNumber: '91111966732',
              password: '1234abc'
            };
          }
          return a;
        });
        localStorage.setItem('medcred_agents', JSON.stringify(updatedList));
      }
    }
  }, []);

  const handleImageChange = (e, setPreview, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const goToStep = (targetStep) => {
    if (targetStep > step) {
      if (step === 1 && (!fullName || !mobileNumber || !email || !password)) {
        alert('Please fill out all registration details.');
        return;
      }
    }
    setStep(targetStep);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aadhaarNumber) {
      alert('Please enter your Aadhaar number.');
      return;
    }
    if (!profileFile || !frontFile || !backFile) {
      alert('Please upload all required identity documents.');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('mobileNumber', mobileNumber);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('referralCodeUsed', referralCode);
      formData.append('aadhaarNumber', aadhaarNumber);
      formData.append('role', role);

      formData.append('profilePic', profileFile);
      formData.append('aadhaarFront', frontFile);
      formData.append('aadhaarBack', backFile);

      const res = await api.post(ENDPOINTS.AGENT_REGISTER, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        alert('Registration submitted successfully! Your status is currently "Pending Approval". The administrator will review and assign your manager & designation.');
        navigate('/agent/login');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#faf8ff] min-h-screen flex flex-col font-body-md relative overflow-x-hidden">
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
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 61, 155, 0.1);
        }
      ` }} />

      {/* Background Graphic */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#dae2ff]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#d4e6e5]/20 rounded-full blur-3xl"></div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[#c3c6d6]/20 bg-white/50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/agent')}>
          <span className="material-symbols-outlined text-[#003d9b]">medical_services</span>
          <span className="font-bold text-[#003d9b]">MedCred Agent Onboarding</span>
        </div>
        <Link to="/agent/login" className="text-xs font-bold text-[#003d9b] hover:underline">Sign In Portal</Link>
      </header>

      <main className="relative z-10 flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-[#003d9b]">Apply for MedCred Partnership</h2>
            <p className="text-xs text-[#516161]">Join our nationwide healthcare financing agent network.</p>
          </div>

          {/* Progress Line */}
          <div className="relative max-w-xs mx-auto py-2">
            <div className="flex justify-between items-center relative z-10">
              <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => goToStep(1)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 1 ? 'bg-[#003d9b] text-white' : 'bg-[#e1e2ec] text-[#434654]'}`}>1</div>
                <span className="text-[10px] font-semibold text-[#516161]">Personal</span>
              </div>
              <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => goToStep(2)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 2 ? 'bg-[#003d9b] text-white' : 'bg-[#e1e2ec] text-[#434654]'}`}>2</div>
                <span className="text-[10px] font-semibold text-[#516161]">Documents</span>
              </div>
            </div>
            <div className="absolute top-6 left-0 w-full h-[2px] bg-[#e1e2ec] -z-0"></div>
            <div 
              className="absolute top-6 left-0 h-[2px] bg-[#003d9b] transition-all duration-300" 
              style={{ width: `${(step - 1) * 100}%` }}
            ></div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-lg border border-[#c3c6d6]/20">
            {step === 1 ? (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-[#191b23]">Step 1: Partner Account Setup</h3>
                <div className="space-y-4">
                  <div className="relative input-group">
                    <input 
                      className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                      id="full-name" 
                      placeholder=" " 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                    <label className="absolute left-4 top-3 text-[#434654] text-xs" htmlFor="full-name">Full Name</label>
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
                    <label className="absolute left-4 top-3 text-[#434654] text-xs" htmlFor="mobile-number">Mobile Number</label>
                  </div>

                  <div className="relative input-group">
                    <input 
                      className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                      id="email" 
                      placeholder=" " 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <label className="absolute left-4 top-3 text-[#434654] text-xs" htmlFor="email">Email Address</label>
                  </div>

                  <div className="relative input-group">
                    <input 
                      className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm" 
                      id="password" 
                      placeholder=" " 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <label className="absolute left-4 top-3 text-[#434654] text-xs" htmlFor="password">Login Password</label>
                  </div>

                  <div className="relative input-group">
                    <input 
                      className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm font-semibold text-[#003d9b]" 
                      id="referral-code" 
                      placeholder=" " 
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                    <label className="absolute left-4 top-3 text-[#434654] text-xs" htmlFor="referral-code">Referral Code (Optional)</label>
                  </div>

                  <div className="relative input-group">
                    <select
                      className="block w-full px-4 py-3 bg-white border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm font-semibold text-[#434654]"
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="Super Agent">Super Agent</option>
                      <option value="Agent">Agent</option>
                      <option value="Field Agent">Field Agent</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => goToStep(2)}
                    className="bg-[#003d9b] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0052cc] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Next Step <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-base font-bold text-[#191b23]">Step 2: Identity &amp; Documents</h3>

                <div className="relative input-group">
                  <input 
                    className="input-field block w-full px-4 py-3 bg-transparent border border-[#c3c6d6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d9b] focus:border-transparent text-sm font-semibold tracking-wider" 
                    id="aadhaar" 
                    placeholder=" " 
                    maxLength="12"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                  <label className="absolute left-4 top-3 text-[#434654] text-xs" htmlFor="aadhaar">12-Digit Aadhaar Number</label>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Photo upload UI */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#516161]">Profile Pic</span>
                    <label className="w-full aspect-square border-2 border-dashed border-[#c3c6d6] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#003d9b] hover:bg-[#003d9b]/5 transition-all overflow-hidden relative group">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setProfilePreview, setProfileFile)} required />
                      {!profilePreview ? (
                        <span className="material-symbols-outlined text-[#737685] text-2xl group-hover:scale-110 transition-transform">account_circle</span>
                      ) : (
                        <img src={profilePreview} className="w-full h-full object-cover" alt="Profile" />
                      )}
                    </label>
                  </div>

                  {/* Aadhaar Front */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#516161]">Aadhaar Front</span>
                    <label className="w-full aspect-square border-2 border-dashed border-[#c3c6d6] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#003d9b] hover:bg-[#003d9b]/5 transition-all overflow-hidden relative group">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setFrontPreview, setFrontFile)} required />
                      {!frontPreview ? (
                        <span className="material-symbols-outlined text-[#737685] text-2xl group-hover:scale-110 transition-transform">badge</span>
                      ) : (
                        <img src={frontPreview} className="w-full h-full object-cover" alt="Aadhaar Front" />
                      )}
                    </label>
                  </div>

                  {/* Aadhaar Back */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#516161]">Aadhaar Back</span>
                    <label className="w-full aspect-square border-2 border-dashed border-[#c3c6d6] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#003d9b] hover:bg-[#003d9b]/5 transition-all overflow-hidden relative group">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setBackPreview, setBackFile)} required />
                      {!backPreview ? (
                        <span className="material-symbols-outlined text-[#737685] text-2xl group-hover:scale-110 transition-transform">credit_card</span>
                      ) : (
                        <img src={backPreview} className="w-full h-full object-cover" alt="Aadhaar Back" />
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button 
                    type="button"
                    onClick={() => goToStep(1)}
                    className="text-[#003d9b] font-bold text-xs hover:bg-[#f3f3fd] px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#003d9b] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0052cc] active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Submit Partnership Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
