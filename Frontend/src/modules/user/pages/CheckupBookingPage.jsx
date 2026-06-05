import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';

export default function CheckupBookingPage() {
  const navigate = useNavigate();
  const [lab, setLab] = useState('Thyrocare');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('08:00 AM - 10:00 AM');
  const [success, setSuccess] = useState(false);

  const labs = ['Thyrocare', 'Dr. Lal PathLabs', 'Apollo Diagnostics'];
  const slots = ['08:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 02:00 PM', '04:00 PM - 06:00 PM'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) {
      alert("Please select an appointment date.");
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-24">
      {/* TopAppBar */}
      <header className="flex justify-between items-center pl-2 pr-4 w-full h-20 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity active:scale-95 duration-150 cursor-pointer"
          >
            arrow_back
          </button>
          <h1 className="text-sm font-bold text-primary">Book Free Checkup</h1>
        </div>
        <button className="material-symbols-outlined text-primary p-2 hover:bg-surface-variant rounded-full cursor-pointer">notifications</button>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-4 space-y-6 max-w-md mx-auto w-full animate-fade-in">
        {success ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-on-surface">Booking Confirmed!</h3>
              <p className="text-xs text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
                Your annual full body health checkup with <span className="font-bold text-primary">{lab}</span> has been booked for <span className="font-bold text-primary">{date}</span> during the <span className="font-bold text-primary">{slot}</span> slot. A lab executive will visit your address for home sample collection.
              </p>
            </div>
            
            {/* Appointment Detail Ticket */}
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 text-xs w-full text-left space-y-2">
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Appointment ID</span>
                <span className="font-bold text-primary">MC-AP-48192</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Lab Partner</span>
                <span className="font-bold">{lab}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Time Slot</span>
                <span className="font-bold">{slot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Service Type</span>
                <span className="font-bold text-tertiary">Free Home Sample Collection</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-primary text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition-all mt-4"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Free Checkup Promo Details */}
            <section className="bg-gradient-to-br from-tertiary to-emerald-600 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="relative z-10 space-y-2">
                <span className="text-[9px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Annual Health Benefit</span>
                <h3 className="text-lg font-bold">Complete Health Checkup</h3>
                <p className="text-[10px] opacity-90 leading-relaxed">
                  Includes 64 essential tests: Complete Blood Count (CBC), Fasting Blood Sugar, Kidney &amp; Liver profiles, and Cholesterol screen.
                </p>
                <div className="pt-2 flex justify-between text-[10px] font-bold border-t border-white/20 mt-4">
                  <span>Price: ₹2,499 (FREE)</span>
                  <span>Home Collection: Included</span>
                </div>
              </div>
            </section>

            {/* Booking Form */}
            <section className="bg-white border border-outline-variant/50 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Appointment Configuration</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Lab Selector */}
                <div className="space-y-1">
                  <span className="text-xs text-on-surface-variant font-semibold">Select Diagnostic Lab</span>
                  <div className="grid grid-cols-3 gap-2">
                    {labs.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLab(l)}
                        className={`py-2 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${
                          lab === l 
                            ? 'bg-primary text-white shadow-sm' 
                            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Picker */}
                <div className="space-y-1 flex flex-col">
                  <label className="text-xs text-on-surface-variant font-semibold" htmlFor="date">Select Date</label>
                  <input 
                    type="date"
                    id="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="px-3 py-2.5 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs font-semibold"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                {/* Slot Selector */}
                <div className="space-y-1">
                  <span className="text-xs text-on-surface-variant font-semibold">Select Preferred Time Slot</span>
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSlot(s)}
                        className={`py-2 px-1 text-[9px] font-bold rounded-xl transition-all cursor-pointer ${
                          slot === s 
                            ? 'bg-primary text-white shadow-sm' 
                            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-xs mt-4"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Confirm Appointment
                </button>
              </form>
            </section>
          </>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
