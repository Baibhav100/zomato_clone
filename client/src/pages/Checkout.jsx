import React, { useState, useEffect } from 'react';
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
    const [paymentMethod, setPaymentMethod] = useState('cod');

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const placeOrderInDB = async (method) => {
        try {
            const res = await api.post('/api/orders', {
                restaurantId: cartItems[0].restaurant.id,
                totalPrice: cartTotal + 40,
                address,
                items: cartItems,
                paymentMethod: method
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
    };

    useEffect(() => {
        if (paymentMethod === 'paypal') {
            const loadPaypal = async () => {
                // Use intent=capture and ensure currency=USD for sandbox compatibility
                const isLoaded = await loadScript('https://www.paypal.com/sdk/js?client-id=AZaGOIa6G_VPDLCh6AFUp5bYmjGjg9DIj5OagWmQ7x1AGBq3iWVAsa76Qhb5WvEcma3bxMmt1rbzGUDW&currency=USD&intent=capture');
                if (isLoaded && window.paypal) {
                    const container = document.getElementById('paypal-button-container');
                    if (!container) return;
                    container.innerHTML = ''; 
                    
                    window.paypal.Buttons({
                        createOrder: (data, actions) => {
                            if (!address) {
                                alert("Please enter delivery address first!");
                                return null;
                            }
                            const totalUsd = ((cartTotal + 40) / 83).toFixed(2);
                            console.log(`[PayPal] Creating order for $${totalUsd} USD`);
                            return actions.order.create({
                                purchase_units: [{
                                    amount: {
                                        currency_code: 'USD',
                                        value: totalUsd
                                    }
                                }],
                                application_context: {
                                    shipping_preference: 'NO_SHIPPING'
                                }
                            });
                        },
                        onApprove: async (data, actions) => {
                            console.log('[PayPal] Payment approved, capturing...');
                            setLoading(true);
                            try {
                                await actions.order.capture();
                                await placeOrderInDB('paypal');
                            } catch (err) {
                                console.error('[PayPal] Capture Error:', err);
                                alert('Payment capture failed. Please try again.');
                            } finally {
                                setLoading(false);
                            }
                        },
                        onError: (err) => {
                            console.error('[PayPal] SDK Error:', err);
                            // If it's a common "Things didn't work" error, it's often a sandbox session issue
                            alert('PayPal Sandbox Error: This is common in test mode. Try using an Incognito/Private window or clearing cookies.');
                            setLoading(false);
                        }
                    }).render('#paypal-button-container');
                }
            };
            loadPaypal();
        }
    }, [paymentMethod, cartTotal, address]);

    const handlePlaceOrder = async () => {
        if (!address) return alert("Please enter delivery address");
        setLoading(true);

        if (paymentMethod === 'razorpay') {
            const isLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!isLoaded) {
                alert('Razorpay SDK failed to load. Are you offline?');
                setLoading(false);
                return;
            }

            try {
                // 1. Create order on our backend
                const { data: orderData } = await api.post('/api/payments/razorpay/order', { amount: cartTotal + 40 });
                
                // 2. Open Razorpay Widget
                const options = {
                    key: 'rzp_test_SggF9wcBE4nMhW', // Using test key ID directly
                    amount: orderData.amount,
                    currency: "INR",
                    name: "Zomato Clone",
                    description: "Food Delivery Payment",
                    order_id: orderData.id,
                    handler: async function (response) {
                        // Success! Place order in DB
                        await placeOrderInDB('razorpay');
                        setLoading(false);
                    },
                    prefill: {
                        name: "Zomato User",
                        email: "user@example.com",
                        contact: "9999999999"
                    },
                    theme: { color: "#EF4F5F" },
                    modal: {
                        ondismiss: function() { setLoading(false); }
                    }
                };
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    alert("Payment Failed: " + response.error.description);
                    setLoading(false);
                });
                rzp.open();
            } catch (err) {
                alert("Could not initialize Razorpay");
                setLoading(false);
            }
        } else {
            // Cash on Delivery
            await placeOrderInDB('cod');
            setLoading(false);
        }
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
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="text-zomato-red" size={24} />
                                <h3 className="text-xl font-bold">Payment Method</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div 
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-zomato-red bg-pink-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <span className="font-bold text-center">Cash on Delivery</span>
                                    {paymentMethod === 'cod' && <CheckCircle2 size={24} className="text-zomato-red mt-2" />}
                                </div>
                                <div 
                                    onClick={() => setPaymentMethod('razorpay')}
                                    className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpb3Rl-U2KQEmxEKkNOZnJVH7nP8Am68S6vA&s" alt="Razorpay" className="h-6 object-contain mb-1" />
                                    <span className="text-xs text-gray-500 mt-1">UPI & Cards</span>
                                    {paymentMethod === 'razorpay' && <CheckCircle2 size={24} className="text-blue-500 mt-2" />}
                                </div>
                                <div 
                                    onClick={() => setPaymentMethod('paypal')}
                                    className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 object-contain mb-1" />
                                    <span className="text-xs text-gray-500 mt-1">International</span>
                                    {paymentMethod === 'paypal' && <CheckCircle2 size={24} className="text-yellow-500 mt-2" />}
                                </div>
                            </div>

                            {/* Info text based on selection */}
                            <div className="mt-4 p-4 border border-gray-100 bg-gray-50 rounded-lg text-sm text-gray-600 animate-in fade-in duration-300">
                                {paymentMethod === 'cod' && "Pay with cash when your food arrives."}
                                {paymentMethod === 'razorpay' && "You will be redirected to Razorpay to complete your payment securely via UPI, Credit/Debit Card, or Netbanking."}
                                {paymentMethod === 'paypal' && "You will be redirected to PayPal to complete your payment securely using your PayPal account or International cards."}
                            </div>
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

                            {paymentMethod === 'paypal' ? (
                                <div id="paypal-button-container" className="min-h-[150px] w-full"></div>
                            ) : (
                                <button 
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="w-full bg-zomato-red text-white py-4 rounded-xl font-black text-lg shadow-lg hover:bg-zomato-dark transition-colors flex items-center justify-center gap-2 group"
                                >
                                    {loading ? 'Processing...' : (
                                        <>PLACE ORDER <ChevronRight className="group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
