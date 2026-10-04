import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';

function CategoryImage({ cat }) {
    const [imgFailed, setImgFailed] = useState(false);

    const fallbackEmoji = cat.name.toLowerCase().includes('electronics') ? '📱' :
        cat.name.toLowerCase().includes('tiles') ? '🏬' :
            cat.name.toLowerCase().includes('iron') ? '⚡' :
                cat.name.toLowerCase().includes('hardware') ? '🛠️' : '📦';

    if (!cat.imageUrl || imgFailed) {
        return <span className="text-5xl select-none">{fallbackEmoji}</span>;
    }

    return (
        <img
            src={cat.imageUrl}
            alt={cat.name}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
        />
    );
}

function AdminCategoryList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', imageUrl: '' });

    // Filtering and sorting states
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name-asc');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/admin/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                alert("inside edit category block");
                await axios.put(`/admin/categories/${editingCategory.id}`, formData);
            } else {
                alert("inside add category block");
                await axios.post('/admin/categories', formData);
            }
            setShowModal(false);
            fetchCategories();
            alert('Category synchronized.');
        } catch (err) {
            alert('Operation failed: ' + (err.response?.data || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this industrial category? This will affect material classification.')) return;
        try {
            await axios.delete(`/api/admin/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert('Delete failed.');
        }
    };

    // Filter and Sort logic
    const filteredCategories = categories.filter(cat => {
        if (search) {
            const term = search.toLowerCase();
            const nameMatch = cat.name?.toLowerCase().includes(term);
            const descMatch = cat.description?.toLowerCase().includes(term);
            if (!nameMatch && !descMatch) return false;
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
                        Loading Classification Data...
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8 font-sans">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Market Classification</h1>
                        <p className="text-gray-500 text-sm mt-1">Organize materials into logical industrial sectors.</p>
                    </div>
                    <button
                        onClick={() => { setEditingCategory(null); setFormData({ name: '', description: '', imageUrl: '' }); setShowModal(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all border-none cursor-pointer flex items-center gap-2 text-sm"
                    >
                        ➕ Define New Sector
                    </button>
                </div>

                {/* Filters Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Search Sectors</label>
                            <input
                                type="text"
                                placeholder="Sector name or description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                            />
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
                                onClick={() => { setSearch(''); setSortBy('name-asc'); }}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories Grid layout */}
                {filteredCategories.length === 0 ? (
                    <div className="p-16 text-center text-gray-400 font-semibold italic bg-white rounded-2xl border border-slate-100">
                        No matching sectors found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCategories.map((cat) => (
                            <div key={cat.id} className="bg-white rounded-3xl shadow-sm border border-slate-100/80 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[320px]">
                                <div>
                                    {/* Big Header Image */}
                                    <div className="w-full h-40 bg-slate-50 border-b border-slate-100 flex items-center justify-center shadow-inner overflow-hidden relative">
                                        <CategoryImage cat={cat} />
                                    </div>
                                    {/* Details Wrapper */}
                                    <div className="p-6">
                                        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">{cat.name}</h3>
                                        <p className="text-gray-450 text-xs mt-2 italic leading-relaxed line-clamp-2">{cat.description || 'General industrial material category.'}</p>
                                    </div>
                                </div>

                                <div className="px-6 pb-6">
                                    <div className="flex gap-3 pt-4 border-t border-slate-50 relative z-10">
                                        <button
                                            onClick={() => { setEditingCategory(cat); setFormData({ name: cat.name, description: cat.description || '', imageUrl: cat.imageUrl || '' }); setShowModal(true); }}
                                            className="flex-grow bg-slate-100 text-slate-700 py-2.5 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer text-xs"
                                        >
                                            Edit Sector
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="bg-rose-50 text-rose-500 px-3.5 py-2.5 rounded-lg font-bold hover:bg-rose-600 hover:text-white transition-all border-none cursor-pointer text-xs"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                {/* Radial background pattern glow */}
                                <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-slate-50/50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Form Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800">
                                <div>
                                    <h2 className="text-xl font-extrabold uppercase tracking-tight">{editingCategory ? 'Update Classification Sector' : 'Define New Sector'}</h2>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Classification Management</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-slate-400 hover:text-white text-xl bg-transparent border-none cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider pl-1">Sector Name</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider pl-1">Sector Image URL</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        placeholder="https://example.com/img.jpg"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider pl-1">Sector Scope / Description</label>
                                    <textarea
                                        rows="3"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all border-none cursor-pointer shadow-md shadow-blue-500/10"
                                    >
                                        {editingCategory ? 'Commit Sector' : 'Authorize Placement'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-500 py-3.5 rounded-xl font-bold text-sm transition-all border-none cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminCategoryList;
