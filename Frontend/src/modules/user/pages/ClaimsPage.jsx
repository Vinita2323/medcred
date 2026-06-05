import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import { hasMembership } from '../utils/storage';

export default function ClaimsPage() {
  const navigate = useNavigate();
  const isMember = hasMembership();
  const [claims, setClaims] = useState([
    {
      id: 'MC-8291',
      hospital: 'Max Health Super Speciality',
      date: 'July 24, 2026',
      amount: '₹42,500.00',
      status: 'Pending',
      type: 'medical_services',
      bg: 'bg-primary-fixed',
      text: 'text-primary'
    },
    {
      id: 'MC-7104',
      hospital: 'Apollo Hospitals, Delhi',
      date: 'July 18, 2026',
      amount: '₹1,12,000.00',
      status: 'Approved',
      type: 'receipt_long',
      bg: 'bg-tertiary-fixed',
      text: 'text-tertiary'
    },
    {
      id: 'MC-6542',
      hospital: 'Fortis Memorial Research',
      date: 'July 12, 2026',
      amount: '₹18,900.00',
      status: 'Rejected',
      type: 'emergency',
      bg: 'bg-error-container/50',
      text: 'text-error'
    }
  ]);

  const [selectedClaimId, setSelectedClaimId] = useState('MC-8291');

  const handleNewClaim = () => {
    const hospital = prompt("Enter Hospital Name:");
    if (!hospital) return;
    const amountVal = prompt("Enter Claim Amount (INR):", "5000");
    if (!amountVal) return;

    const newClaim = {
      id: `MC-${Math.floor(1000 + Math.random() * 9000)}`,
      hospital,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      amount: `₹${parseFloat(amountVal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      status: 'Pending',
      type: 'medical_services',
      bg: 'bg-primary-fixed',
      text: 'text-primary'
    };

    setClaims([newClaim, ...claims]);
    setSelectedClaimId(newClaim.id);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-secondary-container/20 text-on-secondary-container border border-secondary-container/30';
      case 'Approved':
        return 'bg-tertiary-fixed/20 text-on-tertiary-fixed-variant border border-tertiary-fixed/30';
      case 'Rejected':
        return 'bg-error-container text-on-error-container';
      default:
        return '';
    }
  };

  const selectedClaim = claims.find(c => c.id === selectedClaimId) || claims[0];

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-24">
      <header className="flex justify-between items-center pl-2 pr-4 w-full h-20 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <img alt="MedCred Logo" className="h-16 w-auto object-contain" src="/FinalLogo.png" />
        </div>
        <button 
          onClick={() => navigate('/notifications')} 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-80 cursor-pointer"
        >
          <span className="material-symbols-outlined text-primary">notifications</span>
        </button>
      </header>

      <main className="flex-grow overflow-y-auto p-4 space-y-4 animate-fade-in">
        {/* Membership Gate */}
        {!isMember && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-4xl">lock</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-on-surface">Claims Locked</h3>
              <p className="text-sm text-on-surface-variant mt-1 max-w-[260px] mx-auto leading-relaxed">
                Purchase a healthcare membership to unlock claim submission and management.
              </p>
            </div>
            <button
              onClick={() => navigate('/membership-plans')}
              className="bg-primary text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:opacity-90 cursor-pointer active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">health_and_safety</span>
              Activate Membership
            </button>
            <p className="text-[11px] text-on-surface-variant">Starting from ₹999/year</p>
          </div>
        )}

        {isMember && <>
        {/* Welcome & CTA */}
        <section className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Dashboard Overview</p>
            <h2 className="text-xl font-bold text-on-surface mt-0.5">Manage Claims</h2>
          </div>
          <button 
            onClick={handleNewClaim}
            className="bg-primary text-on-primary text-xs py-2.5 px-4 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            New Claim
          </button>
        </section>

        {/* Bento Statistics Grid */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container-lowest border border-outline-variant p-3.5 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-on-surface-variant">Total Claims</p>
            <p className="text-2xl font-bold text-primary mt-1">{claims.length}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-3.5 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-on-surface-variant">Pending</p>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-2xl font-bold text-secondary">{claims.filter(c => c.status === 'Pending').length}</p>
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
            </div>
          </div>
        </section>

        {/* Selected Claim Tracker */}
        {selectedClaim && (
          <aside className="space-y-3">
            <h3 className="text-xs font-bold text-on-surface px-1">Tracking Claim #{selectedClaim.id}</h3>
            <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
              
              <div className="relative z-10 space-y-5">
                {/* Timeline */}
                <div className="relative pl-8 space-y-5">
                  <div className="absolute left-3.5 top-1 bottom-1 w-0.5 bg-outline-variant"></div>
                  
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -left-8 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                      <span className="material-symbols-outlined text-xs">check</span>
                    </div>
                    <p className="text-xs font-bold text-on-surface">Submitted</p>
                    <p className="text-[10px] text-on-surface-variant">{selectedClaim.date} • 10:45 AM</p>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute -left-8 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                      <span className="material-symbols-outlined text-xs">check</span>
                    </div>
                    <p className="text-xs font-bold text-on-surface">Under Review</p>
                    <p className="text-[10px] text-on-surface-variant">Assessment in progress</p>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className={`absolute -left-8 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                      selectedClaim.status === 'Approved' 
                        ? 'bg-primary text-white' 
                        : selectedClaim.status === 'Rejected'
                        ? 'bg-error text-white'
                        : 'bg-white border-2 border-primary text-primary'
                    }`}>
                      {selectedClaim.status === 'Approved' ? (
                        <span className="material-symbols-outlined text-xs">check</span>
                      ) : selectedClaim.status === 'Rejected' ? (
                        <span className="material-symbols-outlined text-xs">close</span>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-on-surface">Verification</p>
                    <p className="text-[10px] text-on-surface-variant">
                      {selectedClaim.status === 'Approved' 
                        ? 'Verification successful' 
                        : selectedClaim.status === 'Rejected'
                        ? 'Verification failed'
                        : 'In progress'
                      }
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant">
                  <button 
                    onClick={() => alert(`Details for Claim ID: ${selectedClaim.id}`)}
                    className="w-full py-2.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary-fixed/30 active:scale-95 transition-all cursor-pointer"
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* List of Recent Claims */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-on-surface px-1">Recent Claims</h3>
          <div className="space-y-3">
            {claims.map((claim) => (
              <div 
                key={claim.id}
                onClick={() => setSelectedClaimId(claim.id)}
                className={`border p-4 rounded-xl hover:bg-surface-container transition-all cursor-pointer shadow-sm flex justify-between items-start ${
                  selectedClaimId === claim.id ? 'border-primary bg-surface-container-low' : 'border-outline-variant bg-surface-container-lowest'
                }`}
              >
                <div className="flex gap-3.5">
                  <div className={`w-10 h-10 rounded-lg ${claim.bg} flex items-center justify-center ${claim.text}`}>
                    <span className="material-symbols-outlined text-xl">{claim.type}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">{claim.hospital}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Claim #{claim.id} • {claim.date}</p>
                    <p className="text-sm font-bold text-primary mt-1">{claim.amount}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full tracking-wider ${getStatusClass(claim.status)}`}>
                  {claim.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Support Card */}
        <section className="bg-primary p-4 rounded-xl text-on-primary space-y-2 relative overflow-hidden shadow-md">
          <img 
            alt="Support" 
            className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuANkD8DiPlgTHDQvdMYito25tQl9YtybGOqggXFyxD7ULn7t6uGVUcCitDaZq2lseElDQeArjEZL95n2G_PvHb_hEq29gP7ZiA98d21qfGDsriZCiermG6yE3FrHf7JkLpIV4_-IMEI-yKJNqBaziIEsSIdP2TOtYj9bgl7JRSe_UabM0rLiIx8E3EZxQRLb5bn320vi4ve2hCud1GYS04GdyPO6huIaB9ZzsVMNxdqjzKw_X0gGFefr9eMTQywfoGXI1LMzmdu5VA3"
          />
          <div className="relative z-10 space-y-2">
            <p className="text-sm font-bold">Need help?</p>
            <p className="text-xs opacity-90 leading-normal">Talk to our medical claim experts for faster processing.</p>
            <button 
              onClick={() => alert("Connecting to MedCred customer help desk...")}
              className="bg-white text-primary text-xs font-bold px-3.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </section>
        </>}
      </main>

      <BottomNavBar />
    </div>
  );
}
