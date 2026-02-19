import React, { useState, useEffect } from 'react';
import { ChevronLeft, Check, Smartphone, CreditCard, Wallet, Banknote } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const colors = [
    'bg-blue-500', 'bg-indigo-600', 'bg-sky-400',
    'bg-green-500', 'bg-orange-500', 'bg-red-500',
    'bg-purple-500', 'bg-gray-800'
];

const types = ['UPI', 'Debit Card', 'Credit Card', 'Wallet', 'Cash'];
const icons = [
    { name: 'Smartphone', label: 'Phone' },
    { name: 'CreditCard', label: 'Card' },
    { name: 'Wallet', label: 'Wallet' },
    { name: 'Banknote', label: 'Cash' }
];

const AddPaymentMethod = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [name, setName] = useState('');
    const [type, setType] = useState('UPI');
    const [icon, setIcon] = useState('Smartphone');
    const [color, setColor] = useState('bg-blue-500');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit) {
            fetchMethod();
        }
    }, [id]);

    const fetchMethod = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/payment-methods/${id}/`);
            const data = response.data;
            setName(data.name);
            setType(data.type || 'UPI');
            setIcon(data.icon || 'Smartphone');
            setColor(data.color || 'bg-blue-500');
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch payment method details.');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { name, type, icon, color };
            if (isEdit) {
                await api.patch(`/payment-methods/${id}/`, payload);
            } else {
                await api.post('/payment-methods/', payload);
            }
            navigate('/payment-methods');
        } catch (err) {
            console.error(err);
            setError('Failed to save payment method.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate('/payment-methods')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Method' : 'Add Method'}</h1>
                <div className="w-10"></div>
            </div>

            <div className="px-6 mt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Method Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. HDFC Bank, GPay"
                            className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <div className="flex flex-wrap gap-2">
                            {types.map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${type === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                        <div className="flex gap-4">
                            {icons.map(i => {
                                const IconComp = { Smartphone, CreditCard, Wallet, Banknote }[i.name];
                                return (
                                    <button
                                        key={i.name}
                                        type="button"
                                        onClick={() => setIcon(i.name)}
                                        className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all ${icon === i.name ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 bg-white text-gray-400'}`}
                                    >
                                        <IconComp size={24} />
                                        <span className="text-[10px] mt-1">{i.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                        <div className="flex flex-wrap gap-3">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-10 h-10 rounded-full ${c} transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Check size={20} />
                                {isEdit ? 'Update Method' : 'Save Method'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentMethod;
