import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate(`/course/${course.id}`);
  };

  const discount = course.basePrice && course.earlyBirdPrice
    ? Math.round(((course.basePrice - course.earlyBirdPrice) / course.basePrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 flex flex-col h-full border border-gray-200">
      <div className="relative">
        <img
          className="w-full h-48 object-cover"
          src={course.thumbnail || 'https://placehold.co/600x400/E2E8F0/4A5568?text=PMA+Course'}
          alt={course.name}
          onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/E2E8F0/4A5568?text=Image+Not+Found'; }}
        />
        {discount > 0 && (
          <div className="absolute top-0 right-0 m-4 bg-yellow-300 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {discount}% OFF
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>
        <p className="text-gray-600 mb-4 flex-grow text-sm leading-relaxed">{course.description}</p>
        
        <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold text-blue-600">
                  ₹{course.earlyBirdPrice}
                </p>
                <p className="text-md text-gray-400 line-through">
                  ₹{course.basePrice}
                </p>
              </div>

              {/* This displays the text from the 'offerText' field in the admin form */}
              {course.offerText && (
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">
                  {course.offerText}
                </span>
              )}
            </div>

            <button
                onClick={handleRegisterClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                View Details
            </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
