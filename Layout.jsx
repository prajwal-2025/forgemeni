import React, { useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import NotificationDisplay from './NotificationDisplay';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinkClasses = "text-gray-600 transition duration-150 ease-in-out hover:text-brand-primary hover:bg-brand-light px-3 py-2 rounded-md text-base font-medium";
  const activeLinkClasses = "text-brand-primary bg-blue-100";

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              {/* This now uses a direct URL from Firebase Storage for maximum reliability. */}
              <img className="h-14 w-auto" src="https://firebasestorage.googleapis.com/v0/b/courseapp-8b8f2.firebasestorage.app/o/logo.png?alt=media&token=61959b27-673c-49c0-8a43-3e6b6bb04ed3" alt="PMA-Logo" />
              <span className="text-xl font-bold text-brand-primary-dark tracking-tight">Pathan Mining Academy</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              <NavLink to="/" className={({isActive}) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>Home</NavLink>
              <NavLink to="/student-login" className={({isActive}) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>Student Login</NavLink>
              <Link to="/login" className="bg-brand-primary shadow-sm hover:bg-brand-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Admin Login</Link>
            </div>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" className={({isActive}) => `block ${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>Home</NavLink>
            <NavLink to="/student-login" className={({isActive}) => `block ${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}>Student Login</NavLink>
            <Link to="/login" className="block bg-brand-primary text-center hover:bg-brand-primary-light text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Admin Login</Link>
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => (
    <footer className="bg-gray-800 text-white border-t-4 border-brand-primary">
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 className="text-lg font-semibold text-brand-secondary">Pathan Mining Academy</h3>
          <p className="mt-2 text-gray-400">Your partner in achieving excellence in the mining industry.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-brand-secondary">Contact Us</h3>
          <p className="mt-2 text-gray-400">Behind Bank of Baroda, Gandhi Chowk, Chandrapur, Maharashtra-442403</p>
          <p className="text-gray-400">Email: pathanminingacademy@gmail.com</p>
          <p className="text-gray-400">Phone: +91 89289-64320 , 07172-450-128</p> 
        </div>
        <div>
          <h3 className="text-lg font-semibold text-brand-secondary">Quick Links</h3>
          <ul className="mt-2 space-y-1">
            <li><Link to="/" className="hover:text-brand-secondary">Home</Link></li>
            <li><Link to="/student-login" className="hover:text-brand-secondary">Student Login</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Pathan Mining Academy. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
);

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <NotificationDisplay />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
