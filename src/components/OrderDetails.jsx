import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from './common/Layout';

function OrderDetails() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId] = useState(localStorage.getItem('currentUserId'));
    const [showComplaintForm, setShowComplaintForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [complaintData, setComplaintData] = useState({ issueType: 'DAMAGED_PRODUCT', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }
        fetchOrderDetails();
    }, [orderId, userId]);

    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(`/orders/${orderId}?userId=${userId}`);
            setOrder(response.data);
        } catch (err) {
            console.error('Error fetching order details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleComplaintSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = `/api/profile/orders/${orderId}/complaint?userId=${userId}${selectedProduct ? `&productId=${selectedProduct.id}` : ''}`;
            await axios.post(url, complaintData);
            alert('Complaint submitted successfully! Our support team will contact you shortly.');
            setShowComplaintForm(false);
            setComplaintData({ issueType: 'DAMAGED_PRODUCT', description: '' });
        } catch (err) {
            console.error('Error submitting complaint:', err);
            alert('Failed to submit complaint. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadInvoice = () => {
        if (!order) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to download/print the invoice.');
            return;
        }

        const orderDateStr = new Date(order.orderDate).toLocaleDateString();
        const itemsHtml = order.orderItems.map(item => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 16px 0; font-weight: 700; color: #111827; font-size: 14px;">${item.product.name}</td>
                <td style="padding: 16px 0; text-align: center; color: #4b5563; font-weight: 600; font-size: 14px;">${item.quantity}</td>
                <td style="padding: 16px 0; text-align: right; color: #4b5563; font-weight: 600; font-size: 14px;">₹${item.price.toFixed(2)}</td>
                <td style="padding: 16px 0; text-align: right; font-weight: 800; color: #111827; font-size: 14px;">₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('');

        const addressHtml = order.deliveryAddress ? `
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #1f2937;">${order.deliveryAddress.name || order.user?.name || ''}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #4b5563;">${order.deliveryAddress.addressLine1 || ''}</p>
            ${order.deliveryAddress.addressLine2 ? `<p style="margin: 0 0 4px 0; font-size: 14px; color: #4b5563;">${order.deliveryAddress.addressLine2}</p>` : ''}
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #4b5563;">${order.deliveryAddress.city || ''}, ${order.deliveryAddress.state || ''} - ${order.deliveryAddress.postalCode || ''}</p>
            <p style="margin: 0; font-size: 14px; color: #4b5563;">${order.deliveryAddress.country || 'India'}</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #4b5563;">Phone: ${order.deliveryAddress.phone || ''}</p>
        ` : `
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #1f2937;">${order.user?.name || 'Customer'}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #4b5563;">${order.user?.email || ''}</p>
        `;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${order.orderNumber}</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        color: #1f2937;
                        margin: 0;
                        padding: 40px;
                        background-color: #ffffff;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .invoice-card {
                        max-width: 800px;
                        margin: 0 auto;
                        border: 1px solid #e5e7eb;
                        border-radius: 24px;
                        overflow: hidden;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                    }
                    .header {
                        background: linear-gradient(135deg, #111827 0%, #030712 100%);
                        color: #ffffff;
                        padding: 48px;
                    }
                    .header-top {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 40px;
                    }
                    .logo {
                        background-color: #2563eb;
                        color: white;
                        width: 48px;
                        height: 48px;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 20px;
                        font-weight: 900;
                    }
                    .title {
                        font-size: 36px;
                        font-weight: 900;
                        text-transform: uppercase;
                        margin: 0 0 6px 0;
                        letter-spacing: -0.05em;
                    }
                    .subtitle {
                        color: #9ca3af;
                        margin: 0;
                        font-size: 14px;
                        font-weight: 600;
                    }
                    .header-grid {
                        display: grid;
                        grid-template-cols: 1fr 1fr;
                        gap: 40px;
                        border-top: 1px solid rgba(255, 255, 255, 0.1);
                        padding-top: 32px;
                    }
                    .section-label {
                        font-size: 10px;
                        font-weight: 800;
                        text-transform: uppercase;
                        color: #9ca3af;
                        letter-spacing: 0.2em;
                        margin-bottom: 12px;
                    }
                    .value-bold {
                        font-size: 18px;
                        font-weight: 800;
                        margin: 0 0 4px 0;
                    }
                    .value-sub {
                        font-size: 14px;
                        color: #d1d5db;
                        margin: 0;
                        font-style: italic;
                    }
                    .content {
                        padding: 48px;
                    }
                    .table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 40px;
                    }
                    .table th {
                        border-bottom: 2px solid #f3f4f6;
                        padding-bottom: 16px;
                        font-size: 11px;
                        font-weight: 800;
                        text-transform: uppercase;
                        color: #9ca3af;
                        letter-spacing: 0.1em;
                        text-align: left;
                    }
                    .totals-container {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-end;
                        background-color: #f9fafb;
                        padding: 32px;
                        border-radius: 20px;
                        gap: 12px;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        width: 100%;
                        max-width: 320px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #4b5563;
                    }
                    .total-row.final {
                        font-size: 24px;
                        font-weight: 900;
                        border-top: 1px solid #e5e7eb;
                        padding-top: 20px;
                        margin-top: 8px;
                        color: #111827;
                    }
                    .final-val {
                        color: #2563eb;
                        font-size: 26px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 48px;
                        font-size: 12px;
                        color: #9ca3af;
                        font-weight: 600;
                    }
                    @media print {
                        body {
                            padding: 0;
                            background-color: #ffffff;
                        }
                        .invoice-card {
                            border: none;
                            box-shadow: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-card">
                    <div class="header">
                        <div class="header-top">
                            <div>
                                <h1 class="title">Invoice</h1>
                                <p class="subtitle">MegaMart ID: ${order.orderNumber}</p>
                            </div>
                            <div style="text-align: right;">
                                <div class="logo" style="margin-left: auto; margin-bottom: 10px;">BP</div>
                                <span style="font-size: 12px; font-weight: bold; opacity: 0.8;">MegaMart Product Sourcing</span>
                            </div>
                        </div>
                        <div class="header-grid">
                            <div>
                                <div class="section-label">Billed to</div>
                                ${addressHtml}
                            </div>
                            <div style="text-align: right;">
                                <div class="section-label">Transaction Date</div>
                                <p class="value-bold">${orderDateStr}</p>
                                <p class="value-sub" style="font-weight: 800; text-transform: uppercase; margin-top: 12px; color: #ffffff; font-size: 14px; font-style: normal;">Payment: ${order.paymentMethod}</p>
                            </div>
                        </div>
                    </div>
                    <div class="content">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th style="width: 50%;">Material Item</th>
                                    <th style="text-align: center; width: 10%;">Qty</th>
                                    <th style="text-align: right; width: 20%;">Unit Price</th>
                                    <th style="text-align: right; width: 20%;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        <div class="totals-container">
                            <div class="total-row">
                                <span style="color: #9ca3af; font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">Subtotal</span>
                                <span>₹${order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div class="total-row">
                                <span style="color: #9ca3af; font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">Delivery</span>
                                <span>₹${order.deliveryCharge.toFixed(2)}</span>
                            </div>
                            <div class="total-row" style="color: #059669;">
                                <span style="font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">Discount</span>
                                <span>- ₹${order.discountAmount.toFixed(2)}</span>
                            </div>
                            <div class="total-row final">
                                <span style="font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em;">Total</span>
                                <span class="final-val">₹${order.finalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="footer">
                    Thank you for choosing MegaMart for your shopping needs.
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 300);
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    if (loading) return <Layout><div className="p-20 text-center text-lg font-bold">Generating invoice data...</div></Layout>;
    if (!order) return <Layout><div className="p-20 text-center text-red-500 font-bold">Order not found.</div></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Invoice Section */}
                    <div className="flex-1 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
                        <div className="bg-gradient-to-br from-gray-900 to-black p-12 text-white">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Invoice</h1>
                                    <p className="text-gray-400 font-medium">MegaMart ID: {order.orderNumber}</p>
                                </div>
                                <div className="text-right">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black mb-4 ml-auto">BP</div>
                                    <p className="text-sm font-bold opacity-75">MegaMart Product Sourcing</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-12 border-t border-white/10 pt-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4">Billed to</p>
                                    <p className="text-lg font-bold">{order.user?.name || 'Customer'}</p>
                                    <p className="text-sm text-gray-400 italic mb-1">{order.user?.email}</p>
                                    <p className="text-sm text-gray-400 italic">{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4">Transaction Date</p>
                                    <p className="text-lg font-bold">{new Date(order.orderDate).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-400 font-bold mt-2 uppercase">{order.paymentMethod}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-12">
                            <table className="w-full text-left mb-12">
                                <thead className="border-b-2 border-gray-50">
                                    <tr>
                                        <th className="pb-6 text-xs font-black uppercase text-gray-400 tracking-widest">Material Item</th>
                                        <th className="pb-6 text-xs font-black uppercase text-gray-400 tracking-widest text-center">Qty</th>
                                        <th className="pb-6 text-xs font-black uppercase text-gray-400 tracking-widest text-right">Unit Price</th>
                                        <th className="pb-6 text-xs font-black uppercase text-gray-400 tracking-widest text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {order.orderItems.map((item) => (
                                        <tr key={item.id} className="group">
                                            <td className="py-8">
                                                <p className="font-bold text-gray-900 mb-1">{item.product.name}</p>
                                                <button
                                                    onClick={() => { setSelectedProduct(item.product); setShowComplaintForm(true); }}
                                                    className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-transparent border-none cursor-pointer"
                                                >
                                                    Report Issue &rarr;
                                                </button>
                                            </td>
                                            <td className="py-8 text-center font-bold text-gray-600">{item.quantity}</td>
                                            <td className="py-8 text-right font-bold text-gray-600">₹{item.price.toFixed(2)}</td>
                                            <td className="py-8 text-right font-black text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex flex-col items-end gap-6 bg-gray-50 p-8 rounded-[2rem]">
                                <div className="flex justify-between w-full max-w-xs text-sm">
                                    <span className="text-gray-400 font-bold uppercase">Subtotal</span>
                                    <span className="font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between w-full max-w-xs text-sm">
                                    <span className="text-gray-400 font-bold uppercase">Delivery</span>
                                    <span className="font-bold text-gray-900">₹{order.deliveryCharge.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between w-full max-w-xs text-sm text-emerald-600">
                                    <span className="font-bold uppercase">Discount</span>
                                    <span className="font-bold">- ₹{order.discountAmount.toFixed(2)}</span>
                                </div>
                                <div className="h-px w-full max-w-xs bg-gray-200"></div>
                                <div className="flex justify-between w-full max-w-xs text-2xl">
                                    <span className="font-black uppercase tracking-tighter">Total</span>
                                    <span className="font-black text-blue-600 text-3xl">₹{order.finalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Complaint Form */}
                    <div className="w-full lg:w-96 space-y-8">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
                            <h3 className="text-xl font-black text-gray-900 mb-4 border-l-4 border-blue-600 pl-4">Order Status</h3>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">🚚</div>
                                <div>
                                    <p className="font-black text-gray-900 leading-tight">{order.status}</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Status Updated: {new Date(order.orderDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleDownloadInvoice}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all border-none cursor-pointer shadow-lg mb-4"
                            >
                                Download PDF Invoice
                            </button>
                            <button
                                onClick={() => navigate('/profile/orders')}
                                className="w-full bg-white text-gray-700 py-4 rounded-xl font-bold border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                Return to List
                            </button>
                        </div>

                        {showComplaintForm && (
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-red-50 animate-in slide-in-from-top-4">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-red-600">Support Request</h3>
                                    <button onClick={() => setShowComplaintForm(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold bg-transparent border-none cursor-pointer">✕</button>
                                </div>
                                <p className="text-sm text-gray-500 mb-6 italic">Reporting issue for: <span className="font-bold text-gray-800">{selectedProduct ? selectedProduct.name : 'Full Order'}</span></p>

                                <form onSubmit={handleComplaintSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Issue Type</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-blue-600 outline-none"
                                            value={complaintData.issueType}
                                            onChange={(e) => setComplaintData({ ...complaintData, issueType: e.target.value })}
                                        >
                                            <option value="DAMAGED_PRODUCT">Damaged Material</option>
                                            <option value="WRONG_ITEM">Incorrect Specification</option>
                                            <option value="MISSING_ITEM">Missing Material</option>
                                            <option value="DELIVERY_DELAY">Logistic Delay</option>
                                            <option value="OTHER">Other Professional Assistance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Provide Detailed Context</label>
                                        <textarea
                                            rows="4"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-medium text-gray-700 focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                                            placeholder="Describe the condition of the materials upon arrival..."
                                            required
                                            value={complaintData.description}
                                            onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-red-600 text-white py-4 rounded-xl font-black hover:bg-red-700 transition-all border-none cursor-pointer shadow-xl disabled:opacity-50"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Professional Report'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default OrderDetails;
