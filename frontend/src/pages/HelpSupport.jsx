import React, { useState } from 'react';
import { ChevronLeft, MessageCircle, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpSupport = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        { question: 'How do I link my bank account?', answer: 'Go to Profile > Payment Methods and click "Add New Method". You can follow the instructions to link your UPI apps or Bank cards safely.' },
        { question: 'Is my data secure?', answer: 'Yes, we use industry-standard encryption to protect your financial data. We do not store your raw bank credentials.' },
        { question: 'Can I export my transaction history?', answer: 'Currently, this feature is in development and will be available in the next update. You will be able to export as CSV or PDF.' },
        { question: 'How do I change my budget limit?', answer: 'Navigate to the Budget tab and tap on the "Edit" icon near your total budget to set a new monthly limit.' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-24">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors duration-300">
                <button
                    onClick={() => navigate('/profile')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-700 dark:text-gray-200" />
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Help & Support</h1>
                <div className="w-10"></div>
            </div>

            <div className="px-6 mt-6">
                {/* Contact Support Section */}
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-2">Contact Us</h3>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-8 transition-colors duration-300">
                    <div className="flex justify-between gap-4">
                        <button className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl bg-indigo-50 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-600 transition-colors">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                <MessageCircle size={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Chat</span>
                        </button>
                        <button className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl bg-indigo-50 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-600 transition-colors">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                <Mail size={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Email</span>
                        </button>
                        <button className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl bg-indigo-50 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-600 transition-colors">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                <Phone size={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Call</span>
                        </button>
                    </div>
                </div>

                {/* FAQs Section */}
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-2">Freqently Asked Questions</h3>
                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm transition-colors duration-300 cursor-pointer"
                            onClick={() => setOpenIndex(index === openIndex ? null : index)}
                        >
                            <div className="flex justify-between items-start gap-3">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm">{faq.question}</h4>
                                {index === openIndex ? (
                                    <ChevronUp size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                                ) : (
                                    <ChevronDown size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                                )}
                            </div>
                            {index === openIndex && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                                    {faq.answer}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;
