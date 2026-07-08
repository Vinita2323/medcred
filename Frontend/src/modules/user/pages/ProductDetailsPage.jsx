import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/storage';
import { getProductImage } from '../../../utils/getProductImage';

export default function ProductDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);

  const hasCustomImages = product.images && product.images.filter(Boolean).length > 0;
  const productImages = hasCustomImages 
    ? product.images.filter(Boolean) 
    : [product.imageUrl, product.imageUrl, product.imageUrl].filter(Boolean);

  // Ensure we have at least 3 elements for the gallery
  while (productImages.length < 3 && productImages.length > 0) {
    productImages.push(productImages[0]);
  }

  const images = productImages.map((url, index) => {
    let style = {};
    if (!hasCustomImages) {
      if (index === 1) style = { transform: 'scaleX(-1)' };
      if (index === 2) style = { transform: 'scale(1.25) rotate(4deg)' };
    }
    return {
      id: index,
      url,
      style
    };
  });

  if (!product) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-surface text-on-surface h-screen">
        <p>Product not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col bg-surface-container-lowest min-h-screen pb-24 md:pb-12 md:bg-[#F8FAFF]">
      {/* Header */}
      <header className="flex items-center px-4 w-full h-16 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="w-full max-w-6xl mx-auto flex items-center">
          <button onClick={() => navigate(-1)} className="material-symbols-outlined text-on-surface hover:bg-surface-variant/50 p-2 rounded-full -ml-2 transition-colors cursor-pointer">
            arrow_back
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-on-surface pr-8">Product Details</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto animate-fade-in w-full max-w-6xl mx-auto md:p-8 md:grid md:grid-cols-12 md:gap-8 md:items-start">
        {/* Product Image Section */}
        <div className="w-full md:col-span-5 flex flex-row-reverse gap-3 items-start p-4 md:p-0">
          {/* Main Viewport */}
          <div className="flex-1 bg-white aspect-square max-h-[400px] relative border border-outline-variant/30 rounded-2xl overflow-hidden md:max-h-none md:rounded-3xl md:border md:border-outline-variant/40 md:shadow-[0_8px_30px_rgb(0,0,0,0.03)] md:p-8 flex items-center justify-center">
            <div className="w-full h-full overflow-hidden flex items-center justify-center">
              <img 
                src={getProductImage(images[activeImageIndex]?.url, product.category)} 
                alt={product.name} 
                className="w-full h-full object-cover md:object-contain transition-all duration-300 ease-out" 
                style={images[activeImageIndex]?.style}
                onError={(e) => { e.target.onerror = null; e.target.src = getProductImage(null, product.category); }} 
              />
            </div>
            <div className="absolute top-3 right-3 bg-[#0BA058] text-white text-[9px] font-black px-2 py-1 rounded tracking-wider uppercase shadow-md flex items-center gap-0.5 md:top-6 md:right-6 md:text-[10px] md:px-2.5 md:py-1.5">
              <span className="material-symbols-outlined text-[11px] md:text-[12px] font-black" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              Best Seller
            </div>
          </div>

          {/* Thumbnail Selector */}
          <div className="flex flex-col gap-2 justify-start shrink-0">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIndex(img.id)}
                className={`w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 overflow-hidden bg-white shadow-sm flex items-center justify-center p-1 transition-all cursor-pointer ${
                  activeImageIndex === img.id ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-outline-variant/40 hover:border-primary/50'
                }`}
              >
                <div className="w-full h-full overflow-hidden flex items-center justify-center">
                  <img 
                    src={getProductImage(img.url, product.category)} 
                    alt={`Thumbnail ${img.id + 1}`} 
                    className="w-full h-full object-contain" 
                    style={img.style}
                    onError={(e) => { e.target.onerror = null; e.target.src = getProductImage(null, product.category); }} 
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5 space-y-5 bg-surface md:col-span-7 md:rounded-3xl md:border md:border-outline-variant/40 md:shadow-[0_8px_30px_rgb(0,0,0,0.03)] md:p-8">
          <div>
            <h2 className="text-xl md:text-3xl font-black text-on-surface leading-tight tracking-tight">{product.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-[#FFB300]">
                {[1, 2, 3, 4].map((star) => (
                  <span key={star} className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
              </div>
              <span className="text-[10px] md:text-xs bg-surface-variant text-on-surface-variant font-bold px-2 py-0.5 rounded-full ml-1">4.8</span>
              <span className="text-[10px] md:text-xs text-on-surface-variant font-semibold">(1.2k reviews)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-primary">₹{((product.discountedPrice || product.price) * quantity).toLocaleString('en-IN')}</span>
              {product.discountedPrice && (
                <span className="text-sm text-on-surface-variant/70 line-through font-semibold pb-0.5">
                  ₹{(product.price * quantity).toLocaleString('en-IN')}
                </span>
              )}
              {product.discountedPrice && (
                <span className="text-[10px] font-bold text-[#0BA058] bg-[#0BA058]/10 border border-[#0BA058]/20 px-2.5 py-1 rounded-full mb-0.5 ml-1 shrink-0">
                  {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest shrink-0 self-start sm:self-auto">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3 py-1 hover:bg-surface-variant text-primary font-bold text-base transition-colors cursor-pointer select-none active:scale-90"
              >
                -
              </button>
              <span className="px-3 font-mono font-bold text-sm text-on-surface w-8 text-center select-none">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="px-3 py-1 hover:bg-surface-variant text-primary font-bold text-base transition-colors cursor-pointer select-none active:scale-90"
              >
                +
              </button>
            </div>
          </div>

          <div className="border-t border-outline-variant/30 pt-4 mt-2">
            <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider mb-2 text-on-surface/80">Description</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {product.description || `Premium quality ${product.name} designed for accurate and fast readings. Ideal for home healthcare use with MedCred guarantee. Features a highly durable build and comes with a 1-year replacement warranty.`}
            </p>
          </div>

          <div className="border-t border-outline-variant/30 pt-4">
            <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider mb-3 text-on-surface/80">Key Features</h3>
            <ul className="space-y-3">
              {(product.keyFeatures && product.keyFeatures.length > 0 ? product.keyFeatures : [
                'Clinical accuracy certified',
                'Easy to read digital display',
                'Lightweight and portable',
                '1 Year Manufacturer Warranty'
              ]).map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                  </span>
                  <span className="font-medium">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop Buy Now Button */}
          <div className="hidden md:block pt-4">
            <button 
              onClick={() => {
                if (!isLoggedIn()) {
                  navigate('/login');
                } else {
                  navigate('/checkout', { state: { product, quantity } });
                }
              }}
              className="w-full bg-primary text-white font-black text-sm h-12 rounded-xl shadow-md hover:bg-primary-container hover:shadow-xl hover:shadow-primary/15 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">shopping_cart</span>
              Buy Now
            </button>
          </div>
        </div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 flex gap-2.5 md:hidden">
        <button 
          onClick={() => {
            if (!isLoggedIn()) {
              navigate('/login');
            } else {
              navigate('/checkout', { state: { product, quantity } });
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
