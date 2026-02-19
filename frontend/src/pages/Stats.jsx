import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    TrendingUp,
    TrendingDown,
    Calendar,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    PieChart as PieChartIcon
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import api from '../api';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

const Stats = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/transactions/analytics_stats/');
            setData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch analytics stats:', err);
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const getIcon = (iconName, size = 20) => {
        if (!iconName) return <LucideIcons.CreditCard size={size} />;

        if (iconName.startsWith('http') || iconName.startsWith('/') || iconName.includes('.')) {
            return (
                <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-full bg-white">
                    <img
                        src={iconName}
                        alt="icon"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/20?text=?';
                        }}
                    />
                </div>
            );
        }

        const Icon = LucideIcons[iconName] || LucideIcons.CreditCard;
        return <Icon size={size} />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 animate-pulse">Loading analytics...</p>
            </div>
        );
    }

    const { category_distribution, monthly_trend, summary } = data;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors duration-300">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-700 dark:text-gray-200" />
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Analytics</h1>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-700 dark:text-gray-200">
                    <Filter size={20} />
                </button>
            </div>

            <div className="px-6 mt-6 space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <TrendingDown size={16} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">Total Spent</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">
                            {formatCurrency(summary.total_spent)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                <Calendar size={16} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">Daily Avg</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">
                            {formatCurrency(summary.avg_daily)}
                        </p>
                    </div>
                </div>

                {/* Category Distribution Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-gray-900 dark:text-white">Category Spend</h2>
                        <PieChartIcon size={20} className="text-gray-400" />
                    </div>
                    <div className="h-64 relative">
                        {category_distribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={category_distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {category_distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-2">
                                <PieChartIcon size={40} className="text-gray-200 dark:text-gray-700" />
                                <p className="text-sm text-gray-400">No data available</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 mt-6">
                        {category_distribution.slice(0, 4).map((cat, index) => (
                            <div key={cat.name} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate w-24">
                                    {cat.name}
                                </span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {Math.round((cat.value / summary.total_spent) * 100) || 0}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Trend Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-gray-900 dark:text-white">Spending Trend</h2>
                        <TrendingUp size={20} className="text-gray-400" />
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthly_trend}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTrend)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights Section */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <LucideIcons.Zap size={100} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                            <LucideIcons.Zap size={20} />
                            AI Insight
                        </h3>
                        <p className="text-sm opacity-90 leading-relaxed">
                            {summary.total_spent > 0
                                ? `You've spent ${formatCurrency(summary.total_spent)} this month across ${summary.transaction_count} transactions. Your daily average is ${formatCurrency(summary.avg_daily)}.`
                                : "No spending recorded this period. Start tracking to get personalized AI insights!"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
