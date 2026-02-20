import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/forgot-password/', {
                email: email,
                new_password: newPassword
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            console.error('Reset failed:', err);
            const message = err.response?.data?.error || 'Failed to reset password. Ensure account exists.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center px-8 relative overflow-hidden transition-colors duration-300 dark:bg-gray-900">
            <button onClick={() => navigate('/login')} className="absolute top-8 left-6 p-2 bg-gray-50 dark:bg-gray-800 rounded-full hover:bg-gray-100 transition-colors z-20">
                <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
            </button>

            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-30 dark:opacity-10"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-30 dark:opacity-10"></div>

            <div className="z-10 w-full max-w-sm mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Enter your email and a new password.</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium animate-shake">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-2xl text-green-600 dark:text-green-400 text-sm font-medium">
                        Password updated! Redirecting to login...
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail size={20} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all dark:text-white"
                                placeholder="Email address"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock size={20} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full pl-11 pr-12 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all dark:text-white"
                                placeholder="New Password"
                                required
                            />
                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || success}
                        className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-indigo-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                        {!loading && <ArrowRight size={18} className="ml-2" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
