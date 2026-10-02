import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';

function AdminUserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter and Sort states
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('name-asc');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/admin/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleVerification = async (id, currentStatus) => {
        try {
            await axios.put(`/api/admin/users/${id}/verification?isVerified=${!currentStatus}`);
            fetchUsers();
            alert('Verification status updated.');
        } catch (err) {
            alert('Update failed.');
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Revoke access and delete this user? This action is permanent.')) return;
        try {
            await axios.delete(`/api/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert('Delete failed.');
        }
    };

    // Filter and Sort logic
    const filteredUsers = users.filter(user => {
        if (search) {
            const term = search.toLowerCase();
            const matchesName = user.name?.toLowerCase().includes(term);
            const matchesEmail = user.email?.toLowerCase().includes(term);
            const matchesPhone = user.phone?.toLowerCase().includes(term);
            if (!matchesName && !matchesEmail && !matchesPhone) return false;
        }

        if (statusFilter) {
            if (statusFilter === 'verified' && !user.isVerified) return false;
            if (statusFilter === 'pending' && user.isVerified) return false;
        }

        return true;
    }).sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        if (sortBy === 'name-asc') return nameA.localeCompare(nameB);
        if (sortBy === 'name-desc') return nameB.localeCompare(nameA);
        return 0;
    });

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center p-24 space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="text-gray-400 font-bold uppercase tracking-widest text-sm animate-pulse">
                        Authenticating User Registry...
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8 font-sans">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Authenticated Stakeholders</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage project clients, authorize credentials, and oversee system access.</p>
                </div>

                {/* Filters card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Search Users</label>
                            <input
                                type="text"
                                placeholder="Name, email, phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Security Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                <option value="verified">Identity Verified</option>
                                <option value="pending">Pending Review</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                            >
                                <option value="name-asc">Name: A-Z</option>
                                <option value="name-desc">Name: Z-A</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => { setSearch(''); setStatusFilter(''); setSortBy('name-asc'); }}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-slate-900 text-slate-100 border-b border-slate-800">
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider w-4/12">User Profile</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider w-3/12">Contact</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider w-3/12">Security Status</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider w-2/12 text-right">Access Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-16 text-center text-gray-400 font-semibold italic">
                                            No matching stakeholders found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-extrabold border border-blue-100 shadow-inner flex-shrink-0">
                                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-800 truncate">{user.name || 'Anonymous Client'}</p>
                                                        <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm font-semibold text-slate-700">{user.phone || 'No Contact Data'}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border
                                                    ${user.isVerified 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                        : 'bg-rose-50 text-rose-550 border-rose-100'
                                                    }`}
                                                >
                                                    {user.isVerified ? 'Identity Verified' : 'Pending Review'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => toggleVerification(user.id, user.isVerified)}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all border-none cursor-pointer
                                                            ${user.isVerified 
                                                                ? 'bg-slate-100 text-slate-600 hover:bg-amber-500 hover:text-white' 
                                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                                            }`}
                                                    >
                                                        {user.isVerified ? 'Suspend' : 'Verify'}
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(user.id)}
                                                        className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-600 hover:text-white transition-all border-none cursor-pointer"
                                                        title="Revoke User"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminUserList;
