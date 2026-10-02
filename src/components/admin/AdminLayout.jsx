import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import ChatWidget from '../common/ChatWidget';

function AdminLayout({ children }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Products', path: '/admin/products', icon: '📦' },
        { name: 'Categories', path: '/admin/categories', icon: '🏷️' },
        { name: 'Orders', path: '/admin/orders', icon: '🚛' },
        { name: 'Users', path: '/admin/users', icon: '👥' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Top Navigation Bar - Matches Storefront Navbar Style */}
            <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        {/* Admin Brand Logo */}
                        <Link to="/admin/dashboard" className="flex items-center space-x-2 decoration-none">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                BP
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent flex items-center">
                                MegaMart
                                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 ml-2 uppercase tracking-wider">
                                    Admin
                                </span>
                              </span>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`font-semibold text-sm transition-colors decoration-none flex items-center gap-1.5 py-1 border-b-2
                                            ${isActive 
                                                ? 'text-blue-600 border-blue-600' 
                                                : 'text-gray-500 hover:text-blue-600 border-transparent'}`}
                                    >
                                        <span>{item.icon}</span>
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Profile Dropdown Menu */}
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 bg-transparent border-none cursor-pointer font-semibold text-sm"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center border border-blue-100 shadow-sm">
                                        AD
                                    </div>
                                    <span className="hidden sm:inline">Administrator</span>
                                </button>
                                {isProfileMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Sync</p>
                                            <p className="text-xs font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                                System Online
                                            </p>
                                        </div>
                                        <Link to="/homepage" className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 decoration-none">
                                            🏪 Store View
                                        </Link>
                                        <hr className="my-1 border-gray-100" />
                                        <button 
                                            onClick={handleLogout} 
                                            className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 bg-transparent border-none cursor-pointer"
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Burger Icon */}
                            <button 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                                className="md:hidden text-gray-650 hover:text-blue-600 bg-transparent border-none cursor-pointer text-xl p-1"
                            >
                                {isMobileMenuOpen ? '✕' : '☰'}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Dropdown Menu Drawer */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden mt-4 py-4 border-t border-gray-100 space-y-3">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`block font-bold text-sm decoration-none py-1.5 px-3 rounded-lg transition-colors
                                            ${isActive 
                                                ? 'bg-blue-50 text-blue-600' 
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}
                                    >
                                        <span className="mr-2">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </nav>

            {/* Centered Main Content Area */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 mt-24 mb-16">
                {children}
            </main>
            <ChatWidget />
        </div>
    );
}

export default AdminLayout;
