import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowRight,
  Filter,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  LoadingSpinner,
  EmptyState,
  ErrorState,
} from "../../components/common";
import { notificationService } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'unread'

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getNotifications();
      if (res && res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications page:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
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
      console.error("Failed to mark read:", err);
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
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "RESERVATION_CREATED":
        return <Utensils className="w-5 h-5 text-brand-600" />;
      case "RESERVATION_CONFIRMED":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "RESERVATION_READY":
        return <PackageCheck className="w-5 h-5 text-sky-600" />;
      case "RESERVATION_COMPLETED":
        return <CheckCheck className="w-5 h-5 text-emerald-700" />;
      case "RESERVATION_CANCELLED":
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case "FOOD_EXPIRING":
      case "FOOD_EXPIRED":
        return <Clock className="w-5 h-5 text-amber-600" />;
      case "VERIFICATION_UPDATED":
        return <ShieldCheck className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-charcoal-600" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === "unread") return !n.isRead;
    return true;
  });

  return (
    <DashboardLayout title="Notification Center">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">
              Activity & Notifications
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Live updates on food claims, status changes, and partner
              verification records.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              iconLeft={CheckCheck}
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read ({unreadCount})
            </Button>
          )}
        </div>

        {/* Filter Bar & List Card */}
        <Card variant="default" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
            <div className="flex items-center gap-2 bg-surface-100 p-1 rounded-2xl border border-charcoal-200">
              <button
                onClick={() => setFilterTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  filterTab === "all"
                    ? "bg-brand-600 text-white shadow-soft-xs"
                    : "text-charcoal-600 hover:text-charcoal-900"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilterTab("unread")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  filterTab === "unread"
                    ? "bg-brand-600 text-white shadow-soft-xs"
                    : "text-charcoal-600 hover:text-charcoal-900"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* List Content / Loading / Error / Empty */}
          {loading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner
                size="lg"
                text="Loading notification history..."
              />
            </div>
          ) : error ? (
            <ErrorState
              title="Unable to load notifications"
              message={error}
              onRetry={fetchNotifications}
            />
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={
                filterTab === "unread"
                  ? "No unread notifications"
                  : "Notification inbox clear"
              }
              message={
                filterTab === "unread"
                  ? "You have read all current notification updates."
                  : "Important platform events and claim status updates will appear here."
              }
            />
          ) : (
            <div className="divide-y divide-charcoal-100">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleItemClick(notif)}
                  className={`
                    p-4 hover:bg-surface-50 transition-colors cursor-pointer flex items-start gap-4 rounded-2xl my-1 group relative
                    ${!notif.isRead ? "bg-brand-50/30" : ""}
                  `}
                >
                  <div className="p-2.5 rounded-2xl bg-surface-100 border border-charcoal-100 shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`text-sm ${!notif.isRead ? "font-black text-charcoal-900" : "font-bold text-charcoal-800"}`}
                      >
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <Badge variant="brand" size="sm">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-600 leading-relaxed mb-2">
                      {notif.message}
                    </p>
                    <span className="text-[11px] font-medium text-charcoal-400">
                      {new Date(notif.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notif.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1.5 text-brand-700 hover:bg-brand-50"
                        title="Mark as read"
                        onClick={(e) => handleMarkAsRead(notif._id, e)}
                      >
                        <CheckCheck className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1.5 text-charcoal-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete notification"
                      onClick={(e) => handleDelete(notif._id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
