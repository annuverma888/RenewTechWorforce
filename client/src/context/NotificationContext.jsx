import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const DEFAULT_NOTIFICATIONS = [
    {
      _id: 'notif-1',
      title: 'New project matching your skills',
      message: '150MW Rewa Solar Park is looking for PV Wiremen with your verified skills.',
      link: '/projects',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'notif-2',
      title: 'Application shortlisted',
      message: 'Tata Power Renewable has shortlisted your application for Solar PV Installation.',
      link: '/technician/applications',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      _id: 'notif-3',
      title: 'Certificate verified',
      message: 'Your SCGJ Solar PV Installer Level 4 certificate was verified by administrator.',
      link: '/technician/certificates',
      isRead: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: 'notif-4',
      title: 'Interview scheduled',
      message: 'Interview with GreenVolt Energy scheduled for tomorrow at 11:00 AM.',
      link: '/technician/applications',
      isRead: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      _id: 'notif-5',
      title: 'Technician hired',
      message: 'Rahul Kumar was mobilized and hired for 50MW Jaisalmer Wind Project.',
      link: '/epc/workforce',
      isRead: true,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      _id: 'notif-6',
      title: 'Project completed',
      message: 'Bhadla Solar Phase IV milestone successfully marked completed.',
      link: '/epc/workforce',
      isRead: true,
      createdAt: new Date(Date.now() - 345600000).toISOString(),
    },
  ];

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await notificationAPI.getAll();
      if (res.data?.success && res.data.data?.length > 0) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount || res.data.data.filter(n => !n.isRead).length);
      } else {
        setNotifications(DEFAULT_NOTIFICATIONS);
        setUnreadCount(DEFAULT_NOTIFICATIONS.filter(n => !n.isRead).length);
      }
    } catch (err) {
      setNotifications(DEFAULT_NOTIFICATIONS);
      setUnreadCount(DEFAULT_NOTIFICATIONS.filter(n => !n.isRead).length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds for live notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
