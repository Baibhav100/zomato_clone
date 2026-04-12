import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Save, Shield, Star, Award, ShoppingBag } from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
        fetchOrders();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/api/auth/me');
            setProfile(res.data);
        } catch (err) {
            // Not logged in — redirect to home
            navigate('/');
        }
        setLoading(false);
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/orders');
            setOrders(res.data);
        } catch (_) {}
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/auth/profile', profile);
            if (res.data.success) {
                setMessage('Profile updated successfully!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) { alert('Update failed!'); }
    };

    if (loading) return <div className="container py-20 text-center text-gray-400">Loading your profile...</div>;
    if (!profile) return null;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container max-w-4xl mx-auto px-4">
                <div className="flex items-center gap-4 mb-10">
                    <User size={32} className="text-zomato-red" />
                    <h1 className="text-4xl font-extrabold text-zomato-dark">Profile Settings</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* AVATAR & STATS */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
                            <div className="w-24 h-24 bg-zomato-red text-white flex items-center justify-center text-4xl font-black rounded-full mx-auto mb-4 border-4 border-pink-50 shadow-md">
                                {profile.name?.[0].toUpperCase()}
                            </div>
                            <h3 className="text-xl font-extrabold text-zomato-dark">{profile.name}</h3>
                            <p className="text-sm text-gray-500 mb-6">{profile.email}</p>
                            
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                    <span>Gold Member</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                    <Award size={16} className="text-blue-500" />
                                    <span>15 Orders Placed</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* EDIT FORM */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleUpdate} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                            {message && (
                                <div className="bg-green-100 text-green-700 p-4 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <Shield size={20} /> {message}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-red-500 transition-shadow">
                                        <User size={18} className="text-gray-400" />
                                        <input 
                                            value={profile.name}
                                            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                            className="bg-transparent outline-none w-full font-semibold"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 opacity-60">
                                        <Mail size={18} className="text-gray-400" />
                                        <input 
                                            value={profile.email}
                                            disabled
                                            className="bg-transparent outline-none w-full font-semibold text-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-red-500 transition-shadow">
                                    <Phone size={18} className="text-gray-400" />
                                    <input 
                                        value={profile.phone}
                                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                        className="bg-transparent outline-none w-full font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Default Delivery Address</label>
                                <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-red-500 transition-shadow">
                                    <MapPin size={18} className="text-gray-400 mt-1" />
                                    <textarea 
                                        value={profile.address}
                                        onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                                        className="bg-transparent outline-none w-full font-semibold h-24 pt-0"
                                    />
                                </div>
                            </div>

                            <button className="w-full bg-zomato-red text-white py-4 rounded-xl font-black text-lg shadow-lg hover:bg-zomato-dark transition-colors flex items-center justify-center gap-2">
                                <Save size={20} /> SAVE CHANGES
                            </button>
                        </form>
                    </div>
                </div>

                {/* ORDERS SECTION */}
                <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <h2 className="text-xl font-extrabold text-zomato-dark mb-6 flex items-center gap-2">
                        <ShoppingBag size={22} className="text-zomato-red" /> Your Order History
                    </h2>
                    {orders.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No orders yet. Start exploring restaurants!</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {orders.map(order => (
                                <div key={order.id} className="flex justify-between items-center border border-gray-100 rounded-xl p-4">
                                    <div>
                                        <p className="font-bold text-zomato-dark">{order.restaurant_name}</p>
                                        <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-zomato-red">₹{order.total_price}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                            order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'
                                        }`}>{order.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
