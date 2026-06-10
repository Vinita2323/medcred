import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentOtpPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next field
    if (val !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        // Clear previous input and focus it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 6) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        navigate('/agent/dashboard');
      }, 1500);
    }
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      setResendTimer(30);
      // Resend OTP API call logic
    }
  };

  return (
    <div className="bg-[#faf8ff] text-[#191b23] min-h-screen flex flex-col font-body-md overflow-x-hidden relative">
      <style dangerouslySetInnerHTML={{__html: `
        .otp-input:focus {
          box-shadow: 0 0 0 2px rgba(0, 82, 204, 0.2);
          border-color: #0052cc;
        }
        .glass-background {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}} />

      {/* Header */}
      <header className="flex justify-between items-center px-4 w-full h-16 sticky top-0 z-50 bg-white border-b border-[#c3c6d6]/30">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/agent/login')} className="material-symbols-outlined text-[#003d9b] p-2 hover:bg-[#f3f3fd] rounded-full transition-colors">
            arrow_back
          </button>
          <span className="text-lg md:text-xl font-bold text-[#003d9b]">MedCred India</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#dae2ff] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#003d9b]">person</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-8 relative">
        {/* Decorative background elements */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-[#003d9b]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[#516161]/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-[480px] z-10">
          {/* Logo Badge */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-[#0052cc]/10 rounded-3xl flex items-center justify-center transform rotate-6 border border-[#0052cc]/10">
                <span className="material-symbols-outlined text-[#003d9b] text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#ffdbcf] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <span className="material-symbols-outlined text-[#7b2600] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
            </div>
          </div>

          {/* OTP Card */}
          <div className="bg-white border border-[#c3c6d6]/30 rounded-xl p-6 md:p-8 shadow-sm glass-background">
            <div className="text-center mb-8">
              <h1 className="text-xl md:text-2xl font-bold text-[#191b23] mb-2">Verify Mobile Number</h1>
              <p className="text-sm text-[#434654] max-w-[320px] mx-auto">
                Enter the 6-digit verification code sent to your mobile.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Inputs */}
              <div className="flex justify-between gap-2 md:gap-3">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    className="otp-input w-11 h-14 md:w-14 md:h-16 text-center text-xl font-bold rounded-lg border border-[#c3c6d6] bg-[#f3f3fd] focus:outline-none transition-all"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                  />
                ))}
              </div>

              {/* Verify CTA */}
              <div className="space-y-4">
                <button
                  className="w-full h-14 bg-[#003d9b] text-white font-semibold rounded-lg shadow-lg hover:bg-[#0052cc] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-80"
                  type="submit"
                  disabled={otp.join('').length < 6 || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify and Continue
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-sm text-[#434654]">
                    Didn't receive the code?
                    <button
                      className="text-[#003d9b] font-bold hover:underline ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      id="resendBtn"
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={handleResend}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex items-center justify-center gap-6 opacity-60">
            <div className="flex items-center gap-1 text-xs font-semibold text-[#737685] uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span>Secure Encryption</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#737685] uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">shield</span>
              <span>RBI Compliant</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center border-t border-[#c3c6d6]/30">
        <p className="text-[11px] text-[#434654]">
          © 2026 MedCred India Financial Services. High-stakes precision in health-fintech.
        </p>
      </footer>
    </div>
  );
}
