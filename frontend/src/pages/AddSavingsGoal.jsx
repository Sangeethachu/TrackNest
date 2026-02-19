import React, { useState } from 'react';
import { ChevronLeft, Target, Wallet, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

import api from '../api';

const AddSavingsGoal = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [savedAmount, setSavedAmount] = useState('');
    const [selectedColor, setSelectedColor] = useState('blue');
    const [selectedIcon, setSelectedIcon] = useState('Target');
    const [saving, setSaving] = useState(false);

    const colors = [
        { name: 'blue', class: 'bg-blue-100 text-blue-600' },
        { name: 'green', class: 'bg-green-100 text-green-600' },
        { name: 'orange', class: 'bg-orange-100 text-orange-600' },
        { name: 'purple', class: 'bg-purple-100 text-purple-600' },
        { name: 'red', class: 'bg-red-100 text-red-600' },
        { name: 'indigo', class: 'bg-indigo-100 text-indigo-600' },
    ];

    const icons = [
        'Target', 'Car', 'Home', 'Plane', 'Smartphone', 'Laptop', 'Gift', 'Shield',
        'Coffee', 'Utensils', 'ShoppingBag', 'Heart', 'Zap', 'Star', 'Music', 'Camera',
        'Palette', 'Gamepad2', 'Library', 'Dumbbell', 'Bike'
    ];

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name,
                target_amount: parseFloat(targetAmount),
                saved_amount: parseFloat(savedAmount) || 0,
                icon: selectedIcon,
                color: selectedColor
            };
            await api.post('/savings-goals/', payload);
            navigate('/');
        } catch (err) {
            console.error('Failed to save goal:', err);
            alert('Failed to save goal: ' + (err.response?.data?.detail || err.message));
        } finally {
            setSaving(false);
        }
    };

    const getIcon = (iconName) => {
        const Icon = LucideIcons[iconName];
        return Icon ? <Icon size={24} /> : null;
    };

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
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">New Goal</h1>
                <div className="w-10"></div>
            </div>

            <div className="px-6 mt-6">
                <form onSubmit={handleSave} className="space-y-6">

                    {/* Goal Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goal Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Target size={20} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. New Laptop"
                                className="block w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Target Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Amount</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-400 font-bold">₹</span>
                            </div>
                            <input
                                type="number"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                placeholder="5000"
                                className="block w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Saved So Far */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Amount (Optional)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Wallet size={20} className="text-gray-400" />
                            </div>
                            <input
                                type="number"
                                value={savedAmount}
                                onChange={(e) => setSavedAmount(e.target.value)}
                                placeholder="0"
                                className="block w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Theme</label>
                        <div className="flex gap-3 justify-between">
                            {colors.map((color) => (
                                <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => setSelectedColor(color.name)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${color.class.split(' ')[0]} ${selectedColor === color.name ? 'ring-4 ring-offset-2 ring-indigo-200 dark:ring-indigo-900' : ''}`}
                                >
                                    {selectedColor === color.name && <Check size={20} className="text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Icon Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
                        <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1 scrollbar-hide">
                            {icons.map((iconName) => (
                                <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => setSelectedIcon(iconName)}
                                    className={`p-3 rounded-xl border flex items-center justify-center transition-all ${selectedIcon === iconName
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500'}`}
                                >
                                    {getIcon(iconName)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        {saving ? 'Creating...' : 'Create Goal'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AddSavingsGoal;
