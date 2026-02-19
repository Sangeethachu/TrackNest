import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, FileText, Check, CreditCard, Wallet, Banknote, Smartphone } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const AddTransaction = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get('category'); // Can be null

    // Form State
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(null); // Selected Category Object
    const [paymentMethod, setPaymentMethod] = useState(null); // Selected PaymentMethod Object
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [type, setType] = useState('expense'); // 'income' or 'expense'

    // Data State
    const [categories, setCategories] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, methodsRes] = await Promise.all([
                    api.get('/categories/'),
                    api.get('/payment-methods/')
                ]);
                setCategories(catsRes.data);
                setPaymentMethods(methodsRes.data);

                // Pre-select category if provided in URL
                if (initialCategory) {
                    const found = catsRes.data.find(c => c.name === initialCategory);
                    if (found) setCategory(found);
                }

                // Pre-select first payment method if available
                if (methodsRes.data.length > 0) {
                    setPaymentMethod(methodsRes.data[0]);
                }

                setLoading(false);
            } catch (err) {
                console.error("Failed to load data", err);
                setLoading(false);
            }
        };
        fetchData();
    }, [initialCategory]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!amount || !title) {
            alert("Please enter amount and title");
            return;
        }

        setSaving(true);
        try {
            const transactionDate = new Date(date);
            const now = new Date();
            // If the selected date is today, use the current local time
            if (transactionDate.toDateString() === now.toDateString()) {
                transactionDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
            }

            const payload = {
                title,
                amount: parseFloat(amount),
                transaction_type: type,
                category_id: category?.id || null,
                payment_method_id: paymentMethod?.id || null,
                date: transactionDate.toISOString(),
                description
            };

            await api.post('/transactions/', payload);
            navigate('/');
        } catch (err) {
            console.error("Failed to save transaction", err);
            alert("Failed to save transaction: " + JSON.stringify(err.response?.data || err.message));
            setSaving(false);
        }
    };

    const getIcon = (iconName, size = 24) => {
        if (!iconName) return <LucideIcons.HelpCircle size={size} />;

        if (iconName.startsWith('http') || iconName.startsWith('/') || iconName.includes('.')) {
            return (
                <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-full bg-white">
                    <img
                        src={iconName}
                        alt="icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/24?text=?';
                        }}
                    />
                </div>
            );
        }

        const Icon = LucideIcons[iconName];
        return Icon ? <Icon size={size} /> : <LucideIcons.HelpCircle size={size} />;
    };

    // Helper to get color for category (since backend doesn't have color yet)
    const getCategoryColor = (catName) => {
        const colors = [
            'bg-blue-100 text-blue-600',
            'bg-green-100 text-green-600',
            'bg-purple-100 text-purple-600',
            'bg-orange-100 text-orange-600',
            'bg-pink-100 text-pink-600',
            'bg-teal-100 text-teal-600'
        ];
        let hash = 0;
        for (let i = 0; i < catName.length; i++) {
            hash = catName.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    if (loading) {
        return <LoadingSpinner fullPage={true} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-24">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors duration-300">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-700 dark:text-gray-200" />
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Add Transaction</h1>
                <div className="w-10"></div>
            </div>

            <div className="px-6 mt-6">
                {/* Type Selector */}
                <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-xl flex mb-8">
                    <button
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'expense'
                            ? 'bg-white dark:bg-gray-800 text-red-600 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}
                        onClick={() => setType('expense')}
                    >
                        Expense
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'income'
                            ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}
                        onClick={() => setType('income')}
                    >
                        Income
                    </button>
                </div>

                {/* Amount Input */}
                <div className="mb-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Amount</p>
                    <div className="flex items-center justify-center">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white mr-1">₹</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="text-4xl font-bold text-gray-900 dark:text-white bg-transparent outline-none w-48 text-center placeholder-gray-300"
                            autoFocus
                        />
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What is this for?"
                            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                        <div className="grid grid-cols-3 gap-3">
                            {categories.map((cat) => {
                                const colorClass = getCategoryColor(cat.name);
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${category?.id === cat.id
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${colorClass}`}>
                                            {getIcon(cat.icon)}
                                        </div>
                                        <span className={`text-xs font-medium ${category?.id === cat.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {cat.name}
                                        </span>
                                    </button>
                                );
                            })}
                            {/* Loader if empty */}
                            {!loading && categories.length === 0 && <p className="text-sm text-gray-500 col-span-3 text-center">No categories found.</p>}
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => setPaymentMethod(method)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all min-w-fit ${paymentMethod?.id === method.id
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${method.color || 'bg-gray-500'}`} style={{ backgroundColor: method.color }}>
                                        {getIcon(method.icon)}
                                    </div>
                                    <span className={`text-sm font-medium ${paymentMethod?.id === method.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {method.name}
                                    </span>
                                </button>
                            ))}
                            {!loading && paymentMethods.length === 0 && <p className="text-sm text-gray-500">No payment methods found.</p>}
                        </div>
                    </div>

                    {/* Date & Description */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar size={20} className="text-gray-400" />
                            </div>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FileText size={20} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a description (optional)"
                                className="block w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <Check size={20} />
                                Save Transaction
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTransaction;
