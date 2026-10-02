import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from './common/Layout';
import { useAuth } from '../context/AuthContext';

function Cart() {
    const { user, loading: authLoading } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading) {
            if (user) {
                fetchCart();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading]);

    const fetchCart = async () => {
        try {
            const response = await axios.get(`/cart?userId=${user.id}`);

            // Defensive check for unexpected response (e.g. HTML redirect)
            if (!response.data || typeof response.data !== 'object' || !Array.isArray(response.data.items)) {
                console.error('Cart response is invalid or not an object:', response.data);
                setCart({ items: [] });
                return;
            }

            setCart(response.data);
        } catch (err) {
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, qty) => {
        if (qty < 1) return;
        try {
            await axios.put(`/cart/update?userId=${user.id}&itemId=${itemId}&quantity=${qty}`);
            fetchCart();
        } catch (err) {
            console.error('Error updating quantity:', err);
        }
    };

    const removeItem = async (itemId) => {
        try {
            await axios.delete(`/cart/remove?userId=${user.id}&itemId=${itemId}`);
            fetchCart();
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    const clearCart = async () => {
        if (!window.confirm('Are you sure you want to clear your cart?')) return;
        try {
            await axios.delete(`/cart/clear?userId=${user.id}`);
            fetchCart();
        } catch (err) {
            console.error('Error clearing cart:', err);
        }
    };

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    };

    if (loading) return <Layout><div className="p-20 text-center text-gray-400">Loading your cart...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-black text-gray-900 mb-12">Shopping Cart</h1>

                {!user ? (
                    <div className="bg-white rounded-[2rem] p-20 text-center shadow-sm border border-gray-100 animate-in fade-in zoom-in-95">
                        <div className="text-8xl mb-8">🔐</div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Please log in to view your cart</h2>
                        <p className="text-gray-500 mb-10 text-lg">You must be logged in to view items in your shopping cart.</p>
                        <Link to="/login" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all decoration-none shadow-xl inline-block">
                            Log In / Register
                        </Link>
                    </div>
                ) : !cart || cart.items.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-20 text-center shadow-sm border border-gray-100 animate-in fade-in zoom-in-95">
                        <div className="text-8xl mb-8">🛒</div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
                        <p className="text-gray-500 mb-10 text-lg">Looks like you haven't added any products yet.</p>
                        <Link to="/products" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all decoration-none shadow-xl inline-block">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Cart Items List */}
                        <div className="lg:w-2/3 space-y-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                    <span className="font-bold text-gray-600 uppercase tracking-widest text-xs">{cart.items.length} Items</span>
                                    <button onClick={clearCart} className="text-red-500 text-sm font-bold hover:underline bg-transparent border-none cursor-pointer">Clear Cart</button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {cart.items.map((item) => (
                                        <div key={item.itemId} className="p-8 flex items-center gap-8 group">
                                            <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                                                <img
                                                    src={item.imageUrl || 'https://via.placeholder.com/100?text=Item'}
                                                    alt={item.productName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{item.productName}</h3>
                                                <p className="text-gray-400 font-bold text-xs uppercase mb-4">₹{item.price} / unit</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center border border-gray-100 rounded-xl px-3 py-1 bg-white shadow-sm">
                                                        <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)} className="text-lg font-bold p-1 hover:text-blue-600 border-none bg-transparent cursor-pointer">-</button>
                                                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} className="text-lg font-bold p-1 hover:text-blue-600 border-none bg-transparent cursor-pointer">+</button>
                                                    </div>
                                                    <button onClick={() => removeItem(item.itemId)} className="text-red-400 hover:text-red-600 text-sm bg-transparent border-none cursor-pointer">Remove</button>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-400 text-xs font-medium uppercase mb-1">Subtotal</p>
                                                <p className="text-2xl font-black text-gray-900">₹{item.subtotal}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Summary Sidebar */}
                        <div className="lg:w-1/3">
                            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 sticky top-28">
                                <h2 className="text-2xl font-black text-gray-900 mb-8">Order Summary</h2>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-gray-800">₹{calculateTotal()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Shipping</span>
                                        <span className="text-blue-600 font-bold">Calculated at Checkout</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
                                        <span className="text-xl font-black text-gray-900">Total</span>
                                        <span className="text-3xl font-black text-blue-600">₹{calculateTotal()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full bg-blue-600 text-white font-black rounded-2xl py-5 text-xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 border-none cursor-pointer mb-4"
                                >
                                    Proceed to Checkout &rarr;
                                </button>
                                <div className="bg-gray-50 rounded-xl p-4 flex gap-3">
                                    <span className="text-2xl">🛡️</span>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                        Secure checkout guaranteed. All payments are encrypted and processed through verified gateways.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default Cart;
