import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ArrowRight, Star, MapPin, ChevronDown, Settings, SlidersHorizontal, Info } from 'lucide-react';
import TabSwitcher from '../components/TabSwitcher';
import RestaurantCard from '../components/RestaurantCard';
import api from '../api';
import AIRecommendations from '../components/AIRecommendations';

const Home = ({ initialTab = 'delivery' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRestaurants();
    }, [activeTab]);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/restaurants?category=${activeTab}`);
            setRestaurants(res.data);
        } catch (err) {
            console.error('Error fetching restaurants:', err);
        }
        setLoading(false);
    };

    const collections = [
        { title: 'Bingeworthy Desserts', places: '5 Places', img: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
        { title: 'Great Cafes', places: '13 Places', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400' },
        { title: 'Pan-Asian Restaurants', places: '6 Places', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
        { title: 'Great Buffets', places: '6 Places', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' }
    ];

    return (
        <div style={{ background: 'white', minHeight: '100vh' }}>
            <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="container" style={{ paddingTop: '2rem' }}>
                {/* COLLECTIONS SECTION */}
                <section style={{ marginBottom: '3rem' }}>
                    <div className="flex justify-between items-end" style={{ marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '400', color: '#1c1c1c' }}>Collections</h2>
                            <p style={{ color: '#4F4F4F', fontSize: '1rem', marginTop: '0.2rem' }}>Explore curated lists of top restaurants, cafes, pubs, and bars based on trends and AI reviews</p>
                        </div>
                        <div style={{ color: '#FF7E8B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                            All collections <ChevronRight size={16} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {collections.map((col, idx) => (
                            <div key={idx} className="hover-lift" style={{ 
                                position: 'relative', height: '320px', borderRadius: '0.4rem', overflow: 'hidden', cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }}>
                                <img src={col.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '1rem', color: 'white' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '500' }}>{col.title}</h3>
                                    <p style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>{col.places} <ArrowRight size={14} /></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FILTERS SECTION */}
                <div style={{ display: 'flex', gap: '0.8rem', padding: '1rem 0', flexWrap: 'wrap', borderBottom: '1px solid #f2f2f2', marginBottom: '2rem' }}>
                    <FilterButton label="Filters" icon={<SlidersHorizontal size={14}/>} />
                    <FilterButton label="Offers" />
                    <FilterButton label="Rating: 4.5+" />
                    <FilterButton label="Pet friendly" />
                    <FilterButton label="Outdoor seating" />
                    <FilterButton label="Serves Alcohol" />
                    <FilterButton label="Open Now" />
                </div>

                {/* 50% OFF PROMO BANNER */}
                <div className="hover-lift flex flex-col md:flex-row relative" style={{ 
                    background: '#1C1C1C', 
                    borderRadius: '1rem', 
                    overflow: 'hidden', 
                    marginBottom: '3rem',
                    alignItems: 'center',
                    minHeight: '240px'
                }}>
                    <div className="w-full md:w-1/2 p-8 md:p-12 z-10 text-white relative">
                        <p style={{ fontSize: '1.5rem', fontWeight: '300' }}>Get up to</p>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: 1 }}>50% OFF</h2>
                        <p style={{ fontSize: '1.1rem', marginTop: '0.5rem', opacity: 0.8 }}>on your dining bills with Zomato</p>
                        <button className="btn" style={{ 
                            background: '#FF7E8B', color: 'white', marginTop: '1.5rem', 
                            padding: '0.8rem 1.5rem', borderRadius: '0.4rem', border: 'none',
                            fontWeight: '600', cursor: 'pointer'
                        }}>
                            Check out all the restaurants
                        </button>
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 opacity-40 md:opacity-70">
                        <img 
                            src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <div className="absolute inset-0 hidden md:block" style={{ 
                            background: 'linear-gradient(to right, #1c1c1c, transparent)' 
                        }}></div>
                    </div>
                </div>
                
                {/* AI TARGETED RECOMMENDATIONS */}
                <AIRecommendations />

                {/* RESTAURANTS SECTION */}
                <section style={{ marginBottom: '5rem' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '500', color: '#1c1c1c', marginBottom: '2rem' }}>
                        {activeTab === 'dine_out' ? 'Best Dining Experiences' : 'Popular Restaurants Nearby'}
                    </h2>
                    
                    <div className="grid-3">
                        {loading ? (
                            [1,2,3,4,5,6].map(i => (
                                <div key={i} style={{ height: '350px', background: '#f8f8f8', borderRadius: '0.8rem', animation: 'pulse 1.5s infinite' }} />
                            ))
                        ) : restaurants.length > 0 ? (
                            restaurants.map(rest => (
                                <RestaurantCard key={rest.id} restaurant={rest} />
                            ))
                        ) : (
                            <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '4rem', background: '#f9f9f9', borderRadius: '1rem' }}>
                                <Info size={40} color="#ccc" />
                                <p style={{ fontSize: '1.2rem', color: '#666', marginTop: '1rem' }}>No restaurants found in this category.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

const FilterButton = ({ label, icon }) => (
    <button style={{ 
        padding: '0.5rem 0.8rem', borderRadius: '0.5rem', border: '1px solid #e8e8e8', 
        background: 'white', color: '#9c9c9c', fontSize: '0.85rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s ease'
    }} className="hover-lift shadow-sm">
        {icon} {label}
    </button>
);

export default Home;
