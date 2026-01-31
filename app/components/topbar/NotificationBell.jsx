'use client';
import { useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';

const API_URL = 'https://admin.merchantfcservice.com/api/notification-list';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // 🔹 Load last seen time
  const lastSeenTime =
    typeof window !== 'undefined'
      ? localStorage.getItem('lastSeenNotificationTime')
      : null;

  // 🔁 API polling every 5 sec
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const stored = localStorage.getItem('token');
        const token = stored ? JSON.parse(stored).token : null;
        const res = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        setNotifications(data);

        // 🧮 Count only NEW notifications
        const newOnes = data.filter(item => {
          if (!lastSeenTime) return true;
          return new Date(item.createdAt) > new Date(lastSeenTime);
        });

        setUnreadCount(newOnes.length);
      } catch (error) {
        console.error('Notification fetch error:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);

    return () => clearInterval(interval);
  }, [lastSeenTime]);

  // ❌ Outside click close
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

  // 👀 When user opens notification
  const handleOpen = () => {
    setIsOpen(!isOpen);
    setUnreadCount(0);
    localStorage.setItem('lastSeenNotificationTime', new Date().toISOString());
  };

  return (
    <div className="relative" ref={notificationRef}>
      <div
        className="cursor-pointer p-3 rounded-full bg-[#F5F5F5]"
        onClick={handleOpen}
      >
        <FaBell className="text-xl text-secondary" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 h-96 bg-white border rounded-lg shadow-lg p-3 z-20">
          <h2 className="font-semibold mb-2">Notifications</h2>

          <div className="space-y-2 overflow-y-auto h-full">
            {notifications.length === 0 && (
              <p className="text-sm text-gray-500">No notifications</p>
            )}

            {notifications.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    item.read_data === 'unread'
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-gray-300'
                  }`}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 ">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>#{item.id}</span>
                    <span>•</span>
                    <span>User {item.user_id}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
