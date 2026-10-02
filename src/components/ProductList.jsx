import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from './common/Layout';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Parse query params
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    const searchQuery = queryParams.get('q');

    // Advanced Filter and Sort states
    const [localSearch, setLocalSearch] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState('');

    // Reset filters when category or query parameters change
    useEffect(() => {
        setLocalSearch('');
        setMinPrice('');
        setMaxPrice('');
        setSelectedBrands([]);
        setInStockOnly(false);
        setSortBy('');
    }, [categoryParam, searchQuery]);

    const [analyticsMeta, setAnalyticsMeta] = useState({
        isNewUser: true,
        feedType: 'TRENDING_PRODUCTS',
        preferredCategory: null,
        trendingProducts: []
    });

    useEffect(() => {
        fetchData();
    }, [categoryParam, searchQuery]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const currentUserId = localStorage.getItem('currentUserId');
            const userQueryStr = currentUserId ? `?userId=${currentUserId}` : '';

            // Fetch personalized/reordered categories for sidebar
            try {
                const catRes = await axios.get(`/api/analytics/categories${userQueryStr}`);
                if (Array.isArray(catRes.data) && catRes.data.length > 0) {
                    setCategories(catRes.data);
                } else {
                    const fallbackCat = await axios.get('/products/categories');
                    setCategories(fallbackCat.data || []);
                }
            } catch (catErr) {
                const fallbackCat = await axios.get('/products/categories');
                setCategories(fallbackCat.data || []);
            }

            // Fetch products based on category, search, or analytics feed
            if (searchQuery) {
                const prodRes = await axios.get(`/products/search?q=${encodeURIComponent(searchQuery)}`);
                setProducts(prodRes.data.products || prodRes.data || []);
            } else if (categoryParam) {
                const prodRes = await axios.get(`/products/category/${encodeURIComponent(categoryParam)}`);
                setProducts(prodRes.data || []);
            } else {
                // Main Feed -> Analytics Recommendation Feed
                try {
                    const feedRes = await axios.get(`/api/analytics/feed${userQueryStr}`);
                    if (feedRes.data && Array.isArray(feedRes.data.products)) {
                        setProducts(feedRes.data.products);
                        setAnalyticsMeta({
                            isNewUser: feedRes.data.isNewUser,
                            feedType: feedRes.data.feedType,
                            preferredCategory: feedRes.data.preferredCategory,
                            trendingProducts: feedRes.data.trendingProducts || []
                        });
                    } else {
                        const fallbackProd = await axios.get('/products');
                        setProducts(fallbackProd.data || []);
                    }
                } catch (feedErr) {
                    const fallbackProd = await axios.get('/products');
                    setProducts(fallbackProd.data || []);
                }
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId) => {
        const userId = localStorage.getItem('currentUserId');
        if (!userId) {
            alert('Please login to add items to your cart.');
            navigate('/login');
            return;
        }

        try {
            await axios.post(`/products/add/${productId}`, { userId });
            alert('Product added to cart!');
        } catch (err) {
            console.error('Error adding to cart:', err);
            alert('Failed to add product to cart.');
        }
    };

    const handleBrandToggle = (brand) => {
        if (selectedBrands.includes(brand)) {
            setSelectedBrands(selectedBrands.filter(b => b !== brand));
        } else {
            setSelectedBrands([...selectedBrands, brand]);
        }
    };

    const handleResetFilters = () => {
        setLocalSearch('');
        setMinPrice('');
        setMaxPrice('');
        setSelectedBrands([]);
        setInStockOnly(false);
        setSortBy('');
    };

    // Extract unique brands from loaded products
    const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

    // Apply filters and sorting
    const filteredProducts = products.filter(product => {
        if (localSearch) {
            const term = localSearch.toLowerCase();
            const matchesName = product.name?.toLowerCase().includes(term);
            const matchesBrand = product.brand?.toLowerCase().includes(term);
            const matchesDesc = product.description?.toLowerCase().includes(term);
            if (!matchesName && !matchesBrand && !matchesDesc) return false;
        }

        if (minPrice && product.price < parseFloat(minPrice)) return false;
        if (maxPrice && product.price > parseFloat(maxPrice)) return false;

        if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;

        if (inStockOnly && !(product.stockQuantity > 0)) return false;

        return true;
    }).sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
    });

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar / Filters */}
                    <aside className="w-full md:w-64 shrink-0">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto space-y-6">
                            
                            {/* Search & Sort Section */}
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                                    <span>🔍</span> Search & Sort
                                </h3>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Search within results..."
                                        value={localSearch}
                                        onChange={(e) => setLocalSearch(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                                    />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                                    >
                                        <option value="">Sort by: Relevance</option>
                                        <option value="price-asc">Price: Low to High</option>
                                        <option value="price-desc">Price: High to Low</option>
                                        <option value="name-asc">Name: A to Z</option>
                                        <option value="name-desc">Name: Z to A</option>
                                    </select>
                                </div>
                            </div>

                            {/* Categories Section */}
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                                    <span>📂</span> Categories
                                </h3>
                                <ul className="space-y-1 list-none p-0 m-0">
                                    <li>
                                        <button
                                            onClick={() => navigate('/products')}
                                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer border-none
                        ${!categoryParam ? 'bg-blue-600 text-white font-bold' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            All Products
                                        </button>
                                    </li>
                                    {categories.map((cat) => (
                                        <li key={cat.id}>
                                            <button
                                                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                                                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer border-none
                          ${categoryParam === cat.name ? 'bg-blue-600 text-white font-bold' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Price Filter Section */}
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                                    <span>₹</span> Price Range
                                </h3>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-1/2 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-1/2 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                            </div>

                            {/* Brands Section */}
                            {uniqueBrands.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                                        <span>🏷️</span> Brands
                                    </h3>
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                        {uniqueBrands.map((brand) => (
                                            <label key={brand} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBrands.includes(brand)}
                                                    onChange={() => handleBrandToggle(brand)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span>{brand}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Availability Section */}
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                                    <span>📦</span> Availability
                                </h3>
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={inStockOnly}
                                        onChange={(e) => setInStockOnly(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>In Stock Only</span>
                                </label>
                            </div>

                            {/* Reset Filters Button */}
                            <button
                                onClick={handleResetFilters}
                                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-all border-none cursor-pointer"
                            >
                                Clear All Filters
                            </button>

                        </div>
                    </aside>

                    {/* Product Grid */}
                    <main className="flex-1">
                        {!searchQuery && !categoryParam && (
                            <div className="mb-6">
                                {analyticsMeta.preferredCategory ? (
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-lg border border-blue-500/30 flex items-center justify-between">
                                        <div>
                                            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full uppercase tracking-widest font-extrabold backdrop-blur-sm">
                                                🎯 Recommended for You
                                            </span>
                                            <h2 className="text-xl font-extrabold mt-2">
                                                Top Items in "{analyticsMeta.preferredCategory}"
                                            </h2>
                                            <p className="text-blue-100 text-sm mt-0.5">
                                                Based on your PySpark activity & preference analytics
                                            </p>
                                        </div>
                                        <div className="text-4xl hidden sm:block">📊</div>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-5 rounded-2xl shadow-lg border border-orange-400/30 flex items-center justify-between">
                                        <div>
                                            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full uppercase tracking-widest font-extrabold backdrop-blur-sm">
                                                🔥 Popular & Trending Feed
                                            </span>
                                            <h2 className="text-xl font-extrabold mt-2">
                                                Top Hot-Selling Products
                                            </h2>
                                            <p className="text-orange-100 text-sm mt-0.5">
                                                Discover top rated & trending items across our catalog
                                            </p>
                                        </div>
                                        <div className="text-4xl hidden sm:block">🔥</div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mb-8 flex justify-between items-center">
                            <h1 className="text-3xl font-bold text-gray-800">
                                {searchQuery ? `Search results for "${searchQuery}"` : (categoryParam || 'All Products')}
                            </h1>
                            <p className="text-gray-500 font-medium">{filteredProducts.length} Items found</p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 6].map(i => (
                                    <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center border border-red-100">
                                <p className="font-bold text-xl mb-2">Oops!</p>
                                <p>{error}</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="bg-white p-20 rounded-3xl text-center shadow-sm border border-gray-100">
                                <div className="text-6xl mb-6">🏜️</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
                                <p className="text-gray-500">Try adjusting your filters or search query.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group flex flex-col relative">
                                        <div
                                            className="h-48 bg-gray-100 relative cursor-pointer overflow-hidden"
                                            onClick={() => navigate(`/products/${product.id}`)}
                                        >
                                            <img
                                                src={product.imageUrl || 'https://via.placeholder.com/300x200?text=Product'}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            {analyticsMeta.preferredCategory && product.category?.name?.toLowerCase() === analyticsMeta.preferredCategory?.toLowerCase() && (
                                                <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md z-10">
                                                    🎯 Preferred
                                                </span>
                                            )}
                                            <div className="absolute top-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                                <button className="bg-white/90 backdrop-blur shadow-lg p-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors border-none cursor-pointer">
                                                    🤍
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-6 flex-grow flex flex-col">
                                            <div className="mb-4">
                                                <h3
                                                    className="text-lg font-bold text-gray-800 mb-1 hover:text-blue-600 cursor-pointer transition-colors"
                                                    onClick={() => navigate(`/products/${product.id}`)}
                                                >
                                                    {product.name}
                                                </h3>
                                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{product.brand}</p>
                                            </div>
                                            <div className="mt-auto flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-400 font-medium">Price</span>
                                                    <span className="text-2xl font-black text-blue-600">₹{product.price}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleAddToCart(product.id)}
                                                    className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 border-none cursor-pointer"
                                                >
                                                    🛒
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </Layout>
    );
}

export default ProductList;
