import React, { useState, useEffect } from 'react';
import api from '../api';
import { Calendar, Package, ShoppingBag, MapPin, Receipt, Clock, ChevronRight, Utensils, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusConfig = {
    'pending':   { color: 'bg-yellow-100 text-yellow-800 border-yellow-200',   dot: 'bg-yellow-500',  label: 'PENDING' },
    'preparing': { color: 'bg-blue-100   text-blue-800   border-blue-200',     dot: 'bg-blue-500',    label: 'PREPARING' },
    'out_for_delivery': { color: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-500', label: 'OUT FOR DELIVERY' },
    'delivered': { color: 'bg-green-100  text-green-800  border-green-200',    dot: 'bg-green-500',   label: 'DELIVERED' },
    'cancelled': { color: 'bg-red-100    text-red-800    border-red-200',      dot: 'bg-red-500',     label: 'CANCELLED' },
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/orders');
            setOrders(res.data);
        } catch (err) { console.error('Orders fail:', err); }
        setLoading(false);
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to remove this order from your history?")) return;
        try {
            await api.delete(`/api/orders/${orderId}`);
            setOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (err) {
            alert("Failed to delete order. It might be already processed.");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading your food history...</p>
            </div>
        </div>
    );

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center px-6">
                    <div className="w-28 h-28 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag size={52} className="text-red-400" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-3">No orders yet!</h2>
                    <p className="text-gray-500 mb-8 text-lg">Discover the finest restaurants and place your first order.</p>
                    <Link to="/" className="bg-red-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 inline-block">
                        Explore Restaurants
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container max-w-3xl mx-auto px-4">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                        <Receipt size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">My Orders</h1>
                        <p className="text-gray-500 text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
                    </div>
                </div>

                {/* Order Cards */}
                <div className="space-y-5">
                    {orders.map(order => {
                        const status = statusConfig[order.status] || statusConfig['pending'];
                        const isExpanded = expandedId === order.id;

                        return (
                            <div key={order.id}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">

                                {/* Card Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-start justify-between gap-4">

                                        {/* Restaurant Info */}
                                        <div className="flex items-start gap-4 min-w-0">
                                            {order.restaurant_image ? (
                                                <img
                                                    src={order.restaurant_image}
                                                    alt={order.restaurant_name}
                                                    className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-sm"
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                                    <Utensils size={24} className="text-gray-400" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-extrabold text-gray-900 leading-tight mb-1 truncate">
                                                    {order.restaurant_name || 'Restaurant'}
                                                </h3>
                                                <div className="flex items-center gap-3 text-gray-400 text-xs flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-gray-300">• Order #{order.id}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border whitespace-nowrap flex-shrink-0 ${status.color}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></div>
                                            {status.label}
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                {order.address && (
                                    <div className="px-6 pb-4">
                                        <div className="flex items-start gap-2 text-gray-500 text-sm bg-gray-50 p-3 rounded-xl border-l-4 border-red-400">
                                            <MapPin size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                                            <span className="leading-relaxed">{order.address}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Items (collapsible) */}
                                {order.items && order.items.length > 0 && (
                                    <div className="px-6 pb-4">
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                            className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 mb-3"
                                        >
                                            {isExpanded ? '▲ Hide items' : `▼ Show ${order.items.length} item${order.items.length !== 1 ? 's' : ''}`}
                                        </button>

                                        {isExpanded && (
                                            <div className="bg-gray-50 rounded-2xl overflow-hidden divide-y divide-gray-100">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs font-black flex items-center justify-center">
                                                                {item.quantity}×
                                                            </span>
                                                            <span className="font-semibold text-gray-800 text-sm">{item.item_name}</span>
                                                        </div>
                                                        <span className="font-bold text-gray-700 text-sm">
                                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Footer — Total + Action */}
                                <div className="px-6 py-4 border-t border-dashed border-gray-100 flex justify-between items-center bg-gray-50/60">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Paid</p>
                                        <p className="text-2xl font-black text-gray-900">
                                            ₹{Number(order.total_price || 0).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDeleteOrder(order.id)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                            title="Delete order history"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <Link
                                            to={`/orders/${order.id}`}
                                            className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-sm"
                                        >
                                            Order Details <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Orders;
