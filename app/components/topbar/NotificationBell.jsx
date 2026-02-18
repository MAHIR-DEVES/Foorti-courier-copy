'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { FaBell } from 'react-icons/fa';

const API_URL = 'https://admin.merchantfcservice.com/api/notification-list';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // Helper function to get notification timestamp
  const getNotificationTimestamp = (item) => {
    // Try different possible timestamp fields
    const timestamp = item.createdAt || item.created_at || item.date || item.timestamp;
    
    if (!timestamp) {
      console.warn('Notification missing timestamp field:', item);
      return null;
    }
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp for notification:', item.id, timestamp);
      return null;
    }
    
    return date;
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const stored = localStorage.getItem('token');
      const token = stored ? JSON.parse(stored).token : null;
      
      if (!token) return;

      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      
      // Validate and process notifications
      const validNotifications = data.filter(item => {
        const timestamp = getNotificationTimestamp(item);
        return timestamp !== null;
      });
      
      setNotifications(validNotifications);

      // Get last seen time
      const lastSeen = localStorage.getItem('lastSeenNotificationTime');
      
      // Count unread notifications (created after lastSeen)
      let newCount = 0;
      
      if (!lastSeen) {
        // First time user - all notifications are unread
        newCount = validNotifications.length;
      } else {
        const lastSeenDate = new Date(lastSeen);
        
        if (isNaN(lastSeenDate.getTime())) {
          console.warn('Invalid lastSeenNotificationTime in localStorage:', lastSeen);
          // If last seen time is invalid, treat all as unread
          newCount = validNotifications.length;
        } else {
          // Count notifications newer than last seen time
          newCount = validNotifications.filter(item => {
            const itemDate = getNotificationTimestamp(item);
            return itemDate && itemDate > lastSeenDate;
          }).length;
        }
      }

      setUnreadCount(newCount);
      
      // Debug logging (remove in production)
      console.log('Notifications fetched:', {
        total: validNotifications.length,
        unread: newCount,
        lastSeen: lastSeen
      });
      
    } catch (error) {
      console.error('Notification fetch error:', error);
    }
  }, []);

  // Polling every 5 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = e => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle bell click
  const handleBellClick = () => {
    if (!isOpen) {
      // Opening the dropdown - mark all as read
      const currentTime = new Date().toISOString();
      try {
        localStorage.setItem('lastSeenNotificationTime', currentTime);
        // Remove the red mark immediately
        setUnreadCount(0); 
        console.log('Marked all notifications as read at:', currentTime);
      } catch (error) {
        console.error('Failed to save last seen time:', error);
      }
    }
    setIsOpen(!isOpen);
  };

  // Initialize last seen time if it doesn't exist
  useEffect(() => {
    const lastSeen = localStorage.getItem('lastSeenNotificationTime');
    if (!lastSeen) {
      // Set initial last seen time to current time for new users
      const currentTime = new Date().toISOString();
      try {
        localStorage.setItem('lastSeenNotificationTime', currentTime);
        console.log('Initialized last seen time:', currentTime);
      } catch (error) {
        console.error('Failed to initialize last seen time:', error);
      }
    }
  }, []);

  return (
    <div className="relative inline-block" ref={notificationRef}>
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <FaBell className="w-6 h-6 text-gray-600" />
        
        {/* Unread count badge - shows only when there are unread notifications */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[1.25rem] h-5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown - fixed width and responsive */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border rounded-lg shadow-lg z-50 max-h-[32rem] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b bg-white rounded-t-lg">
            <h3 className="text-sm font-semibold text-gray-700">
              Notifications
              {notifications.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({notifications.length} total)
                </span>
              )}
            </h3>
          </div>

          {/* Notifications list with proper overflow handling */}
          <div className="overflow-y-auto flex-1 max-h-[400px]">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm text-gray-800 break-words pr-2">
                      {item.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 mt-1 text-xs text-gray-500">
                      <span>#{item.id}</span>
                      <span>•</span>
                      <span>User {item.user_id}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;