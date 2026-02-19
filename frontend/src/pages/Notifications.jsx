import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, Info, XCircle, Trash2, Check } from 'lucide-react';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications/');
            setNotifications(response.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/mark_read/`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.post('/notifications/mark_all_read/');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}/`);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={20} className="text-orange-500" />;
            case 'error': return <XCircle size={20} className="text-red-500" />;
            default: return <Info size={20} className="text-blue-500" />;
        }
    };

    if (loading) return <LoadingSpinner fullPage={true} />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-700 dark:text-gray-200" />
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h1>
                <div className="w-10"></div>
            </div>

            <div className="px-6 py-4">
                {notifications.length > 0 && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={markAllRead}
                            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
                        >
                            <Check size={14} /> Mark all read
                        </button>
                    </div>
                )}

                <div className="space-y-3">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Info size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-gray-900 dark:text-white font-medium mb-1">No notifications</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">You're all caught up!</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white dark:bg-gray-800 p-4 rounded-xl border transition-all relative group ${notification.is_read
                                    ? 'border-gray-100 dark:border-gray-700 opacity-75'
                                    : 'border-indigo-100 dark:border-indigo-900/50 shadow-sm ring-1 ring-indigo-50 dark:ring-indigo-900/20'
                                    }`}
                                onClick={() => !notification.is_read && markAsRead(notification.id)}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-0.5 ${notification.is_read ? 'opacity-50' : ''}`}>
                                        {getIcon(notification.notification_type)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`text-sm font-semibold mb-1 ${notification.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                            {notification.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification.id);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                {!notification.is_read && (
                                    <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
