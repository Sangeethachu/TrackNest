import React from 'react';

const LoadingSpinner = ({ fullPage = false }) => {
    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-32 h-32">
                {/* Animated Rings */}
                <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900/30 rounded-full animate-pulse opacity-50"></div>
                <div className="absolute inset-2 border-4 border-indigo-100 dark:border-indigo-800/20 rounded-full animate-ping opacity-20"></div>

                {/* Loader Image */}
                <div className="absolute inset-0 flex items-center justify-center animate-logo-run">
                    <img
                        src="/app_loader_icon.png"
                        alt="Loading..."
                        className="w-28 h-28 object-contain drop-shadow-2xl"
                    />
                </div>
            </div>

            {/* Loading Text */}
            <div className="flex flex-col items-center">
                <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse tracking-wide">
                    TrackNest
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    Loading your financial world...
                </p>
            </div>
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex items-center justify-center transition-all duration-300">
                {content}
            </div>
        );
    }

    return (
        <div className="w-full py-12 flex items-center justify-center">
            {content}
        </div>
    );
};

export default LoadingSpinner;
