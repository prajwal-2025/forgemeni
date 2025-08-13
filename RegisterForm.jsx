import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useNotification } from '../context/NotificationContext';
import { UploadCloud, Clipboard, Check, AlertCircle } from 'lucide-react';

const RegisterForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({ name: '', email: '', phone: '', college: '' });
    const [paymentOption, setPaymentOption] = useState('full');
    const [screenshot, setScreenshot] = useState(null);

    const UPI_ID = 'pathanminingacademy.62732523@hdfcbank';
    const UPI_NAME = 'Pathan Mining Academy';

    useEffect(() => {
        const studentDataString = sessionStorage.getItem('student');
        if (studentDataString) {
            const studentData = JSON.parse(studentDataString);
            setFormData(prev => ({ 
                ...prev, 
                phone: studentData.phone || '',
                name: studentData.name || ''
            }));
        }
    }, []);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'courses', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setCourse({ id: docSnap.id, ...docSnap.data() });
                } else {
                    showNotification('Course not found.', 'error');
                }
            } catch (error) {
                console.error("Error fetching course:", error);
                showNotification('Failed to load course details.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, showNotification]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setScreenshot(e.target.files[0]);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(UPI_ID);
        setCopied(true);
        showNotification('UPI ID copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!screenshot) {
            showNotification('Please upload a payment screenshot.', 'error');
            return;
        }
        setSubmitting(true);

        try {
            const screenshotRef = ref(storage, `screenshots/${id}/${Date.now()}_${screenshot.name}`);
            const uploadResult = await uploadBytes(screenshotRef, screenshot);
            const screenshotUrl = await getDownloadURL(uploadResult.ref);

            const registrationData = {
                ...formData,
                courseId: id,
                courseName: course.name,
                paymentOption,
                amountPaid: paymentOption === 'full' ? course.earlyBirdPrice : 99,
                priceOffered: course.earlyBirdPrice,
                screenshotUrl,
                confirmed: false,
                paymentStatus: paymentOption === 'full' ? 'full_payment_received' : 'seat_lock_pending',
                registeredAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'registrations'), registrationData);
            
            navigate('/confirmation');

        } catch (error) {
            console.error("Error submitting registration:", error);
            showNotification('Submission failed. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center py-20">Loading course details...</div>;
    }

    if (!course) {
        return <div className="text-center py-20">Could not load course. Please go back and try again.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{course.name}</h1>
                    <p className="mt-2 text-lg text-slate-400">Complete the steps below to secure your spot.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-800/50 p-8 rounded-xl shadow-lg border border-slate-700 space-y-8">
                    
                    {/* Step 1: Fill Your Details */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Step 1: Fill Your Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required className="w-full p-3 bg-slate-700/50 border-2 border-slate-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white" />
                            <input type="email" name="email" placeholder="Email Address" onChange={handleInputChange} required className="w-full p-3 bg-slate-700/50 border-2 border-slate-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white" />
                            <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} required className="w-full p-3 bg-slate-700/50 border-2 border-slate-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white" />
                            <input type="text" name="college" placeholder="Your College" onChange={handleInputChange} required className="w-full p-3 bg-slate-700/50 border-2 border-slate-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white" />
                        </div>
                    </div>
                    
                    {/* Step 2: Choose Payment Option */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Step 2: Choose Payment Option</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div onClick={() => setPaymentOption('full')} className={`p-6 border-2 rounded-lg cursor-pointer transition ${paymentOption === 'full' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600 hover:border-purple-500'}`}>
                                <h4 className="font-bold text-lg text-white">Pay in Full</h4>
                                <p className="text-3xl font-extrabold text-purple-400 mt-2">₹{course.earlyBirdPrice}</p>
                            </div>
                            <div onClick={() => setPaymentOption('seat_lock')} className={`p-6 border-2 rounded-lg cursor-pointer transition ${paymentOption === 'seat_lock' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600 hover:border-purple-500'}`}>
                                <h4 className="font-bold text-lg text-white">Lock Your Seat</h4>
                                <p className="text-3xl font-extrabold text-purple-400 mt-2">₹99</p>
                            </div>
                        </div>
                        <div className="mt-6 text-center bg-slate-700/50 p-4 rounded-lg">
                            <p className="text-sm text-slate-400 mb-2">Copy our UPI ID</p>
                            <div className="flex items-center justify-center bg-slate-800 border border-slate-600 rounded-md px-3 py-2">
                                <span className="font-mono text-slate-200">{UPI_ID}</span>
                                <button type="button" onClick={copyToClipboard} className="ml-4 p-1.5 rounded-md hover:bg-slate-700 transition">
                                    {copied ? <Check className="text-green-400" size={16} /> : <Clipboard size={16} className="text-slate-400"/>}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Payment */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Step 3: Payment</h3>
                        <div className="bg-yellow-500/10 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                            <div className="flex">
                                <div className="flex-shrink-0"><AlertCircle className="h-5 w-5 text-yellow-400" /></div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-200">
                                        Open your UPI app, paste the copied ID, and before paying, please verify the name is <strong className="font-bold">"{UPI_NAME}"</strong>.
                                        Take a screenshot after payment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Step 4: Upload Payment Screenshot */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Step 4: Upload Payment Screenshot</h3>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-slate-500" />
                                <div className="flex text-sm text-slate-400">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-purple-400 hover:text-purple-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500 px-1">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" required />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-slate-500">{screenshot ? screenshot.name : 'PNG, JPG, GIF up to 10MB'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button type="submit" disabled={submitting} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-opacity-50">
                            {submitting ? 'Submitting...' : 'Submit Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
