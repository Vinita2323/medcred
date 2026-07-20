import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Lottie from 'lottie-react';
import membershipActivAnim from '../../../assets/Lotties/membershipActiv.json';
import { saveMembership, getMembership, updateUser } from '../utils/storage';
import html2pdf from 'html2pdf.js';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

const METHODS = [
  { id: 'upi',     icon: 'smartphone',          label: 'UPI',         desc: 'Pay via any UPI app' },
  { id: 'card',    icon: 'credit_card',          label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbank', icon: 'account_balance',       label: 'Net Banking', desc: 'All major banks supported' },
];

const BANKS = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Yes Bank', 'Punjab National Bank'];

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const planId = location.state?.planId || 'family';
  const planObjId = location.state?.planObjId || null;
  const plan = {
    name: location.state?.planName || 'Health Plan',
    price: location.state?.price || 999,
    validity: location.state?.validity || '1 Year',
    members: location.state?.members || 1,
    coverage: location.state?.coverage || '2L'
  };
  const finalPrice = location.state?.price || plan.price;
  const agentDetail = location.state?.agentDetail || null;
  const referralCode = location.state?.referralCode || null;
  const discount = location.state?.discount || 0;

  const [method, setMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [membership, setMembership] = useState(null);

  // UPI state
  const [upiId, setUpiId] = useState('');
  // Card state
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  // Net banking
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

  const handlePay = async () => {
    if (!validateForm()) return;
    setProcessing(true);

    try {
      if (!planObjId) {
        throw new Error("Plan ID is missing. Please select a plan again.");
      }

      // Load Razorpay SDK
      const loadScript = (src) => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };
      
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      // Step 1: Create Order
      const orderRes = await api.post(ENDPOINTS.ORDERS_CREATE, {
        planId: planObjId,
        referralCode,
        agentDetail,
        discount,
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to create order');
      }
      
      const { order: newOrder, razorpayOrder, keyId } = orderRes.data.data;
      const orderId = newOrder.orderId;

      // 2. Initialize Razorpay options
      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "MedCred Health",
        description: `Purchase of ${plan.name}`,
        image: "https://medcred.in/logo.png",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            setProcessing(true);

            // Step 2: Confirm Payment with Razorpay signature
            const paymentDetails = {
              upiId: method === 'upi' ? upiId : undefined,
              bankName: method === 'netbank' ? bank : undefined,
              cardLast4: method === 'card' ? card.number.slice(-4) : undefined,
              cardHolderName: method === 'card' ? card.name : undefined,
            };

            const confirmRes = await api.post(ENDPOINTS.ORDERS_CONFIRM(orderId), {
              paymentMethod: method,
              paymentDetails,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!confirmRes.data.success) {
              throw new Error(confirmRes.data.message || 'Failed to confirm payment');
            }

            const { card: newCard, order } = confirmRes.data.data;

            // Step 3: Update local state & context
            updateUser({ cardId: newCard._id });
            
            saveMembership(planId, { method, txnId: newCard.cardNumber, price: finalPrice });
            
            setMembership({
              planName: newCard.planName,
              cardNumber: newCard.cardNumber,
              expiresAt: newCard.validTill,
              price: finalPrice,
              transactionId: order.orderId,
            });

            setProcessing(false);
            setSuccess(true);
          } catch (error) {
            console.error('Payment Error:', error);
            alert(error.response?.data?.message || error.message || 'Payment failed. Please try again.');
            setProcessing(false);
          }
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#0c56d0"
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Payment Error:', error);
      alert(error.response?.data?.message || error.message || 'Payment initialized failed. Please try again.');
      setProcessing(false);
    }
  };

  const handleDownloadInvoice = () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div id="invoice-content" style="font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; background: white;">
        <div style="border-bottom: 2px solid #0052CC; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="margin-bottom: 10px;">
            <img src="${window.location.origin}/FinalLogo.png" alt="MedCred Logo" style="height: 45px; object-fit: contain; display: block;" />
          </div>
          <div style="color: #666; margin-top: 5px;">Invoice #MC-${Math.floor(100000 + Math.random() * 900000)}</div>
          <div style="color: #666;">Date: ${new Date().toLocaleDateString()}</div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <div>
            <strong>Billed To:</strong><br/>
            Customer<br/>
            MedCred User
          </div>
          <div style="text-align: right;">
            <strong>Agent Details:</strong><br/>
            ${(agentDetail || referralCode) ? `Name/No: ${agentDetail || 'N/A'}<br/>Code: ${referralCode || 'N/A'}` : 'Channel: Direct / Self'}
          </div>
        </div>

        <table style="border-collapse: collapse; margin-top: 20px; width: 100%;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 12px; border-bottom: 1px solid #ddd; color: #666; font-weight: 600; font-size: 14px;">Description</th>
              <th style="text-align: left; padding: 12px; border-bottom: 1px solid #ddd; color: #666; font-weight: 600; font-size: 14px;">Included Benefits</th>
              <th style="text-align: right; padding: 12px; border-bottom: 1px solid #ddd; color: #666; font-weight: 600; font-size: 14px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: left; padding: 12px; border-bottom: 1px solid #ddd;">
                <strong>${plan.name}</strong><br/>
                <span style="color: #666; font-size: 13px;">${plan.validity}</span>
              </td>
              <td style="text-align: left; padding: 12px; border-bottom: 1px solid #ddd; color: #666; font-size: 13px;">
                - Up to ${plan.members} members<br/>
                - ${plan.coverage} Coverage<br/>
              </td>
              <td style="text-align: right; padding: 12px; border-bottom: 1px solid #ddd;">₹${finalPrice.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div style="font-size: 20px; font-weight: bold; color: #0052CC; text-align: right; margin-top: 20px;">
          Total Paid: ₹${finalPrice.toLocaleString()}
        </div>
        
        <div style="margin-top: 60px; font-size: 12px; color: #888; text-align: center;">
          This is a computer generated invoice and does not require a physical signature.
        </div>
      </div>
    `;

    const opt = {
      margin:       10,
      filename:     `MedCred_Invoice_${membership.transactionId}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  // ── Success Screen ────────────────────────────────────────────────
  if (success && membership) {
    return (
      <div className="bg-white min-h-screen flex flex-col overflow-y-auto hide-scrollbar">
        <div className="flex-grow flex flex-col items-center justify-center px-5 py-8 animate-fade-in my-auto">
        {/* Animated checkmark */}
        <div className="relative mb-2">
          <div className="w-24 h-24 flex items-center justify-center">
            <Lottie animationData={membershipActivAnim} loop={false} />
          </div>
        </div>

        <h1 className="text-xl font-black text-on-surface text-center mb-1">Membership Activated!</h1>
        <p className="text-xs text-on-surface-variant text-center mb-4 px-2">Your healthcare membership is now active. You have full access to all MedCred benefits.</p>

        {/* Membership card */}
        <div className="w-full max-w-sm bg-gradient-to-br from-[#0D1B3E] via-[#062E8A] to-[#0A4DBF] rounded-2xl p-5 text-white shadow-xl mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[8px] opacity-60 uppercase tracking-widest font-semibold">Healthcare Membership</p>
                <p className="text-xs font-bold mt-0.5">{membership.planName}</p>
              </div>
              <span className="material-symbols-outlined text-white/60 text-xl">health_and_safety</span>
            </div>
            <p className="text-base font-mono tracking-[0.15em] font-bold mb-3">{membership.cardNumber}</p>
            <div className="flex justify-between text-[10px]">
              <div>
                <p className="opacity-60 text-[8px] uppercase">Coverage</p>
                <p className="font-bold">{plan.coverage}</p>
              </div>
              <div>
                <p className="opacity-60 text-[8px] uppercase">Valid Till</p>
                <p className="font-bold">{new Date(membership.expiresAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="opacity-60 text-[8px] uppercase">Status</p>
                <p className="font-bold text-tertiary-fixed">Active</p>
              </div>
            </div>
          </div>
          <div className="shimmer-bg absolute inset-0 rounded-2xl" />
        </div>

        {/* Txn details */}
        <div className="w-full max-w-sm bg-surface-container-low rounded-xl p-3 space-y-1.5 text-[10px] mb-4">
          {[
            ['Amount Paid', `₹${membership.price.toLocaleString()}`],
            ['Transaction ID', membership.transactionId],
            ['Payment Method', method.toUpperCase()],
            ['Date', new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })],
          ].map(([k,v]) => (
            <div key={k} className="flex justify-between items-center py-1 border-b border-outline-variant/30 last:border-0">
              <span className="text-on-surface-variant font-semibold">{k}</span>
              <span className="text-on-surface font-bold font-mono">{v}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col w-full max-w-sm gap-3">
          <button
            onClick={handleDownloadInvoice}
            className="w-full py-3 bg-surface-container border-2 border-primary text-primary font-black rounded-xl shadow-sm hover:bg-primary/5 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            Download Invoice
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-primary text-white font-black rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            Go to Dashboard
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
        <p className="text-[9px] text-on-surface-variant mt-3 text-center">A confirmation has been sent to your registered mobile number.</p>
        </div>
      </div>
    );
  }

  // ── Processing overlay ────────────────────────────────────────────
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

  // ── Payment Form ──────────────────────────────────────────────────
  return (
    <div className="flex-grow flex flex-col bg-[#F8FAFF] min-h-screen">
      <header className="flex items-center gap-3 px-4 h-16 sticky top-0 z-40 bg-white border-b border-outline-variant/30 shadow-sm">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>
        <img src="/FinalLogo.png" alt="MedCred" className="h-10 w-auto object-contain" />
        <div className="ml-auto flex items-center gap-1 text-tertiary">
          <span className="material-symbols-outlined text-sm">lock</span>
          <span className="text-[10px] font-bold">Secure Payment</span>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto px-4 py-5 max-w-md mx-auto w-full space-y-5">

        {/* Order summary */}
        <div className="bg-gradient-to-br from-[#062E8A] to-[#0A4DBF] rounded-2xl p-4 text-white">
          <p className="text-[10px] opacity-70 uppercase font-bold tracking-wider mb-1">Order Summary</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">{plan.name}</p>
              <p className="text-xs opacity-70">{plan.validity} · Up to {plan.members} members · {plan.coverage} coverage</p>
            </div>
            <p className="text-2xl font-black">₹{finalPrice.toLocaleString()}</p>
          </div>
        </div>

        {/* Payment method selector */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">Select Payment Method</p>
          {METHODS.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`payment-method-btn w-full text-left flex items-center gap-4 ${method === m.id ? 'active' : ''}`}
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
                  className="w-full h-12 pl-12 pr-4 border border-outline-variant rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <p className="text-[10px] text-on-surface-variant">Works with PhonePe, GPay, Paytm, BHIM & all UPI apps</p>
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
                  className="w-full h-12 px-4 border border-outline-variant rounded-2xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Expiry</label>
                  <input
                    type="text" value={card.expiry} maxLength={5}
                    onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                    placeholder="MM/YY"
                    className="w-full h-12 px-4 border border-outline-variant rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">CVV</label>
                  <input
                    type="password" value={card.cvv} maxLength={4}
                    onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g,'') }))}
                    placeholder="•••"
                    className="w-full h-12 px-4 border border-outline-variant rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Name on Card</label>
                <input
                  type="text" value={card.name}
                  onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                  placeholder="RAHUL KUMAR"
                  className="w-full h-12 px-4 border border-outline-variant rounded-2xl text-sm uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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
        <div className="flex items-center justify-center gap-4 opacity-70 py-2">
          <span className="text-[12px] font-black text-blue-900 italic tracking-tighter">VISA</span>
          <div className="flex -space-x-1 items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 opacity-90"></div>
            <div className="w-4 h-4 rounded-full bg-yellow-400 opacity-90"></div>
          </div>
          <span className="text-[11px] font-bold text-on-surface-variant">RuPay · UPI</span>
        </div>

        {/* Pay button */}
        <div className="sticky bottom-0 bg-[#F8FAFF] pt-2 pb-[calc(env(safe-area-inset-bottom)+24px)]">
          <button
            onClick={handlePay}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-3 text-base"
          >
            <span className="material-symbols-outlined">lock</span>
            Pay ₹{finalPrice.toLocaleString()} Securely
          </button>
          <p className="text-center text-[10px] text-on-surface-variant mt-2">
            🔒 Payment secured by Razorpay · PCI DSS Compliant
          </p>
        </div>
      </main>
    </div>
  );
}
