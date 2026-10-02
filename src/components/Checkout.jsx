import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Layout from './common/Layout';

function Checkout() {
    const [cart, setCart] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(true);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India'
    });
    const [userId] = useState(localStorage.getItem('currentUserId'));
    const navigate = useNavigate();
    const location = useLocation();
    const buyNowState = location.state;

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        try {
            if (buyNowState?.buyNow) {
                const addrRes = await axios.get(`/addresses/user/${userId}`);
                setAddresses(addrRes.data);
                if (addrRes.data.length > 0) {
                    setSelectedAddressId(addrRes.data[0].id);
                }
                setCart({
                    items: [
                        {
                            product: buyNowState.product,
                            quantity: buyNowState.quantity,
                            subtotal: buyNowState.product.price * buyNowState.quantity
                        }
                    ]
                });
            } else {
                const [cartRes, addrRes] = await Promise.all([
                    axios.get(`/cart?userId=${userId}`),
                    axios.get(`/addresses/user/${userId}`)
                ]);

                setCart(cartRes.data);
                setAddresses(addrRes.data);
                if (addrRes.data.length > 0) {
                    setSelectedAddressId(addrRes.data[0].id);
                }
            }
        } catch (err) {
            console.error('Error fetching checkout data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/addresses/user/${userId}`, newAddress);
            setAddresses([...addresses, response.data]);
            setSelectedAddressId(response.data.id);
            setIsAddingAddress(false);
            setNewAddress({ name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India' });
        } catch (err) {
            alert('Failed to add address.');
        }
    };

    const calculateTotals = () => {
        if (!cart || !cart.items) return { subtotal: 0, delivery: 0, discount: 0, total: 0 };
        const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
        const delivery = subtotal * 0.05;
        const discount = subtotal > 1000 ? delivery * 0.15 : 0;
        const total = subtotal + delivery - discount;
        return { subtotal, delivery, discount, total };
    };

    const processOrder = async (razorpayDetails = null) => {
        if (!selectedAddressId) {
            alert('Please select a delivery address.');
            return;
        }

        try {
            if (buyNowState?.buyNow) {
                if (paymentMethod === 'online') {
                    if (!razorpayDetails) return;
                    const params = new URLSearchParams({
                        productId: buyNowState.product.id,
                        userId,
                        addressId: selectedAddressId,
                        quantity: buyNowState.quantity,
                        razorpayPaymentId: razorpayDetails.razorpay_payment_id,
                        razorpayOrderId: razorpayDetails.razorpay_order_id,
                        razorpaySignature: razorpayDetails.razorpay_signature
                    });
                    const response = await axios.post(`/buynow/process-online?${params.toString()}`);
                    if (response.data.success) {
                        navigate(`/payment/success/${response.data.orderId}`);
                    }
                } else {
                    const params = new URLSearchParams({
                        productId: buyNowState.product.id,
                        userId,
                        addressId: selectedAddressId,
                        quantity: buyNowState.quantity
                    });
                    const response = await axios.post(`/buynow/process-cod?${params.toString()}`);
                    if (response.data.success) {
                        navigate(`/payment/success/${response.data.orderId}`);
                    }
                }
            } else {
                const params = new URLSearchParams({
                    userId,
                    addressId: selectedAddressId,
                    paymentMethod: paymentMethod === 'online' ? 'online' : 'cod'
                });

                if (razorpayDetails) {
                    params.append('razorpayPaymentId', razorpayDetails.razorpay_payment_id);
                    params.append('razorpayOrderId', razorpayDetails.razorpay_order_id);
                    params.append('razorpaySignature', razorpayDetails.razorpay_signature);
                }

                const response = await axios.post(`/payment/process?${params.toString()}`);
                if (response.data.success) {
                    navigate(`/payment/success/${response.data.orderId}`);
                }
            }
        } catch (err) {
            alert('Failed to place order: ' + (err.response?.data?.message || err.message));
        }
    };

    const handlePayment = async () => {
        if (!selectedAddressId) {
            alert('Please select a delivery address.');
            return;
        }

        if (paymentMethod === 'cod') {
            processOrder();
        } else {
            try {
                let orderRes;
                if (buyNowState?.buyNow) {
                    const params = new URLSearchParams({
                        productId: buyNowState.product.id,
                        userId,
                        quantity: buyNowState.quantity
                    });
                    orderRes = await axios.post(`/buynow/create-razorpay-order?${params.toString()}`);
                } else {
                    orderRes = await axios.post(`/payment/create-razorpay-order?userId=${userId}`);
                }

                if (orderRes.data.success) {
                    const options = {
                        key: orderRes.data.keyId,
                        amount: orderRes.data.amount * 100,
                        currency: "INR",
                        name: "MegaMart Marketplace",
                        description: "product Payment",
                        order_id: orderRes.data.razorpayOrderId,
                        handler: (response) => processOrder(response),
                        prefill: {
                            name: localStorage.getItem('userName'),
                            email: localStorage.getItem('userEmail'),
                        },
                        theme: { color: "#2563eb" }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                }
            } catch (err) {
                alert('Payment initialization failed: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const { subtotal, delivery, discount, total } = calculateTotals();

    if (loading) return <Layout><div className="p-20 text-center">Loading checkout...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-black text-gray-900 mb-12">Checkout</h1>

                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-2/3 space-y-10">
                        {/* Address Section */}
                        <section className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                    <span className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg">1</span>
                                    Delivery Address
                                </h2>
                                {!isAddingAddress && (
                                    <button onClick={() => setIsAddingAddress(true)} className="text-blue-600 font-bold hover:underline bg-transparent border-none cursor-pointer">
                                        + Add New Address
                                    </button>
                                )}
                            </div>

                            {isAddingAddress ? (
                                <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4">
                                    <input type="text" placeholder="Full Name" required className="p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} />
                                    <input type="text" placeholder="Phone" required className="p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                                    <input type="text" placeholder="Address Line 1" required className="md:col-span-2 p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500" value={newAddress.addressLine1} onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })} />
                                    <input type="text" placeholder="City" required className="p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                    <input type="text" placeholder="Postal Code" required className="p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500" value={newAddress.postalCode} onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })} />
                                    <div className="md:col-span-2 flex gap-4">
                                        <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all cursor-pointer border-none">Save Address</button>
                                        <button type="button" onClick={() => setIsAddingAddress(false)} className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all cursor-pointer border-none">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {addresses.map(addr => (
                                        <div
                                            key={addr.id}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative ${selectedAddressId === addr.id ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 bg-white hover:border-blue-200'}`}
                                        >
                                            {selectedAddressId === addr.id && <span className="absolute top-4 right-4 text-blue-600 text-xl font-bold italic">Selected ✓</span>}
                                            <p className="font-black text-gray-800 text-lg mb-2">{addr.name}</p>
                                            <p className="text-gray-500 text-sm leading-relaxed mb-4">{addr.addressLine1}, {addr.city}</p>
                                            <p className="text-gray-400 font-bold text-xs">{addr.phone}</p>
                                        </div>
                                    ))}
                                    {addresses.length === 0 && <p className="text-gray-400 p-4 border-2 border-dashed border-gray-100 rounded-2xl text-center md:col-span-2">No addresses saved yet.</p>}
                                </div>
                            )}
                        </section>

                        {/* Payment Section */}
                        <section className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3 mb-8">
                                <span className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg">2</span>
                                Payment Method
                            </h2>
                            <div className="space-y-4">
                                <label className={`flex items-center gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'}`}>
                                    <input type="radio" name="payment" className="w-5 h-5 accent-blue-600" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                                    <div>
                                        <p className="font-black text-gray-800">Cash on Delivery</p>
                                        <p className="text-gray-500 text-xs">Pay when you receive the materials</p>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'}`}>
                                    <input type="radio" name="payment" className="w-5 h-5 accent-blue-600" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                                    <div>
                                        <p className="font-black text-gray-800">Online Payment (Razorpay)</p>
                                        <p className="text-gray-500 text-xs">Securely pay via UPI, Card, or Netbanking</p>
                                    </div>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 sticky top-28">
                            <h3 className="text-2xl font-black text-gray-900 mb-8">Order Highlights</h3>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="font-black text-gray-800">₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Delivery (5%)</span>
                                    <span className="font-black text-gray-800">₹{delivery}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold italic">
                                        <span>Discount (15% off delivery)</span>
                                        <span>- ₹{discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t-2 border-dashed border-gray-100 pt-6 flex justify-between items-center text-gray-900">
                                    <span className="text-xl font-black">Grand Total</span>
                                    <span className="text-4xl font-black text-blue-600">₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                            <button
                                onClick={handlePayment}
                                className="w-full bg-blue-600 text-white font-black rounded-2xl py-6 text-xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 border-none cursor-pointer"
                            >
                                Place Order Now
                            </button>
                            <p className="text-center text-gray-400 text-xs mt-6 font-bold uppercase tracking-widest">Fast Delivery Guaranteed</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Checkout;
