import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setLoggedIn, hasMembership } from '../utils/storage';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mobile || !password) {
      alert('Please fill in all fields.');
      return;
    }
    setLoggedIn(true);
    // Redirect based on membership status
    if (hasMembership()) {
      navigate('/dashboard');
    } else {
      navigate('/membership-plans');
    }
  };

  return (
    <div className="flex-grow flex flex-col bg-background text-on-background min-h-screen">
      <main className="flex-grow flex items-center justify-center p-6 lg:p-12">
        <div className="max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side: Branding and Hero Visual (Desktop Only) */}
          <div className="hidden lg:flex flex-col space-y-6 pr-8">
            <div className="flex items-center mb-2">
              <img 
                src="/FinalLogo.png" 
                alt="MedCred Logo" 
                className="h-14 w-auto object-contain" 
              />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-on-surface leading-tight">
              Secure Healthcare <br />
              <span className="text-primary">Financing</span> in Seconds.
            </h1>
            
            <p className="text-base text-on-surface-variant max-w-[500px] leading-relaxed">
              Access instant medical loans, manage claims efficiently, and secure your family's health future with India's most trusted medical fintech partner.
            </p>
            
            <div className="relative mt-8 rounded-2xl overflow-hidden shadow-2xl h-[400px] group">
              <img 
                alt="Healthcare Fintech Professional" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBP1HJBDSAGwEbyhasDzI2xXvrYsE4UABr6-H0DJbJaSU07l6_c4W7rj22MI5WffCSjkzePbrSd_xcKvNxtFL_kUqayZaQPfD1w1-Ezv9La3ZnQIF_d-YFSNoxnBHzhTbnqNFr6_UdJ1aUI0puyOBpvAlYtoWbxXA36SKmqghoY-7A2MVJzby_qL_NhECl8a-ZpV4atmPmiosCAmEQEqnt8q_mX7A6mPHkAnsbkcEyvvfezcVB16LB0FQC_MSTWxpybIe5fRswVLCF"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/70 backdrop-blur-md p-4 rounded-xl border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-400"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-fixed"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary-fixed"></div>
                  </div>
                  <span className="text-xs font-bold text-on-surface">Joined by 10k+ providers this month</span>
                </div>
              </div>
            </div>
          </div>
 
          {/* Right Side: Login Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[440px] bg-surface-container-lowest p-6 lg:p-8 rounded-2xl shadow-[0_4px_24px_rgba(0,82,204,0.08)] border border-outline-variant">
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center mb-8">
                <img 
                  src="/FinalLogo.png" 
                  alt="MedCred Logo" 
                  className="h-12 w-auto object-contain" 
                />
              </div>
              
              <header className="mb-6">
                <h2 className="text-2xl font-extrabold text-primary mb-1">Welcome Back</h2>
                <p className="text-xs text-on-surface-variant">Log in to manage your medical finances.</p>
              </header>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Mobile Number Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface" htmlFor="mobile">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant text-lg">call</span>
                    </div>
                    <input 
                      className="w-full pl-10 pr-3 py-3 bg-surface border border-outline-variant rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs font-semibold" 
                      id="mobile" 
                      name="mobile" 
                      placeholder="9988776655" 
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-on-surface" htmlFor="password">Password</label>
                    <button type="button" onClick={() => navigate('/forgot-password')} className="text-[10px] text-primary hover:underline cursor-pointer font-semibold">Forgot Password?</button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant text-lg">lock</span>
                    </div>
                    <input 
                      className="w-full pl-10 pr-10 py-3 bg-surface border border-outline-variant rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs font-semibold" 
                      id="password" 
                      name="password" 
                      placeholder="••••••••" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>
                
                <div className="pt-2 space-y-4">
                  {/* Primary Login Button */}
                  <button 
                    className="w-full bg-primary text-white py-3 rounded-md text-xs font-bold hover:bg-primary-container active:scale-[0.98] transition-all duration-150 shadow-md cursor-pointer" 
                    type="submit"
                  >
                    Login
                  </button>
                  <p className="text-center text-[11px] text-on-surface-variant">
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => navigate('/register')} 
                      className="text-primary font-bold hover:underline cursor-pointer"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
