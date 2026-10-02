import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';

function AdminOrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Filter and Sort states
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/admin/orders');
            setOrders(response.data);
            
            // Sync open modal order details
            if (selectedOrder) {
                const updated = response.data.find(o => o.id === selectedOrder.id);
                if (updated) {
                    setSelectedOrder(updated);
                }
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`/api/admin/orders/${id}/status?status=${status}`);
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder(prev => ({ ...prev, status }));
            }
            await fetchOrders();
            alert('Order status updated. Email notification sent to user.');
        } catch (err) {
            alert('Update failed.');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            case 'CANCELLED': return 'bg-rose-50 text-rose-500 border border-rose-100';
            case 'SHIPPED': return 'bg-blue-50 text-blue-600 border border-blue-100';
            default: return 'bg-amber-50 text-amber-600 border border-amber-100';
        }
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setStartDate('');
        setEndDate('');
        setMinAmount('');
        setMaxAmount('');
        setSortBy('date-desc');
    };

    // Filter and Sort Logic
    const filteredOrders = orders.filter(order => {
        if (search) {
            const term = search.toLowerCase();
            const matchesNumber = order.orderNumber?.toLowerCase().includes(term);
            const matchesName = order.userName?.toLowerCase().includes(term);
            const matchesEmail = order.userEmail?.toLowerCase().includes(term);
            if (!matchesNumber && !matchesName && !matchesEmail) return false;
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
        if (sortBy === 'date-desc') return new Date(b.orderDate) - new Date(a.orderDate);
        if (sortBy === 'date-asc') return new Date(a.orderDate) - new Date(b.orderDate);
        if (sortBy === 'amount-desc') return amtB - amtA;
        if (sortBy === 'amount-asc') return amtA - amtB;
        return 0;
    });

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center p-24 space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="text-gray-400 font-bold uppercase tracking-widest text-sm animate-pulse">
                        Scanning Logistics Registry...
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8 font-sans">
                {/* Header info */}
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Global Logistics</h1>
                    <p className="text-gray-500 text-sm mt-1">Track fulfillment, manage deliveries, and oversee project distributions. Click on any row to inspect.</p>
                </div>

                {/* Filters card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Search Orders</label>
                            <input
                                type="text"
                                placeholder="Order #, client name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                            >
                                <option value="date-desc">Date: Newest First</option>
                                <option value="date-asc">Date: Oldest First</option>
                                <option value="amount-desc">Investment: High to Low</option>
                                <option value="amount-asc">Investment: Low to High</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleClearFilters}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Date From</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Date To</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Min Investment (₹)</label>
                            <input
                                type="number"
                                placeholder="Min"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Max Investment (₹)</label>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Orders table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-900 text-slate-100 border-b border-slate-800">
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider w-3/12">Transaction ID</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider w-3/12">Customer</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider w-2/12">Asset Volume</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider w-2/12">Status</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider w-2/12 text-right">Workflow</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-16 text-center text-gray-400 font-semibold italic">
                                            No matching transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr 
                                            key={order.id} 
                                            className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                            onClick={(e) => {
                                                if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') return;
                                                setSelectedOrder(order);
                                                setShowModal(true);
                                            }}
                                        >
                                            <td className="p-4">
                                                <p className="font-extrabold text-blue-600 uppercase text-xs group-hover:underline">#{order.orderNumber}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1">{new Date(order.orderDate).toLocaleDateString()}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-800">{order.userName}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{order.userEmail || 'Project Client'}</p>
                                            </td>
                                            <td className="p-4 font-bold text-slate-800 italic">₹{order.finalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${getStatusStyle(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <select
                                                    className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 font-semibold text-xs outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="SHIPPED">Shipped</option>
                                                    <option value="DELIVERED">Delivered</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Details Modal */}
                {showModal && selectedOrder && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300">
                            {/* Header */}
                            <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800">
                                <div>
                                    <h2 className="text-xl font-extrabold uppercase tracking-tight">Order Details</h2>
                                    <p className="text-blue-400 text-xs font-bold uppercase mt-0.5">Transaction #{selectedOrder.orderNumber}</p>
                                </div>
                                <button 
                                    onClick={() => { setShowModal(false); setSelectedOrder(null); }} 
                                    className="text-slate-400 hover:text-white text-xl bg-transparent border-none cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[60vh] overflow-y-auto">
                                {/* Shipping Info (5 columns) */}
                                <div className="md:col-span-5 space-y-4 md:border-r md:border-slate-100 md:pr-6">
                                    <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-50 pb-2">Client Information</h3>
                                    
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Customer Name</p>
                                        <p className="font-semibold text-slate-700 text-sm">{selectedOrder.userName}</p>
                                    </div>
                                    
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Email Address</p>
                                        <p className="font-semibold text-slate-700 text-sm">{selectedOrder.userEmail || 'N/A'}</p>
                                    </div>

                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Contact Number</p>
                                        <p className="font-semibold text-slate-700 text-sm">{selectedOrder.userMobileNumber || 'N/A'}</p>
                                    </div>

                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Delivery Destination</p>
                                        <p className="font-semibold text-gray-550 text-xs leading-relaxed">{selectedOrder.address}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Order Date</p>
                                            <p className="font-semibold text-slate-700 text-xs">{selectedOrder.orderDateDisplay || new Date(selectedOrder.orderDate).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Delivery Date</p>
                                            <p className="font-semibold text-slate-700 text-xs">{selectedOrder.deliveryDateDisplay || (selectedOrder.deliveryDate ? new Date(selectedOrder.deliveryDate).toLocaleDateString() : 'Pending')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 pt-4 border-t border-slate-50">
                                        <label className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Modify Workflow Status</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-xs outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                                            value={selectedOrder.status}
                                            onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Items & Billing summary (7 columns) */}
                                <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-50 pb-2">Material Manifest</h3>
                                        <div className="divide-y divide-slate-100 max-h-[25vh] overflow-y-auto pr-2 mt-2 space-y-3">
                                            {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                                                selectedOrder.orderItems.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between py-2.5 first:pt-0">
                                                        <div className="flex items-center gap-3">
                                                            <img 
                                                                src={item.productImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=80&auto=format&fit=crop'} 
                                                                className="w-12 h-12 rounded-lg object-cover shadow-sm bg-slate-50 flex-shrink-0" 
                                                                alt="" 
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-slate-800 text-xs truncate">{item.productName}</p>
                                                                <p className="text-[10px] text-gray-400 mt-0.5">{item.productBrand} &bull; Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="font-bold text-slate-800 italic text-xs">₹{item.subtotal?.toFixed(2) || (item.price * item.quantity).toFixed(2)}</p>
                                                            <p className="text-[9px] text-gray-400">₹{item.price?.toFixed(2)} / unit</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-400 italic text-xs text-center py-6">No products found in this manifest.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Cost breakdown */}
                                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                                        <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                                            <span>Cart Subtotal</span>
                                            <span>₹{selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                                            <span>Logistic Delivery Charge</span>
                                            <span>+ ₹{selectedOrder.deliveryCharge?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-semibold text-emerald-600">
                                            <span>Cluster Cashback Discount</span>
                                            <span>- ₹{selectedOrder.discountAmount?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 font-bold text-slate-800 text-base italic">
                                            <span>Total Investment</span>
                                            <span className="text-blue-600 font-extrabold">₹{selectedOrder.finalAmount?.toFixed(2) || '0.00'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-50 p-4 flex justify-end">
                                <button
                                    onClick={() => { setShowModal(false); setSelectedOrder(null); }}
                                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminOrderList;
