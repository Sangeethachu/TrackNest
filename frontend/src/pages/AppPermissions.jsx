import React, { useState } from 'react';
import { ChevronLeft, Key, Lock, Camera, MapPin, Bell, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppPermissions = () => {
    const navigate = useNavigate();

    // Mock states for permissions for UI interactability
    const [permissions, setPermissions] = useState({
        notifications: true,
        camera: false,
        location: false,
        network: true
    });

    const togglePermission = (key) => {
        setPermissions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const permissionList = [
        {
            key: 'notifications',
            icon: Bell,
            label: 'Push Notifications',
            desc: 'Receive alerts for budget goals and app updates.',
            required: false
        },
        {
            key: 'network',
            icon: Globe,
            label: 'Network Access',
            desc: 'Required to sync your data with TrackNest servers.',
            required: true
        },
        {
            key: 'camera',
            icon: Camera,
            label: 'Camera',
            desc: 'Used for taking pictures of receipts (Coming Soon).',
            required: false
        },
        {
            key: 'location',
            icon: MapPin,
            label: 'Location Services',
            desc: 'Tag your transactions with a geographical location.',
            required: false
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-24 transition-colors duration-200">
            {/* Header */}
            <header className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors duration-200">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors mr-2">
                    <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-xl font-semibold">App Permissions</h1>
            </header>

            {/* Content */}
            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-4 mb-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                        <Key size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white">Device Access</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Control what information the app can access.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                    {permissionList.map((item, index) => {
                        const Icon = item.icon;
                        const isLastItem = index === permissionList.length - 1;
                        const isEnabled = permissions[item.key];

                        return (
                            <div
                                key={item.key}
                                className={`flex items-center justify-between p-4 ${!isLastItem ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl mt-1">
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{item.label}</h3>
                                            {item.required && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full flex items-center gap-1">
                                                    <Lock size={10} /> Required
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => !item.required && togglePermission(item.key)}
                                    disabled={item.required}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${isEnabled
                                            ? item.required ? 'bg-indigo-300 dark:bg-indigo-800 cursor-not-allowed' : 'bg-indigo-600 cursor-pointer'
                                            : 'bg-gray-300 dark:bg-gray-600 cursor-pointer'
                                        }`}
                                >
                                    <div
                                        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${isEnabled ? 'translate-x-6' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AppPermissions;
