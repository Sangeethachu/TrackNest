import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Signup = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        if (localStorage.getItem('access_token')) {
            navigate('/');
        }
    }, [navigate]);

    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/register/', {
                username: email, // Use email as username
                email: email,
                password: password,
                first_name: name
            });

            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            navigate('/');
        } catch (err) {
            console.error('Registration failed:', err);
            const message = err.response?.data?.error ||
                err.response?.data?.detail ||
                err.response?.data?.username?.[0] ||
                err.response?.data?.email?.[0] ||
                'Failed to create account. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center px-8 relative overflow-hidden transition-colors duration-300 dark:bg-gray-900">
            {/* Background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-30 dark:opacity-10"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-30 dark:opacity-10"></div>

            <div className="z-10 w-full max-w-sm mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Join us to track your expenses efficiently.</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={20} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full Name"
                                className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl leading-5 bg-gray-50 dark:bg-gray-800 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-750 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={20} className="text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl leading-5 bg-gray-50 dark:bg-gray-800 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-750 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={20} className="text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="block w-full pl-10 pr-10 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl leading-5 bg-gray-50 dark:bg-gray-800 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-750 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                                required
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 rounded"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-400">
                                I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500 underline decoration-indigo-500/30">Terms</a> and <a href="#" className="text-indigo-600 hover:text-indigo-500 underline decoration-indigo-500/30">Privacy Policy</a>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end mt-[-1rem]">
                        <Link to="/forgot-password" class="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-indigo-200 active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                        {!loading && <ArrowRight size={18} className="ml-2" />}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
