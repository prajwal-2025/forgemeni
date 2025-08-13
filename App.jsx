// src/App.jsx
import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';

// Lazy-loaded pages for better performance
const Home = lazy(() => import('./pages/Home'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const StudentLogin = lazy(() => import('./pages/StudentLogin'));
const RegisterForm = lazy(() => import('./pages/RegisterForm'));
const BundleRegister = lazy(() => import('./pages/BundleRegister'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const StudentHome = lazy(() => import('./pages/StudentHome'));
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));
const Suggestion = lazy(() => import('./pages/Suggestion'));

const LoadingFallback = () => (
    <div className="flex justify-center items-center h-[80vh] bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
    </div>
);

export default function App() {
    return (
        <NotificationProvider>
            <ErrorBoundary>
                <Router>
                    <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                            <Route path="/" element={<Layout />}>
                                <Route index element={<Home />} />
                                <Route path="course/:id" element={<CourseDetail />} />
                                <Route path="student-login" element={<StudentLogin />} />
                                <Route path="register/:id" element={<RegisterForm />} />
                                <Route path="register-bundle" element={<BundleRegister />} />
                                <Route path="confirmation" element={<Confirmation />} />
                                <Route path="student-home" element={<StudentHome />} />
                                <Route path="admin" element={<Admin />} />
                                <Route path="login" element={<Login />} />
                                <Route path="suggestion" element={<Suggestion />} />
                                <Route path="*" element={<div className="text-white text-center p-8">404 - Page Not Found</div>} />
                            </Route>
                        </Routes>
                    </Suspense>
                </Router>
            </ErrorBoundary>
        </NotificationProvider>
    );
}
