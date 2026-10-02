import React from 'react';
import { Link } from 'react-router-dom';
import { redirectToSupport } from '../../utils/support';


function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center space-x-2 decoration-none">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">BP</div>
                            <span className="text-xl font-bold text-gray-800">MegaMart</span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Your one-stop marketplace for quality products. Delivering joy, one order at a time.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-6">Quick Links</h4>
                        <ul className="space-y-4 list-none p-0">
                            <li><Link to="/products" className="text-gray-500 hover:text-blue-600 text-sm transition-colors decoration-none">All Products</Link></li>
                            <li><Link to="/categories" className="text-gray-500 hover:text-blue-600 text-sm transition-colors decoration-none">Categories</Link></li>
                            <li><Link to="/vendors" className="text-gray-500 hover:text-blue-600 text-sm transition-colors decoration-none">Become a Seller</Link></li>
                        </ul>
                    </div>

                    {/* Help & Support */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-6">Support</h4>
                        <ul className="space-y-4 list-none p-0">
                             <li>
                                <button
                                    onClick={redirectToSupport}
                                    className="text-gray-500 hover:text-blue-600 text-sm transition-colors decoration-none bg-transparent border-none cursor-pointer p-0 font-normal text-left"
                                >
                                    Contact Us
                                </button>
                            </li>
                            <li><Link to="/faq" className="text-gray-500 hover:text-blue-600 text-sm transition-colors decoration-none">FAQs</Link></li>
                            <li><Link to="/shipping" className="text-gray-500 hover:text-blue-600 text-sm transition-colors decoration-none">Shipping Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-6">Get in Touch</h4>
                        <div className="space-y-4 text-sm text-gray-500">
                            <p className="flex items-center gap-2">📍 123 commerce hub, Build City</p>
                            <p className="flex items-center gap-2">📞 +1 (234) 567-890</p>
                             <p
                                onClick={redirectToSupport}
                                className="flex items-center gap-2 hover:text-blue-600 cursor-pointer transition-colors"
                             >
                                ✉️ support@megamart.com
                             </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-xs">© 2026 MegaMart Materials. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span className="text-gray-400 hover:text-blue-600 cursor-pointer text-xl">🅕</span>
                        <span className="text-gray-400 hover:text-blue-400 cursor-pointer text-xl">🆃</span>
                        <span className="text-gray-400 hover:text-pink-600 cursor-pointer text-xl">🅘</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
