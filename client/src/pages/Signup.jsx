import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck, ArrowRight, UtensilsCrossed } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/api/auth/register', formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
            {/* Left Showcase Panel */}
            <div className="w-full md:w-5/12 relative hidden md:flex flex-col justify-between overflow-hidden bg-zomato-dark text-white p-12 lg:p-16">
                <div className="absolute inset-0 z-0 opacity-40">
                    <img 
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80" 
                        alt="Background" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zomato-dark via-zomato-dark/80 to-transparent"></div>
                </div>
                
                <div className="relative z-10 flex items-center gap-3 mb-10">
                    <div className="bg-zomato-red p-3 rounded-2xl shadow-lg shadow-red-500/30">
                        <UtensilsCrossed size={32} color="white" />
                    </div>
                    <span className="text-4xl font-black italic tracking-tighter">zomato<span className="text-zomato-red">.</span></span>
                </div>

                <div className="relative z-10 max-w-sm">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-6">
                        Discover the best food & drinks in <span className="text-zomato-red">Guwahati.</span>
                    </h1>
                    <p className="text-lg text-gray-300 font-medium mb-10 leading-relaxed">
                        Join millions of food lovers exploring restaurants, placing live orders, and leaving reviews seamlessly.
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm font-bold bg-white/10 backdrop-blur-md p-4 rounded-2xl w-fit border border-white/10">
                        <ShieldCheck className="text-rating-green" size={24} />
                        Trusted by 50M+ Users
                    </div>
                </div>
            </div>

            {/* Right Signup Form */}
            <div className="w-full md:w-7/12 flex items-center justify-center p-6 md:p-12 lg:p-20 relative bg-white">
                <div className="w-full max-w-[480px] animate-in slide-in-from-bottom-8 duration-500">
                    
                    {/* Mobile Only Header */}
                    <div className="md:hidden flex items-center gap-2 mb-10">
                        <div className="bg-zomato-red p-2 rounded-xl">
                            <UtensilsCrossed size={20} color="white" />
                        </div>
                        <span className="text-3xl font-black italic tracking-tighter text-zomato-dark">zomato<span className="text-zomato-red">.</span></span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-4xl font-black text-zomato-dark tracking-tight mb-2">Create Account</h2>
                        <p className="text-gray-500 font-medium text-lg">Your next great meal is just a few clicks away.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl mb-6 font-bold flex items-center gap-3 animate-in shake">
                            <Lock size={20} /> {error}
                        </div>
                    )}

                    {success ? (
                        <div className="bg-green-50 text-rating-green border border-green-100 p-8 rounded-3xl text-center space-y-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                <ShieldCheck size={32} className="text-rating-green" />
                            </div>
                            <h3 className="text-2xl font-black">Account Verified!</h3>
                            <p className="font-medium text-green-700/80">Taking you to the login screen...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-5">
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-zomato-red transition-colors" size={22} />
                                <input 
                                    className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-zomato-red focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-semibold text-gray-800 text-lg"
                                    type="text" placeholder="Full Name" 
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required 
                                />
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-zomato-red transition-colors" size={22} />
                                <input 
                                    className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-zomato-red focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-semibold text-gray-800 text-lg"
                                    type="email" placeholder="Email Address" 
                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required 
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-zomato-red transition-colors" size={22} />
                                <input 
                                    className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-zomato-red focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-semibold text-gray-800 text-lg"
                                    type="password" placeholder="Secure Password" 
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required 
                                />
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full py-4 bg-zomato-red text-white flex items-center justify-center gap-3 rounded-2xl font-black text-lg shadow-[0_10px_20px_-10px_rgba(239,79,95,0.6)] hover:bg-zomato-dark hover:shadow-none hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Create Account <ArrowRight size={20} className="mt-0.5" />
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="text-center pt-6">
                                <p className="text-gray-500 font-medium text-base">
                                    Already have an account? 
                                    <Link to="/login" className="text-zomato-red font-black ml-2 hover:underline">
                                        Log in here
                                    </Link>
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Signup;
