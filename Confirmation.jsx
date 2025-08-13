import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const Confirmation = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center bg-slate-800/50 p-10 rounded-xl shadow-lg border border-slate-700">
                <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
                <h2 className="mt-6 text-3xl font-extrabold text-white">
                    Registration Submitted!
                </h2>
                <p className="mt-4 text-md text-slate-400">
                    Thank you! We've received your details and your registration is now pending review. You will be notified by our team upon confirmation.
                </p>
                <div className="mt-8">
                    <button
                        onClick={() => navigate('/')}
                        className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                        <span>Return to Home Page</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Confirmation;
