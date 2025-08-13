import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const StudentLogin = () => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!/^\d{10}$/.test(phone)) {
            showNotification('Please enter a valid 10-digit phone number.', 'error');
            setLoading(false);
            return;
        }

        try {
            const q = query(collection(db, 'registrations'), where('phone', '==', phone));
            const querySnapshot = await getDocs(q);

            const redirectUrl = sessionStorage.getItem('redirectUrl');
            sessionStorage.removeItem('redirectUrl'); // Clean up now

            if (!querySnapshot.empty) {
                // Case 1: Student is already registered. Log them in.
                const studentData = querySnapshot.docs[0].data();
                sessionStorage.setItem('student', JSON.stringify({ phone: studentData.phone, name: studentData.name }));
                showNotification(`Welcome back, ${studentData.name}!`, 'success');
                navigate(redirectUrl || '/student-home');
            } else {
                // Case 2: New student. Create a temporary session and log them in.
                sessionStorage.setItem('student', JSON.stringify({ phone: phone, name: '' }));
                showNotification('Welcome! Please complete your registration to proceed.', 'info');
                // Navigate to the registration page they were trying to access, or home.
                navigate(redirectUrl || '/');
            }
        } catch (error) {
            showNotification('An error occurred. Please try again.', 'error');
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-slate-800/50 p-10 rounded-xl shadow-lg border border-slate-700">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Student Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        Enter your phone number to proceed.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
                            Phone Number
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-slate-400 sm:text-sm">+91</span>
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-12 sm:text-sm border-slate-600 bg-slate-700/50 rounded-md py-3 text-white"
                                placeholder="98765 43210"
                                required
                                maxLength="10"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Login / Continue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentLogin;
