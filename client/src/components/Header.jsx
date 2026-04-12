import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, User, LogOut, ShoppingCart, ChevronDown, Menu, X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';
import api from '../api';

const Header = ({ user, setUser }) => {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.length >= 1) {
            try {
                const res = await api.get(`/api/public/search?q=${value}`);
                setSearchSuggestions(res.data);
                setShowSuggestions(true);
            } catch (err) { console.error('Search error:', err); }
        } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleLogout = async () => {
        try {
            // Call logout endpoint to clear cookies
            await api.post('/api/auth/logout');
        } catch (_) { }

        // ✅ FIX: Clear localStorage completely
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // ✅ ADD THIS LINE - Clear the token too!

        // Clear cart
        clearCart();

        // Update state
        setUser(null);

        // Dispatch event for other components
        window.dispatchEvent(new Event('auth:logout'));

        // Navigate to home
        navigate('/');
    };

    const handleCartClick = () => {
        if (!user) {
            setShowLoginPrompt(true);
            setAuthModal({ isOpen: true, mode: 'login' });
            setTimeout(() => setShowLoginPrompt(false), 3000); // Hide after 3 seconds
        } else {
            navigate('/checkout');
        }
    };

    return (
        <>
            <header className="sticky top-0 z-[1000] bg-white border-b border-gray-100 shadow-sm">
            <div className="container max-w-[1100px] mx-auto flex items-center justify-between h-[72px] px-4">
                {/* LEFT: LOGO & SEARCH */}
                <div className="flex items-center gap-6 flex-1">
                    <Link to="/" className="text-3xl font-black text-gray-900 italic tracking-tighter hover:scale-105 transition-transform">
                        otamaz
                    </Link>

                    {/* Desktop Search Context */}
                    <div className="hidden md:flex items-center flex-1 max-w-[700px] h-[54px] bg-white border border-gray-200 rounded-xl shadow-sm ml-4 relative">
                        <div className="flex items-center gap-2 pl-4 pr-3 border-r border-gray-200 min-w-[200px]">
                            <MapPin className="text-red-500" size={20} />
                            <input type="text" placeholder="Your Location" className="w-full text-sm outline-none text-gray-700 font-medium" />
                            <ChevronDown size={14} className="text-gray-400" />
                        </div>
                        <div className="flex items-center gap-3 px-4 flex-1 relative">
                            <Search className="text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search for restaurant, cuisine or a dish" 
                                className="w-full text-sm outline-none text-gray-700" 
                                value={searchQuery}
                                onChange={handleSearch}
                                onFocus={() => searchQuery.length >= 1 && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />

                            {/* Predictive Search Suggestions */}
                            {showSuggestions && searchSuggestions.length > 0 && (
                                <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white border border-gray-100 shadow-2xl rounded-2xl py-2 overflow-hidden z-[2000]">
                                    {searchSuggestions.map(s => (
                                        <div 
                                            key={s.id} 
                                            onClick={() => {
                                                navigate(`/restaurant/${s.id}`);
                                                setSearchQuery('');
                                                setShowSuggestions(false);
                                            }}
                                            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <img src={s.image_url} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} alt="" />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{s.name}</span>
                                                <span className="text-[11px] text-gray-400 uppercase font-black tracking-wider bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                                                    {s.category || 'Restaurant'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: AUTH & CART */}
                <div className="flex items-center gap-6">
                    <button onClick={handleCartClick} className="relative p-2 text-gray-600 hover:text-red-500 transition-colors flex items-center gap-2">
                        <ShoppingCart size={24} />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                                {cartItems.length}
                            </span>
                        )}
                        <span className="hidden lg:block font-bold">Cart</span>
                    </button>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="group relative">
                                <button className="flex items-center gap-2 font-bold text-gray-700 hover:text-red-500 py-2">
                                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-red-500 text-xs font-black">
                                        {user.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden sm:block">{user.name}</span>
                                    <ChevronDown size={14} />
                                </button>

                                {/* Dropdown */}
                                <div className="absolute top-full right-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-1">
                                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium">
                                        <User size={18} /> Profile
                                    </Link>
                                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium">
                                        <ShoppingBag size={18} /> My Orders
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-blue-600 hover:bg-blue-50 font-bold">
                                            Admin Panel
                                        </Link>
                                    )}
                                    <hr className="my-1 border-gray-100" />
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 font-bold text-left">
                                        <LogOut size={18} /> Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center gap-8 font-bold text-lg text-gray-500">
                            <button onClick={() => setAuthModal({ isOpen: true, mode: 'login' })} className="hover:text-red-500 transition-colors">Log in</button>
                            <button onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })} className="hover:text-red-500 transition-colors">Sign up</button>
                        </div>
                    )}

                    {/* Mobile Toggle */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-600 p-2">
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 p-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-300">
                    {!user ? (
                        <div className="flex flex-col gap-4">
                            <button onClick={() => setAuthModal({ isOpen: true, mode: 'login' })} className="text-xl font-bold bg-gray-50 p-4 rounded-xl text-center">Log in</button>
                            <button onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })} className="text-xl font-bold bg-red-500 text-white p-4 rounded-xl text-center">Sign up</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Link to="/profile" className="block text-lg font-bold">Profile</Link>
                            <Link to="/orders" className="block text-lg font-bold">Orders</Link>
                            {user.role === 'admin' && <Link to="/admin" className="block text-lg font-bold text-blue-600">Admin Panel</Link>}
                            <button onClick={handleLogout} className="text-lg font-bold text-red-500 block w-full text-left">Log out</button>
                        </div>
                    )}
                </div>
            )}

            <AuthModal
                isOpen={authModal.isOpen}
                onClose={() => setAuthModal({ ...authModal, isOpen: false })}
                initialMode={authModal.mode}
                setUser={setUser}
            />
        </header>

        {/* Login Prompt Ticker */}
        {showLoginPrompt && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[2000] bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold animate-bounce">
                Please login first to access your cart! 🔒
            </div>
        )}
        </>
    );
};

export default Header;