import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        if (user) {
            updateCartCount();
        } else {
            setCartCount(0);
        }
    }, [user]);

    const updateCartCount = async () => {
        try {
            const response = await axios.get(`/cart?userId=${user.id}`);
            setCartCount(response.data.items ? response.data.items.length : 0);
        } catch (err) {
            console.error('Error fetching cart count:', err);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim().length < 2) return;
        setIsSearchModalOpen(false);
        navigate(`/products/search-results?q=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/homepage" className="flex items-center space-x-2 decoration-none">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            BP
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                            MegaMart
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/homepage" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Home</Link>
                        <Link to="/categories" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Categories</Link>
                        <Link to="/products" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Products</Link>
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center space-x-5">
                        <button onClick={() => setIsSearchModalOpen(true)} className="text-gray-600 hover:text-blue-600 bg-transparent border-none cursor-pointer p-1">
                            <span className="text-xl">🔍</span>
                        </button>
                        <Link to="/cart" className="relative text-gray-600 hover:text-blue-600 decoration-none">
                            <span className="text-xl">🛒</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 bg-transparent border-none cursor-pointer font-medium"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">👤</div>
                                    <span className="hidden sm:inline">Profile</span>
                                </button>
                                {isProfileMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                                        <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 decoration-none">My Profile</Link>
                                        <Link to="/profile/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 decoration-none">My Orders</Link>
                                        <hr className="my-1 border-gray-100" />
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 bg-transparent border-none cursor-pointer">Logout</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all decoration-none shadow-md">
                                Login
                            </Link>
                        )}

                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-600 bg-transparent border-none cursor-pointer">
                            {isMobileMenuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 py-4 border-t border-gray-100 space-y-4">
                        <Link to="/homepage" className="block text-gray-600 font-medium decoration-none">Home</Link>
                        <Link to="/categories" className="block text-gray-600 font-medium decoration-none">Categories</Link>
                        <Link to="/products" className="block text-gray-600 font-medium decoration-none">Products</Link>
                        {user && (
                            <>
                                <Link to="/profile" className="block text-gray-600 font-medium decoration-none">My Profile</Link>
                                <Link to="/profile/orders" className="block text-gray-600 font-medium decoration-none">My Orders</Link>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Search Modal */}
            {isSearchModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Search Products</h2>
                            <button onClick={() => setIsSearchModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-xl">✕</button>
                        </div>
                        <form onSubmit={handleSearch} className="p-8">
                            <div className="relative">
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="What are you looking for today?"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">🔍</span>
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all border-none cursor-pointer">
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
