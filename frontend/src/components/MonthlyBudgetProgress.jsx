import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Pencil, Check, X } from 'lucide-react';
import api from '../api';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
};

const MonthlyBudgetProgress = ({ expense = 0, totalBudget = 10000, loading = false, onBudgetUpdate }) => {
    const percentUsed = (expense / totalBudget) * 100;
    const [isEditing, setIsEditing] = useState(false);
    const [newBudget, setNewBudget] = useState(totalBudget.toString());
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveBudget = async () => {
        const parsedBudget = parseFloat(newBudget);
        if (isNaN(parsedBudget) || parsedBudget <= 0) {
            alert('Please enter a valid budget amount');
            return;
        }

        setIsSaving(true);
        try {
            await api.post('/monthly-budget/', { amount: parsedBudget });
            setIsEditing(false);
            if (onBudgetUpdate) onBudgetUpdate();
        } catch (error) {
            console.error('Failed to save budget:', error);
            alert('Failed to update budget limit');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 dark:bg-gray-800 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Monthly spending Limit
                </h2>

                {isEditing ? (
                    <div className="flex items-center gap-2">
                        ₹
                        <input
                            type="number"
                            value={newBudget}
                            onChange={(e) => setNewBudget(e.target.value)}
                            className="w-24 px-2 py-1 text-sm border bg-gray-50 dark:bg-gray-700 dark:text-white border-gray-200 dark:border-gray-600 rounded outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveBudget()}
                        />
                        <button onClick={handleSaveBudget} disabled={isSaving} className="text-green-600 hover:text-green-700 p-1 bg-green-50 dark:bg-green-900/30 rounded">
                            <Check size={16} />
                        </button>
                        <button onClick={() => setIsEditing(false)} className="text-red-500 hover:text-red-600 p-1 bg-red-50 dark:bg-red-900/30 rounded">
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center group cursor-pointer" onClick={() => { setIsEditing(true); setNewBudget(totalBudget.toString()); }}>
                        <span className={`text-sm tracking-tight ${percentUsed > 100 ? 'text-red-600 font-bold' : percentUsed >= 60 ? 'text-orange-500 font-bold' : percentUsed >= 50 ? 'text-yellow-600 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
                            {loading ? '...' : formatCurrency(expense)} <span className="text-gray-400 font-normal">/ {formatCurrency(totalBudget)}</span>
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Pencil size={12} className="text-gray-600 dark:text-gray-300" />
                        </div>
                    </div>
                )}
            </div>

            {percentUsed > 100 ? (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 animate-pulse">
                    <div className="bg-red-500 p-1.5 rounded-lg text-white">
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-red-700 dark:text-red-400">Budget Exceeded!</p>
                        <p className="text-[10px] text-red-600 dark:text-red-300">You've spent {Math.round(percentUsed)}% of your monthly limit.</p>
                    </div>
                </div>
            ) : percentUsed >= 60 ? (
                <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-xl flex items-center gap-3">
                    <div className="bg-orange-400 p-1.5 rounded-lg text-white">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-orange-600 dark:text-orange-400">Budget Warning</p>
                        <p className="text-[10px] text-orange-500 dark:text-orange-300">You've used {Math.round(percentUsed)}% of your monthly limit.</p>
                    </div>
                </div>
            ) : percentUsed >= 50 && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-xl flex items-center gap-3">
                    <div className="bg-yellow-500 p-1.5 rounded-lg text-white">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400">Budget Alert</p>
                        <p className="text-[10px] text-yellow-600 dark:text-yellow-300">You've used {Math.round(percentUsed)}% of your monthly limit.</p>
                    </div>
                </div>
            )}

            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${percentUsed > 100
                        ? 'bg-gradient-to-r from-red-500 to-orange-600'
                        : percentUsed >= 60
                            ? 'bg-gradient-to-r from-orange-300 to-orange-400'
                            : percentUsed >= 50
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                        }`}
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
            </div>
            <p className={`text-xs mt-2 ${percentUsed > 100 ? 'text-red-600 font-bold' : percentUsed >= 60 ? 'text-orange-500 font-bold' : percentUsed >= 50 ? 'text-yellow-600 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                {Math.round(percentUsed)}% of monthly budget used
            </p>
        </div>
    );
};

export default MonthlyBudgetProgress;
