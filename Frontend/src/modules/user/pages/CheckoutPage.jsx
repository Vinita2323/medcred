import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const METHODS = [
  { id: 'upi',     icon: 'smartphone',          label: 'UPI',         desc: 'Pay via any UPI app' },
  { id: 'card',    icon: 'credit_card',          label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbank', icon: 'account_balance',       label: 'Net Banking', desc: 'All major banks supported' },
];

const BANKS = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Yes Bank', 'Punjab National Bank'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product || { label: 'Medical Equipment', price: 999 };
  const price = product.price || 1575; // Dummy price for UI if not present

  const [method, setMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [bank, setBank] = useState('');

  const formatCardNumber = (val) => {
    let clean = val.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(.{4})/g, '$1 ').trim();
  };
  const formatExpiry = (val) => {
    let clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) return clean.slice(0,2) + '/' + clean.slice(2);
    return clean;
  };

  const validateForm = () => {
    if (method === 'upi' && !upiId.includes('@')) {
      alert('Please enter a valid UPI ID (e.g. name@upi)'); return false;
    }
    if (method === 'card') {
      if (card.number.replace(/\s/g,'').length < 16) { alert('Enter a valid 16-digit card number'); return false; }
      if (!card.expiry || !card.cvv || !card.name) { alert('Please fill all card details'); return false; }
    }
    if (method === 'netbank' && !bank) { alert('Please select a bank'); return false; }
    return true;
  };

  const handlePay = () => {
    if (!validateForm()) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
    }, 2000);
  };

  const handleDownloadInvoice = () => {
    const invoiceHtml = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice - ${product.label}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 2px solid #0052CC; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #0052CC; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            table { border-collapse: collapse; margin-top: 20px; width: 100%; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
            th { color: #666; font-weight: 600; font-size: 14px; }
            .total { font-size: 20px; font-weight: bold; color: #0052CC; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">MedCred India</div>
            <div style="color: #666; margin-top: 5px;">Invoice #MC-${Math.floor(100000 + Math.random() * 900000)}</div>
            <div style="color: #666;">Date: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="row">
            <div>
              <strong>Billed To:</strong><br/>
              Customer<br/>
              MedCred User
            </div>
            <div style="text-align: right;">
              <strong>Agent Details:</strong><br/>
              Referred by: Agent Partner<br/>
              Channel: Direct / Agent
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Included Benefits</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${product.label}</strong><br/>
                  <span style="color: #666; font-size: 13px;">1 Year Validity</span>
                </td>
                <td style="color: #666; font-size: 13px;">
                  - Medical Coverage<br/>
                  - Free Consultations<br/>
                  - Pharmacy Discounts
                </td>
                <td style="text-align: right;">₹${price.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            Total Paid: ₹${price.toLocaleString()}
          </div>
          
          <div style="margin-top: 60px; font-size: 12px; color: #888; text-align: center;">
            This is a computer generated invoice and does not require a physical signature.
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (success) {
    return (
      <div className="bg-white min-h-screen flex flex-col overflow-y-auto hide-scrollbar">
        <div className="flex-grow flex flex-col items-center justify-center px-5 py-8 animate-fade-in my-auto">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-5xl">check_circle</span>
          </div>
          <h1 className="text-2xl font-black text-on-surface text-center mb-2">Order Confirmed!</h1>
          <p className="text-sm text-on-surface-variant text-center mb-8 px-4">
            Your order for <strong>{product.label}</strong> has been placed successfully and will be activated shortly.
          </p>
          
          <div className="flex flex-col w-full max-w-sm gap-3">
            <button
              onClick={handleDownloadInvoice}
              className="w-full py-4 bg-surface-container border-2 border-primary text-primary font-black rounded-xl shadow-sm hover:bg-primary/5 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-lg">receipt_long</span>
              Download Invoice
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 bg-primary text-white font-black rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-ring">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
        </div>
        <h3 className="text-lg font-bold text-on-surface">Processing Payment…</h3>
        <p className="text-sm text-on-surface-variant">Please do not close this window.</p>
        <div className="w-48 h-1.5 bg-surface-container rounded-full overflow-hidden mt-2">
          <div className="h-full bg-primary progress-bar-fill" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col bg-[#F8FAFF] min-h-screen">
      <header className="flex items-center gap-3 px-4 h-16 sticky top-0 z-40 bg-white border-b border-outline-variant/30 shadow-sm">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-on-surface flex-1 text-center pr-8">Checkout</h1>
      </header>

      <main className="flex-grow overflow-y-auto px-4 py-5 max-w-md mx-auto w-full space-y-5">
        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-outline-variant p-4 shadow-sm flex items-center gap-4">
          {product.img ? (
            <img src={product.img} alt={product.label} className="w-16 h-16 object-contain rounded-lg bg-surface-container-lowest" />
          ) : (
            <div className="w-16 h-16 bg-surface-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant text-2xl">medical_services</span>
            </div>
          )}
          <div className="flex-1">
            <p className="font-bold text-on-surface text-sm line-clamp-2">{product.label}</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Qty: 1</p>
          </div>
          <p className="text-lg font-black text-primary">₹{price.toLocaleString()}</p>
        </div>

        {/* Payment method selector */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Select Payment Method</p>
          {METHODS.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`w-full text-left flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${method === m.id ? 'border-primary bg-primary/5' : 'border-outline-variant bg-white hover:border-primary/40'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method === m.id ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-xl">{m.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">{m.label}</p>
                <p className="text-[11px] text-on-surface-variant">{m.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${method === m.id ? 'border-primary' : 'border-outline-variant'}`}>
                {method === m.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </button>
          ))}
        </div>

        {/* Dynamic input section */}
        <div className="bg-white rounded-2xl border border-outline-variant p-4 shadow-sm space-y-4 animate-slide-up">
          {method === 'upi' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">UPI ID</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50">smartphone</span>
                <input
                  type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full h-12 pl-12 pr-4 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>
          )}

          {method === 'card' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Card Number</label>
                <input
                  type="text" value={card.number} maxLength={19}
                  onChange={e => setCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))}
                  placeholder="0000 0000 0000 0000"
                  className="w-full h-12 px-4 border border-outline-variant rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Expiry</label>
                  <input
                    type="text" value={card.expiry} maxLength={5}
                    onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                    placeholder="MM/YY"
                    className="w-full h-12 px-4 border border-outline-variant rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">CVV</label>
                  <input
                    type="password" value={card.cvv} maxLength={4}
                    onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g,'') }))}
                    placeholder="•••"
                    className="w-full h-12 px-4 border border-outline-variant rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Name on Card</label>
                <input
                  type="text" value={card.name}
                  onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                  placeholder="RAHUL KUMAR"
                  className="w-full h-12 px-4 border border-outline-variant rounded-xl text-sm uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>
          )}

          {method === 'netbank' && (
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Select Bank</label>
              <div className="grid grid-cols-2 gap-2">
                {BANKS.map(b => (
                  <button
                    key={b} type="button" onClick={() => setBank(b)}
                    className={`p-3 rounded-xl border-2 text-xs font-bold text-left transition-all cursor-pointer ${bank === b ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary/40'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 opacity-50 py-1">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5 object-contain" />
          <span className="text-[10px] font-bold text-on-surface-variant">RuPay · UPI</span>
        </div>

        {/* Pay button */}
        <div className="sticky bottom-0 bg-[#F8FAFF] pt-2 pb-4">
          <button
            onClick={handlePay}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-3 text-base"
          >
            <span className="material-symbols-outlined">lock</span>
            Pay ₹{price.toLocaleString()} Securely
          </button>
        </div>
      </main>
    </div>
  );
}
