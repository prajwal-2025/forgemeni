import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, User, BookOpen, Clock } from 'lucide-react';

const CourseDetail = () => {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourse = async () => {
            if (!id) {
                setLoading(false);
                return;
            };
            try {
                const docRef = doc(db, 'courses', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setCourse({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching course: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handleRegisterClick = () => {
        const studentData = sessionStorage.getItem('student');
        const targetUrl = course.id === 'bundle' ? '/register-bundle' : `/register/${id}`;

        if (studentData) {
            navigate(targetUrl);
        } else {
            sessionStorage.setItem('redirectUrl', targetUrl);
            navigate('/student-login');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[80vh]">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!course) {
        return <div className="text-center py-20 text-xl text-gray-600">Course not found.</div>;
    }

    const discount = course.basePrice && course.earlyBirdPrice
        ? Math.round(((course.basePrice - course.earlyBirdPrice) / course.basePrice) * 100)
        : 0;

    return (
        <div className="bg-white">
            <div className="bg-slate-900 text-white py-12 sm:py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{course.name}</h1>
                    <div className="flex items-center mt-4 text-lg text-slate-300">
                        <User size={20} className="mr-2" />
                        <span>Taught by {course.instructor}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2">
                        <img 
                            src={course.thumbnail} 
                            alt={course.name} 
                            className="w-full rounded-lg shadow-2xl mb-8 aspect-video object-cover"
                        />
                        
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                                    <BookOpen size={28} /> About This Course
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{course.description}</p>
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-4">What You'll Learn</h2>
                                <ul className="space-y-3">
                                    {course.highlights?.map((highlight, index) => (
                                        <li key={index} className="flex items-start">
                                            <CheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" size={20} />
                                            <span className="text-gray-700">{highlight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg shadow-lg p-6 sticky top-28">
                            <h3 className="text-2xl font-bold text-center mb-4 text-slate-800">Enroll Now</h3>
                            
                            <div className="text-center mb-4">
                                <span className="text-4xl font-bold text-purple-600">₹{course.earlyBirdPrice}</span>
                                <span className="text-xl text-slate-500 line-through ml-2">₹{course.basePrice}</span>
                            </div>

                            {discount > 0 && (
                                <div className="text-center text-green-700 font-semibold mb-4 bg-green-100 py-2 rounded-md">
                                    You save {discount}% with the early bird price!
                                </div>
                            )}

                            <button 
                                onClick={handleRegisterClick}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                Register Now
                            </button>
                            
                            <div className="text-center mt-4 text-sm text-slate-500 flex items-center justify-center">
                                <Clock size={16} className="mr-1.5" />
                                <span>{course.earlyBirdSlots} early bird slots remaining!</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
