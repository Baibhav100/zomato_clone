import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, UtensilsCrossed, ShieldCheck, ArrowRight } from 'lucide-react';

const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/api/auth/login', { email, password });
            setUser(res.data.user);
            
            // Allow state to catch up before redirecting
            setTimeout(() => {
                if (res.data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }, 600);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Check your connection.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
            {/* Left Showcase Panel */}
            <div className="w-full md:w-5/12 relative hidden md:flex flex-col justify-between overflow-hidden bg-zomato-dark text-white p-12 lg:p-16">
                <div className="absolute inset-0 z-0 opacity-40">
                    <img 
                        src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80" 
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
                        Welcome back to <span className="text-zomato-red">flavor.</span>
                    </h1>
                    <p className="text-lg text-gray-300 font-medium mb-10 leading-relaxed">
                        Log in to unlock your recent orders, saved favorites, and exclusive platform discounts.
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm font-bold bg-white/10 backdrop-blur-md p-4 rounded-2xl w-fit border border-white/10">
                        <ShieldCheck className="text-rating-green" size={24} />
                        Secure Encrypted Session
                    </div>
                </div>
            </div>

            {/* Right Login Form */}
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
                        <h2 className="text-4xl font-black text-zomato-dark tracking-tight mb-2">Log in</h2>
                        <p className="text-gray-500 font-medium text-lg">Pick up right where you left off.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl mb-6 font-bold flex items-center gap-3 animate-in shake">
                            <Lock size={20} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-zomato-red transition-colors" size={22} />
                            <input 
                                className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-zomato-red focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-semibold text-gray-800 text-lg"
                                type="email" placeholder="Email Address" 
                                value={email} onChange={e => setEmail(e.target.value)} required 
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-zomato-red transition-colors" size={22} />
                            <input 
                                className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-zomato-red focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-semibold text-gray-800 text-lg"
                                type="password" placeholder="Secure Password" 
                                value={password} onChange={e => setPassword(e.target.value)} required 
                            />
                        </div>

                        <div className="flex justify-end mb-4">
                            <button type="button" onClick={() => alert('Reset password feature mocked.')} className="text-sm font-bold text-gray-400 hover:text-zomato-red transition-colors">
                                Forgot password?
                            </button>
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
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        Log in <LogIn size={20} className="mt-0.5" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="text-center pt-6">
                            <p className="text-gray-500 font-medium text-base">
                                New to Zomato? 
                                <Link to="/signup" className="text-zomato-red font-black ml-2 hover:underline">
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
