import React, { useEffect, useState } from 'react';
import { ChevronLeft, Plus, CreditCard, Smartphone, Wallet, Banknote, Edit2, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PaymentMethods = () => {
    const navigate = useNavigate();
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            const response = await api.get('/payment-methods/');
            setMethods(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch payment methods:', err);
            setError('Failed to load payment methods.');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payment method?')) return;

        try {
            await api.delete(`/payment-methods/${id}/`);
            setMethods(methods.filter(m => m.id !== id));
        } catch (err) {
            console.error('Failed to delete method:', err);
            alert('Failed to delete payment method.');
        }
    };

    const getIcon = (iconName, size = 24) => {
        if (!iconName) return <LucideIcons.CreditCard size={size} />;

        if (iconName.startsWith('http') || iconName.startsWith('/') || iconName.includes('.')) {
            return (
                <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-full bg-white">
                    <img
                        src={iconName}
                        alt="icon"
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/24?text=?';
                        }}
                    />
                </div>
            );
        }

        const Icon = LucideIcons[iconName] || LucideIcons.CreditCard;
        return <Icon size={size} />;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-gray-100 dark:border-gray-700">
                <button
                    onClick={() => navigate('/profile')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-700 dark:text-gray-200" />
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Payment Methods</h1>
                <button
                    onClick={() => navigate('/add-payment-method')}
                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="px-6 mt-6 space-y-4">
                {loading && <p className="text-center text-gray-500 dark:text-gray-400">Loading methods...</p>}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-4">
                        {error}
                    </div>
                )}

                {!loading && !error && methods.map((method) => {
                    return (
                        <div key={method.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors duration-300">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md`} style={{ backgroundColor: method.color || '#6366f1', color: '#fff' }}>
                                    {getIcon(method.icon)}
                                </div>
                                <div className="max-w-[150px]">
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{method.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{method.type || 'Payment Method'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate(`/edit-payment-method/${method.id}`)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(method.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Add New Button (Alternative style) */}
                <button
                    onClick={() => navigate('/add-payment-method')}
                    className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-400 font-medium hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Add New Method
                </button>
            </div>
        </div>
    );
};

export default PaymentMethods;
