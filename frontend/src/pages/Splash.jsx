import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Splash = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-between py-12 px-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>
            </div>

            <div className="z-10 flex flex-col items-center text-center mt-12">
                <div className="mb-6 drop-shadow-xl animate-bounce-slow">
                    <img
                        src="/app_loader_icon.png"
                        alt="TrackNest Logo"
                        className="w-32 h-32 object-contain"
                    />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">TrackNest.</h1>
                <p className="text-indigo-100 text-lg">Master your money,<br />effortlessly.</p>
            </div>

            <div className="z-10 w-full max-w-sm space-y-4 mb-8">
                <button
                    onClick={() => navigate('/signup')}
                    className="w-full bg-white text-indigo-600 font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                    Get Started
                    <ArrowRight size={20} />
                </button>
                <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-indigo-700 bg-opacity-50 text-white font-medium py-4 rounded-2xl hover:bg-opacity-70 transition-all border border-indigo-500/30"
                >
                    I have an account
                </button>
            </div>
        </div>
    );
};

export default Splash;
