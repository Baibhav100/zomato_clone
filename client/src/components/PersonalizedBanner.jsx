import React, { useEffect, useState } from 'react';
import { CloudRain, Sun, Leaf, ShoppingCart } from 'lucide-react';
import api from '../api';

const PersonalizedBanner = ({ weather = 'cloudy', mealType = 'dinner' }) => { // Changed mealType default
  const [suggestion, setSuggestion] = useState('Fetching chef suggestions...'); // Changed initial state

  useEffect(() => {
    const fetchAI = async () => {
        try {
            const res = await api.get(`/api/ai/suggestions?weather=${weather}&mealType=${mealType}`);
            setSuggestion(res.data.suggestion);
        } catch (err) {
            setSuggestion(`Perfect time for a hot meal in this ${weather} weather!`);
        }
    };
    fetchAI();
  }, [weather, mealType]); // Updated dependencies

  return (
    <div className="container" style={{ margin: '2rem auto' }}>
      <div style={{
        background: 'linear-gradient(to right, #EF4F5F, #FCEEC0)',
        borderRadius: '1rem',
        padding: '2rem',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 30px rgba(239, 79, 95, 0.2)'
      }}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {weather === 'cloudy' ? <CloudRain size={28} /> : <Sun size={28} />}
            <span style={{ fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1rem' }}>
              Personalized for you
            </span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.1 }}>
            {mealType === 'lunch' ? 'Lunch' : 'Dinner'} is calling!
          </h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '500px', fontWeight: '500', opacity: 0.9 }}>
            {suggestion}
          </p>
          <button className="btn" style={{ background: 'white', color: 'var(--zomato-red)', fontWeight: '700', padding: '0.8rem 2rem', border: 'none', borderRadius: '0.6rem', marginTop: '1rem', width: 'fit-content' }}>
            Check Recommendations
          </button>
        </div>
        
        <div style={{ position: 'relative' }}>
           <img 
             src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&h=300" 
             alt="Featured food" 
             style={{ width: '300px', borderRadius: '1rem', transform: 'rotate(5deg)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
           />
        </div>
      </div>
    </div>
  );
};

export default PersonalizedBanner;
