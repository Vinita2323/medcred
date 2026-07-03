import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

import api from '../../../services/api';
import { ENDPOINTS, getImageUrl } from '../../../services/types';

// Method constants removed since Razorpay handles them internally

// Utility to load script dynamically
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product || { name: 'Medical Equipment', price: 999 };
  const price = product.discountedPrice || product.price || 1575;

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const validateForm = () => {
    if (!deliveryAddress || deliveryAddress.trim().length < 10) { alert('Please enter a complete delivery address'); return false; }
    return true;
  };

  const handlePay = async () => {
    if (!validateForm()) return;
    setProcessing(true);
    
    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setProcessing(false);
        return;
      }

      const payload = {
        productId: product._id || product.productId,
        deliveryAddress,
        paymentMethod: 'razorpay'
      };

      // 1. Create order on backend (returns razorpay_order_id)
      const initRes = await api.post(ENDPOINTS.PRODUCT_ORDER_CREATE, payload);
      
      if (!initRes.data.success) {
        alert(initRes.data.message || 'Failed to initialize payment.');
        setProcessing(false);
        return;
      }

      const { razorpayOrder, keyId, order } = initRes.data.data;

      // 2. Initialize Razorpay options
      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID, // Use backend returned key or env fallback
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "MedCred Health",
        description: `Purchase of ${product.name}`,
        image: "https://medcred.in/logo.png", // Add your actual logo URL here
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            setProcessing(true); // Re-show loader while verifying
            // 3. Verify payment on backend
            const verifyRes = await api.post(ENDPOINTS.PRODUCT_ORDER_VERIFY, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              setProcessing(false);
              setSuccess(true);
            } else {
              alert('Payment verification failed.');
              setProcessing(false);
            }
          } catch (verifyError) {
            console.error('Verify error:', verifyError);
            alert('Payment verification failed.');
            setProcessing(false);
          }
        },
        prefill: {
          name: "Customer Name", // Ideally get from user profile
          email: "customer@example.com", // Ideally get from user profile
          contact: "9999999999" // Ideally get from user profile
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

    } catch (err) {
      console.error('Payment failed:', err);
      alert('Payment initialization failed. Please try again.');
      setProcessing(false);
    }
  };

  const handleDownloadInvoice = () => {
    // Create an invisible container for the invoice
    const invoiceElement = document.createElement('div');
    invoiceElement.style.padding = '40px';
    invoiceElement.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    invoiceElement.style.color = '#333';
    invoiceElement.style.backgroundColor = '#fff';
    
    invoiceElement.innerHTML = `
      <div style="border-bottom: 2px solid #0052CC; padding-bottom: 20px; margin-bottom: 30px;">
        <div style="margin-bottom: 10px;">
          <img src="${window.location.origin}/FinalLogo.png" alt="MedCred Logo" style="height: 45px; object-fit: contain; display: block;" />
        </div>
        <div style="color: #666; margin-top: 5px;">Invoice #MC-${Math.floor(100000 + Math.random() * 900000)}</div>
        <div style="color: #666;">Date: ${new Date().toLocaleDateString()}</div>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div>
          <strong>Billed To:</strong><br/>
          Customer<br/>
          MedCred User
        </div>
        <div style="text-align: right;">
          <strong>Delivery Address:</strong><br/>
          ${deliveryAddress || 'Not provided'}
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 12px; border-bottom: 1px solid #ddd; color: #666;">Description</th>
            <th style="text-align: right; padding: 12px; border-bottom: 1px solid #ddd; color: #666;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: left; padding: 12px; border-bottom: 1px solid #ddd;">
              <strong>${product.name}</strong><br/>
              <span style="color: #666; font-size: 13px;">Medical Equipment</span>
            </td>
            <td style="text-align: right; padding: 12px; border-bottom: 1px solid #ddd;">₹${price.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div style="font-size: 20px; font-weight: bold; color: #0052CC; text-align: right;">
        Total Paid: ₹${price.toLocaleString()}
      </div>
      
      <div style="margin-top: 60px; font-size: 12px; color: #888; text-align: center;">
        This is a computer generated invoice and does not require a physical signature.
      </div>
    `;

    // Configure html2pdf options
    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     `Invoice_${product.name.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate and download the PDF
    html2pdf().set(opt).from(invoiceElement).save();
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
          {product.imageUrl ? (
            <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-16 h-16 object-contain rounded-lg bg-surface-container-lowest" />
          ) : (
            <div className="w-16 h-16 bg-surface-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant text-2xl">medical_services</span>
            </div>
          )}
          <div className="flex-1">
            <p className="font-bold text-on-surface text-sm line-clamp-2">{product.name}</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Qty: 1</p>
          </div>
          <p className="text-lg font-black text-primary">₹{price.toLocaleString()}</p>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl border border-outline-variant p-4 shadow-sm space-y-3">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Delivery Address</p>
          <textarea 
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Enter full shipping address (House No, Street, City, Pincode)"
            className="w-full h-24 p-3 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all"
          />
        </div>

        {/* UI for Payment method selection has been removed since Razorpay natively handles it */}

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
