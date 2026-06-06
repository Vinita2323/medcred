import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/storage';

export default function ProductDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  if (!product) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-surface text-on-surface h-screen">
        <p>Product not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col bg-surface-container-lowest min-h-screen pb-24">
      {/* Header */}
      <header className="flex items-center px-4 w-full h-16 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <button onClick={() => navigate(-1)} className="material-symbols-outlined text-on-surface hover:bg-surface-variant p-2 rounded-full -ml-2 transition-colors cursor-pointer">
          arrow_back
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-on-surface pr-8">Product Details</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto animate-fade-in">
        {/* Product Image */}
        <div className="w-full bg-surface-container-lowest aspect-[4/3] max-h-[400px] relative border-b border-outline-variant/30 overflow-hidden">
          <img src={product.img} alt={product.label} className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4 bg-[#0A9E58] text-white text-[10px] font-black px-2.5 py-1.5 rounded tracking-wider uppercase shadow-md">
            Best Seller
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5 space-y-4 bg-surface">
          <div>
            <h2 className="text-xl font-black text-on-surface leading-tight">{product.label}</h2>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex text-[#FFB300]">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
              </div>
              <span className="text-[10px] text-on-surface-variant font-bold ml-1">4.8 (1.2k reviews)</span>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-primary">₹{(Math.random() * 3000 + 500).toFixed(0)}</span>
            <span className="text-sm text-on-surface-variant line-through font-semibold pb-1">₹{(Math.random() * 5000 + 4000).toFixed(0)}</span>
            <span className="text-[10px] font-bold text-tertiary bg-tertiary-container px-2 py-0.5 rounded-full mb-1.5 ml-1">50% OFF</span>
          </div>

          <div className="border-t border-outline-variant/30 pt-4 mt-2">
            <h3 className="font-bold text-on-surface mb-2">Description</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Premium quality {product.label} designed for accurate and fast readings. Ideal for home healthcare use with MedCred guarantee. 
              Features a highly durable build and comes with a 1-year replacement warranty.
            </p>
          </div>

          <div className="border-t border-outline-variant/30 pt-4">
            <h3 className="font-bold text-on-surface mb-3">Key Features</h3>
            <ul className="space-y-2">
              {[
                'Clinical accuracy certified',
                'Easy to read digital display',
                'Lightweight and portable',
                '1 Year Manufacturer Warranty'
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-[14px]">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 flex gap-2.5">
        <button 
          onClick={() => {
            if (!isLoggedIn()) {
              navigate('/login');
            } else {
              navigate('/checkout', { state: { product } });
            }
          }}
          className="w-full bg-primary text-white font-black text-sm h-11 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
