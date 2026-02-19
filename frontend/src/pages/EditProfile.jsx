import React, { useState, useEffect } from 'react';
import { ChevronLeft, Camera, Save, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const EditProfile = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const avatars = [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Willow',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver'
    ];

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get('/user/');
                const user = response.data;
                setName(user.first_name || user.username || '');
                setEmail(user.email || '');
                setSelectedAvatar(user.profile?.avatar_url || avatars[0]);
            } catch (err) {
                console.error('Failed to fetch user data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/update-profile/', {
                first_name: name,
                email: email,
                avatar_url: selectedAvatar
            });
            navigate('/profile');
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage={true} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors">
                <button
                    onClick={() => navigate('/profile')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-700 dark:text-gray-200" />
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Edit Profile</h1>
                <div className="w-10"></div>
            </div>

            <div className="px-6 mt-8">
                {/* Avatar Selection */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-28 h-28 bg-gray-200 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 dark:border-gray-700">
                        <img
                            src={selectedAvatar}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex gap-3 mt-2 overflow-x-auto pb-2 w-full justify-center">
                        {avatars.map((avatar, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setSelectedAvatar(avatar)}
                                className={`flex-shrink-0 w-12 h-12 rounded-full border-2 overflow-hidden transition-all ${selectedAvatar === avatar ? 'border-indigo-600 ring-2 ring-indigo-100 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={avatar} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john.doe@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-indigo-600 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none mt-4 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        {saving ? (
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <><Save size={20} /> Save Changes</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
