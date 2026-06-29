import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get(ENDPOINTS.PRODUCTS);
        if (res.data.success) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="flex-grow flex flex-col bg-[#f5f6fa] text-on-surface font-body-md pb-20">
      {/* Top App Bar */}
      <header className="flex items-center gap-3 px-4 h-16 bg-white shadow-sm sticky top-0 z-40">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[#191b23]">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-[#191b23]">All Medical Equipment</h1>
      </header>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
            <p>No products available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((item) => (
              <div 
                key={item.productId}
                onClick={() => navigate('/product-details', { state: { product: item } })}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
              >
                <div className="relative h-32 bg-gray-50 p-4 flex items-center justify-center">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                    onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Product' }}
                  />
                  {item.stock <= 5 && item.stock > 0 && (
                    <span className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Only {item.stock} left
                    </span>
                  )}
                  {item.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-bold text-[#191b23] text-sm line-clamp-2 leading-tight">{item.name}</h3>
                    {item.category && <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{item.category}</p>}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-black text-[#003d9b] text-base">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                    <button className="w-8 h-8 rounded-full bg-[#f3f3fd] text-[#003d9b] flex items-center justify-center group-hover:bg-[#003d9b] group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
