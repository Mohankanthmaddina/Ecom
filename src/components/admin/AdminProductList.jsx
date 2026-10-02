import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';

function AdminProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        imageUrl: '',
        brand: '',
        stockQuantity: '',
        specifications: ''
    });

    // Filtering and sorting states
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                axios.get('/api/admin/products'),
                axios.get('/api/admin/categories')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            categoryId: '',
            imageUrl: '',
            brand: '',
            stockQuantity: '',
            specifications: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate specifications JSON
        let cleanedSpecifications = null;
        if (formData.specifications && formData.specifications.trim() !== '') {
            try {
                JSON.parse(formData.specifications);
                cleanedSpecifications = formData.specifications.trim();
            } catch (err) {
                alert('Specifications must be in valid JSON format (e.g., {"Color": "Gray", "Weight": "50kg"})');
                return;
            }
        }

        const payload = {
            ...formData,
            specifications: cleanedSpecifications,
            price: parseFloat(formData.price),
            stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity, 10) : 0
        };

        try {
            if (editingProduct) {
                await axios.put(`/api/admin/products/${editingProduct.id}`, payload);
            } else {
                await axios.post('/api/admin/products', payload);
            }
            setShowModal(false);
            resetForm();
            fetchData();
            alert('Operation successful!');
        } catch (err) {
            alert('Error: ' + (err.response?.data || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this industrial asset?')) return;
        try {
            await axios.delete(`/api/admin/products/${id}`);
            fetchData();
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    };

    const openEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            categoryId: product.categoryId || '',
            imageUrl: product.imageUrl || '',
            brand: product.brand || '',
            stockQuantity: product.stockQuantity !== undefined && product.stockQuantity !== null ? product.stockQuantity : '',
            specifications: product.specifications || ''
        });
        setShowModal(true);
    };

    const handleClearFilters = () => {
        setSearch('');
        setCategoryFilter('');
        setStockFilter('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('');
    };

    // Filter and Sort Logic
    const filteredProducts = products.filter(p => {
        if (search) {
            const term = search.toLowerCase();
            const matchesName = p.name?.toLowerCase().includes(term);
            const matchesBrand = p.brand?.toLowerCase().includes(term);
            const matchesDesc = p.description?.toLowerCase().includes(term);
            if (!matchesName && !matchesBrand && !matchesDesc) return false;
        }

        if (categoryFilter && String(p.categoryId) !== String(categoryFilter)) {
            return false;
        }

        if (stockFilter) {
            const stock = p.stockQuantity || 0;
            if (stockFilter === 'out' && stock > 0) return false;
            if (stockFilter === 'low' && (stock <= 0 || stock > 10)) return false;
            if (stockFilter === 'in' && stock <= 10) return false;
        }

        if (minPrice && p.price < parseFloat(minPrice)) return false;
        if (maxPrice && p.price > parseFloat(maxPrice)) return false;

        return true;
    }).sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock-asc') return (a.stockQuantity || 0) - (b.stockQuantity || 0);
        if (sortBy === 'stock-desc') return (b.stockQuantity || 0) - (a.stockQuantity || 0);
        return 0;
    });

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center p-24 space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="text-gray-400 font-bold uppercase tracking-widest text-sm animate-pulse">
                        Accessing Inventory...
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8 font-sans">
                {/* Header section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Material Inventory</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage stock levels, pricing, and product specifications.</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all border-none cursor-pointer flex items-center gap-2 text-sm"
                    >
                        ➕ Register New Material
                    </button>
                </div>

                {/* Filters card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Search Materials</label>
                            <input
                                type="text"
                                placeholder="Name, brand, desc..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Stock Level</label>
                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                            >
                                <option value="">All Stock Levels</option>
                                <option value="out">Out of Stock (0)</option>
                                <option value="low">Low Stock (1-10)</option>
                                <option value="in">In Stock (&gt;10)</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                            >
                                <option value="">Relevance</option>
                                <option value="name-asc">Name: A to Z</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="stock-asc">Stock: Low to High</option>
                                <option value="stock-desc">Stock: High to Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Min Price (₹)</label>
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Max Price (₹)</label>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="lg:col-span-2 flex items-end">
                            <button
                                onClick={handleClearFilters}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Catalog Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-900 text-slate-100 border-b border-slate-800">
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider w-5/12">Material Item</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider w-2/12">Category</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider w-2/12">Stock Level</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider w-2/12">Unit Price</th>
                                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider w-1/12 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-16 text-center text-gray-400 font-semibold italic">
                                            No materials match the selected filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={p.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=80&auto=format&fit=crop'}
                                                        className="w-12 h-12 rounded-lg object-cover shadow-sm bg-slate-50 flex-shrink-0"
                                                        alt=""
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-800 truncate">{p.name}</p>
                                                        <p className="text-xs text-gray-400 truncate mt-0.5">{p.brand} &bull; {p.description || 'No description provided.'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border border-blue-100">
                                                    {p.categoryName || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border
                                                    ${p.stockQuantity <= 0 
                                                        ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                                        : p.stockQuantity <= 10 
                                                        ? 'bg-amber-50 text-amber-600 border-amber-100' 
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    }`}
                                                >
                                                    {p.stockQuantity || 0} Units
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-slate-800 italic">₹{p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(p)}
                                                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer"
                                                        title="Edit Product"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-600 hover:text-white transition-all border-none cursor-pointer"
                                                        title="Delete Product"
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

                {/* Form Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800">
                                <div>
                                    <h2 className="text-xl font-extrabold uppercase tracking-tight">{editingProduct ? 'Edit Material Specifications' : 'Register New Material'}</h2>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Industrial Specification Form</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-slate-400 hover:text-white text-xl bg-transparent border-none cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider pl-1">Material Name</label>
                                        <input
                                            type="text" required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider pl-1">Unit Price (₹)</label>
                                        <input
                                            type="number" step="0.01" required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider pl-1">Brand</label>
                                        <input
                                            type="text" required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider pl-1">Stock Quantity</label>
                                        <input
                                            type="number" required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            value={formData.stockQuantity}
                                            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider pl-1">Category Assignment</label>
                                    <select
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    >
                                        <option value="">Select an industrial category...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider pl-1">Image Source URL</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        placeholder="https://example.com/img.jpg"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider pl-1">Specifications (JSON format)</label>
                                    <textarea
                                        rows="2"
                                        placeholder='e.g., {"Grade": "OPC 53", "Weight": "50kg"}'
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                                        value={formData.specifications}
                                        onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider pl-1">Material Description</label>
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
                                        {editingProduct ? 'Commit Updates' : 'Authorize Placement'}
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

export default AdminProductList;
