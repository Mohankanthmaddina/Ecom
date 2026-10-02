import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from './common/Layout';
import { redirectToSupport } from '../utils/support';


function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId] = useState(localStorage.getItem('currentUserId'));
    const navigate = useNavigate();

    // Advanced Filter and Sort states
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [userId]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`/orders/user/${userId}`);
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return 'bg-emerald-100 text-emerald-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            case 'SHIPPED': return 'bg-blue-100 text-blue-700';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setStartDate('');
        setEndDate('');
        setMinAmount('');
        setMaxAmount('');
        setSortBy('newest');
    };

    // Filter and Sort Logic
    const filteredOrders = orders.filter(order => {
        if (search && !order.orderNumber?.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }

        if (statusFilter && order.status !== statusFilter) {
            return false;
        }

        const orderTime = new Date(order.orderDate).getTime();
        if (startDate) {
            const start = new Date(startDate).setHours(0,0,0,0);
            if (orderTime < start) return false;
        }
        if (endDate) {
            const end = new Date(endDate).setHours(23,59,59,999);
            if (orderTime > end) return false;
        }

        const amt = order.finalAmount || order.totalAmount || 0;
        if (minAmount && amt < parseFloat(minAmount)) return false;
        if (maxAmount && amt > parseFloat(maxAmount)) return false;

        return true;
    }).sort((a, b) => {
        const amtA = a.finalAmount || a.totalAmount || 0;
        const amtB = b.finalAmount || b.totalAmount || 0;
        if (sortBy === 'newest') return new Date(b.orderDate) - new Date(a.orderDate);
        if (sortBy === 'oldest') return new Date(a.orderDate) - new Date(b.orderDate);
        if (sortBy === 'amount-desc') return amtB - amtA;
        if (sortBy === 'amount-asc') return amtA - amtB;
        return 0;
    });

    if (loading) return <Layout><div className="p-20 text-center">Loading order history...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">My Material Orders</h1>
                        <p className="text-gray-500 font-medium italic">Track your deliveries and view past transactions.</p>
                    </div>
                    <Link to="/profile" className="text-blue-600 font-bold hover:underline decoration-none mb-2">Back to Dashboard</Link>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] text-center shadow-sm border border-gray-100">
                        <div className="text-8xl mb-8">🚛</div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">No orders yet</h2>
                        <p className="text-gray-500 mb-10 text-lg max-w-md mx-auto">Start building your project by exploring our premium material marketplace.</p>
                        <Link to="/products" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all decoration-none shadow-xl inline-block">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Horizontal Filter Bar */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Search Orders</label>
                                    <input
                                        type="text"
                                        placeholder="Order Number..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="amount-desc">Amount: High to Low</option>
                                        <option value="amount-asc">Amount: Low to High</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleClearFilters}
                                        className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-all border-none cursor-pointer"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Date From</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Date To</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Min Amount (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minAmount}
                                        onChange={(e) => setMinAmount(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Max Amount (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxAmount}
                                        onChange={(e) => setMaxAmount(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div className="bg-white p-20 rounded-[3rem] text-center shadow-sm border border-gray-100">
                                <div className="text-6xl mb-6">🔍</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">No matching orders found</h3>
                                <p className="text-gray-500">Try adjusting your filters or search query.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 hover:shadow-xl transition-all group overflow-hidden relative"
                                    >
                                        {/* Status Bar */}
                                        <div className="flex flex-wrap justify-between items-center gap-6 relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px] border border-gray-100 shadow-inner">
                                                    <span className="text-xs font-bold text-gray-400 uppercase">{new Date(order.orderDate).toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="text-2xl font-black text-gray-800">{new Date(order.orderDate).getDate()}</span>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase">{new Date(order.orderDate).getFullYear()}</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Order #{order.orderNumber}</p>
                                                    <h3 className="text-xl font-black text-gray-900 mb-2">₹{order.finalAmount?.toFixed(2) || order.totalAmount?.toFixed(2)}</h3>
                                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-1 max-w-sm hidden lg:block">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Shipping to</p>
                                                <p className="text-sm font-medium text-gray-600 line-clamp-2 italic">
                                                    {order.deliveryAddress ? `${order.deliveryAddress.addressLine1}, ${order.deliveryAddress.city}` : 'Default Address'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => navigate(`/profile/orders/${order.id}`)}
                                                    className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all border-none cursor-pointer shadow-lg"
                                                >
                                                    View Details & Invoice
                                                </button>
                                            </div>
                                        </div>

                                        {/* Horizontal progress visualization (Optional/Decorative) */}
                                        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 w-full opacity-50"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div className="mt-12 bg-blue-50/50 rounded-[2.5rem] p-8 border border-blue-100 text-center">
                    <p className="text-blue-600 font-bold text-sm italic">
                        All order times are displayed in UTC+5:30. Need help with an order? <button onClick={redirectToSupport} className="bg-transparent border-none cursor-pointer text-blue-800 hover:text-blue-900 font-black underline p-0 inline">Contact our support team</button> within 24 hours of delivery.
                    </p>
                </div>
            </div>
        </Layout>
    );
}

export default OrderHistory;
