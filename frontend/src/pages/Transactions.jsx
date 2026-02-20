import React, { useEffect, useState, useRef } from 'react';
import { Search, ShoppingBag, TrendingDown, ArrowLeft, Upload, FileType2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const Transactions = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    topCategory: 'N/A',
    categoryData: []
  });

  const fetchTransactions = React.useCallback(async () => {
    try {
      const response = await api.get('/transactions/');
      const data = response.data;
      setTransactions(data);
      calculateStats(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const calculateStats = (data) => {
    const expenses = data.filter(t => t.transaction_type === 'expense');
    const totalSpent = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Group by category
    const categoryTotals = {};
    expenses.forEach(t => {
      const catName = t.category?.name || 'General';
      categoryTotals[catName] = (categoryTotals[catName] || 0) + parseFloat(t.amount);
    });

    const categoryData = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
        // Assign a color based on category or default
        color: getCategoryColor(name)
      }))
      .sort((a, b) => b.amount - a.amount);

    const topCategory = categoryData.length > 0 ? categoryData[0].name : 'N/A';

    setStats({
      totalSpent,
      topCategory,
      categoryData: categoryData.slice(0, 4) // Show top 4 for UI
    });
  };

  const getCategoryColor = (name) => {
    const colors = {
      'Food': '#10b981', // green
      'Travel': '#f97316', // orange
      'Shopping': '#6366f1', // indigo
      'Bills': '#a855f7', // purple
      'Entertainment': '#ec4899', // pink
      'General': '#6b7280' // gray
    };
    return colors[name] || '#6366f1';
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }

    const password = window.prompt("If your PDF is password protected (like most Bank Statements), enter it here.\nIf not, just leave this blank and click OK:");
    if (password === null) {
      // User clicked cancel
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (password) {
      formData.append('password', password);
    }

    setUploading(true);
    try {
      const response = await api.post('/upload-statement/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      alert(response.data.message);
      fetchTransactions(); // Refresh the list
    } catch (err) {
      console.error('Failed to upload statement:', err);
      alert(err.response?.data?.error || 'Failed to process statement. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Transactions history</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative"
            title="Import Statement"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Upload size={22} className="text-indigo-600 dark:text-indigo-400" />
            )}
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <Search size={22} className="text-gray-700 dark:text-gray-200" />
          </button>
        </div>
      </div>

      {/* Highlights */}
      <div className="px-6 mt-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Monthly highlights</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Total Spent */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <ShoppingBag size={18} className="text-gray-700 dark:text-gray-200" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total spent</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {loading ? '...' : formatCurrency(stats.totalSpent)}
            </p>
            <p className="text-xs text-indigo-600 font-medium">
              Across all categories
            </p>
          </div>

          {/* Top Spending */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <TrendingDown size={18} className="text-gray-700 dark:text-gray-200" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Top category</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">
              {loading ? '...' : stats.topCategory}
            </p>
            <p className="text-xs text-green-600 font-medium">
              Highest expenditure
            </p>
          </div>
        </div>

        {/* Categories breakdown */}
        {!loading && stats.categoryData.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Spending by category</h3>
            <div className="space-y-4">
              {stats.categoryData.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{category.name}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: category.color,
                        width: `${category.percentage}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="px-6 mt-8">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent activity</h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
          {loading ? (
            <div className="py-12">
              <LoadingSpinner />
            </div>
          ) : transactions.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No transactions recorded yet.</p>
          ) : transactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${index !== transactions.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  {getIcon(transaction.category?.icon)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{transaction.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {transaction.category?.name || 'General'} • {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {transaction.transaction_type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
