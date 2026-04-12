import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="group flex flex-col gap-3 p-3 bg-white hover:bg-white hover:shadow-[0_8px_40px_rgba(28,28,28,0.12)] rounded-3xl transition-all duration-300 border border-transparent hover:border-gray-100 cursor-pointer">
      <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-sm">
        <img 
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'} 
          alt={restaurant.name} 
          className="w-full h-100% object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {restaurant.is_promoted && (
          <div className="absolute top-3 left-3 bg-zomato-dark/70 text-white text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest backdrop-blur-md">
            Promoted
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-white/95 px-2 py-1 rounded-lg text-xs font-black text-zomato-red shadow-lg flex items-center gap-1.5">
          <span className="animate-pulse">●</span> 50% OFF up to ₹100
        </div>
      </div>

      <div className="px-1">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xl font-black text-zomato-dark truncate flex-1">{restaurant.name}</h3>
          <div className={`flex items-center gap-1 text-white px-2 py-0.5 rounded-md text-xs font-black shadow-sm ${restaurant.rating >= 4 ? 'bg-rating-green' : 'bg-rating-orange'}`}>
            {restaurant.rating} <Star size={10} fill="currentColor" strokeWidth={0} />
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
          <p className="truncate opacity-80">North Indian, Chinese, Street Food</p>
          <p className="font-bold whitespace-nowrap">₹{restaurant.price_for_two || 200} for two</p>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-100 group-hover:border-gray-200 transition-colors">
          <div className="flex items-center gap-2 text-xs text-gray-400">
             <span className="font-bold text-gray-700">Zoo Road</span>
             <span>•</span>
             <span>2.5 km</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-black text-gray-600">
             <Clock size={12} className="text-gray-400" /> {restaurant.delivery_time || 30} min
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
