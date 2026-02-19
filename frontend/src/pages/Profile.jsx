import React, { useEffect, useState } from 'react';
import { User, Settings, CreditCard, Bell, LogOut, ChevronRight, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import MonthlyBudgetProgress from '../components/MonthlyBudgetProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency } from './Home';

const Profile = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [user, setUser] = useState({ name: 'User', email: '', avatar: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, userRes] = await Promise.all([
                    api.get('/transactions/dashboard_stats/'),
                    api.get('/user/')
                ]);
                setDashboardData(statsRes.data);
                setUser({
                    name: userRes.data.first_name || userRes.data.username,
                    email: userRes.data.email,
                    avatar: userRes.data.profile?.avatar_url
                });
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const menuItems = [
        { icon: User, label: 'Edit Profile', value: '', path: '/edit-profile' },
        { icon: Settings, label: 'Settings', value: '', path: '/settings' },
        { icon: CreditCard, label: 'Payment Methods', value: '2 linked', path: '/payment-methods' },
        { icon: Bell, label: 'Notifications', value: 'On', path: '/settings' },
        { icon: HelpCircle, label: 'Help & Support', value: '', path: '/help' },
    ];

    if (loading) {
        return <LoadingSpinner fullPage={true} />;
    }

    const totalBudget = dashboardData?.total_budget || 10000;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-300">
            {/* Header Profile Section */}
            <div className="bg-white dark:bg-gray-800 px-6 pt-12 pb-8 rounded-b-3xl shadow-sm transition-colors duration-300">
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-full p-1">
                            <img
                                src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                                alt="Profile"
                                className="w-full h-full rounded-full border-4 border-white bg-white"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/edit-profile')}
                            className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-lg border-2 border-white"
                        >
                            <Settings size={16} />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
                </div>

                {/* Stats Row */}
                <div className="flex justify-between mt-8 px-4">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Balance</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {loading ? '...' : formatCurrency(dashboardData?.balance || 0)}
                        </p>
                    </div>
                    <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Monthly</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {loading ? '...' : formatCurrency(dashboardData?.expense || 0)}
                        </p>
                    </div>
                    <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Income</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {loading ? '...' : formatCurrency(dashboardData?.income || 0)}
                        </p>
                    </div>
                </div>

                {/* Monthly Budget Progress */}
                <div className="mt-8">
                    <MonthlyBudgetProgress
                        expense={dashboardData?.expense}
                        totalBudget={totalBudget}
                        loading={loading}
                    />
                </div>
            </div>

            {/* Menu Options */}
            <div className="px-6 mt-6 space-y-4">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={index}
                                onClick={() => item.path && navigate(item.path)}
                                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600">
                                        <Icon size={20} />
                                    </div>
                                    <span className="font-medium text-gray-900">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.value && (
                                        <span className="text-xs text-gray-400 font-medium">{item.value}</span>
                                    )}
                                    <ChevronRight size={18} className="text-gray-300" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="px-4 pb-4">
                    <button className="w-full bg-white rounded-2xl p-4 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 transition-colors shadow-sm font-medium">
                        <LogOut size={20} />
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
