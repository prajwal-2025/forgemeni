// src/pages/BundleRegister.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth, functions } from '../firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';

// Helper function to convert file to base64
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

// Icons
const UploadCloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>;

export default function BundleRegister() {
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(auth.currentUser);

    const [initialLoading, setInitialLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({ name: '', email: '', phone: '', college: '' });
    const [screenshotFile, setScreenshotFile] = useState(null);
    const [priceToPay, setPriceToPay] = useState(0);

    const BUNDLE_BASE_PRICE = 3999;
    const BUNDLE_EARLY_BIRD_PRICE = 2999;
    const BUNDLE_EARLY_BIRD_SLOTS = 10;

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setCurrentUser(user);
                setFormData(prev => ({ ...prev, phone: user.phoneNumber?.replace('+91', '') || '' }));
            } else {
                localStorage.setItem('intendedPath', '/register-bundle');
                navigate('/student-login');
            }
        });
        return unsubscribe;
    }, [navigate]);

    useEffect(() => {
        const fetchBundlePrice = async () => {
            try {
                const regsQuery = query(collection(db, 'registrations'), where('courseId', '==', 'bundle'), where('confirmed', '==', true));
                const regsSnap = await getDocs(regsQuery);
                const registrationCount = regsSnap.size;

                setPriceToPay(registrationCount < BUNDLE_EARLY_BIRD_SLOTS ? BUNDLE_EARLY_BIRD_PRICE : BUNDLE_BASE_PRICE);
            } catch (err) {
                console.error("Error fetching bundle data:", err);
                setError('Failed to load registration details. Please try again.');
            } finally {
                setInitialLoading(false);
            }
        };

        if (currentUser) {
            fetchBundlePrice();
        }
    }, [currentUser]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('UPI ID copied to clipboard!', 'success');
        }, () => {
            showNotification('Failed to copy UPI ID.', 'error');
        });
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setScreenshotFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!screenshotFile) {
            showNotification("Please upload a screenshot of your payment.", "error");
            return;
        }
        setIsSubmitting(true);

        try {
            const uploadScreenshot = httpsCallable(functions, 'uploadScreenshot');
            const base64File = await toBase64(screenshotFile);
            const result = await uploadScreenshot({ file: base64File, fileName: screenshotFile.name, contentType: screenshotFile.type });
            const screenshotUrl = result.data.downloadURL;

            if (!screenshotUrl) throw new Error("Cloud function did not return a URL.");

            const docId = `${currentUser.uid}_bundle`;
            const registrationData = {
                userId: currentUser.uid,
                courseId: 'bundle',
                ...formData,
                screenshotUrl,
                priceOffered: priceToPay,
                amountPaid: priceToPay,
                paymentStatus: 'full_payment_pending',
                confirmed: false,
                registeredAt: new Date(),
            };
            
            await setDoc(doc(db, 'registrations', docId), registrationData);
            navigate('/confirmation');
        } catch (error) {
            console.error('Error submitting form:', error);
            showNotification('There was an error submitting your registration.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (initialLoading) return <div className="bg-slate-900 min-h-screen flex items-center justify-center text-white text-lg animate-pulse">Calculating your special bundle price...</div>;
    if (error) return <div className="bg-slate-900 min-h-screen flex items-center justify-center text-red-500 font-semibold text-lg">{error}</div>;

    return (
        <div className="bg-slate-900 text-white min-h-screen font-sans pt-24 pb-12 md:pt-32 md:pb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto px-4">
                <div className="bg-slate-800/50 border border-slate-700 p-6 md:p-8 rounded-2xl shadow-2xl shadow-purple-900/20">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">Register for Combined Bundle</h2>
                        <p className="text-slate-400 mt-2">You're one step away from unlocking all courses!</p>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-100 mb-4 border-b-2 border-slate-700 pb-2">Step 1: Complete Payment</h3>
                        <div className="mt-4 text-center bg-slate-900 p-6 rounded-lg">
                            <h3 className="font-bold text-lg text-purple-300">Final Price to Pay</h3>
                            <p className="text-white font-bold text-5xl my-2">₹{priceToPay}</p>
                            <p className="font-semibold text-slate-400 mt-4">Pay using UPI to the ID below:</p>
                            <div className="flex items-center justify-center bg-slate-700/50 p-2 rounded-md mt-2 max-w-xs mx-auto">
                                <p className="font-mono text-purple-300 tracking-wider">your-upi-id@okhdfcbank</p>
                                <button onClick={() => copyToClipboard('your-upi-id@okhdfcbank')} className="ml-3 text-slate-400 hover:text-white transition"><CopyIcon /></button>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-100 mb-2 border-b-2 border-slate-700 pb-2">Step 2: Fill Your Details</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Your Name' },
                                { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
                                { id: 'phone', label: 'Phone Number', type: 'tel', disabled: true },
                                { id: 'college', label: 'College Name', type: 'text', placeholder: 'Your College' }
                            ].map(field => (
                                <div key={field.id}>
                                    <label htmlFor={field.id} className="block text-sm font-medium text-slate-300 mb-1">{field.label}</label>
                                    <input type={field.type} id={field.id} name={field.id} placeholder={field.placeholder} value={formData[field.id]} onChange={handleChange} required disabled={field.disabled}
                                        className="w-full p-3 bg-slate-700/50 border-2 border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 transition disabled:bg-slate-800 disabled:text-slate-400 text-white" />
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Step 3: Upload Payment Screenshot</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <UploadCloudIcon />
                                    <div className="flex text-sm text-slate-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-purple-400 hover:text-purple-300 px-1">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} required />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-slate-500">{screenshotFile ? screenshotFile.name : 'PNG, JPG, GIF up to 10MB'}</p>
                                </div>
                            </div>
                        </div>

                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform">
                            {isSubmitting ? 'Submitting...' : 'Submit Bundle Registration'}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
