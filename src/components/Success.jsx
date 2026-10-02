import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from './common/Layout';

function Success() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            // The backend /payment/success/{id} returns a view, let's see if we can get order details.
            // I'll assume we can use a dashboard endpoint or I'll implement a basic success screen.
            // For now, I'll just show the Order ID and a success message.
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                <div className="bg-white rounded-[3rem] p-12 lg:p-20 shadow-2xl border border-gray-50 flex flex-col items-center animate-in zoom-in-95 duration-700">
                    <div className="w-32 h-32 bg-emerald-500 text-white rounded-full flex items-center justify-center text-6xl shadow-xl shadow-emerald-200 mb-10 animate-bounce">
                        ✓
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 font-display uppercase tracking-tighter">Order Placed Successfully!</h1>
                    <p className="text-xl text-gray-500 mb-12 max-w-md leading-relaxed">
                        Thank you for choosing MegaMart. Your materials will be delivered to your site shortly.
                    </p>

                    <div className="bg-gray-50 rounded-2xl p-6 w-full mb-12 border border-gray-100">
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Order Tracking ID</p>
                        <p className="text-2xl font-black text-blue-600">BP-ORD-{orderId}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <Link to="/profile/orders" className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all decoration-none">
                            View My Orders
                        </Link>
                        <Link to="/homepage" className="flex-1 bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all decoration-none">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Success;
