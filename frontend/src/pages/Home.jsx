import React, { useEffect, useState } from 'react';
import MonthlyBudgetProgress from '../components/MonthlyBudgetProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { Bell, MoreHorizontal, TrendingUp, Download, Upload, Plus, Wallet, TrendingDown, ArrowUpRight, ArrowDownLeft, DollarSign, Calendar, CreditCard, RotateCcw, Pencil, Trash2, Check, Target } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import api from '../api';

const Home = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState({ name: 'User', first_name: '', avatar: '', balance: 0 });
  const [loading, setLoading] = useState(true);

  // Add Value Modal State
  const [isAddValueOpen, setIsAddValueOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [addAmount, setAddAmount] = useState('');

  // Edit Goal Modal State
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editName, setEditName] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [editSavedAmount, setEditSavedAmount] = useState('');
  const [editColor, setEditColor] = useState('blue');
  const [editIcon, setEditIcon] = useState('Target');

  // Delete Goal Modal State
  const [isDeleteGoalOpen, setIsDeleteGoalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

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

  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  // Smart Text State
  const [smartText, setSmartText] = useState('');
  const [smartTextPreview, setSmartTextPreview] = useState(null);
  const [isSubmittingSmartText, setIsSubmittingSmartText] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchDashboardData();
    fetchGoals();
    fetchCategories();
    fetchUnreadNotifications();
  }, []);

  // Poll for UI Preview auto-suggestions
  useEffect(() => {
    const handler = setTimeout(() => {
      if (smartText.trim().length > 2) {
        api.post('/parse-smart-text/', { text: smartText, preview: true })
          .then(res => setSmartTextPreview(res.data.preview))
          .catch(() => setSmartTextPreview(null));
      } else {
        setSmartTextPreview(null);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [smartText]);

  const handleSmartTextSubmit = async (e) => {
    e.preventDefault();
    if (!smartText.trim()) return;

    setIsSubmittingSmartText(true);
    try {
      const response = await api.post('/parse-smart-text/', { text: smartText });
      alert(response.data.message);
      setSmartText('');
      setSmartTextPreview(null);
      fetchDashboardData(); // Refresh values
    } catch (err) {
      console.error('Smart text error:', err);
      alert(err.response?.data?.error || 'Could not parse that sentence. Try "Spent 500 on groceries"');
    } finally {
      setIsSubmittingSmartText(false);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await api.get('/notifications/');
      const unreadList = response.data.filter(n => !n.is_read);

      const lastSeenIdStr = localStorage.getItem('lastSeenNotificationId');
      const lastSeenId = lastSeenIdStr ? parseInt(lastSeenIdStr, 10) : 0;

      const hasNew = unreadList.some(n => n.id > lastSeenId);

      setUnreadCount(unreadList.length);
      setHasNewNotifications(hasNew);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get('/user/');
      setUser({
        name: response.data.first_name || response.data.username,
        avatar: response.data.profile?.avatar_url,
      });
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      // Filter or sort categories if needed for Quick Add (e.g. top 6)
      setCategories(response.data.slice(0, 8));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/transactions/dashboard_stats/');
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await api.get('/savings-goals/');
      setGoals(response.data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    }
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


  // Get color for goal
  const getGoalColor = (colorName) => {
    const colorObj = colors.find(c => c.name === colorName);
    return colorObj ? colorObj.class : colors[0].class;
  };

  const handleAddValue = (goal) => {
    setSelectedGoal(goal);
    setAddAmount('');
    setIsAddValueOpen(true);
  };

  const saveAddValue = async () => {
    if (!addAmount || isNaN(addAmount) || parseFloat(addAmount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      await api.post(`/savings-goals/${selectedGoal.id}/add_amount/`, { amount: parseFloat(addAmount) });
      fetchGoals(); // Refresh the goals list
      setIsAddValueOpen(false);
    } catch (err) {
      console.error('Failed to add amount:', err);
      alert('Failed to update goal. Please try again.');
    }
  };

  // Edit Goal Handlers
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setEditName(goal.name);
    setEditTargetAmount(goal.target_amount);
    setEditSavedAmount(goal.saved_amount);
    setEditColor(goal.color);
    setEditIcon(goal.icon || 'Target');
    setIsEditGoalOpen(true);
  };

  const saveEditGoal = async () => {
    try {
      await api.patch(`/savings-goals/${editingGoal.id}/`, {
        name: editName,
        target_amount: parseFloat(editTargetAmount),
        saved_amount: parseFloat(editSavedAmount) || 0,
        color: editColor,
        icon: editIcon
      });
      fetchGoals();
      setIsEditGoalOpen(false);
    } catch (err) {
      console.error('Failed to update goal:', err);
      alert('Failed to update goal.');
    }
  };

  // Delete Goal Handlers
  const handleDeleteGoal = (goal) => {
    setGoalToDelete(goal);
    setIsDeleteGoalOpen(true);
  };

  const confirmDeleteGoal = async () => {
    try {
      await api.delete(`/savings-goals/${goalToDelete.id}/`);
      fetchGoals();
      setIsDeleteGoalOpen(false);
    } catch (err) {
      console.error('Failed to delete goal:', err);
      alert('Failed to delete goal.');
    }
  };

  const weeklySpending = dashboardData?.weekly_spending || [];
  const allAmounts = weeklySpending.map(d => parseFloat(d.amount) || 0);
  const maxAmount = Math.max(...allAmounts, 1);
  const totalBudget = dashboardData?.total_budget || 10000; // Fallback to 10k if 0
  // const percentUsed = ((dashboardData?.expense || 0) / totalBudget) * 100; // Handled in component now

  const monthChange = dashboardData?.month_change || 0;
  const isBalancePositive = monthChange >= 0;

  if (loading && !dashboardData) {
    return <LoadingSpinner fullPage={true} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-6 pt-12 pb-6 min-h-[320px] rounded-b-[40px] shadow-sm relative overflow-hidden">
        {/* Background blobs for glass effect */}
        <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
              />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back!</p>
                <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/notifications')}
              className={`p-2 bg-white/50 dark:bg-gray-800/50 rounded-full shadow-sm hover:shadow-md transition-all border border-white/50 dark:border-gray-700 hover-ring backdrop-blur-sm relative`}
            >
              <Bell size={24} className={`text-gray-700 dark:text-gray-200 ${(hasNewNotifications || unreadCount > 0) ? 'text-indigo-600 dark:text-indigo-400' : ''} ${hasNewNotifications ? '[animation:ring_1s_ease-in-out_infinite]' : ''}`} />
              {hasNewNotifications && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
              )}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Balance */}
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your balance</p>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              {loading ? '...' : formatCurrency(dashboardData?.balance || 0)}
            </h1>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full mt-2 ${isBalancePositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              {isBalancePositive ? (
                <LucideIcons.TrendingUp size={14} className="text-green-600 dark:text-green-400" />
              ) : (
                <LucideIcons.TrendingDown size={14} className="text-red-600 dark:text-red-400" />
              )}
              <p className={`text-sm font-medium ${isBalancePositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {monthChange > 0 ? '+' : ''}{monthChange}%
              </p>
            </div>
          </div>

          {/* Action Buttons - Glass Style */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate('/add-transaction')}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 px-8 py-6 rounded-2xl font-medium shadow-lg shadow-gray-200 dark:shadow-none transition-transform hover:scale-105"
            >
              <LucideIcons.Plus size={20} className="mr-2" />
              Add Entry
            </Button>
            <Button
              onClick={() => navigate('/stats')}
              variant="outline"
              className="glass dark:glass-dark border-0 px-8 py-6 rounded-2xl font-medium text-gray-700 dark:text-white transition-transform hover:scale-105"
            >
              <LucideIcons.BarChart3 size={20} className="mr-2" />
              Analytics
            </Button>
            <Button
              onClick={() => navigate('/settings')}
              variant="outline"
              className="glass dark:glass-dark border-0 p-6 rounded-2xl text-gray-700 dark:text-white transition-transform hover:scale-105"
            >
              <LucideIcons.Settings size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Add */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Quick Add</h2>
          <button onClick={() => navigate('/add-transaction')} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">See more</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = getIcon(cat.icon);
            // Derive a color if not present in API, cycling through some defaults or using a helper
            const bgColors = ['bg-orange-100', 'bg-blue-100', 'bg-purple-100', 'bg-red-100', 'bg-green-100', 'bg-gray-100'];
            const textColors = ['text-orange-600', 'text-blue-600', 'text-purple-600', 'text-red-600', 'text-green-600', 'text-gray-600'];
            const colorIndex = (cat.id || 0) % bgColors.length;
            const colorClass = `${bgColors[colorIndex]} ${textColors[colorIndex]}`;

            return (
              <div
                key={cat.id}
                className="flex flex-col items-center gap-2 min-w-fit cursor-pointer"
                onClick={() => navigate(`/add-transaction?category=${cat.name}`)}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-shadow ${colorClass}`}>
                  {Icon}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{cat.name}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Smart Input */}
      <div className="px-6 mt-8">
        <form onSubmit={handleSmartTextSubmit} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <LucideIcons.Sparkles className="h-5 w-5 text-indigo-500 group-focus-within:animate-pulse" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-12 py-4 bg-white dark:bg-gray-800 border-0 rounded-2xl text-sm shadow-sm hover:shadow-md focus:ring-2 focus:ring-indigo-500 dark:text-white transition-shadow"
            placeholder="Type 'spent 500 on groceries today'..."
            value={smartText}
            onChange={(e) => setSmartText(e.target.value)}
            disabled={isSubmittingSmartText}
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button
              type="submit"
              disabled={isSubmittingSmartText || !smartText.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              {isSubmittingSmartText ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LucideIcons.Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>

        {/* Magic Auto-Suggestion Preview */}
        {smartTextPreview && smartText.trim().length > 2 && (
          <div className="mt-3 p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-2xl flex items-center justify-between animate-fade-in shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 rounded-xl">
                <LucideIcons.Wand2 size={18} />
              </div>
              <div>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold mb-0.5 uppercase tracking-wider">AI Prediction</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {smartTextPreview.transaction_type === 'income' ? '+' : '-'}₹{smartTextPreview.amount} for <span className="font-bold">{smartTextPreview.title || 'Unknown'}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                  <LucideIcons.Folder size={12} /> {smartTextPreview.category_name}
                  <span className="mx-1">•</span>
                  <LucideIcons.Calendar size={12} /> {new Date(smartTextPreview.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Savings Goals */}
      <div className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Savings Goals</h2>
          <button
            onClick={() => navigate('/add-goal')}
            className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
          >
            + Add New
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {goals.length === 0 ? (
            <div className="w-full text-center py-8 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 text-sm">No savings goals yet.</p>
              <button
                onClick={() => navigate('/add-goal')}
                className="text-indigo-600 font-medium text-sm mt-2"
              >
                Create your first goal
              </button>
            </div>
          ) : (
            goals.map((goal) => {
              const percentage = Math.round((goal.saved_amount / goal.target_amount) * 100) || 0;
              const colorClass = getGoalColor(goal.color);
              return (
                <div key={goal.id} className="min-w-[200px] bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-transform hover:scale-[1.02] relative group">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditGoal(goal);
                      }}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGoal(goal);
                      }}
                      className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-xl ${colorClass}`}>
                      {LucideIcons[goal.icon] ? React.createElement(LucideIcons[goal.icon], { size: 20 }) : <LucideIcons.Target size={20} />}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate pr-8">{goal.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {formatCurrency(goal.saved_amount || 0)} / {formatCurrency(goal.target_amount || 0)}
                  </p>

                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden border border-gray-100 dark:border-gray-800 mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${goal.color === 'blue' ? 'bg-blue-600' :
                        goal.color === 'green' ? 'bg-green-600' :
                          goal.color === 'orange' ? 'bg-orange-600' :
                            goal.color === 'purple' ? 'bg-purple-600' :
                              goal.color === 'red' ? 'bg-red-600' :
                                goal.color === 'indigo' ? 'bg-indigo-600' : 'bg-gray-900'
                        }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-end mt-1">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{percentage}%</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>


      {/* Spending Overview */}
      <div className="px-6 mt-8">
        <MonthlyBudgetProgress
          expense={dashboardData?.expense}
          totalBudget={totalBudget}
          loading={loading}
        />

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 mt-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="pt-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">This week</h3>
            <div className="flex items-end justify-between gap-2 h-32">
              {weeklySpending.map((day, index) => {
                const amount = parseFloat(day.amount) || 0;
                const isZero = amount === 0;
                // If 0, use minimal height to show "empty" but keep structure
                const heightPercent = isZero ? 2 : (amount / maxAmount) * 100;
                const isToday = new Date().toDateString() === new Date(day.full_date).toDateString();

                return (
                  <div key={index} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 cursor-pointer relative group ${isZero ? 'bg-gray-200 dark:bg-gray-700' : (isToday ? 'bg-indigo-600' : 'bg-purple-500')}`}
                      style={{
                        height: isZero ? '4px' : `${Math.max(heightPercent, 10)}%`, // Keep meaningful bars visible
                        minHeight: isZero ? '4px' : '20px' // Ensure visibility
                      }}
                    >
                      {!isZero && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                          {formatCurrency(amount)}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs ${isToday ? 'font-bold text-indigo-600' : 'text-gray-500 dark:text-gray-400'}`}>{day.day}</span>
                  </div>
                );
              })}
              {loading && <p className="text-center text-xs text-gray-400 w-full">Loading chart...</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Transactions */}
      <div className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Latest transactions</h2>
          <button
            onClick={() => navigate('/transactions')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            See more
          </button>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
          {loading ? (
            <p className="p-4 text-center text-gray-500 dark:text-gray-400">Loading transactions...</p>
          ) : (dashboardData?.recent_transactions || []).map((transaction, index) => (
            <div
              key={transaction.id}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${index !== (dashboardData?.recent_transactions || []).length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  {getIcon(transaction.category?.icon)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{transaction.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${transaction.transaction_type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.category?.name || 'Uncategorized'}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm ${transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.transaction_type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {!loading && (dashboardData?.recent_transactions || []).length === 0 && (
            <p className="p-4 text-center text-gray-500 dark:text-gray-400">No recent transactions found.</p>
          )}
        </div>
      </div>

      {/* Add Value Modal */}
      <Dialog open={isAddValueOpen} onOpenChange={setIsAddValueOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Savings</DialogTitle>
            <DialogDescription>
              Funds to your <strong>{selectedGoal?.name}</strong> goal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="0.00"
                className="col-span-3"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveAddValue();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddValueOpen(false)}>Cancel</Button>
            <Button onClick={saveAddValue}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Modal */}
      <Dialog open={isEditGoalOpen} onOpenChange={setIsEditGoalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Goal Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>Target Amount</Label>
              <Input type="number" value={editTargetAmount} onChange={(e) => setEditTargetAmount(e.target.value)} />
            </div>
            <div>
              <Label>Saved Amount</Label>
              <Input type="number" value={editSavedAmount} onChange={(e) => setEditSavedAmount(e.target.value)} />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setEditColor(color.name)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${color.class.split(' ')[0]} ${editColor === color.name ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                  >
                    {editColor === color.name && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Icon</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {icons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setEditIcon(icon)}
                    className={`p-2 rounded-lg border flex items-center justify-center ${editIcon === icon ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'border-gray-200'}`}
                  >
                    {LucideIcons[icon] ? React.createElement(LucideIcons[icon], { size: 16 }) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditGoalOpen(false)}>Cancel</Button>
            <Button onClick={saveEditGoal}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteGoalOpen} onOpenChange={setIsDeleteGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Goal?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{goalToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteGoalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteGoal} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export default Home;
