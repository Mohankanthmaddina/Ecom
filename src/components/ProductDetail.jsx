import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './common/Layout';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`/products`);
            // The backend /view/{id} returns HTML, but /products returns JSON.
            // Let's find the specific product in the list or assume there's a JSON endpoint for single product.
            // Looking at ProductController, @GetMapping("/view/{id}") returns String (view).
            // However, there's no @GetMapping("/{id}") returning ResponseEntity<Product>.
            // I'll fetch all and filter for now, or check if I missed one.
            const allProds = response.data;
            const found = allProds.find(p => p.id.toString() === id);

            if (found) {
                setProduct(found);
            } else {
                setError('Product not found.');
            }
        } catch (err) {
            setError('Failed to load product details.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        const userId = localStorage.getItem('currentUserId');
        if (!userId) {
            alert('Please login to add items to your cart.');
            navigate('/login');
            return;
        }

        try {
            await axios.post(`/cart/add?userId=${userId}&productId=${product.id}&quantity=${quantity}`);
            alert('Product added to cart!');
        } catch (err) {
            alert('Failed to add product to cart.');
        }
    };

    const handleBuyNow = () => {
        const userId = localStorage.getItem('currentUserId');
        if (!userId) {
            alert('Please login to purchase items.');
            navigate('/login');
            return;
        }

        navigate('/checkout', { state: { buyNow: true, product, quantity } });
    };

    if (loading) return <Layout><div className="p-20 text-center text-gray-400">Loading details...</div></Layout>;
    if (error) return <Layout><div className="p-20 text-center text-red-500">{error}</div></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="lg:w-1/2 bg-gray-50 flex items-center justify-center p-12">
                        <img
                            src={product.imageUrl || 'https://via.placeholder.com/600x400?text=Product'}
                            alt={product.name}
                            className="max-w-full max-h-[500px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Info Section */}
                    <div className="lg:w-1/2 p-12 lg:p-16 flex flex-col">
                        <div className="mb-8">
                            <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4 inline-block">
                                {product.brand}
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">{product.name}</h1>
                            <div className="flex items-center gap-4 text-emerald-600 font-bold bg-emerald-50 w-fit px-4 py-2 rounded-xl">
                                <span>✓ In Stock</span>
                                <span className="text-gray-300">|</span>
                                <span>{product.stockQuantity} Units Left</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {product.description || "High-quality product sourced from verified suppliers. Perfect for professional and industrial use."}
                            </p>
                        </div>

                        <div className="mb-10">
                            <span className="text-gray-400 text-sm font-medium uppercase tracking-widest block mb-2">Price</span>
                            <span className="text-5xl font-black text-blue-600">₹{product.price}</span>
                        </div>

                        <div className="mt-auto space-y-4">
                            <div className="flex gap-4">
                                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2 bg-white shadow-sm">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-xl font-bold p-2 hover:text-blue-600 border-none bg-transparent cursor-pointer">-</button>
                                    <span className="w-12 text-center text-xl font-bold">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="text-xl font-bold p-2 hover:text-blue-600 border-none bg-transparent cursor-pointer">+</button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-blue-600 text-white font-bold rounded-2xl p-4 text-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 border-none cursor-pointer flex items-center justify-center gap-3"
                                >
                                    <span>🛒</span> Add to Cart
                                </button>
                            </div>
                            <button
                                onClick={handleBuyNow}
                                className="w-full bg-gray-900 text-white font-bold rounded-2xl p-4 text-lg hover:bg-black transition-all border-none cursor-pointer"
                            >
                                ⚡ Buy It Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Specifications Tab */}
                <div className="mt-16 bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-4">Product Specifications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex justify-between border-b border-gray-50 py-4">
                            <span className="text-gray-500 font-medium">Category</span>
                            <span className="text-gray-900 font-bold">{product.categoryName || 'General'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 py-4">
                            <span className="text-gray-500 font-medium">Brand</span>
                            <span className="text-gray-900 font-bold">{product.brand}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 py-4">
                            <span className="text-gray-500 font-medium">Material Type</span>
                            <span className="text-gray-900 font-bold">Industrial Grade</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 py-4">
                            <span className="text-gray-500 font-medium">Warranty</span>
                            <span className="text-gray-900 font-bold">Standard Manufacturer Warranty</span>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default ProductDetail;
