import React from 'react';
import { Home, Receipt, CreditCard, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Receipt, label: 'Transactions', path: '/transactions' },
    { icon: CreditCard, label: 'Budget', path: '/budget' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive
                  ? 'bg-indigo-600 text-white p-4 rounded-2xl -mt-8 shadow-lg shadow-indigo-200'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <Icon size={isActive ? 24 : 22} strokeWidth={2} />
              {!isActive && (
                <span className="text-xs font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
