import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './common/Layout';
import { useAuth } from '../context/AuthContext';

function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [categories, setCategories] = React.useState([]);

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const currentUserId = localStorage.getItem('currentUserId');
                const userQueryStr = currentUserId ? `?userId=${currentUserId}` : '';
                const response = await axios.get(`/api/analytics/categories${userQueryStr}`);
                if (Array.isArray(response.data)) {
                    setCategories(response.data.slice(0, 4)); // Show top 4 personalized/trending categories
                }
            } catch (err) {
                console.error(err);
                try {
                    const fallback = await axios.get('/products/categories');
                    setCategories(fallback.data.slice(0, 4));
                } catch (e) {}
            }
        };
        fetchCategories();
    }, []);

    const features = [
        { title: 'One Day Delivery', desc: 'Delivering Quality products.', icon: '🚚', color: 'bg-blue-600' },
        { title: 'Hot Selling Item', desc: 'Available Everywhere.', icon: '🔥', color: 'bg-orange-500' },
        { title: 'Delivery Selection', desc: 'Flexible delivery options available.', icon: '📦', color: 'bg-indigo-600' }
    ];

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <section className="bg-white rounded-3xl p-12 lg:p-20 shadow-xl border border-gray-100 text-center relative overflow-hidden mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="relative z-10">
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight">
                            Quality products <br />
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                                Directly to Your Site
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-medium">
                            Join thousands of professionals sourcing high-quality materials from verified suppliers.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={() => navigate('/products')}
                                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 cursor-pointer border-none"
                            >
                                <i className="fas fa-search mr-2"></i> Explore Products
                            </button>
                            <button
                                onClick={() => window.dispatchEvent(new Event('open-assistant'))}
                                className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg cursor-pointer border-none"
                            >
                                <i className="fas fa-microphone mr-2"></i> Personal Assistant
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all cursor-pointer border-none"
                            >
                                <i className="fas fa-user-tie mr-2"></i> Partner with Us
                            </button>
                        </div>
                    </div>
                    {/* Subtle background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -ml-32 -mb-32"></div>
                </section>

                {/* Why Choose Us */}
                <section className="mb-24">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose MegaMart?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                <div className={`${f.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{f.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Categories */}
                <section className="mb-24">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Popular Categories</h2>
                            <p className="text-gray-500">Find exactly what you need for your project</p>
                        </div>
                        <button onClick={() => navigate('/categories')} className="text-blue-600 font-bold hover:underline bg-transparent border-none cursor-pointer">
                            View All &rarr;
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.map((cat, i) => (
                            <div
                                key={cat.id}
                                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                                className="group bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 text-center cursor-pointer hover:border-blue-300 hover:shadow-xl transition-all relative overflow-hidden h-48 flex flex-col items-center justify-center"
                            >
                                <img
                                    src={cat.imageUrl || 'https://via.placeholder.com/200?text=' + cat.name}
                                    alt={cat.name}
                                    className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity"
                                />
                                <h3 className="relative z-10 font-bold text-gray-800 uppercase tracking-tighter">{cat.name}</h3>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-4xl font-bold mb-6">Ready to Build Something Great?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-xl mx-auto">
                        Get personalized assistance and verified supplier connections for your next purchase.
                    </p>
                    <button 
                        onClick={() => {
                            if (!user) navigate('/login');
                            else navigate('/products');
                        }}
                        className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all cursor-pointer border-none shadow-xl"
                    >
                        Get Started Now
                    </button>
                </section>
            </div>
        </Layout>
    );
}

export default Home;
