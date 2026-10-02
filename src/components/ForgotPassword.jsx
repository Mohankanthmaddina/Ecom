import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [alert, setAlert] = useState(null);

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        if (type !== 'loading') {
            setTimeout(() => setAlert(null), 5000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        showAlert('loading', 'Please Wait', 'Sending recovery email...');

        try {
            const response = await axios.post(`/forgot-password?email=${encodeURIComponent(email)}`);

            if (response.status === 200) {
                showAlert('success', 'OTP Sent', 'A verification code has been sent to your email.');
                setTimeout(() => {
                    navigate(`/otp-verification?type=reset&email=${encodeURIComponent(email)}`);
                }, 1500);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || "Email not found or not verified";
            showAlert('error', 'Request Failed', errorMessage);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {alert && (
                <div className="fixed top-5 right-5 z-50 max-w-sm w-full">
                    <div className={`bg-white rounded-xl shadow-lg border-l-4 p-4 flex items-start gap-3 transform transition-all duration-300
            ${alert.type === 'success' ? 'border-green-500' : ''}
            ${alert.type === 'error' ? 'border-red-500' : ''}
            ${alert.type === 'loading' ? 'border-blue-500' : ''}
          `}>
                        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm
              ${alert.type === 'success' ? 'bg-green-100 text-green-700' : ''}
              ${alert.type === 'error' ? 'bg-red-100 text-red-700' : ''}
              ${alert.type === 'loading' ? 'bg-blue-100 text-blue-700 animate-spin' : ''}
            `}>
                            {alert.type === 'success' && '✓'}
                            {alert.type === 'error' && '✕'}
                            {alert.type === 'loading' && '⟳'}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 m-0">{alert.title}</h3>
                            <p className="text-gray-600 text-sm mt-1 m-0">{alert.message}</p>
                        </div>
                    </div>
                </div>
            )}

            <nav className="bg-white shadow-lg py-4">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                BP
                            </div>
                            <span className="text-2xl font-bold text-blue-600">MegaMart</span>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer font-medium text-sm"
                        >
                            &larr; Back to Login
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-md mx-auto my-12 bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 m-0">Reset Password</h2>
                    <p className="text-gray-500 mt-2">Enter your email to receive a recovery code</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium text-sm">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white border-0 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm disabled:opacity-70"
                        disabled={alert?.type === 'loading'}
                    >
                        {alert?.type === 'loading' ? 'Sending...' : 'Send Recovery Code'}
                    </button>

                    <div className="text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-600 hover:underline font-medium bg-transparent border-none cursor-pointer text-sm"
                            type="button"
                        >
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;
