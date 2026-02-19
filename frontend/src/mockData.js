export const userData = {
  name: 'Joshua Pearce',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joshua',
  balance: 24983.64,
  lastMonthChange: 12.7
};

export const quickAddCategories = [
  { id: 1, name: 'Food', icon: 'Utensils', color: 'bg-orange-100 text-orange-600' },
  { id: 2, name: 'Transport', icon: 'Car', color: 'bg-blue-100 text-blue-600' },
  { id: 3, name: 'Shopping', icon: 'ShoppingBag', color: 'bg-purple-100 text-purple-600' },
  { id: 4, name: 'Bills', icon: 'FileText', color: 'bg-red-100 text-red-600' },
  { id: 5, name: 'Health', icon: 'Heart', color: 'bg-green-100 text-green-600' },
  { id: 6, name: 'Other', icon: 'MoreHorizontal', color: 'bg-gray-100 text-gray-600' }
];

export const savingsGoals = [
  { id: 1, name: 'New Laptop', target: 2000, saved: 1450, icon: 'Laptop', color: 'bg-blue-100 text-blue-600' },
  { id: 2, name: 'Vacation', target: 5000, saved: 1200, icon: 'Plane', color: 'bg-orange-100 text-orange-600' },
  { id: 3, name: 'Emergency Fund', target: 10000, saved: 8500, icon: 'Shield', color: 'bg-green-100 text-green-600' },
  { id: 4, name: 'New Car', target: 30000, saved: 5000, icon: 'Car', color: 'bg-red-100 text-red-600' }
];

export const transactions = [
  {
    id: 1,
    type: 'Withdraw from ATM',
    amount: -10.33,
    status: 'Completed',
    time: '22:11',
    icon: 'Banknote',
    category: 'ATM'
  },
  {
    id: 2,
    type: 'Send to Josh',
    amount: -15.12,
    status: 'Completed',
    time: '19:21',
    icon: 'ArrowUpRight',
    category: 'Transfer'
  },
  {
    id: 3,
    type: 'Tax bills',
    amount: -28.57,
    status: 'Completed',
    time: '15:53',
    icon: 'FileText',
    category: 'Bills'
  },
  {
    id: 4,
    type: 'Received from Brian',
    amount: 13.82,
    status: 'Completed',
    time: '12:26',
    icon: 'ArrowDownLeft',
    category: 'Transfer'
  },
  {
    id: 5,
    type: 'Internet bills',
    amount: -15.12,
    status: 'Completed',
    time: '10:33',
    icon: 'Globe',
    category: 'Bills'
  },
  {
    id: 6,
    type: 'Send to Sarah',
    amount: -10.24,
    status: 'Completed',
    time: '08:15',
    icon: 'ArrowUpRight',
    category: 'Transfer'
  }
];

export const monthlyHighlights = {
  totalSpent: 798.41,
  changePercent: -2.5,
  topSpending: {
    category: 'Groceries',
    changePercent: 4.7
  }
};

export const budgetData = [
  { category: 'Housing', amount: 2000, color: '#3b82f6' },
  { category: 'Groceries', amount: 450, color: '#f97316' },
  { category: 'Foods', amount: 600, color: '#10b981' },
  { category: 'Health', amount: 300, color: '#8b5cf6' },
  { category: 'Transport', amount: 500, color: '#fb923c' },
  { category: 'Utilities', amount: 250, color: '#fbbf24' }
];

export const budgetTotal = 4100.00;
export const budgetLimit = 10000;
