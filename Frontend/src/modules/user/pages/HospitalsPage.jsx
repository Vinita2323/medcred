import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';

export default function HospitalsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const filters = ['All', 'Multi-Speciality', 'Eye Care', 'Cardiology', 'Dental'];

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(ENDPOINTS.HOSPITALS);
        if (response.data.success) {
          const mappedHospitals = response.data.data.map(h => ({
            id: h._id,
            name: h.name,
            type: 'Multi-Speciality', // Defaulting since we don't have exact types in DB yet
            rating: (4 + Math.random()).toFixed(1),
            distance: (1 + Math.random() * 10).toFixed(1) + ' km',
            address: `${h.location?.address || ''}, ${h.location?.city || ''}`.replace(/^, | , $/g, ''),
            cashless: h.isClaimEnabled,
            image: h.logoUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBP1HJBDSAGwEbyhasDzI2xXvrYsE4UABr6-H0DJbJaSU07l6_c4W7rj22MI5WffCSjkzePbrSd_xcKvNxtFL_kUqayZaQPfD1w1-Ezv9La3ZnQIF_d-YFSNoxnBHzhTbnqNFr6_UdJ1aUI0puyOBpvAlYtoWbxXA36SKmqghoY-7A2MVJzby_qL_NhECl8a-ZpV4atmPmiosCAmEQEqnt8q_mX7A6mPHkAnsbkcEyvvfezcVB16LB0FQC_MSTWxpybIe5fRswVLCF'
          }));
          setHospitals(mappedHospitals);
        }
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          h.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || h.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-grow flex flex-col bg-surface text-on-surface font-body-md relative pb-24">
      {/* TopAppBar */}
      <header className="flex justify-between items-center pl-2 pr-4 w-full h-20 sticky top-0 z-40 bg-surface shadow-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity active:scale-95 duration-150 cursor-pointer p-2 rounded-full"
          >
            arrow_back
          </button>
          <h1 className="text-sm font-bold text-primary">Network Hospitals</h1>
        </div>
        <button 
          onClick={() => navigate('/notifications')} 
          className="material-symbols-outlined text-primary p-2 hover:bg-surface-variant rounded-full cursor-pointer"
        >
          notifications
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-4 space-y-5 max-w-md mx-auto w-full animate-fade-in">
        {/* Search */}
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl">search</span>
          <input 
            className="w-full pl-11 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-xs" 
            placeholder="Search hospital or city..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Badges */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === filter 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Hospitals List */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">
            {filteredHospitals.length} cashless network partners found
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredHospitals.length > 0 ? (
            filteredHospitals.map(h => (
              <div 
                key={h.id}
                className="bg-white border border-outline-variant/40 rounded-2xl overflow-hidden shadow-sm flex flex-col"
              >
                <div className="h-32 w-full relative">
                  <img 
                    alt={h.name} 
                    className="w-full h-full object-cover" 
                    src={h.image}
                  />
                  {h.cashless && (
                    <span className="absolute top-3 left-3 bg-tertiary text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                      Cashless Pre-Approved
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {h.rating}
                  </span>
                </div>
                
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-xs text-on-surface">{h.name}</h3>
                    <p className="text-[10px] text-primary font-semibold mt-0.5">{h.type} • {h.distance}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">{h.address}</p>
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={() => alert(`Directions opened for ${h.name}`)}
                      className="flex-1 bg-surface-container-high text-on-surface text-[10px] font-bold py-2 rounded-lg hover:bg-outline-variant transition-colors cursor-pointer"
                    >
                      Directions
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/claims');
                        setTimeout(() => {
                          alert(`Ready to submit cashless claim request for ${h.name}.`);
                        }, 500);
                      }}
                      className="flex-1 bg-primary text-white text-[10px] font-bold py-2 rounded-lg hover:bg-primary-container transition-all cursor-pointer shadow-sm"
                    >
                      Pre-Auth Claim
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 space-y-2">
              <span className="material-symbols-outlined text-outline text-4xl">local_hospital</span>
              <p className="text-xs text-on-surface-variant font-medium">No network hospitals match your search filters.</p>
            </div>
          )}
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
