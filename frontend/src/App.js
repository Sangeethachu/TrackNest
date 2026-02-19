import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Stats from './pages/Stats';
import Budget from './pages/Budget';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import PaymentMethods from './pages/PaymentMethods';
import AddPaymentMethod from './pages/AddPaymentMethod';
import Settings from './pages/Settings';
import HelpSupport from './pages/HelpSupport';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Splash from './pages/Splash';
import AddTransaction from './pages/AddTransaction';
import AddSavingsGoal from './pages/AddSavingsGoal';
import BottomNav from './components/BottomNav';

// Layout component to include BottomNav only on main pages
const MainLayout = () => {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative dark:bg-gray-900 transition-colors duration-300">
      <Outlet />
      <BottomNav />
    </div>
  );
};

const AuthLayout = () => {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative dark:bg-gray-900 transition-colors duration-300">
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Routes (No Bottom Nav) */}
          <Route element={<AuthLayout />}>
            <Route path="/splash" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Private Routes (With Bottom Nav) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/add-transaction" element={<AddTransaction />} />
            <Route path="/add-goal" element={<AddSavingsGoal />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/payment-methods" element={<PaymentMethods />} />
            <Route path="/add-payment-method" element={<AddPaymentMethod />} />
            <Route path="/edit-payment-method/:id" element={<AddPaymentMethod />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<HelpSupport />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
