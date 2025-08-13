import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import CourseForm from '../components/CourseForm';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 9 7c0 1.3.5 2.6 1.5 3.5.7.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => (
    <Modal isOpen={isOpen} onClose={onClose}>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-slate-400 mt-2 text-sm">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold bg-slate-600 hover:bg-slate-500 text-white transition">Cancel</button>
            <button onClick={onConfirm} className="px-4 py-2 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition">Confirm</button>
        </div>
    </Modal>
);

const RegistrationsList = ({ regs, search, filter, onConfirm }) => {
    const filterLogic = (r) => {
        if (filter === 'all') return true;
        if (filter === 'confirmed') return r.confirmed;
        if (filter === 'pending') return !r.confirmed;
        return false;
    };
    const filtered = regs.filter(filterLogic).filter(r => (r.name?.toLowerCase() || '').includes(search.toLowerCase()) || (r.phone || '').includes(search));

    const getStatusPill = (reg) => {
        if (reg.confirmed) return <span className="px-2 py-1 text-xs font-semibold text-green-300 bg-green-500/20 rounded-full">Confirmed</span>;
        if (reg.paymentStatus === 'full_payment_pending') return <span className="px-2 py-1 text-xs font-semibold text-yellow-300 bg-yellow-500/20 rounded-full">Pending Full Payment</span>;
        if (reg.paymentStatus === 'seat_lock_pending') return <span className="px-2 py-1 text-xs font-semibold text-blue-300 bg-blue-500/20 rounded-full">Pending Seat Lock</span>;
        return <span className="px-2 py-1 text-xs font-semibold text-slate-300 bg-slate-500/20 rounded-full">Pending</span>;
    };

    return (
        <div className="space-y-4">
            {filtered.length === 0 ? <p className="text-center text-slate-500 py-8">No registrations found.</p> : filtered.map(r => (
                <div key={r.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-lg text-white">{r.name || 'No Name'}</p>
                            <p className="text-sm text-slate-400">{r.phone || 'No Phone'} | {r.college || 'N/A'}</p>
                        </div>
                        {getStatusPill(r)}
                    </div>
                    <div className="mt-3 border-t border-slate-700 pt-3 text-sm text-slate-300 space-y-1">
                        <p><strong>Course:</strong> <span className="font-semibold text-purple-400">{r.courseId === 'bundle' ? 'Combined Course Bundle' : r.courseId?.toUpperCase()}</span></p>
                        {r.isFromBundle && <p className="text-xs text-purple-400">(Part of a bundle purchase)</p>}
                        <p><strong>Payment:</strong> Paid ₹{r.amountPaid} (Offered: ₹{r.priceOffered})</p>
                        <p><strong>Screenshot:</strong> {r.screenshotUrl ? <a href={r.screenshotUrl} target="_blank" rel="noreferrer" className="underline text-indigo-400 hover:text-indigo-300">View Screenshot</a> : 'None'}</p>
                    </div>
                    {!r.confirmed && <div className="mt-4 text-right"><button onClick={() => onConfirm(r)} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-md transition-colors text-sm">Confirm Registration</button></div>}
                </div>
            ))}
        </div>
    );
};

export default function Admin() {
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [view, setView] = useState('registrations');
    
    const [regs, setRegs] = useState([]);
    const [regLoading, setRegLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(true);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser && currentUser.email) { // Simple check for admin
                setUser(currentUser);
            } else {
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        
        const unsubRegs = onSnapshot(collection(db, 'registrations'), (snapshot) => {
            setRegs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            setRegLoading(false);
        });
        
        const unsubCourses = onSnapshot(collection(db, 'courses'), (snapshot) => {
            setCourses(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            setCoursesLoading(false);
        });

        const unsubSuggestions = onSnapshot(collection(db, 'suggestions'), (snapshot) => {
            setSuggestions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            setSuggestionsLoading(false);
        });

        return () => {
            unsubRegs();
            unsubCourses();
            unsubSuggestions();
        };
    }, [user]);

    const handleConfirmRegistration = (reg) => {
        setConfirmModal({
            isOpen: true,
            title: "Confirm Registration?",
            message: `Are you sure you have verified the payment for ${reg.name}? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    await updateDoc(doc(db, 'registrations', reg.id), { confirmed: true });
                    showNotification("Registration confirmed!", "success");
                } catch (error) {
                    showNotification("Failed to confirm registration.", "error");
                    console.error(error);
                } finally {
                    setConfirmModal({ isOpen: false });
                }
            }
        });
    };
    
    // THIS IS THE CORRECTED FUNCTION
    const handleSaveCourse = async (courseData) => {
        // Prevent slashes in the course code, as they create invalid paths.
        if (courseData.courseCode.includes('/')) {
            showNotification('Error: Course Code cannot contain a forward slash ("/").', 'error');
            return;
        }

        try {
            // This is the key fix:
            // If we are editing, use the ID from the `editingCourse` state.
            // If we are creating, use the new `courseCode` from the form.
            const docId = editingCourse ? editingCourse.id : courseData.courseCode.toLowerCase();
            const courseRef = doc(db, 'courses', docId);

            // Save the data using setDoc to either create or overwrite.
            await setDoc(courseRef, courseData, { merge: true });
            
            showNotification(editingCourse ? "Course updated!" : "Course added!", "success");
            closeModal();
        } catch (error) {
            showNotification("Failed to save course. Check console for details.", "error");
            console.error("Firebase save error: ", error);
        }
    };
    
    const handleDeleteCourse = (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Course?",
            message: `Are you sure you want to delete this course (${id.toUpperCase()})? This cannot be undone.`,
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'courses', id));
                    showNotification("Course deleted.", "success");
                } catch (error) {
                    showNotification("Failed to delete course.", "error");
                    console.error(error);
                } finally {
                    setConfirmModal({ isOpen: false });
                }
            }
        });
    };

    const openModal = (course = null) => {
        setEditingCourse(course);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCourse(null);
    };

    if (!user) return <div className="bg-slate-900 min-h-screen flex items-center justify-center text-white">Checking authentication...</div>;

    const renderView = () => {
        switch (view) {
            case 'registrations':
                return (
                    <div>
                        <div className="flex flex-col md:flex-row gap-3 mb-4 items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <div className="flex gap-2">
                                {['all', 'pending', 'confirmed'].map(f => <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-md text-sm font-semibold transition ${filter === f ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>)}
                            </div>
                            <input type="text" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} className="w-full md:w-auto md:ml-auto px-3 py-2 bg-slate-700/50 border-2 border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"/>
                        </div>
                        {regLoading ? <p className="text-center text-slate-400 py-4">Loading registrations...</p> : <RegistrationsList regs={regs} search={search} filter={filter} onConfirm={handleConfirmRegistration} />}
                    </div>
                );
            case 'courses':
                return (
                    <div>
                        <div className="text-right mb-4">
                            <button onClick={() => openModal()} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md">Add New Course</button>
                        </div>
                        {coursesLoading ? <p className="text-center text-slate-400 py-4">Loading courses...</p> : (
                            <div className="space-y-4">
                                {courses.map(c => (
                                    <div key={c.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-white">{c.name}</p>
                                            <p className="text-sm text-slate-400">{c.id.toUpperCase()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openModal(c)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-md text-sm">Edit</button>
                                            <button onClick={() => handleDeleteCourse(c.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md text-sm">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'suggestions':
                return (
                    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
                        {suggestionsLoading ? <p className="text-center text-slate-400 py-4">Loading suggestions...</p> : (
                            <div className="space-y-4">
                                {suggestions.length === 0 ? <p className="text-center text-slate-500 py-4">No suggestions yet.</p> : suggestions.map(s => (
                                    <div key={s.id} className="border-b border-slate-700 p-4 last:border-b-0">
                                        <p className="font-semibold text-white">"{s.text}"</p>
                                        <p className="text-xs text-slate-400 mt-2">By: {s.userPhone || s.userId} on {new Date(s.submittedAt.seconds * 1000).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <ConfirmationModal {...confirmModal} onClose={() => setConfirmModal({ isOpen: false })} />
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <CourseForm onSave={handleSaveCourse} onCancel={closeModal} course={editingCourse} />
            </Modal>
            <header className="bg-slate-800/80 backdrop-blur-sm shadow-md border-b border-slate-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                    <button onClick={() => signOut(auth)} className="bg-red-600/80 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition">
                        <LogOutIcon />
                        <span>Log out</span>
                    </button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-b border-slate-700 mb-6">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {[
                                { key: 'registrations', label: 'Registrations', icon: <UsersIcon /> },
                                { key: 'courses', label: 'Courses', icon: <BookOpenIcon /> },
                                { key: 'suggestions', label: 'Suggestions', icon: <LightbulbIcon /> }
                            ].map(tab => (
                                <button key={tab.key} onClick={() => setView(tab.key)} className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition ${view === tab.key ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}>
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderView()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
