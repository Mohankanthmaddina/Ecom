import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Make sure to configure axios for credentials globally if needed,
// but we'll do it explicitly here for the login request.

function Login() {
    const { login } = useAuth();
    const [loginType, setLoginType] = useState('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setAlert({ type: 'loading', title: 'Please Wait', message: 'Authenticating...' });

        try {
            const response = await axios.post('/login', {
                email,
                password,
                role: loginType.toUpperCase()
            });

            if (response.status === 200) {
                // IMPORTANT: Save user data using AuthContext
                login(response.data.user);

                setAlert({
                    type: 'success',
                    title: 'Success',
                    message: 'Login successful. Redirecting...'
                });

                // Redirect logic based on role
                setTimeout(() => {
                    window.location.href = response.data.redirectUrl || (loginType === 'admin' ? '/admin/dashboard' : '/homepage');
                }, 1500);
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setAlert({
                    type: 'error',
                    title: error.response.data.error || 'Login Failed',
                    message: error.response.data.message || 'Please check your credentials and try again'
                });
            } else {
                setAlert({
                    type: 'error',
                    title: 'Error',
                    message: 'Could not connect to the server.'
                });
            }
        }
    };

    const clearAlert = () => setAlert(null);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Alert System */}
            {alert && (
                <div className="fixed top-5 right-5 z-50 max-w-sm w-full">
                    <div className={`bg-white rounded-xl shadow-lg border-l-4 overflow-hidden transform transition-all duration-300
            ${alert.type === 'success' ? 'border-green-500' : ''}
            ${alert.type === 'error' ? 'border-red-500' : ''}
            ${alert.type === 'loading' ? 'border-gray-500' : ''}
          `}>
                        <div className="p-4 flex items-start gap-3">
                            <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm
                ${alert.type === 'success' ? 'bg-green-100 text-green-700' : ''}
                ${alert.type === 'error' ? 'bg-red-100 text-red-700' : ''}
                ${alert.type === 'loading' ? 'bg-gray-100 text-gray-700 animate-spin' : ''}
              `}>
                                {alert.type === 'success' && '✓'}
                                {alert.type === 'error' && '✕'}
                                {alert.type === 'loading' && '⟳'}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-semibold m-0 text-base
                  ${alert.type === 'success' ? 'text-green-800' : ''}
                  ${alert.type === 'error' ? 'text-red-800' : ''}
                  ${alert.type === 'loading' ? 'text-gray-800' : ''}
                `}>{alert.title}</h3>
                                <p className="text-gray-600 text-sm mt-1 mb-0">{alert.message}</p>
                            </div>
                            {alert.type !== 'loading' && (
                                <button onClick={clearAlert} className="text-gray-400 hover:text-gray-600 shrink-0 border-none bg-transparent cursor-pointer">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            )}
                        </div>
                        {alert.type !== 'loading' && (
                            <div className="h-1 w-full bg-gray-200">
                                <div className={`h-full animate-[progress_5s_linear_forwards]
                  ${alert.type === 'success' ? 'bg-green-500' : ''}
                  ${alert.type === 'error' ? 'bg-red-500' : ''}
                `}></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Navbar */}
            <nav className="bg-white shadow-lg py-4">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.href = '/'}>
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                BP {/* FontAwesome icon fallback if needed */}
                            </div>
                            <span className="text-2xl font-bold text-blue-600">MegaMart</span>
                        </div>
                        <a href="/" className="text-blue-600 hover:text-blue-800 decoration-none font-medium text-sm">
                            &larr; Back to Home
                        </a>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-md mx-auto my-12 bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 m-0">Welcome Back</h2>
                    <p className="text-gray-500 mt-2">Sign in to your account</p>
                </div>

                <div className="mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            id="user-login-btn"
                            type="button"
                            className={`flex-1 py-3 px-4 text-center font-semibold bg-transparent border-0 cursor-pointer transition-colors
                ${loginType === 'user' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setLoginType('user')}
                        >
                            User Login
                        </button>
                        <button
                            id="admin-login-btn"
                            type="button"
                            className={`flex-1 py-3 px-4 text-center font-semibold bg-transparent border-0 cursor-pointer transition-colors
                ${loginType === 'admin' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setLoginType('admin')}
                        >
                            Admin Login
                        </button>
                    </div>
                    <div className="mt-3 text-sm text-gray-500 text-center">
                        Selected: <span className="font-semibold text-blue-600">
                            {loginType === 'user' ? 'User Login' : 'Admin Login'}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium text-sm">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-medium text-sm">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white border-0 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={alert?.type === 'loading'}
                        >
                            {alert?.type === 'loading' ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>

                    <div className="text-center pt-4 border-t border-gray-100 mt-6">
                        <a href="/forgot-password" className="text-blue-600 hover:underline text-sm font-medium">Forgot Password?</a>
                        <p className="mt-4 text-gray-500 text-sm">
                            Don't have an account?{' '}
                            <a href="/register" className="text-blue-600 hover:underline font-medium">Register here</a>
                        </p>
                    </div>
                </form>
            </div>

            <style jsx="true">{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
}

export default Login;
