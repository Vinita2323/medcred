import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS, STORAGE_KEYS } from '../../../services/types';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('admin@medcred.in');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPwd, setShowPwd]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(ENDPOINTS.ADMIN_LOGIN, { email, password });

      if (res.data.success) {
        const { accessToken, refreshToken, admin } = res.data.data;
        
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(admin));

        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001a4d] via-[#003d9b] to-[#0052cc] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background decorative orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mt-48 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mb-48 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">MedCred Admin</h1>
          <p className="text-sm text-white/70 mt-1">Secure access for administrators only</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-lg font-extrabold text-[#191b23] mb-1">Welcome back</h2>
          <p className="text-xs text-[#516161] mb-6">Sign in to your admin panel</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737685] text-[18px]">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/10 transition-all"
                  placeholder="admin@medcred.in"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#516161] uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737685] text-[18px]">
                  lock
                </span>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#f5f8ff] border border-[#c3c6d6]/50 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/10 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737685] hover:text-[#003d9b] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                <p className="text-xs text-red-600 font-semibold">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-[#003d9b]/30 disabled:opacity-60 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                  Authenticating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Sign In to Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-6 p-3.5 bg-[#f0f4ff] rounded-xl border border-[#dae2ff]">
            <p className="text-[11px] text-[#516161] font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#003d9b] text-[14px]">info</span>
              Demo: admin@medcred.in · Admin@123
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/50 mt-6">
          MedCred India © {new Date().getFullYear()} · Confidential Admin Access
        </p>
      </div>
    </div>
  );
}
