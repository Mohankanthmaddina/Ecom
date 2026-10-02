import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [alert, setAlert] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        if (type !== 'loading') {
            setTimeout(() => setAlert(null), 5000);
        }
    };

    const getPasswordStrength = (password) => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[@#$%^&*!]/.test(password)
        };
        const metCount = Object.values(requirements).filter(Boolean).length;

        if (metCount === 5) return { text: 'Strong', color: 'bg-green-500', width: '100%' };
        if (metCount >= 4) return { text: 'Good', color: 'bg-blue-500', width: '75%' };
        if (metCount >= 3) return { text: 'Fair', color: 'bg-yellow-500', width: '50%' };
        if (metCount >= 1) return { text: 'Weak', color: 'bg-red-500', width: '25%' };
        return { text: 'Too Weak', color: 'bg-red-300', width: '10%' };
    };

    const isPasswordStrong = (password) => {
        return password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[@#$%^&*!]/.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isPasswordStrong(newPassword)) {
            showAlert('error', 'Weak Password', "Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols.");
            return;
        }

        showAlert('loading', 'Resetting', 'Processing your new password...');

        try {
            const response = await axios.post('/reset-password', {
                email,
                otpCode,
                newPassword
            });

            if (response.data.status === "SUCCESS") {
                showAlert('success', 'Success', response.data.message);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                showAlert('error', 'Reset Failed', response.data.message);
            }
        } catch (error) {
            showAlert('error', 'Error', error.response?.data?.message || "Something went wrong. Please try again.");
        }
    };

    const strength = getPasswordStrength(newPassword);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {alert && (
                <div className="fixed top-5 right-5 z-50 max-w-sm w-full">
                    <div className={`bg-white rounded-xl shadow-lg border-l-4 p-4 flex items-start gap-3 transition-all
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

            <nav className="bg-white shadow-sm py-4 mb-8">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">BP</div>
                        <span className="text-2xl font-bold text-blue-600">MegaMart</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 m-0">Set New Password</h2>
                    <p className="text-gray-500 mt-3">Verified code for <span className="text-blue-600 font-semibold">{email}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium text-sm">6-digit OTP Code</label>
                        <input
                            type="text"
                            maxLength="6"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono tracking-widest"
                            placeholder="000000"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-medium text-sm">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Choose a strong password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        {newPassword.length > 0 && (
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }}></div>
                                    </div>
                                    <span className={`text-xs font-bold ${strength.text === 'Strong' ? 'text-green-600' : 'text-gray-500'}`}>{strength.text}</span>
                                </div>

                                <div className="text-xs grid grid-cols-2 gap-2 text-gray-500">
                                    <div className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                                        <span>{newPassword.length >= 8 ? '✓' : '○'}</span> 8+ chars
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                                        <span>{/[A-Z]/.test(newPassword) ? '✓' : '○'}</span> Uppercase
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${/[a-z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                                        <span>{/[a-z]/.test(newPassword) ? '✓' : '○'}</span> Lowercase
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? 'text-green-600' : ''}`}>
                                        <span>{/[0-9]/.test(newPassword) ? '✓' : '○'}</span> Number
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${/[@#$%^&*!]/.test(newPassword) ? 'text-green-600' : ''}`}>
                                        <span>{/[@#$%^&*!]/.test(newPassword) ? '✓' : '○'}</span> Symbol
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white border-0 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                        disabled={alert?.type === 'loading'}
                    >
                        {alert?.type === 'loading' ? 'Updating...' : 'Set New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
