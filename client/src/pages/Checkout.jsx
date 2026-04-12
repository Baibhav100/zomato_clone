import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { MapPin, CreditCard, ShoppingBag, ChevronRight, CheckCircle2 } from 'lucide-react';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderDone, setOrderDone] = useState(false);

    const handlePlaceOrder = async () => {
        if (!address) return alert("Please enter delivery address");
        setLoading(true);
        try {
            const res = await api.post('/api/orders', {
                restaurantId: cartItems[0].restaurant.id,
                totalPrice: cartTotal + 40,
                address,
                items: cartItems
            });

            if (res.data.success) {
                setOrderDone(true);
                clearCart();
                setTimeout(() => navigate('/orders'), 3000);
            }
        } catch (err) {
            alert("Order failed!");
            console.error(err);
        }
        setLoading(false);
    };

    if (cartItems.length === 0 && !orderDone) {
        return (
            <div className="container py-20 text-center">
                <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold">Your cart is empty</h2>
                <button onClick={() => navigate('/')} className="mt-4 bg-zomato-red text-white px-6 py-2 rounded-lg">Browse Restaurants</button>
            </div>
        );
    }

    if (orderDone) {
        return (
            <div className="container py-20 text-center animate-in fade-in zoom-in duration-500">
                <CheckCircle2 size={80} className="mx-auto text-green-500 mb-4" />
                <h2 className="text-3xl font-extrabold text-zomato-dark">Order Placed Successfully!</h2>
                <p className="text-gray-500 mt-2">Your delicious food is on the way.</p>
                <p className="text-sm text-gray-400 mt-8">Redirecting to your orders...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="container py-8">
                <h1 className="text-3xl font-extrabold mb-8">Checkout</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: ADDR & PAYMENT */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="text-zomato-red" size={24} />
                                <h3 className="text-xl font-bold">Delivery Address</h3>
                            </div>
                            <textarea 
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Enter your full address (House no, Street, Landmark...)"
                                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-32 bg-gray-50"
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm opacity-60">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="text-zomato-red" size={24} />
                                <h3 className="text-xl font-bold">Payment Method</h3>
                            </div>
                            <div className="p-4 border-2 border-zomato-red bg-pink-50 rounded-lg flex items-center justify-between">
                                <span className="font-semibold">Cash on Delivery</span>
                                <CheckCircle2 size={20} className="text-zomato-red" />
                            </div>
                            <p className="mt-4 text-sm text-gray-500">Online payment integration coming soon.</p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SUMMARY */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg sticky top-24">
                            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                            <div className="space-y-4 mb-6">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{item.item_name} x {item.quantity}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                                        </div>
                                        <p className="font-bold">₹{item.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-4" />

                            <div className="space-y-2 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Item Total</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Delivery Charge</span>
                                    <span>₹40</span>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <div className="flex justify-between text-xl font-black text-zomato-dark mb-8">
                                <span>Grand Total</span>
                                <span>₹{cartTotal + 40}</span>
                            </div>

                            <button 
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full bg-zomato-red text-white py-4 rounded-xl font-black text-lg shadow-lg hover:bg-zomato-dark transition-colors flex items-center justify-center gap-2 group"
                            >
                                {loading ? 'Processing...' : (
                                    <>PLACE ORDER <ChevronRight className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
