import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
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
import Notifications from './pages/Notifications';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AppPermissions from './pages/AppPermissions';
import ForgotPassword from './pages/ForgotPassword';
import ChangePin from './pages/ChangePin';
import BottomNav from './components/BottomNav';
import api from './api';

// Protected Route Component
const ProtectedRoute = () => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/splash" replace />;
  }

  return <Outlet />;
};

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
  // Stealth Keep-Alive for Render (Ping every 14 mins)
  React.useEffect(() => {
    const keepAlive = async () => {
      try {
        await api.get('/health-check/');
        console.log('Heartbeat: System healthy');
      } catch (err) {
        // Silent fail
      }
    };

    // Initial ping
    keepAlive();

    // 14 minutes interval (840,000 ms)
    const interval = setInterval(keepAlive, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Routes (No Bottom Nav) */}
          <Route element={<AuthLayout />}>
            <Route path="/splash" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Private Routes (With Bottom Nav) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/add-transaction" element={<AddTransaction />} />
              <Route path="/add-goal" element={<AddSavingsGoal />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/change-pin" element={<ChangePin />} />
              <Route path="/payment-methods" element={<PaymentMethods />} />
              <Route path="/add-payment-method" element={<AddPaymentMethod />} />
              <Route path="/edit-payment-method/:id" element={<AddPaymentMethod />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/permissions" element={<AppPermissions />} />
              <Route path="/help" element={<HelpSupport />} />
            </Route>
          </Route>

          {/* Redirect all unknown routes to home (which redirects to splash if not logged in) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
