// src/context/NotificationContext.jsx
import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ message: '', type: 'success', show: false });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(n => ({ ...n, show: false }));
    }, 4000); // Hide after 4 seconds
  };

  return (
    <NotificationContext.Provider value={{ showNotification, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};
