import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  PackageCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Utensils,
  ExternalLink,
} from "lucide-react";
import { notificationService } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getNotifications();
      if (res && res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Failed to load notifications:", err.message);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      const target = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif._id);
    }
    setIsOpen(false);

    // Determine target route based on notification type
    const type = notif.type;
    const relatedId = notif.relatedId;

    if (type.startsWith("RESERVATION_")) {
      if (userRole === "business") {
        navigate("/business/reservations");
      } else if (userRole === "recipient") {
        navigate("/recipient/dashboard");
      } else {
        navigate(relatedId ? `/reservation/${relatedId}` : "/dashboard");
      }
    } else if (type.startsWith("FOOD_")) {
      navigate(relatedId ? `/food/${relatedId}` : "/food");
    } else if (type === "VERIFICATION_UPDATED") {
      navigate("/profile");
    } else {
      navigate("/notifications");
    }
  };

  // Helper icon mapper
  const getNotificationIcon = (type) => {
    switch (type) {
      case "RESERVATION_CREATED":
        return <Utensils className="w-4 h-4 text-brand-600" />;
      case "RESERVATION_CONFIRMED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "RESERVATION_READY":
        return <PackageCheck className="w-4 h-4 text-sky-600" />;
      case "RESERVATION_COMPLETED":
        return <CheckCheck className="w-4 h-4 text-emerald-700" />;
      case "RESERVATION_CANCELLED":
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case "FOOD_EXPIRING":
      case "FOOD_EXPIRED":
        return <Clock className="w-4 h-4 text-amber-600" />;
      case "VERIFICATION_UPDATED":
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-charcoal-600" />;
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const diffSeconds = Math.floor((new Date() - date) / 1000);

    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2.5 rounded-xl text-charcoal-700 hover:bg-charcoal-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-soft-xs animate-in zoom-in-50">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-charcoal-100 shadow-soft-xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3.5 bg-surface-50 border-b border-charcoal-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-charcoal-900 text-sm">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 font-extrabold text-[10px]">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-charcoal-100">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-charcoal-500 font-medium">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="py-8 text-center text-xs text-rose-600 font-medium px-4">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center px-4">
                <Bell className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-charcoal-700">
                  No notifications yet
                </p>
                <p className="text-[11px] text-charcoal-500 mt-0.5">
                  Updates on food claims and account status will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleItemClick(notif)}
                  className={`
                    p-3.5 hover:bg-surface-50 transition-colors cursor-pointer flex items-start gap-3 group relative
                    ${!notif.isRead ? "bg-brand-50/40" : ""}
                  `}
                >
                  {/* Type Icon */}
                  <div className="p-2 rounded-xl bg-surface-100 border border-charcoal-100 shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Body Text */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={`text-xs font-bold truncate ${!notif.isRead ? "text-charcoal-900 font-black" : "text-charcoal-700"}`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-charcoal-400 font-medium shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-charcoal-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  {/* Unread Indicator & Delete Button */}
                  <div className="absolute right-3 top-3.5 flex items-center gap-1.5">
                    {!notif.isRead && (
                      <span
                        className="w-2 h-2 rounded-full bg-brand-600 shrink-0"
                        title="Unread"
                      />
                    )}
                    <button
                      onClick={(e) => handleDelete(notif._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-charcoal-400 hover:text-rose-600 rounded transition-opacity"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-surface-50 border-t border-charcoal-100 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-extrabold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
            >
              <span>View all notifications</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
