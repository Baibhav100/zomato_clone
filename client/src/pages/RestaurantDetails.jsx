import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { Star, Heart, Minus, Plus, ShoppingBag, Info, ChevronRight, MapPin, Clock, Sparkles } from 'lucide-react';
import RestaurantCard from '../components/RestaurantCard';

const RestaurantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [aiInfo, setAiInfo] = useState({});
    const [analyzing, setAnalyzing] = useState(null);
    const [similarRestaurants, setSimilarRestaurants] = useState([]);
    const [loadingSimilar, setLoadingSimilar] = useState(false);
    const { cartItems, addToCart, updateQuantity, cartTotal, cartCount } = useCart();

    useEffect(() => {
        fetchDetails();
        fetchSimilar();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await api.get(`/api/restaurants/${id}`);
            setData(res.data);
        } catch (err) { console.error('Details fetch fail:', err); }
    };

    const fetchSimilar = async () => {
        setLoadingSimilar(true);
        try {
            const res = await api.get(`/api/ai/recommend-similar/${id}`);
            setSimilarRestaurants(res.data);
        } catch (err) { console.error('Similar fetch fail:', err); }
        setLoadingSimilar(false);
    };

    const getItemInCart = (itemId) => cartItems.find(i => i.id === itemId);

    const getAiDescription = async (item) => {
        setAnalyzing(item.id);
        try {
            const res = await api.post('/api/ai/describe-food', {
                foodName: item.item_name,
                description: item.description,
                restaurantName: data.name
            });

            setAiInfo(prev => ({ ...prev, [item.id]: res.data.result }));
        } catch (err) { console.error('AI error:', err); }
        setAnalyzing(null);
    };

    if (!data) return <div className="container py-20 text-center animate-pulse">Loading fine dining experience...</div>;

    return (
        <div className="bg-white min-h-screen">
            {/* HERO PHOTOS */}
            <div className="container py-8">
                <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[450px] rounded-2xl overflow-hidden shadow-lg">
                    <div className="col-span-3 row-span-2 relative group cursor-pointer">
                        <img src={data.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={data.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                    <div className="col-span-1 row-span-1 relative overflow-hidden group cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="col-span-1 row-span-1 relative overflow-hidden group cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                </div>

                {/* INFO SECTION */}
                <div className="mt-8 flex justify-between items-start border-b border-gray-100 pb-8">
                    <div className="flex-1">
                        <h1 className="text-4xl font-black text-zomato-dark mb-2 tracking-tight">{data.name}</h1>
                        <p className="text-lg text-gray-500 mb-4 font-medium">North Indian, Continental, Chinese</p>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                           <div className="flex items-center gap-2">
                               <MapPin size={16} className="text-zomato-red" />
                               <span className="font-bold text-gray-700">{data.address}</span>
                           </div>
                           <div className="flex items-center gap-2">
                               <Clock size={16} />
                               <span className="font-bold text-gray-700">Open now - {data.delivery_time} mins (Delivery)</span>
                           </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="bg-rating-green text-white p-3 rounded-xl text-center shadow-lg shadow-green-100 min-w-[100px]">
                            <p className="text-xl font-black flex items-center justify-center gap-1">{data.rating} <Star size={16} fill="white" strokeWidth={0} /></p>
                            <p className="text-xs font-black uppercase tracking-tighter opacity-80">45k+ Ratings</p>
                        </div>
                    </div>
                </div>

                {/* MENU SECTION */}
                <div className="mt-12 flex gap-12">
                    {/* LEFT: CATEGORIES */}
                    <div className="hidden lg:block w-64 space-y-4">
                        <h3 className="text-xl font-extrabold mb-6">Menu Categories</h3>
                        {['Recommended', 'Main Course', 'Appetizers', 'Combos'].map(c => (
                            <div key={c} className="p-3 font-bold text-gray-500 hover:text-zomato-red hover:bg-red-50 rounded-xl cursor-pointer transition-colors border-l-4 border-transparent hover:border-zomato-red">
                                {c}
                            </div>
                        ))}
                    </div>

                    {/* RIGHT: ITEMS */}
                    <div className="flex-1 space-y-10">
                        <h2 className="text-3xl font-black mb-8 border-l-8 border-zomato-red pl-4">Menu Items</h2>
                        <div className="grid grid-cols-1 gap-8">
                            {data.menu.map(item => {
                                const inCart = getItemInCart(item.id);
                                return (
                                    <div key={item.id} className="flex gap-8 group p-6 bg-white hover:bg-gray-50/50 rounded-3xl transition-all border border-gray-50 hover:border-gray-100">
                                        <div className="flex-1">
                                            <div className={`w-4 h-4 border-2 rounded p-0.5 mb-3 ${item.type === 'veg' ? 'border-green-600' : 'border-red-600'}`}>
                                                <div className={`w-full h-full rounded-full ${item.type === 'veg' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                            </div>
                                            <h3 className="text-2xl font-black text-zomato-dark mb-1">{item.item_name}</h3>
                                            <p className="text-xl font-bold text-gray-800 mb-3">₹{item.price}</p>
                                            <p className="text-gray-500 leading-relaxed mb-4 line-clamp-2 italic">{item.description}</p>
                                            
                                            {/* AI SECTION */}
                                            <div className="mt-4">
                                                {aiInfo[item.id] ? (
                                                    <div className="bg-pink-50 p-4 rounded-2xl text-sm border border-red-100 animate-in fade-in slide-in-from-left duration-500">
                                                        <p className="text-zomato-red leading-relaxed font-medium">✨ {aiInfo[item.id]}</p>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => getAiDescription(item)}
                                                        disabled={analyzing === item.id}
                                                        className="text-xs font-black text-zomato-red uppercase tracking-widest flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-red-50 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                                                    >
                                                        {analyzing === item.id ? (
                                                            <><span className="animate-spin text-lg">⚙️</span> Analyzing Dish...</>
                                                        ) : (
                                                            <><Info size={14} /> AI Perspective</>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="relative w-40 h-40 shrink-0">
                                            <img src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} className="w-full h-full object-cover rounded-2xl shadow-md border border-gray-100" />
                                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center bg-white border border-zomato-red rounded-xl shadow-xl overflow-hidden min-w-[120px] h-11">
                                                {!inCart ? (
                                                    <button 
                                                        onClick={() => addToCart(item, data)} 
                                                        className="w-full h-full text-zomato-red font-black text-sm uppercase tracking-wider hover:bg-pink-50 transition-colors"
                                                    >
                                                        ADD
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-between w-full px-2 text-zomato-red">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-pink-50 rounded-lg"><Minus size={16} /></button>
                                                        <span className="font-black text-lg">{inCart.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-pink-50 rounded-lg"><Plus size={16} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>

                {/* SIMILAR RESTAURANTS (NLP RECOMMENDER) */}
                <div className="mt-20 mb-20 border-t border-gray-100 pt-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-zomato-dark flex items-center gap-3">
                                More Like This <Sparkles className="text-zomato-red fill-zomato-red" size={24} />
                            </h2>
                            <p className="text-gray-500 font-medium">NLP-powered recommendations based on reviews and vibe similarity</p>
                        </div>
                        <button 
                            onClick={fetchSimilar}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-xl transition-colors text-sm"
                        >
                            Refresh AI Results
                        </button>
                    </div>

                    {loadingSimilar ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-gray-50 rounded-3xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : similarRestaurants.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {similarRestaurants.map(rest => (
                                <RestaurantCard key={rest.id} restaurant={rest} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-10 text-gray-400 italic font-medium">Looking for similar vibes... but this place is unique!</p>
                    )}
                </div>
            </div>

            {/* STICKY CART BAR */}
            {cartCount > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[900px] bg-zomato-red text-white p-5 rounded-3xl flex justify-between items-center shadow-[0_20px_60px_-15px_rgba(239,79,95,0.6)] z-[1100] animate-in slide-in-from-bottom duration-500">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="text-xl font-black underline decoration-2 decoration-white/30">{cartCount} Items | ₹{cartTotal}</p>
                            <p className="text-xs font-bold opacity-80 uppercase tracking-widest">From {cartItems[0].restaurant.name}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/checkout')}
                        className="flex items-center gap-2 bg-white text-zomato-red px-8 py-3 rounded-2xl font-black text-lg shadow-sm hover:bg-zomato-dark hover:text-white transition-all group"
                    >
                        GO TO CHECKOUT <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default RestaurantDetails;
