import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './common/Layout';
import { redirectToSupport } from '../utils/support';

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const currentUserId = localStorage.getItem('currentUserId');
            const userQueryStr = currentUserId ? `?userId=${currentUserId}` : '';
            const response = await axios.get(`/api/analytics/categories${userQueryStr}`);
            if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else {
                const fallback = await axios.get('/products/categories');
                setCategories(fallback.data || []);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            try {
                const fallback = await axios.get('/products/categories');
                setCategories(fallback.data || []);
            } catch (e) {}
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">Material Categories</h1>
                    <p className="text-xl text-gray-500">Find everything you need for your purchase</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white rounded-3xl h-48 animate-pulse border border-gray-100 shadow-sm"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                                className="group relative bg-white aspect-square rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl hover:border-blue-300 transition-all duration-700 overflow-hidden"
                            >
                                {/* Background Image with Overlay */}
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={cat.imageUrl || 'https://via.placeholder.com/400?text=' + cat.name}
                                        alt={cat.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 opacity-20 group-hover:opacity-40"
                                    />
                                    <div className="absolute inset-0 bg-blue-50/10 group-hover:bg-blue-600/10 transition-colors"></div>
                                </div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <h3 className="text-xl font-black text-gray-800 group-hover:text-blue-600 transition-colors uppercase tracking-widest text-center px-4">{cat.name}</h3>
                                    <div className="h-1 w-0 group-hover:w-16 bg-blue-600 mt-4 transition-all duration-500 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <section className="mt-24 p-12 bg-white rounded-[3rem] shadow-sm border border-gray-100 text-center">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Can't Find a Category?</h2>
                    <p className="text-gray-500 mb-8 max-w-lg mx-auto">Contact our professional assistant for custom sourcing of industrial materials.</p>
                    <button
                        onClick={redirectToSupport}
                        className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all border-none cursor-pointer"
                    >
                        Get Expert Support
                    </button>
                </section>
            </div>
        </Layout>
    );
}

export default Categories;
