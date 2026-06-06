import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { setLoggedIn } from '../utils/storage';

export default function OtpPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      setResendTimer(30);
      alert("Verification OTP resent to your registered mobile number.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      alert("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setLoggedIn(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }, 1500);
  };

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative animate-fade-in">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-4 md:px-6 w-full h-16 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(-1)} 
            className="material-symbols-outlined text-primary p-2 hover:bg-surface-container-low rounded-full transition-colors cursor-pointer"
          >
            arrow_back
          </button>
          <img 
            src="/FinalLogo.png" 
            alt="MedCred Logo" 
            className="h-10 w-auto object-contain ml-1" 
          />
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 relative">
        {/* Atmospheric Background Elements */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-[380px] z-10 space-y-6">
          {/* Card Wrapper */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] glass-card">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-on-surface mb-2">Verify Mobile Number</h2>
              <p className="text-xs text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
                Enter the 6-digit code sent to your mobile.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inputs */}
              <div className="flex justify-between gap-1">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    className="w-9 h-12 text-center text-lg font-bold rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    required
                  />
                ))}
              </div>

              {/* Action Button */}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading || success}
                  className={`w-full h-12 text-sm font-semibold rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                    success 
                      ? 'bg-tertiary-container text-on-tertiary-container' 
                      : 'bg-primary hover:bg-primary-container text-on-primary'
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> 
                      <span>Verifying...</span>
                    </>
                  ) : success ? (
                    <>
                      <span className="material-symbols-outlined text-lg">check_circle</span> 
                      <span>Success!</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-xs text-on-surface-variant font-medium">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendTimer > 0}
                      className={`font-semibold underline decoration-2 underline-offset-4 cursor-pointer ${
                        resendTimer > 0 ? 'text-slate-400' : 'text-primary hover:text-primary-container'
                      }`}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Trust Badge Section */}
          <div className="flex items-center justify-center gap-6 opacity-60">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Secure Encryption</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">shield</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">RBI Compliant</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center border-t border-outline-variant/30 mt-auto">
        <p className="text-[10px] text-on-surface-variant font-medium">© 2026 MedCred India Financial Services. High-stakes precision in health-fintech.</p>
      </footer>
    </div>
  );
}
