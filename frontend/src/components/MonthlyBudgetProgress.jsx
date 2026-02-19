import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
};

const MonthlyBudgetProgress = ({ expense = 0, totalBudget = 10000, loading = false }) => {
    const percentUsed = (expense / totalBudget) * 100;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 dark:text-white">Monthly spending</h2>
                <span className={`text-sm ${percentUsed > 100 ? 'text-red-600 font-bold' : percentUsed >= 60 ? 'text-orange-500 font-bold' : percentUsed >= 50 ? 'text-yellow-600 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                    {loading ? '...' : formatCurrency(expense)} / {formatCurrency(totalBudget)}
                </span>
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
