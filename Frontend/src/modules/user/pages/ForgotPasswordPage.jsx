import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('mobile'); // mobile | otp | newpass | success
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timer, setTimer] = useState(30);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const inputRefs = useRef([]);

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

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = async () => {
    if (mobile.length < 10) { setErrorMsg('Enter valid 10-digit mobile number'); return; }
    setErrorMsg('');
    try {
      setLoading(true);
      await api.post(ENDPOINTS.USER_FORGOT_PASSWORD, { mobile });
      setStep('otp');
      setTimer(30);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setErrorMsg('Passwords do not match'); return; }
    
    setErrorMsg('');
    const otpCode = otp.join('');
    
    try {
      setLoading(true);
      const payload = {
        mobile,
        otp: otpCode,
        newPassword: password,
        confirmPassword: confirmPassword
      };
      await api.post(ENDPOINTS.USER_RESET_PASSWORD, payload);
      setStep('success');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to reset password. Check OTP.');
    } finally {
      setLoading(false);
    }
  };

  const stepContent = {
    mobile: {
      icon: 'smartphone',
      title: 'Forgot Password?',
      subtitle: "Enter your registered mobile number. We'll send an OTP.",
    },
    otp: {
      icon: 'sms',
      title: 'Enter OTP',
      subtitle: `6-digit code sent to +91 ${mobile}`,
    },
    newpass: {
      icon: 'lock_reset',
      title: 'Set New Password',
      subtitle: 'Create a strong password for your MedCred account.',
    },
  };

  return (
    <div className="flex-grow flex flex-col bg-white min-h-screen">
      <header className="flex items-center gap-3 px-4 h-16 sticky top-0 z-40 bg-white border-b border-outline-variant/30 shadow-sm">
        <button onClick={() => step === 'mobile' ? navigate('/login') : setStep(s => s === 'newpass' ? 'otp' : 'mobile')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>
        <img src="/FinalLogo.png" alt="MedCred" className="h-10 w-auto object-contain" />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-5 py-8 max-w-md mx-auto w-full">
        {step === 'success' ? (
          <div className="flex flex-col items-center text-center gap-4 animate-scale-up">
            <div className="w-24 h-24 rounded-full bg-tertiary/10 flex items-center justify-center animate-pulse-ring">
              <span className="material-symbols-outlined text-tertiary text-5xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-2xl font-black text-on-surface">Password Updated!</h2>
            <p className="text-sm text-on-surface-variant">Your password has been successfully reset. You can now log in with your new password.</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:opacity-90 cursor-pointer transition-all active:scale-[0.98]"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="w-full animate-fade-in space-y-6">
            {/* Icon + title */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">{stepContent[step]?.icon}</span>
              </div>
              <h1 className="text-2xl font-black text-on-surface">{stepContent[step]?.title}</h1>
              <p className="text-sm text-on-surface-variant mt-1">{stepContent[step]?.subtitle}</p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2">
              {['mobile','otp','newpass'].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all ${step === s || (step === 'newpass' && s !== 'newpass') || (step === 'otp' && s === 'mobile') ? 'w-8 bg-primary' : 'w-4 bg-outline-variant'}`} />
              ))}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-error/10 border border-error/20 text-error text-xs font-bold p-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {errorMsg}
              </div>
            )}

            {/* Step: Mobile */}
            {step === 'mobile' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant border-r border-outline-variant pr-3 font-semibold">+91</span>
                    <input
                      type="tel" maxLength={10} value={mobile}
                      onChange={e => { setMobile(e.target.value.replace(/\D/g,'')); setErrorMsg(''); }}
                      placeholder="98765 43210"
                      className="w-full h-13 pl-16 pr-4 border border-outline-variant rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all py-4"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:opacity-90 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            )}

            {/* Step: OTP */}
            {step === 'otp' && (
              <div className="space-y-5">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => inputRefs.current[idx] = el}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e => handleOtpChange(e, idx)}
                      onKeyDown={e => handleOtpKey(e, idx)}
                      className="flex-1 h-14 text-center text-xl font-black border-2 border-outline-variant rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all bg-surface-container-low"
                    />
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-xs text-on-surface-variant">
                    Didn't get OTP?{' '}
                    {timer > 0 ? (
                      <span className="text-outline font-semibold">Resend in {timer}s</span>
                    ) : (
                      <button onClick={handleSendOtp} disabled={loading} className="text-primary font-bold cursor-pointer hover:underline">Resend OTP</button>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => { if (otp.join('').length < 6) { setErrorMsg('Enter complete 6-digit OTP'); return; } setErrorMsg(''); setStep('newpass'); }}
                  className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:opacity-90 cursor-pointer transition-all active:scale-[0.98]"
                >
                  Verify OTP
                </button>
              </div>
            )}

            {/* Step: New Password */}
            {step === 'newpass' && (
              <div className="space-y-4">
                {[
                  { label: 'New Password', val: password, set: setPassword },
                  { label: 'Confirm Password', val: confirmPassword, set: setConfirmPassword },
                ].map(({ label, val, set }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'} value={val}
                        onChange={e => set(e.target.value)}
                        placeholder="Enter password"
                        className="w-full h-13 px-4 pr-12 border border-outline-variant rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all py-4"
                      />
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant cursor-pointer">
                        {showPass ? 'visibility_off' : 'visibility'}
                      </button>
                    </div>
                  </div>
                ))}
                {/* Strength indicator */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${password.length >= i*3 ? (password.length >= 10 ? 'bg-tertiary' : 'bg-primary') : 'bg-outline-variant'}`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-on-surface-variant">{password.length < 6 ? 'Too short' : password.length < 10 ? 'Moderate' : 'Strong password ✓'}</p>
                  </div>
                )}
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:opacity-90 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
