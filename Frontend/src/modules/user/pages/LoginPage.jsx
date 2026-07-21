import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS, STORAGE_KEYS } from '../../../services/types';
import { isLoggedIn } from '../utils/storage';

import { useFormValidation } from '../../../hooks/useFormValidation';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { values, errors, touched, handleChange, handleBlur, validateForm, setValues } = useFormValidation(
    { mobile: location.state?.mobile || '', password: '' },
    {
      mobile: { required: true, pattern: /^[6-9]\d{9}$/, message: 'Invalid mobile number. Must be exactly 10 digits starting with 6-9.' },
      password: { required: true }
    }
  );
  
  const mobile = values.mobile;
  const password = values.password;

  // OTP Login Flow States
  const [step, setStep] = useState('request'); // 'request' or 'verify'
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (loginMethod === 'otp' && step === 'verify' && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, step, loginMethod]);

  const handleOtpChange = (e, index) => {
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

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      setLoading(true);
      await api.post('/auth/resend-otp', { mobile, purpose: 'login' });
      setResendTimer(30);
      setOtp(new Array(6).fill(''));
      setSuccessMsg('OTP resent successfully.');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (loginMethod === 'password') {
      if (!validateForm() || !password) {
        if (!password && !errors.password) {
          setErrorMsg('Please fill in all fields.');
        }
        return;
      }
      try {
        setLoading(true);
        const res = await api.post(ENDPOINTS.USER_LOGIN, { mobile, password });

        if (res.data.success) {
          const { accessToken, refreshToken, user } = res.data.data;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

          navigate('/dashboard');
          return;
        }
      } catch (error) {
        setErrorMsg(error.response?.data?.message || 'Login failed. Please try again.');
        setLoading(false);
      }
      return;
    }

    // OTP Logic
    if (!values.mobile) {
      setErrorMsg('Please enter your mobile number.');
      return;
    }

    if (errors.mobile) {
      setErrorMsg(errors.mobile);
      return;
    }

    if (step === 'request') {
      try {
        setLoading(true);
        const res = await api.post(ENDPOINTS.USER_SEND_LOGIN_OTP, { mobile });

        if (res.data.success) {
          setStep('verify');
          setResendTimer(30);
          setSuccessMsg('OTP sent successfully.');
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // If user doesn't exist, redirect to register
          navigate('/register', { state: { mobile } });
        } else {
          setErrorMsg(error.response?.data?.message || 'Failed to send OTP. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      const otpCode = otp.join('');
      if (otpCode.length < 6) {
        setErrorMsg('Please enter the complete 6-digit OTP.');
        return;
      }

      try {
        setLoading(true);
        const res = await api.post(ENDPOINTS.USER_VERIFY_LOGIN_OTP, { mobile, otp: otpCode });

        if (res.data.success) {
          const { accessToken, refreshToken, user } = res.data.data;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
          navigate('/dashboard');
        }
      } catch (error) {
        setErrorMsg(error.response?.data?.message || 'Invalid OTP. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex-grow flex flex-col bg-background lg:bg-[#F4F7FD] text-on-background min-h-screen relative overflow-hidden">
      {/* Decorative desktop backgrounds */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxjaXJjbGUgY3g9IjMiIGN5PSIzIiByPSIxIiBmaWxsPSIjZDVkOWU0Ij48L2NpcmNsZT4KPC9zdmc+')] [mask-image:radial-gradient(ellipse_at_top_left,black_20%,transparent_70%)]"></div>
      <div className="hidden lg:block absolute -right-32 -top-32 w-[800px] h-[800px] bg-gradient-to-bl from-[#7EA3F9] via-[#4F81F2] to-[#3267E3] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
      <div className="hidden lg:block absolute right-0 top-0 w-1/2 h-full bg-[#4678F3] [clip-path:circle(70%_at_100%_50%)] pointer-events-none"></div>
      
      <main className="flex-grow flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="max-w-[1100px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side: Branding and Hero Visual (Desktop Only) */}
          <div className="hidden lg:flex flex-col space-y-6 pr-8 relative">
            <div className="flex items-center mb-6">
              <img 
                src="/FinalLogo.png" 
                alt="MedCred Logo" 
                className="h-10 w-auto object-contain" 
              />
            </div>

            <div className="inline-flex items-center gap-2 bg-[#EEF2FF] text-[#3267E3] px-3 py-1.5 rounded-full w-fit mb-2">
               <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
               <span className="text-[10px] font-bold">Trusted by 1M+ Families</span>
            </div>
            
            <h1 className="text-[42px] font-black text-[#1A2338] leading-[1.15]">
              Secure Healthcare <br />
              Financing <span className="text-[#3267E3]">in Seconds</span>
            </h1>
            
            <p className="text-[13px] text-gray-500 max-w-[420px] leading-relaxed pt-2">
              Access instant medical loans, manage claims efficiently, and secure your family's health future with India's most trusted medical fintech partner.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-6">
               <div className="space-y-3">
                 <div className="w-12 h-12 rounded-[14px] bg-[#EEF2FF] text-[#3267E3] flex items-center justify-center">
                   <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                 </div>
                 <div>
                   <p className="text-[11px] font-bold text-[#1A2338]">Instant Loans</p>
                   <p className="text-[9px] text-gray-500 mt-0.5 leading-snug pr-2">Quick approvals<br/>in minutes</p>
                 </div>
               </div>
               <div className="space-y-3">
                 <div className="w-12 h-12 rounded-[14px] bg-[#EEFFF3] text-[#16A34A] flex items-center justify-center">
                   <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
                 </div>
                 <div>
                   <p className="text-[11px] font-bold text-[#1A2338]">Secure & Safe</p>
                   <p className="text-[9px] text-gray-500 mt-0.5 leading-snug pr-2">Bank-level security<br/>for your data</p>
                 </div>
               </div>
               <div className="space-y-3">
                 <div className="w-12 h-12 rounded-[14px] bg-[#FDF4FF] text-[#D946EF] flex items-center justify-center">
                   <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
                 </div>
                 <div>
                   <p className="text-[11px] font-bold text-[#1A2338]">Easy Management</p>
                   <p className="text-[9px] text-gray-500 mt-0.5 leading-snug pr-2">Track loans & claims<br/>in one place</p>
                 </div>
               </div>
            </div>
            
            {/* Banner bottom left */}
            <div className="mt-8 bg-gradient-to-r from-[#295ED9] to-[#3B72F4] rounded-2xl p-6 relative overflow-hidden flex items-center shadow-lg w-full max-w-[450px] border border-blue-400/30">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
               <div className="relative z-10 w-2/3">
                 <h3 className="text-white font-bold text-lg leading-tight mb-2">Your Health,<br/>Our Priority</h3>
                 <p className="text-white/80 text-[10px] leading-relaxed">Building a healthier tomorrow,<br/>together.</p>
               </div>
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[110px] h-full flex items-center justify-center pr-2">
                 {/* Fake 3D shield */}
                 <div className="w-[70px] h-[80px] bg-gradient-to-b from-blue-300 to-blue-500 rounded-xl flex items-center justify-center shadow-[inset_-2px_-5px_10px_rgba(0,0,0,0.2)] rotate-[-5deg]">
                    <span className="material-symbols-outlined text-white text-[32px] drop-shadow-md">add</span>
                 </div>
               </div>
            </div>
          </div>
  
          {/* Right Side: Login Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[440px] bg-surface-container-lowest lg:bg-white p-6 lg:p-10 rounded-2xl lg:rounded-[32px] shadow-[0_4px_24px_rgba(0,82,204,0.08)] lg:shadow-[0_25px_60px_-10px_rgba(30,60,140,0.15)] border border-outline-variant lg:border-white relative overflow-hidden flex flex-col lg:min-h-[580px]">
              
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center mb-8">
                <img src="/FinalLogo.png" alt="MedCred Logo" className="h-12 w-auto object-contain" />
              </div>
              
              <header className="mb-8 flex flex-col lg:items-center lg:text-center">
                <div className="hidden lg:flex w-14 h-14 bg-[#EEF2FF] rounded-full text-[#3267E3] items-center justify-center mb-5">
                   <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>lock</span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#1A2338] mb-1.5">Welcome Back</h2>
                <p className="text-[11px] text-gray-500">Log in to manage your medical finances.</p>
              </header>

              {/* Login Method Tabs */}
              <div className="flex rounded-full bg-[#F3F5F9] p-1.5 mb-7">
                <button
                  type="button"
                  onClick={() => setLoginMethod('password')}
                  className={`flex-1 py-2.5 text-[11px] font-bold rounded-full transition-all ${
                    loginMethod === 'password'
                      ? 'bg-white text-[#3267E3] shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('otp')}
                  className={`flex-1 py-2.5 text-[11px] font-bold rounded-full transition-all ${
                    loginMethod === 'otp'
                      ? 'bg-white text-[#3267E3] shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  OTP
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col">
                <div className="space-y-4 flex-grow">
                  {/* Mobile Number Input */}
                  {(loginMethod === 'password' || step === 'request') && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#1A2338]" htmlFor="mobile">Mobile Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <span className="material-symbols-outlined text-gray-400 text-[18px]">call</span>
                        </div>
                        <input 
                          className={`w-full pl-10 pr-3 py-3 bg-white lg:bg-transparent border rounded-xl focus:ring-2 focus:ring-[#3267E3]/20 focus:border-[#3267E3] outline-none transition-all text-xs font-semibold text-[#1A2338] ${touched.mobile && errors.mobile ? 'border-red-500' : 'border-gray-200'}`}
                          id="mobile" 
                          name="mobile" 
                          placeholder="9988776655" 
                          type="tel"
                          maxLength={10}
                          value={values.mobile}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>
                      {touched.mobile && errors.mobile && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.mobile}</p>}
                    </div>
                  )}

                  {/* OTP Verification UI (6 Boxes + Timer) */}
                  {loginMethod === 'otp' && step === 'verify' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-blue-50/50 border border-blue-100/60 p-3 rounded-xl">
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Verifying Mobile</p>
                          <p className="text-xs font-bold text-[#1A2338]">+91 {mobile}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep('request')}
                          className="text-[10px] text-[#3267E3] font-bold hover:underline"
                        >
                          Change
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#1A2338]">Enter 6-Digit OTP</label>
                        <div className="flex justify-between gap-1.5 sm:gap-2">
                          {otp.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => (inputRefs.current[idx] = el)}
                              className="flex-1 min-w-0 h-12 sm:h-14 text-center text-lg font-extrabold rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#3267E3]/20 focus:border-[#3267E3] outline-none transition-all"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(e, idx)}
                              onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                              required
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] px-0.5">
                        <span className="text-gray-400 font-medium">Didn't receive code?</span>
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={resendTimer > 0 || loading}
                          className={`font-bold underline underline-offset-2 ${
                            resendTimer > 0 ? 'text-gray-400 no-underline' : 'text-[#3267E3] hover:text-[#2855C2]'
                          }`}
                        >
                          {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Password Input */}
                  {loginMethod === 'password' && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-[#1A2338]" htmlFor="password">Password</label>
                        <button type="button" onClick={() => navigate('/forgot-password', { state: { mobile: values.mobile } })} className="text-[10px] text-[#3267E3] hover:underline cursor-pointer font-bold">Forgot Password?</button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <span className="material-symbols-outlined text-gray-400 text-[18px]">lock</span>
                        </div>
                        <input 
                          className={`w-full pl-10 pr-10 py-3 bg-white lg:bg-transparent border rounded-xl focus:ring-2 focus:ring-[#3267E3]/20 focus:border-[#3267E3] outline-none transition-all text-xs font-semibold text-[#1A2338] ${touched.password && errors.password ? 'border-red-500' : 'border-gray-200'}`}
                          id="password" 
                          name="password" 
                          placeholder="••••••••" 
                          type={showPassword ? "text" : "password"}
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <button 
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#3267E3] transition-colors cursor-pointer" 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility_off" : "visibility"}</span>
                        </button>
                      </div>
                      {touched.password && errors.password && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.password}</p>}
                    </div>
                  )}

                  {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold p-3 rounded-xl flex items-center gap-2 mt-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {successMsg}
                    </div>
                  )}

                  {errorMsg && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold p-3 rounded-xl flex items-center gap-2 mt-2">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errorMsg}
                    </div>
                  )}
                </div>
                
                <div className="pt-6 space-y-5">
                  <button 
                    className="w-full bg-[#3267E3] text-white py-3.5 rounded-xl text-xs font-bold hover:bg-[#2855C2] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(50,103,227,0.3)] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        {loginMethod === 'otp' ? (step === 'request' ? 'Sending OTP...' : 'Verifying...') : 'Logging in...'}
                      </>
                    ) : loginMethod === 'otp' ? (step === 'request' ? 'Send OTP' : 'Verify OTP') : 'Login'}
                  </button>

                  <div className="flex items-center gap-4 px-2">
                    <div className="flex-1 h-[1px] bg-gray-100"></div>
                    <span className="text-[10px] text-gray-400 font-bold lowercase">or</span>
                    <div className="flex-1 h-[1px] bg-gray-100"></div>
                  </div>

                  <button 
                    type="button" 
                    className="w-full bg-white text-gray-600 py-3 rounded-xl border border-gray-200 text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                    Continue with Google
                  </button>

                  <p className="text-center text-[11px] text-gray-500 pt-1">
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => navigate('/register')} 
                      className="text-[#3267E3] font-bold hover:underline cursor-pointer"
                    >
                      Register here
                    </button>
                  </p>

                  <div className="pt-4 flex items-center justify-center gap-4 text-[10px] text-gray-400 font-medium">
                    <button type="button" onClick={() => navigate('/terms')} className="hover:text-[#3267E3] hover:underline cursor-pointer">Terms</button>
                    <span>•</span>
                    <button type="button" onClick={() => navigate('/privacy')} className="hover:text-[#3267E3] hover:underline cursor-pointer">Privacy</button>
                    <span>•</span>
                    <button type="button" onClick={() => navigate('/support')} className="hover:text-[#3267E3] hover:underline cursor-pointer">Support</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
