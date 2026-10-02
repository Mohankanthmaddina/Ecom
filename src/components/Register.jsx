import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState('register'); // 'register', 'verification', 'success'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'USER',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const [alert, setAlert] = useState(null);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let timer;
        if (step === 'verification' && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [step, countdown]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        if (type !== 'loading') {
            setTimeout(() => setAlert(null), 5000);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) return { valid: false, message: "Please enter a valid email address." };

        const lowerEmail = email.toLowerCase();
        const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
        const domain = lowerEmail.split('@')[1];
        if (!allowedDomains.includes(domain)) {
            return {
                valid: false,
                message: "Please use a standard personal email provider (e.g., gmail.com, yahoo.com). Institutional or temporary emails are not allowed."
            };
        }
        return { valid: true };
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            showAlert('error', 'Password Mismatch', "Passwords do not match! Please check and try again.");
            return;
        }

        const emailCheck = validateEmail(formData.email);
        if (!emailCheck.valid) {
            showAlert('error', 'Invalid Email', emailCheck.message);
            return;
        }

        showAlert('loading', 'Please Wait', 'Validating email and creating account...');

        try {
            const response = await axios.post('/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            if (response.data.success) {
                setStep('verification');
                setCountdown(60);
                setCanResend(false);
                showAlert('success', 'OTP Sent Successfully', response.data.message);
            } else {
                showAlert('error', 'Registration Error', response.data.message || 'Registration failed.');
            }
        } catch (error) {
            const errorData = error.response?.data;
            showAlert('error', errorData?.error || 'Registration Failed', errorData?.message || 'An error occurred during registration.');
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            showAlert('error', 'Invalid OTP', 'Please enter a valid 6-digit OTP code.');
            return;
        }

        showAlert('loading', 'Verifying', 'Verifying OTP...');

        try {
            const response = await axios.post('/registration-verification', {
                email: formData.email,
                otp: otp
            });

            if (response.data.success) {
                setStep('success');
                showAlert('success', 'Verification Successful', 'Email verified successfully!');
            } else {
                showAlert('error', 'Verification Failed', response.data.message || 'OTP verification failed.');
            }
        } catch (error) {
            const errorData = error.response?.data;
            showAlert('error', errorData?.error || 'Verification Error', errorData?.message || 'OTP verification failed.');
        }
    };

    const handleResendOTP = async () => {
        showAlert('loading', 'Resending', 'Resending OTP...');

        try {
            const response = await axios.post('/resend-otp-submit', null, {
                params: { email: formData.email }
            });
            // Note: The backend returns a redirect string or error for this specific endpoint in original code, 
            // but AuthController has a @ResponseBody version too. Checking AuthController...
            // verified: /resend-otp-submit (line 340) returns String (redirect)
            // Wait, there is no @ResponseBody /resend-otp. Let's use the params version.

            showAlert('success', 'OTP Resent', 'A new OTP has been sent to your email.');
            setCountdown(60);
            setCanResend(false);
        } catch (error) {
            showAlert('error', 'Resend Failed', 'Failed to resend OTP. Please try again.');
        }
    };

    const renderAlert = () => {
        if (!alert) return null;
        return (
            <div className="fixed top-5 right-5 z-50 max-w-sm w-full">
                <div className={`bg-white rounded-xl shadow-lg border-l-4 overflow-hidden transform transition-all duration-300
          ${alert.type === 'success' ? 'border-green-500' : ''}
          ${alert.type === 'error' ? 'border-red-500' : ''}
          ${alert.type === 'loading' ? 'border-blue-500' : ''}
        `}>
                    <div className="p-4 flex items-start gap-3">
                        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm
              ${alert.type === 'success' ? 'bg-green-100 text-green-700' : ''}
              ${alert.type === 'error' ? 'bg-red-100 text-red-700' : ''}
              ${alert.type === 'loading' ? 'bg-blue-100 text-blue-700 animate-spin' : ''}
            `}>
                            {alert.type === 'success' && '✓'}
                            {alert.type === 'error' && '✕'}
                            {alert.type === 'loading' && '⟳'}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 m-0">{alert.title}</h3>
                            <p className="text-gray-600 text-sm mt-1 mb-0">{alert.message}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {renderAlert()}

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
                {step === 'register' && (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 m-0">Create Account</h2>
                            <p className="text-gray-500 mt-2">Join our shopping community</p>
                        </div>

                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium text-sm">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2 font-medium text-sm">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2 font-medium text-sm">Register As</label>
                                <select
                                    name="role"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2 font-medium text-sm">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2 font-medium text-sm">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white border-0 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm disabled:opacity-70"
                                    disabled={alert?.type === 'loading'}
                                >
                                    Send OTP Verification
                                </button>
                            </div>

                            <div className="text-center pt-4 border-t border-gray-100 mt-6">
                                <p className="text-gray-500 text-sm">
                                    Already have an account?{' '}
                                    <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline font-medium bg-transparent border-none cursor-pointer">
                                        Sign in here
                                    </button>
                                </p>
                            </div>
                        </form>
                    </>
                )}

                {step === 'verification' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-800 m-0">Verify Email</h2>
                            <p className="text-gray-500 mt-2 text-sm">
                                We've sent a 6-digit code to <br />
                                <span className="font-semibold text-blue-600">{formData.email}</span>
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                            <div className="text-blue-600 text-xl font-bold">!</div>
                            <p className="text-sm text-blue-700 m-0 leading-relaxed">
                                Please check your inbox (and spam folder) for the verification code.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="text-center">
                                <input
                                    type="text"
                                    maxLength="6"
                                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-3xl font-mono tracking-[0.5em] bg-gray-50"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>

                            <button
                                onClick={handleVerifyOTP}
                                className="w-full bg-green-600 text-white border-0 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors cursor-pointer shadow-sm"
                            >
                                Verify & Create Account
                            </button>

                            <div className="flex justify-between items-center text-sm">
                                <button
                                    onClick={handleResendOTP}
                                    disabled={!canResend}
                                    className={`font-medium border-none bg-transparent cursor-pointer
                    ${canResend ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'}`}
                                >
                                    Resend OTP {!canResend && `(${countdown}s)`}
                                </button>
                                <button
                                    onClick={() => setStep('register')}
                                    className="text-gray-500 hover:text-gray-700 font-medium border-none bg-transparent cursor-pointer"
                                >
                                    Change Email
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="text-center space-y-6 py-4">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-green-600 text-4xl font-bold">✓</span>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 m-0">Account Verified!</h2>
                            <p className="text-gray-500 mt-2">
                                Your account is now active. You can proceed to log in.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-blue-600 text-white border-0 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-lg"
                        >
                            Proceed to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Register;
