import React from 'react';
import { ChevronLeft, Moon, Bell, Shield, Smartphone, ChevronRight, RotateCcw, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import api from '../api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";

const Settings = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();
    const [isResetOpen, setIsResetOpen] = useState(false);

    // Initialize push notifications from localStorage or default to true
    const [pushEnabled, setPushEnabled] = useState(() => {
        const stored = localStorage.getItem('pushNotificationsEnabled');
        return stored !== null ? stored === 'true' : true;
    });

    const togglePushNotifications = () => {
        const newValue = !pushEnabled;
        setPushEnabled(newValue);
        localStorage.setItem('pushNotificationsEnabled', newValue);
        // Optionally theoretically interface with service worker here if PWA
    };

    const handleReset = async () => {
        try {
            await api.post('/reset-data/');
            setIsResetOpen(false);
            alert('All data has been reset.');
            navigate('/'); // Redirect to home to refresh state
        } catch (err) {
            console.error('Failed to reset data:', err);
            alert('Failed to reset data. Please try again.');
        }
    };

    const settingsGroups = [
        {
            title: 'Preferences',
            items: [
                {
                    icon: Moon,
                    label: 'Dark Mode',
                    type: 'toggle',
                    value: isDarkMode,
                    action: toggleTheme
                },
                { icon: Bell, label: 'Push Notifications', type: 'toggle', value: pushEnabled, action: togglePushNotifications },
            ]
        },
        {
            title: 'Security',
            items: [
                { icon: Shield, label: 'Privacy Policy', type: 'link', action: () => navigate('/privacy') },
                { icon: Smartphone, label: 'App Permissions', type: 'link', action: () => navigate('/permissions') },
            ]
        },
        {
            title: 'Data Management',
            items: [
                { icon: RotateCcw, label: 'Reset All Data', type: 'button', danger: true, action: () => setIsResetOpen(true) },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pb-24 transition-colors duration-200">
            <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-xl font-semibold">Settings</h1>
                <div className="w-10"></div>
            </header>

            <div className="p-6 max-w-2xl mx-auto">
                {settingsGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-8">
                        <h2 className="text-sm font-semibold mb-3 text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">{group.title}</h2>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                            {group.items.map((item, itemIndex) => {
                                const isLastItem = itemIndex === group.items.length - 1;
                                return (
                                    <div
                                        key={itemIndex}
                                        onClick={() => item.type === 'link' && item.action && item.action()}
                                        className={`flex items-center justify-between p-4 ${!isLastItem ? 'border-b border-gray-100 dark:border-gray-700' : ''} ${item.type === 'link' ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors' : ''}`}
                                    >
                                        <div className="flex items-center space-x-4 pointer-events-none">
                                            <div className={`p-2 rounded-xl ${item.danger ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                                {item.icon && <item.icon size={20} />}
                                            </div>
                                            <span className={`font-medium ${item.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{item.label}</span>
                                        </div>

                                        {item.type === 'toggle' ? (
                                            <button
                                                onClick={item.action}
                                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${item.value ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                                                    }`}
                                            >
                                                <div
                                                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${item.value ? 'translate-x-6' : 'translate-x-0'
                                                        }`}
                                                />
                                            </button>
                                        ) : item.type === 'button' ? (
                                            <button
                                                onClick={item.action}
                                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${item.danger ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/40 dark:text-red-400' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                            >
                                                Reset
                                            </button>
                                        ) : (
                                            <ChevronRight size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-8 pb-8">
                <p className="text-xs text-gray-400">Version 1.0.0</p>
            </div>

            {/* Reset Confirmation Modal */}
            <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <RotateCcw size={20} />
                            Reset All Data?
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. It will permanently delete all your transactions, budgets, and savings goals.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsResetOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white">
                            Yes, Delete Everything
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Settings;
