import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import CourseCard from '../components/CourseCard'; // Ensures the correct component is used
import SuggestionBox from '../components/SuggestionBox';
import { BookOpen, Target, Award } from 'lucide-react';

const Feature = ({ icon, title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
    <div className="flex justify-center items-center mb-4 text-brand-primary">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative text-center py-20 sm:py-32 px-4 bg-white">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
          <div className="relative z-10 container mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-dark tracking-tighter mb-4">
              Master the Mines, Master Your Future
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              High-quality, exam-focused courses designed to propel your career in the mining industry.
            </p>
          </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Feature icon={<BookOpen size={40} />} title="Expert-Led Content">
              Learn from seasoned professionals with real-world mining experience.
            </Feature>
            <Feature icon={<Target size={40} />} title="Exam-Focused">
              Our curriculum is tailored to help you ace certification and competitive exams.
            </Feature>
            <Feature icon={<Award size={40} />} title="Guaranteed Results">
              We're confident in our methods. Follow our path and see guaranteed improvement.
            </Feature>
          </div>
        </div>
      </section>

      {/* Available Courses Section */}
      <section id="courses" className="container mx-auto px-4 py-16 sm:py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-brand-dark mb-10">Available Courses</h2>
        {loading ? (
          <div className="text-center text-gray-600">Loading courses...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* This now correctly renders a CourseCard for each course */}
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Suggestion Box Section */}
      <SuggestionBox />
    </div>
  );
};

export default Home;
