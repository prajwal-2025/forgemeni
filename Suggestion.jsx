// src/pages/Suggestion.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';

const LightbulbIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 9 7c0 1.3.5 2.6 1.5 3.5.7.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;

export default function Suggestion() {
    const [suggestion, setSuggestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(auth.currentUser);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setCurrentUser(user);
            } else {
                showNotification("You must be logged in to make a suggestion.", "info");
                navigate('/student-login');
            }
        });
        return unsubscribe;
    }, [navigate, showNotification]);

    const handleSuggestionSubmit = async (e) => {
        e.preventDefault();
        if (suggestion.trim().length < 10) {
            showNotification("Please provide a more detailed suggestion (at least 10 characters).", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'suggestions'), {
                text: suggestion,
                submittedAt: new Date(),
                userId: currentUser.uid,
                userPhone: currentUser.phoneNumber,
            });
            showNotification("Thank you! Your suggestion has been submitted.", "success");
            setSuggestion('');
            navigate('/student-home');
        } catch (error) {
            console.error("Error submitting suggestion:", error);
            showNotification("Failed to submit suggestion.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                Redirecting to login...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg p-8 space-y-8 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl shadow-purple-900/20"
            >
                <div className="text-center">
                    <LightbulbIcon className="mx-auto h-12 w-12 text-yellow-400" />
                    <h2 className="mt-4 text-3xl font-bold text-white">
                        Suggest a Course or Feature
                    </h2>
                    <p className="mt-2 text-slate-400">We value your feedback! What would you like to see next?</p>
                </div>

                <form onSubmit={handleSuggestionSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="suggestion" className="block text-sm font-medium text-slate-300 mb-1 sr-only">
                            Your Suggestion
                        </label>
                        <textarea
                            id="suggestion"
                            value={suggestion}
                            onChange={(e) => setSuggestion(e.target.value)}
                            placeholder="Describe your idea for a new course or an improvement..."
                            className="mt-1 w-full h-32 p-3 bg-slate-700/50 border-2 border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition text-white"
                            required
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
