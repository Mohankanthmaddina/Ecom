import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from './common/Layout';

function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [userId] = useState(localStorage.getItem('currentUserId'));
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`/api/profile?userId=${userId}`);
            setUser(response.data.user);
            setFormData({
                name: response.data.user.name || '',
                phone: response.data.user.phone || '',
                address: response.data.user.address || ''
            });
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await axios.put(`/api/profile/update?userId=${userId}`, formData);
            alert('Profile updated successfully!');
            fetchProfile();
        } catch (err) {
            console.error('Error updating profile:', err);
            alert('Failed to update profile.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <Layout><div className="p-20 text-center">Loading account details...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Account Settings</h1>
                        <p className="text-gray-500 font-medium italic">Manage your personal information and preferences.</p>
                    </div>
                    <Link to="/profile" className="text-blue-600 font-bold hover:underline decoration-none mb-2">Back to Dashboard</Link>
                </div>

                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
                    <div className="p-12">
                        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="md:col-span-2 flex items-center gap-6 mb-4">
                                <div className="w-20 h-20 bg-gray-900 text-white rounded-3xl flex items-center justify-center text-3xl font-black italic shadow-lg">
                                    BP
                                </div>
                                <div>
                                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Verified Account</p>
                                    <h3 className="text-xl font-black text-gray-900">{user.email}</h3>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Full Name / Organization</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 font-bold text-gray-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. John Doe / Build Corp"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Contact Phone</label>
                                <input
                                    type="tel"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 font-bold text-gray-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Primary Site Address</label>
                                <textarea
                                    rows="4"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 font-bold text-gray-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all resize-none"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Enter your default delivery or billing address..."
                                ></textarea>
                            </div>

                            <div className="md:col-span-2 h-px bg-gray-50 my-4"></div>

                            <div className="md:col-span-2 flex items-center justify-between gap-6">
                                <p className="text-gray-400 text-sm italic max-w-sm">
                                    Last updated on: {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/profile')}
                                        className="px-10 py-5 rounded-2xl font-bold bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all border-none cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="px-12 py-5 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 border-none cursor-pointer disabled:opacity-50"
                                    >
                                        {updating ? 'Saving Configuration...' : 'Confirm Changes'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-12 bg-red-50 p-8 rounded-[2.5rem] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-red-600 font-black uppercase tracking-tighter">Account Deactivation</h3>
                        <p className="text-red-400 text-sm font-medium">This action is irreversible and will delete all your transaction history.</p>
                    </div>
                    <button className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold border-2 border-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer">
                        Delete Account
                    </button>
                </div>
            </div>
        </Layout>
    );
}

export default UserProfile;
