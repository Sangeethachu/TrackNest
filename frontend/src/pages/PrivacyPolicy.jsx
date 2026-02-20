import React from 'react';
import { ChevronLeft, Shield, FileText, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-24 transition-colors duration-200">
            {/* Header */}
            <header className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors duration-200">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors mr-2">
                    <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-xl font-semibold">Privacy Policy</h1>
            </header>

            {/* Content */}
            <div className="p-6 max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-4 mb-8">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white">Your Privacy Matters</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Last updated: Today</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                    <section>
                        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-3">
                            <FileText size={20} className="text-indigo-500" />
                            Data Collection
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            We collect information you directly provide to us when creating your account, including your username, email address, password, and avatar preference. In addition to account information, we handle the financial data you input, such as transactions, budgets, payment methods, and savings goals.
                        </p>
                    </section>

                    <section>
                        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-3">
                            <Lock size={20} className="text-indigo-500" />
                            Data Usage and Security
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            Your financial data is used strictly to provide you with tracking, statistics, and budgeting insights. We do not sell or share your personal information with third-party advertisers. Your information is securely stored, and your password is encrypted using high-standard cryptographic hashing.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                            Your Rights
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            You maintain full ownership of your data. You may request to review your information or use the 'Reset All Data' feature within the App Settings to permanently delete your transaction and budget records from our servers.
                        </p>
                    </section>
                </div>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
                    By using TrackNest, you agree to this privacy policy.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
