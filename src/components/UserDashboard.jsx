import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from './common/Layout';
import { useAuth } from '../context/AuthContext';
import { redirectToSupport } from '../utils/support';

function UserDashboard() {
    const { user: authUser } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (authUser) {
            fetchProfile();
        }
    }, [authUser]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`/api/profile?userId=${authUser.id}`);
            setData(response.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Layout><div className="p-20 text-center">Loading your dashboard...</div></Layout>;
    if (!data) return <Layout><div className="p-20 text-center text-red-500">Failed to load profile. Please log in again.</div></Layout>;

    const { user, orderCount } = data;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                    <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-xl shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Welcome back, {user.name}!</h1>
                        <p className="text-gray-500 text-lg font-medium italic">Building excellence, one project at a time.</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile/edit')}
                        className="md:ml-auto bg-white text-gray-700 border border-gray-100 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                    >
                        ⚙️ Edit Account
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center">
                        <span className="text-4xl mb-4">📦</span>
                        <span className="text-3xl font-black text-gray-900">{orderCount}</span>
                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Total Orders</span>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center">
                        <span className="text-4xl mb-4">🏠</span>
                        <span className="text-3xl font-black text-gray-900">Verified</span>
                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Account Status</span>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center">
                        <span className="text-4xl mb-4">💳</span>
                        <span className="text-3xl font-black text-gray-900">Active</span>
                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Wallet Status</span>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-4 lg:p-8 shadow-sm border border-gray-50 mb-12">
                    <div className="flex justify-between items-center p-6 border-b border-gray-50 mb-6">
                        <h2 className="text-2xl font-black text-gray-800">Account Overview</h2>
                        <Link to="/profile/orders" className="text-blue-600 font-bold hover:underline decoration-none">View Full History &rarr;</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-l-4 border-blue-600 pl-4">Personal Details</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Email Address</p>
                                    <p className="text-lg font-bold text-gray-800">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Contact Number</p>
                                    <p className="text-lg font-bold text-gray-800">{user.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Member Since</p>
                                    <p className="text-lg font-bold text-gray-800">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
                            <div className="text-6xl mb-6">🛡️</div>
                            <h3 className="text-xl font-black text-gray-800 mb-2">Security Note</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                Your account is protected by industry-standard encryption. Always ensure your mobile number is verified for OTP-based secure logins.
                            </p>
                            <button className="text-blue-600 font-bold hover:underline bg-transparent border-none cursor-pointer">Update Password</button>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-gray-900 to-black rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 sm:px-12 px-6">
                    <div>
                        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Need a Professional Quote?</h2>
                        <p className="text-gray-400 text-lg">Our expert architects can help you estimate materials for your entire project.</p>
                    </div>
                     <button
                        onClick={redirectToSupport}
                        className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-900/50 border-none cursor-pointer whitespace-nowrap"
                     >
                        Contact Support
                    </button>
                </div>
            </div>
        </Layout>
    );
}

export default UserDashboard;
