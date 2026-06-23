import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS, STORAGE_KEYS } from '../../../services/types';

export default function AgentLoginPage() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!mobile || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(ENDPOINTS.AGENT_LOGIN, { mobileNumber: mobile.trim(), password });

      if (res.data.success) {
        const { accessToken, refreshToken, agent } = res.data.data;
        
        // Status checks are handled by backend, but if it passes backend let's verify locally just in case
        if (agent.status === 'Pending' || agent.status === 'Pending Approval') {
          setErrorMsg('Access Denied: Your registration is currently pending administrator approval.');
          setLoading(false);
          return;
        }
        if (agent.status === 'Rejected') {
          setErrorMsg('Access Denied: Your application has been rejected by the administrator.');
          setLoading(false);
          return;
        }

        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(agent));

        navigate('/agent/dashboard');
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Login failed. Please check credentials.');
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
        
        .floating-label-input label {
          transition: all 0.2s ease-in-out;
        }

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

      {/* Login Shell */}
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

          {/* Login Card */}
          <div className="glass-card border border-[#c3c6d6]/30 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#191b23]">Welcome Agent.</h2>
              <p className="text-sm text-[#434654] mt-1">Access your credit &amp; verification dashboard.</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Mobile Number Field */}
              <div className="relative floating-label-input">
                <div className="flex items-center border border-[#737685] rounded-lg px-4 py-3 bg-white/50 focus-within:border-[#003d9b] focus-within:ring-1 focus-within:ring-[#003d9b] transition-all">
                  <span className="material-symbols-outlined text-[#737685] mr-3">smartphone</span>
                  <input 
                    className="block w-full bg-transparent border-none p-0 text-[#191b23] font-body-md focus:ring-0 outline-none focus:outline-none placeholder-transparent" 
                    id="mobile" 
                    placeholder=" " 
                    required 
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                  <label className="absolute left-12 top-3 text-[#737685] pointer-events-none transition-all duration-200" htmlFor="mobile">Mobile Number</label>
                </div>
              </div>

              {/* Password Field */}
              <div className="relative floating-label-input">
                <div className="flex items-center border border-[#737685] rounded-lg px-4 py-3 bg-white/50 focus-within:border-[#003d9b] focus-within:ring-1 focus-within:ring-[#003d9b] transition-all">
                  <span className="material-symbols-outlined text-[#737685] mr-3">lock</span>
                  <input 
                    className="block w-full bg-transparent border-none p-0 text-[#191b23] font-body-md focus:ring-0 outline-none focus:outline-none placeholder-transparent" 
                    id="password" 
                    placeholder=" " 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label className="absolute left-12 top-3 text-[#737685] pointer-events-none transition-all duration-200" htmlFor="password">Password</label>
                  <button 
                    className="text-[#737685] hover:text-[#003d9b] transition-colors focus:outline-none" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer group">
                  <input 
                    className="w-4 h-4 rounded border-[#737685] text-[#003d9b] focus:ring-[#003d9b]/20 transition-all cursor-pointer" 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="ml-2 text-[#434654] group-hover:text-[#003d9b] transition-colors select-none">Remember me</span>
                </label>
                <Link className="font-semibold text-[#0052cc] hover:text-[#003d9b] transition-colors" to="/agent/forgot-password">Forgot Password?</Link>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {errorMsg}
                </div>
              )}

              {/* Primary CTA */}
              <button 
                className="w-full bg-[#003d9b] text-white py-3 rounded-lg font-bold shadow-md hover:bg-[#0052cc] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    Logging in...
                  </>
                ) : 'Login'}
              </button>

              {/* Divider */}
              <div className="flex items-center py-2">
                <div className="flex-grow h-px bg-[#c3c6d6]"></div>
                <span className="px-4 text-xs font-semibold text-[#737685]">OR</span>
                <div className="flex-grow h-px bg-[#c3c6d6]"></div>
              </div>

              {/* OTP Login */}
              <button 
                className="w-full flex items-center justify-center border border-[#003d9b] text-[#003d9b] py-3 rounded-lg font-semibold hover:bg-[#003d9b]/5 active:scale-[0.98] transition-all duration-200" 
                type="button"
                onClick={() => navigate('/agent/otp')}
              >
                <span className="material-symbols-outlined mr-2">passkey</span>
                Login with OTP
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm">
            <p className="text-[#434654]">
              Don't have an agent account? <br className="md:hidden"/>
              <Link className="text-[#003d9b] font-bold hover:underline ml-1" to="/agent/register">Apply for Partnership</Link>
            </p>
            <div className="flex justify-center gap-4 mt-6 text-xs text-[#737685] font-semibold">
              <a className="hover:text-[#003d9b] transition-colors" href="#terms">Terms</a>
              <span>•</span>
              <a className="hover:text-[#003d9b] transition-colors" href="#privacy">Privacy</a>
              <span>•</span>
              <a className="hover:text-[#003d9b] transition-colors" href="#support">Support</a>
            </div>
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
