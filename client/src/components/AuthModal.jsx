import React, { useState } from 'react';
import { X, CheckCircle2, Mail, Lock, User, UtensilsCrossed } from 'lucide-react';
import api from '../api';

const AuthModal = ({ isOpen, onClose, initialMode = 'login', setUser }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); 
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'signup' && !agreed) {
      setError('Please agree to the terms and conditions');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await api.post(url, formData);
      
      if (mode === 'login') {
        // Explicitly Save Session
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);
        console.log('[AUTH] Token saved to storage:', !!res.data.token);
        
        setSuccess('login');
        setTimeout(() => {
            setUser(res.data.user);
            setSuccess(null);
            onClose();
        }, 1500);


      } else {
        setSuccess('signup');
        setTimeout(() => {
            setSuccess(null);
            setMode('login');
            setFormData({ name: '', email: '', password: '' });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication Failed');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-[480px] rounded-[24px] shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
        {!success && (
            <button onClick={onClose} className="absolute top-5 right-5 z-20 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all bg-white shadow-sm">
                <X size={20} />
            </button>
        )}

        {/* Header Banner */}
        <div className="h-28 bg-gradient-to-r from-red-50 to-pink-50 flex items-center px-10 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 blur-sm scale-150 transform -translate-y-4">
                <UtensilsCrossed size={120} />
            </div>
            <span className="text-4xl font-black italic tracking-tighter text-gray-900 relative z-10">otamaz<span className="text-red-500">.</span></span>
        </div>

        <div className="px-10 py-8">
            {success ? (
                <div className="text-center py-8 space-y-6">
                    <div className="inline-flex p-5 bg-green-50 rounded-full border-4 border-white shadow-sm animate-bounce">
                        <CheckCircle2 size={64} className="text-green-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                            {success === 'login' ? 'Glad to have you back!' : 'Welcome to the family!'}
                        </h2>
                        <p className="text-gray-500 font-medium">
                            {success === 'login' ? 'Setting up your table...' : 'Your account has been successfully created.'}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                            {mode === 'login' ? 'Log in' : 'Sign up'}
                        </h2>
                        <p className="text-gray-500 font-medium">Enjoy exclusive deals and personalized recommendations</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {mode === 'signup' && (
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
                                <input 
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-semibold text-gray-800 text-lg"
                                    type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required 
                                />
                            </div>
                        )}
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
                            <input 
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-semibold text-gray-800 text-lg"
                                type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required 
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
                            <input 
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-semibold text-gray-800 text-lg"
                                type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required 
                            />
                        </div>

                        {mode === 'signup' && (
                            <label className="flex items-start gap-3 cursor-pointer group py-2">
                                <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="mt-1 flex-shrink-0 w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer" />
                                <span className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-900 transition-colors font-medium">
                                    I agree to Otamaz's <span className="text-red-500 font-bold">Terms of Service</span> and <span className="text-red-500 font-bold">Privacy Policy</span>
                                </span>
                            </label>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading || (mode === 'signup' && !agreed)}
                            className="w-full py-4 mt-2 bg-red-500 text-white flex items-center justify-center gap-2 rounded-2xl font-black text-lg shadow-lg hover:bg-red-600 hover:shadow-none hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Validating...
                                </>
                            ) : (mode === 'login' ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-gray-400 font-bold uppercase tracking-widest">or</span></div>
                    </div>

                    <button 
                        onClick={() => alert('Demo Social Login')}
                        className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all tracking-wide active:scale-[0.98]"
                    >
                        <img src="https://imagepng.org/wp-content/uploads/2019/08/google-icon.png" alt="G" className="w-[18px] h-[18px]" />
                        Continue with Google
                    </button>

                    <div className="mt-8 text-center pt-4 border-t border-gray-100">
                        <p className="text-gray-500 font-medium text-[15px]">
                            {mode === 'login' ? "New to Otamaz?" : "Already member?"}
                            <button 
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-red-500 font-black ml-2 hover:underline tracking-tight"
                            >
                                {mode === 'login' ? 'Create Account' : 'Log In Here'}
                            </button>
                        </p>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;