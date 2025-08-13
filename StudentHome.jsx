// src/pages/StudentHome.jsx (FINAL DEMO MODE)
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import { onAuthStateChanged } from 'firebase/auth';

const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 13.96c.25.13.42.2.46.28.08.17.03.56-.09.68-.12.13-.56.54-1.13.72-.45.14-1.03.18-1.48.06-.5-.13-1.03-.38-1.63-.88-.75-.6-1.55-1.48-2.18-2.48-.63-1-1.03-2.04-1.13-2.33-.09-.28-.01-.5.09-.64.1-.14.23-.28.38-.42.14-.13.28-.27.4-.4.13-.14.23-.28.3-.42.08-.14.04-.3-.04-.42-.08-.13-.41-.99-.56-1.36-.15-.38-.3-.33-.44-.33-.13,0-.29,0-.44.04-.15.04-.38.13-.56.33-.18.19-.68.64-.68,1.55,0,.91.68,1.81.78,1.95.09.14,1.35,2.24,3.3,3.02.45.18.81.28,1.09.36.48.13.81.12,1.1.08.34-.04.99-.41,1.13-.82.14-.41.14-.77.09-.88-.05-.1-.2-.18-.44-.3zM12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2zm0,18c-4.41,0-8-3.59-8-8s3.59-8,8-8,8,3.59,8,8-3.59,8-8,8z"/></svg>;

const DashboardSkeleton = () => (
    <div className="bg-slate-900 min-h-screen text-white animate-pulse">
        <div className="max-w-5xl mx-auto py-8 px-4 pt-28">
            <div className="h-8 bg-slate-700 rounded w-64 mb-6"></div>
            <div className="space-y-5">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
                        <div className="flex justify-between items-center"><div className="h-6 bg-slate-700 rounded w-1/2"></div><div className="h-7 bg-slate-700 rounded-full w-24"></div></div>
                        <div className="mt-4 border-t border-slate-700 pt-4"><div className="h-4 bg-slate-700 rounded w-3/4 mb-3"></div><div className="h-10 bg-slate-700 rounded-lg w-48"></div></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default function StudentHome() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [user, setUser] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const mockUserStr = sessionStorage.getItem('mockUser');
        if (mockUserStr) {
            setUser(JSON.parse(mockUserStr));
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                navigate('/student-login');
            } else {
                setUser(currentUser);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        const fetchRegistrations = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // **FIX:** This logic now works for both real and mock users,
                // as both will have a `uid` property.
                const regsQuery = query(collection(db, "registrations"), where("userId", "==", user.uid));
                const regsSnap = await getDocs(regsQuery);
                const regsData = regsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                const detailedRegs = await Promise.all(
                    regsData.map(async (reg) => {
                        if (reg.courseId === 'bundle') {
                            return { ...reg, course: { name: 'Combined Course Bundle' } };
                        }
                        const courseRef = doc(db, 'courses', reg.courseId);
                        const courseSnap = await getDoc(courseRef);
                        return { ...reg, course: courseSnap.exists() ? courseSnap.data() : null };
                    })
                );
                setRegistrations(detailedRegs);
            } catch (error) {
                console.error("Error fetching student registrations: ", error);
                showNotification("Could not fetch your registrations.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchRegistrations();
    }, [user, showNotification]);

    if (loading || !user) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <main className="max-w-5xl mx-auto py-8 px-4 pt-28">
                <h3 className="text-2xl font-semibold mb-6 text-white">Your Enrolled Courses</h3>
                {registrations.length > 0 ? (
                    <div className="space-y-5">
                        {registrations.map(reg => (
                            <motion.div key={reg.id} className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                    <div>
                                        <h4 className="font-bold text-xl text-white">{reg.course?.name || reg.courseId.toUpperCase()}</h4>
                                        {reg.isFromBundle && <p className="text-xs font-semibold text-purple-400">(Included in your bundle)</p>}
                                    </div>
                                    {reg.confirmed ? (
                                        <span className="mt-2 sm:mt-0 px-3 py-1 text-sm font-semibold text-green-300 bg-green-500/20 rounded-full">Confirmed</span>
                                    ) : (
                                        <span className="mt-2 sm:mt-0 px-3 py-1 text-sm font-semibold text-yellow-300 bg-yellow-500/20 rounded-full">Pending Review</span>
                                    )}
                                </div>
                                <div className="mt-4 border-t border-slate-700 pt-4">
                                    {reg.confirmed ? (
                                        <div>
                                            <p className="text-sm text-slate-300 mb-3">Welcome! You can now join the exclusive WhatsApp group for this course.</p>
                                            <a href={reg.course?.whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-700">
                                                <WhatsAppIcon />
                                                <span>Join WhatsApp Group</span>
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400">We have received your payment of ₹{reg.amountPaid}. Your registration will be confirmed shortly after we verify the payment.</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 border-dashed border-2 border-slate-700 rounded-lg bg-slate-800/50">
                        <p className="text-slate-400">You haven't registered for any courses yet.</p>
                        <button onClick={() => navigate('/')} className="mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700">
                            View Available Courses
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
