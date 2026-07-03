import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';
export default function PurchaseCardPage() {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.PLANS);
      if (res.data?.success) {
        setPlans(res.data.data.filter(p => p.isActive));
      }
    } catch (err) {
      console.error('Failed to fetch plans', err);
    } finally {
      setLoading(false);
    }
  };

  const THEMES = [
    { bgColor: 'bg-[#1a73e8]', textColor: 'text-white' },
    { bgColor: 'bg-[#002f87]', textColor: 'text-white' },
    { bgColor: 'bg-[#0b1633]', textColor: 'text-white' },
  ];

  const cards = plans.map((plan, index) => {
    const theme = THEMES[index % THEMES.length];
    return {
      id: plan.planId || plan._id,
      title: plan.name,
      price: `₹${plan.price}`,
      period: `/${plan.validity || 'yr'}`,
      benefits: plan.features && plan.features.length > 0 ? plan.features : [`Hospital Cashless Claims • Coverage: ₹${plan.coverageAmount || 0}`],
      bgColor: theme.bgColor,
      textColor: theme.textColor,
      isPopular: plan.isPopular !== undefined ? plan.isPopular : (index === 1),
    };
  });

  const handlePurchase = () => {
    if (!selectedCard) {
      alert("Please select a plan to proceed.");
      return;
    }
    // Navigate to the real membership-plans page with the selected plan pre-selected
    navigate('/membership-plans', { state: { preSelectedPlanId: selectedCard } });
  };

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative">
      <header className="flex justify-between items-center pl-2 pr-4 w-full h-14 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity active:scale-95 duration-150 cursor-pointer"
          >
            arrow_back
          </button>
          <h1 className="text-sm font-bold text-primary">Claim Health Card</h1>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto p-4 lg:p-8 space-y-6 max-w-md lg:max-w-5xl mx-auto w-full animate-fade-in pb-24">
        <div className="text-left space-y-1 mt-2 mb-4 lg:mb-6">
          <h2 className="text-lg lg:text-xl font-bold text-[#0b1633]">Recommended for You</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {cards.map((card) => (
            <div 
              key={card.id}
              onClick={() => navigate('/membership-plans', { state: { preSelectedPlanId: card.id } })}
              className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 transform active:scale-95 ${
                selectedCard === card.id 
                  ? 'ring-4 ring-offset-2 ring-primary scale-[1.02] shadow-2xl' 
                  : 'shadow-md hover:shadow-xl'
              } ${card.bgColor} ${card.textColor}`}
            >
              
              <div className="p-5 flex flex-col justify-between h-full min-h-[180px]">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-[17px] font-bold">{card.title}</h3>
                    {card.isPopular && (
                      <span className="bg-[#22c55e] text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded">
                        POPULAR
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight">{card.price}</span>
                    <span className="text-sm font-medium opacity-90">{card.period}</span>
                  </div>

                  <ul className="space-y-1 mt-4">
                    {card.benefits.map((benefit, index) => (
                      <li key={index} className="text-xs font-medium opacity-90 leading-relaxed">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6 flex items-center font-bold text-[11px] tracking-widest uppercase gap-1">
                  SELECT &amp; PURCHASE
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/30 px-4 py-4 z-50 pb-safe">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handlePurchase}
            disabled={!selectedCard}
            className={`w-full py-3.5 rounded-xl text-sm font-bold shadow-md transition-all duration-200 ${
              selectedCard 
                ? 'bg-primary text-white hover:opacity-90 active:scale-95' 
                : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-70'
            }`}
          >
            {selectedCard ? 'View Selected Plan →' : 'Tap a Plan to Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}
