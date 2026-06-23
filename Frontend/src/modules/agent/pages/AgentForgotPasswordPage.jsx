import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function AgentForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('mobile'); // mobile | otp | newpass | success
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timer, setTimer] = useState(30);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const inputRefs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const t = setTimeout(() => setTimer(t => t - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [step, timer]);

  const handleOtpChange = (e, idx) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.substring(val.length - 1);
    setOtp(newOtp);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };
  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handleSendOtp = async () => {
    if (mobile.length < 10) { setErrorMsg('Enter a valid 10-digit mobile number.'); return; }
    setErrorMsg('');
    try {
      setLoading(true);
      await api.post(ENDPOINTS.AGENT_FORGOT_PASSWORD, { mobileNumber: mobile });
      setStep('otp');
      setTimer(30);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setErrorMsg('Passwords do not match.'); return; }
    
    setErrorMsg('');
    const otpCode = otp.join('');
    
    try {
      setLoading(true);
      const payload = {
        mobileNumber: mobile,
        otp: otpCode,
        newPassword: password,
        confirmPassword: confirmPassword
      };
      await api.post(ENDPOINTS.AGENT_RESET_PASSWORD, payload);
      setStep('success');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to reset password. Check OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#faf8ff] text-[#191b23] min-h-screen flex flex-col font-body-md overflow-x-hidden relative">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .floating-label-input label { transition: all 0.2s ease-in-out; }
        .floating-label-input:focus-within label,
        .floating-label-input input:not(:placeholder-shown) + label {
          transform: translateY(-1.2rem) scale(0.85);
          color: #003d9b;
          background: white;
          padding: 0 4px;
        }
      `}} />

      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <img 
          alt="Hospital Backdrop" 
          className="w-full h-full object-cover opacity-10 grayscale" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpQ9GADqPal6Mh8yEiwvACUh8dJiF45In7fwc9WedOQYR0yWzMflJAA_Blf7fn7MSsMeYhNZce4wtKu_AqttLP4otgPc3DMkMcAf_kFH_gHPTFpOXxM4Fl-kT5vFAKAlsXzhdJ99UwWBU8b1E9cxGq_hCMbAj7945LiZFzXsAPW4BavbkIxk8aBhRiV_iIs-5XaGqoj8rDd7QtRY5NeeBylig0eAaUZqGfWghKT4IKx1895Rt1cgRSKfiuvLcpaIPbGLBgBnctiXGF"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#faf8ff] via-[#faf8ff]/80 to-[#dae2ff]/20"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#0052cc] rounded-xl flex items-center justify-center shadow-lg mb-4 cursor-pointer" onClick={() => navigate('/agent')}>
              <span className="material-symbols-outlined text-white text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#003d9b] tracking-tight">MedCred India</h1>
            <p className="text-xs font-semibold text-[#516161] uppercase tracking-widest mt-1">Agent Portal</p>
          </div>

          {/* Card */}
          <div className="glass-card border border-[#c3c6d6]/30 rounded-xl p-6 md:p-8 shadow-sm">
            
            {/* Header Area */}
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => step === 'mobile' ? navigate('/agent/login') : setStep(s => s === 'newpass' ? 'otp' : 'mobile')}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#dae2ff]/50 text-[#003d9b] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#191b23]">
                  {step === 'mobile' ? 'Reset Password' : step === 'otp' ? 'Verification' : step === 'newpass' ? 'New Password' : 'Done'}
                </h2>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {errorMsg}
              </div>
            )}

            {/* Step: Success */}
            {step === 'success' ? (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-[#003d9b]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[#003d9b] text-[40px]">check_circle</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#003d9b]">Password Updated Successfully!</h3>
                <p className="text-sm text-[#434654] mb-6">Your agent portal password has been reset. You can now login with your new credentials.</p>
                <button 
                  onClick={() => navigate('/agent/login')}
                  className="w-full bg-[#003d9b] text-white py-3 rounded-lg font-bold shadow-md hover:bg-[#0052cc] transition-all"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Step: Mobile */}
                {step === 'mobile' && (
                  <>
                    <p className="text-sm text-[#434654] -mt-4 mb-4 ml-11">Enter your registered mobile number to receive an OTP.</p>
                    <div className="relative floating-label-input">
                      <div className="flex items-center border border-[#737685] rounded-lg px-4 py-3 bg-white/50 focus-within:border-[#003d9b] focus-within:ring-1 focus-within:ring-[#003d9b] transition-all">
                        <span className="material-symbols-outlined text-[#737685] mr-3">smartphone</span>
                        <input 
                          className="block w-full bg-transparent border-none p-0 text-[#191b23] font-body-md focus:ring-0 outline-none focus:outline-none placeholder-transparent" 
                          id="mobile" placeholder=" " required type="tel" maxLength={10}
                          value={mobile} onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '')); setErrorMsg(''); }}
                        />
                        <label className="absolute left-12 top-3 text-[#737685] pointer-events-none transition-all duration-200" htmlFor="mobile">Mobile Number</label>
                      </div>
                    </div>
                    <button 
                      onClick={handleSendOtp} disabled={loading}
                      className="w-full bg-[#003d9b] text-white py-3 rounded-lg font-bold shadow-md hover:bg-[#0052cc] transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                      {loading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : 'Send OTP'}
                    </button>
                  </>
                )}

                {/* Step: OTP */}
                {step === 'otp' && (
                  <>
                    <p className="text-sm text-[#434654] -mt-4 mb-4 ml-11">Enter the 6-digit code sent to +91 {mobile}</p>
                    <div className="flex justify-between gap-2">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx} ref={el => inputRefs.current[idx] = el}
                          type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={e => handleOtpChange(e, idx)} onKeyDown={e => handleOtpKey(e, idx)}
                          className="flex-1 h-14 text-center text-lg font-bold border border-[#737685] rounded-lg focus:outline-none focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] bg-white/50 transition-all"
                        />
                      ))}
                    </div>
                    <div className="text-center text-sm mt-4">
                      {timer > 0 ? (
                        <span className="text-[#737685]">Resend OTP in {timer}s</span>
                      ) : (
                        <button onClick={handleSendOtp} disabled={loading} className="text-[#0052cc] font-bold hover:underline">Resend OTP</button>
                      )}
                    </div>
                    <button 
                      onClick={() => { if (otp.join('').length < 6) { setErrorMsg('Enter complete 6-digit OTP'); return; } setErrorMsg(''); setStep('newpass'); }}
                      className="w-full mt-4 bg-[#003d9b] text-white py-3 rounded-lg font-bold shadow-md hover:bg-[#0052cc] transition-all"
                    >
                      Verify Code
                    </button>
                  </>
                )}

                {/* Step: New Password */}
                {step === 'newpass' && (
                  <>
                    <p className="text-sm text-[#434654] -mt-4 mb-4 ml-11">Create a new password for your agent portal.</p>
                    
                    <div className="relative floating-label-input">
                      <div className="flex items-center border border-[#737685] rounded-lg px-4 py-3 bg-white/50 focus-within:border-[#003d9b] focus-within:ring-1 focus-within:ring-[#003d9b] transition-all">
                        <span className="material-symbols-outlined text-[#737685] mr-3">lock</span>
                        <input 
                          className="block w-full bg-transparent border-none p-0 text-[#191b23] font-body-md focus:ring-0 outline-none focus:outline-none placeholder-transparent" 
                          id="newpassword" placeholder=" " required type={showPass ? 'text' : 'password'}
                          value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                        <label className="absolute left-12 top-3 text-[#737685] pointer-events-none transition-all duration-200" htmlFor="newpassword">New Password</label>
                        <button type="button" onClick={() => setShowPass(!showPass)} className="text-[#737685] hover:text-[#003d9b]">
                          <span className="material-symbols-outlined">{showPass ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative floating-label-input mt-4">
                      <div className="flex items-center border border-[#737685] rounded-lg px-4 py-3 bg-white/50 focus-within:border-[#003d9b] focus-within:ring-1 focus-within:ring-[#003d9b] transition-all">
                        <span className="material-symbols-outlined text-[#737685] mr-3">lock</span>
                        <input 
                          className="block w-full bg-transparent border-none p-0 text-[#191b23] font-body-md focus:ring-0 outline-none focus:outline-none placeholder-transparent" 
                          id="confirmpassword" placeholder=" " required type={showPass ? 'text' : 'password'}
                          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <label className="absolute left-12 top-3 text-[#737685] pointer-events-none transition-all duration-200" htmlFor="confirmpassword">Confirm Password</label>
                      </div>
                    </div>

                    <button 
                      onClick={handleResetPassword} disabled={loading}
                      className="w-full mt-6 bg-[#003d9b] text-white py-3 rounded-lg font-bold shadow-md hover:bg-[#0052cc] transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                      {loading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : 'Save Password'}
                    </button>
                  </>
                )}

              </div>
            )}
          </div>
          
          <div className="mt-8 text-center text-sm text-[#737685] font-semibold">
            <Link className="hover:text-[#003d9b] transition-colors" to="/agent/login">Return to Login</Link>
          </div>
        </div>
      </main>

      {/* Atmospheric Accent Icon */}
      <div className="fixed bottom-0 right-0 p-6 opacity-10 pointer-events-none hidden md:block">
        <span className="material-symbols-outlined text-[120px] text-[#003d9b]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 100" }}>shield_watch</span>
      </div>
    </div>
  );
}
