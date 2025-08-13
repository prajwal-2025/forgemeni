// src/components/NotificationDisplay.jsx
import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationDisplay() {
  const { notification } = useNotification();
  const bgColor = notification.type === 'success' ? 'bg-green-600' : notification.type === 'error' ? 'bg-red-600' : 'bg-blue-500';

  return (
    <div className="fixed top-5 right-5 z-[100]">
        <AnimatePresence>
        {notification.show && (
            <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`p-4 rounded-lg text-white shadow-lg ${bgColor}`}
            >
            {notification.message}
            </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
}
