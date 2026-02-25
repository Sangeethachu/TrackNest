import React from 'react';
import { ChevronLeft, SlidersHorizontal, Save } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useState, useEffect } from 'react';
import { formatCurrency } from './Home'; // Reuse helper
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";

const Budget = () => {
  const navigate = useNavigate();
  const [budgetStats, setBudgetStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayTransactions, setTodayTransactions] = useState([]);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [editingBudget, setEditingBudget] = useState(0);

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      const [statsRes, transactionsRes, budgetRes] = await Promise.all([
        api.get('/categories/budget_stats/'),
        api.get('/transactions/'),
        api.get('/monthly-budget/')
      ]);

      const globalLimit = budgetRes.data.length > 0 ? parseFloat(budgetRes.data[0].amount) : (parseFloat(budgetRes.data.amount) || 0);

      setBudgetStats(statsRes.data);
      setMonthlyBudget(globalLimit);
      setEditingBudget(globalLimit);

      // Filter today's transactions using local date
      const allTransactions = transactionsRes.data.results || transactionsRes.data || [];
      const today = new Date();
      const todayTxns = allTransactions.filter(t => {
        const txnDate = new Date(t.date);
        return txnDate.getDate() === today.getDate() &&
          txnDate.getMonth() === today.getMonth() &&
          txnDate.getFullYear() === today.getFullYear();
      }).slice(0, 5);
      setTodayTransactions(todayTxns);
    } catch (error) {
      console.error('Failed to fetch budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBudget = async () => {
    try {
      await api.post('/monthly-budget/', { amount: editingBudget });
      setIsManageOpen(false);
      fetchBudgetData(); // Refresh stats
    } catch (error) {
      console.error('Failed to save budget:', error);
      alert('Failed to save monthly limit');
    }
  };

  const getIcon = (iconName) => {
    const Icon = LucideIcons[iconName] || LucideIcons.HelpCircle;
    return <Icon size={20} />;
  };

  // Calculate totals
  const totalSpent = budgetStats.reduce((sum, item) => sum + item.amount, 0);
  // Chart data now just shows distribution of spent amount
  let chartData = budgetStats.filter(item => item.amount > 0).map(item => ({
    name: item.category,
    value: item.amount,
    color: item.color || '#cbd5e1'
  }));

  const isDataEmpty = chartData.length === 0;
  if (isDataEmpty) {
    chartData = [{ name: 'No Spending', value: 1, color: '#f3f4f6' }];
  }

  // Palette from mock data to preserve the "old UI" look
  const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#fb923c', '#fbbf24', '#ec4899', '#6366f1'];

  if (loading) {
    return <LoadingSpinner fullPage={true} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
          Monthly budget
        </h1>
        <button
          onClick={() => setIsManageOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <SlidersHorizontal size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Budget Chart */}
      <div className="px-6 mt-8">
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center">
          {/* Semi-circular Gauge Chart */}
          <div className="relative w-full h-64 flex flex-col items-center justify-end mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={110}
                  outerRadius={160}
                  paddingAngle={isDataEmpty ? 0 : 3}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={isDataEmpty ? '#e5e7eb' : COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                {!isDataEmpty && (
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    itemStyle={{ color: '#1f2937' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute bottom-0 w-full flex flex-col items-center justify-end pb-4 pointer-events-none">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total spend</span>
              <span className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                {loading ? '...' : formatCurrency(totalSpent)}
              </span>
            </div>
          </div>

          {/* Budget Legend */}
          <div className="w-full grid grid-cols-2 gap-x-12 gap-y-4 mb-8 px-4">
            {loading ? <p>Loading...</p> : budgetStats.filter(item => item.amount > 0).map((item, index) => (
              <div key={item.id} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {item.category}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white ml-auto">
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>

          {/* Spending Limit */}
          <div className="w-full pt-4 border-t border-gray-100 flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full flex-shrink-0" />
            <p className="text-sm text-gray-500">
              Your monthly spending limit is {formatCurrency(monthlyBudget)}
            </p>
          </div>
        </div>
      </div>

      {/* Today Transactions */}
      <div className="px-6 mt-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Today</h2>
        <div className="bg-white rounded-2xl overflow-hidden">
          {todayTransactions.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              No transactions today.
            </div>
          ) : (
            todayTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer ${index !== todayTransactions.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    {getIcon(transaction.category?.icon)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{transaction.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`w-2 h-2 rounded-full ${transaction.transaction_type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      <p className="text-xs text-gray-500">{transaction.category?.name}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {transaction.transaction_type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manage Budget Modal */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Monthly Budget</DialogTitle>
            <DialogDescription>
              Enter the total amount you want to spend this month.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthly-limit" className="text-right">
                Limit
              </Label>
              <Input
                id="monthly-limit"
                type="number"
                value={editingBudget}
                onChange={(e) => setEditingBudget(parseFloat(e.target.value) || 0)}
                className="col-span-3"
                placeholder="Ex: 10000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageOpen(false)}>Cancel</Button>
            <Button onClick={saveBudget}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Budget;
