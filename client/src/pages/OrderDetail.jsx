import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { 
    ChevronLeft, MapPin, Receipt, Clock, Calendar, 
    Utensils, Phone, CheckCircle2, Package, ShoppingBag 
} from 'lucide-react';

const statusConfig = {
    'pending':   { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: <Clock size={20}/>, label: 'Order Pending' },
    'preparing': { color: 'text-blue-600', bg: 'bg-blue-50', icon: <Package size={20}/>, label: 'Being Prepared' },
    'delivered': { color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle2 size={20}/>, label: 'Delivered' },
    'cancelled': { color: 'text-red-600', bg: 'bg-red-50', icon: <ShoppingBag size={20}/>, label: 'Cancelled' },
};

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const res = await api.get(`/api/orders`);
            const found = res.data.find(o => o.id === parseInt(id));
            if (found) {
                setOrder(found);
            } else {
                console.error('Order not found');
            }
        } catch (err) {
            console.error('Fetch detail error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <Receipt size={64} className="text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Order not found</h2>
            <p className="text-gray-500 mt-2 mb-6">We couldn't retrieve the details for this order.</p>
            <Link to="/orders" className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-all">
                Back to My Orders
            </Link>
        </div>
    );

    const status = statusConfig[order.status] || statusConfig['pending'];

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/orders')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <h1 className="text-xl font-black text-gray-900">Order Summary</h1>
                </div>
            </div>

            <div className="container max-w-2xl mx-auto px-4 mt-6">
                {/* Order Information Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Order ID</p>
                            <p className="text-lg font-black text-gray-900">#{order.id}</p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm ${status.bg} ${status.color}`}>
                            {status.icon}
                            {status.label}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 py-4 border-t border-gray-50">
                        <img 
                            src={order.restaurant_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'}
                            className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                            alt={order.restaurant_name}
                        />
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">{order.restaurant_name}</h2>
                            <div className="flex items-center gap-3 text-gray-400 text-xs mt-1">
                                <span className="flex items-center gap-1"><Calendar size={12}/>{new Date(order.created_at).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Clock size={12}/>{new Date(order.created_at).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-6">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <Utensils size={20} className="text-red-500" /> Order Items
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center font-black text-sm">
                                        {item.quantity}×
                                    </div>
                                    <p className="font-bold text-gray-800">{item.item_name}</p>
                                </div>
                                <p className="font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 bg-gray-50/50">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-500 font-medium">Subtotal</span>
                            <span className="text-gray-800 font-bold">₹{Number(order.total_price).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-500 font-medium">Delivery Fee</span>
                            <span className="text-green-600 font-bold">FREE</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
                            <span className="text-xl font-black text-gray-900">Total Paid</span>
                            <span className="text-2xl font-black text-red-500">₹{Number(order.total_price).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Delivery Details */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-red-500" /> Delivery Details
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-2xl border-l-4 border-red-500">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Delivered to</p>
                        <p className="text-gray-800 font-semibold leading-relaxed">{order.address}</p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button 
                        className="text-gray-400 hover:text-red-500 font-bold text-sm flex items-center gap-2 mx-auto"
                        onClick={() => window.print()}
                    >
                        <Receipt size={16} /> Download Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
