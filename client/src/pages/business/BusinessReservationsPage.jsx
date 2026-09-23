import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  Package,
  ShieldCheck,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Building2,
  MapPin,
  QrCode,
  ArrowRight,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Card,
  Badge,
  Button,
  Modal,
  LoadingSpinner,
  EmptyState,
} from "../../components/common";
import { reservationService } from "../../services/reservationService";

const TAB_FILTERS = [
  { key: "ALL", label: "All Reservations" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

const BusinessReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Confirmation Modal State
  const [selectedAction, setSelectedAction] = useState(null);
  // selectedAction shape: { reservationId, currentStatus, newStatus, actionTitle }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationService.getBusinessReservations();
      if (data && data.reservations) {
        setReservations(data.reservations);
      }
    } catch (err) {
      console.error("Failed to load business reservations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleOpenActionModal = (reservation, newStatus, actionTitle) => {
    setActionError(null);
    setSelectedAction({
      reservationId: reservation._id,
      claimCode: reservation.claimCode,
      foodName: reservation.foodId?.name || "Surplus Item",
      recipientName:
        reservation.recipientId?.organizationName ||
        reservation.recipientId?.name ||
        "NGO Recipient",
      currentStatus: reservation.status,
      newStatus,
      actionTitle,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedAction) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await reservationService.updateReservationStatus(
        selectedAction.reservationId,
        selectedAction.newStatus,
      );
      setSelectedAction(null);
      await fetchReservations();
    } catch (err) {
      setActionError(
        err.response?.data?.message || err.message || "Failed to update status",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Search logic
  const filteredReservations = reservations.filter((r) => {
    const matchesTab =
      activeTab === "ALL" || r.status?.toUpperCase() === activeTab;

    const code = (r.claimCode || "").toLowerCase();
    const foodName = (r.foodId?.name || "").toLowerCase();
    const recipientName = (
      r.recipientId?.organizationName ||
      r.recipientId?.name ||
      ""
    ).toLowerCase();

    const matchesSearch =
      !searchQuery.trim() ||
      code.includes(searchQuery.toLowerCase()) ||
      foodName.includes(searchQuery.toLowerCase()) ||
      recipientName.includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusBadgeConfig = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return { variant: "warning", label: "Pending", icon: Clock };
      case "CONFIRMED":
        return { variant: "info", label: "Confirmed", icon: CheckCircle2 };
      case "READY_FOR_PICKUP":
        return { variant: "brand", label: "Ready for Pickup", icon: Package };
      case "COMPLETED":
        return { variant: "success", label: "Completed", icon: ShieldCheck };
      case "CANCELLED":
        return { variant: "danger", label: "Cancelled", icon: XCircle };
      default:
        return { variant: "neutral", label: status || "Pending", icon: Clock };
    }
  };

  return (
    <DashboardLayout title="Business Reservation Management">
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-charcoal-900 tracking-tight">
              Order & Claim Management
            </h2>
            <p className="text-xs text-charcoal-500">
              Manage incoming NGO claims, confirm orders, and update pickup
              statuses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              iconLeft={RefreshCw}
              onClick={fetchReservations}
              disabled={loading}
            >
              Refresh Orders
            </Button>
          </div>
        </div>

        {/* Search Bar & Filter Tabs Header */}
        <Card variant="default" className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Bar Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by claim code (e.g. RPL-123456), food title, or recipient NGO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-charcoal-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
            </div>

            <div className="text-xs text-charcoal-500 font-semibold shrink-0">
              Showing {filteredReservations.length} of {reservations.length}{" "}
              total orders
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-charcoal-100 pt-3">
            {TAB_FILTERS.map((tab) => {
              const count =
                tab.key === "ALL"
                  ? reservations.length
                  : reservations.filter(
                      (r) => r.status?.toUpperCase() === tab.key,
                    ).length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5
                    ${
                      activeTab === tab.key
                        ? "bg-brand-600 text-white shadow-soft-xs"
                        : "bg-surface-100 text-charcoal-700 hover:bg-surface-200"
                    }
                  `}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeTab === tab.key
                        ? "bg-brand-700 text-white"
                        : "bg-charcoal-200 text-charcoal-800"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Main Content Area */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" text="Loading business reservations..." />
          </div>
        ) : filteredReservations.length === 0 ? (
          <EmptyState
            title="No reservations found"
            message={
              searchQuery
                ? "No orders match your search criteria."
                : "No reservations found in this status category."
            }
            actionLabel="Reset Search Filters"
            onAction={() => {
              setActiveTab("ALL");
              setSearchQuery("");
            }}
          />
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-charcoal-100 bg-white shadow-soft-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-50 text-charcoal-500 uppercase font-bold text-[10px] tracking-wider border-b border-charcoal-100">
                  <tr>
                    <th className="py-3.5 px-4">Claim Code</th>
                    <th className="py-3.5 px-4">Food Item</th>
                    <th className="py-3.5 px-4">Recipient NGO</th>
                    <th className="py-3.5 px-4">Qty</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Pickup Deadline</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100 font-medium">
                  {filteredReservations.map((r) => {
                    const statusConfig = getStatusBadgeConfig(r.status);
                    const food = r.foodId || {};
                    const recipient = r.recipientId || {};

                    return (
                      <tr
                        key={r._id}
                        className="hover:bg-surface-50 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-black text-brand-700 tracking-wider">
                          <Link
                            to={`/reservation/${r._id}`}
                            className="hover:underline flex items-center gap-1"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            {r.claimCode}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-charcoal-900">
                          {food.name || "Surplus Item"}
                        </td>
                        <td className="py-3.5 px-4 text-charcoal-800 font-semibold">
                          {recipient.organizationName ||
                            recipient.name ||
                            "NGO Recipient"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-charcoal-900">
                          {r.quantity} {food.quantityUnit || "servings"}
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-700">
                          ₹{r.totalPrice}
                        </td>
                        <td className="py-3.5 px-4 text-amber-700 font-medium">
                          {r.pickupTime || "Today before 8:30 PM"}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={statusConfig.variant}
                            size="sm"
                            icon={statusConfig.icon}
                          >
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Link to={`/reservation/${r._id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-1.5 text-charcoal-600"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>

                          {r.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() =>
                                handleOpenActionModal(
                                  r,
                                  "CONFIRMED",
                                  "Confirm Reservation",
                                )
                              }
                            >
                              Confirm
                            </Button>
                          )}

                          {r.status === "CONFIRMED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleOpenActionModal(
                                  r,
                                  "READY_FOR_PICKUP",
                                  "Mark Ready for Pickup",
                                )
                              }
                            >
                              Mark Ready
                            </Button>
                          )}

                          {r.status === "READY_FOR_PICKUP" && (
                            <Button
                              size="sm"
                              variant="primary"
                              iconLeft={CheckCircle2}
                              onClick={() =>
                                handleOpenActionModal(
                                  r,
                                  "COMPLETED",
                                  "Complete Pickup",
                                )
                              }
                            >
                              Complete
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch-Friendly Card View */}
            <div className="lg:hidden space-y-4">
              {filteredReservations.map((r) => {
                const statusConfig = getStatusBadgeConfig(r.status);
                const food = r.foodId || {};
                const recipient = r.recipientId || {};

                return (
                  <Card
                    key={r._id}
                    variant="default"
                    className="space-y-4 shadow-soft-xs"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-brand-600" />
                        <Link
                          to={`/reservation/${r._id}`}
                          className="font-black text-brand-700 text-sm tracking-wider hover:underline"
                        >
                          {r.claimCode}
                        </Link>
                      </div>
                      <Badge
                        variant={statusConfig.variant}
                        size="sm"
                        icon={statusConfig.icon}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs">
                      <h4 className="font-extrabold text-charcoal-900 text-sm">
                        {food.name || "Surplus Item"}
                      </h4>
                      <p className="text-charcoal-600">
                        Recipient:{" "}
                        <strong>
                          {recipient.organizationName || recipient.name}
                        </strong>
                      </p>
                      <div className="flex justify-between pt-2 text-charcoal-500 font-medium">
                        <span>
                          Quantity:{" "}
                          <strong>
                            {r.quantity} {food.quantityUnit || "servings"}
                          </strong>
                        </span>
                        <span>
                          Total:{" "}
                          <strong className="text-emerald-700">
                            ₹{r.totalPrice}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-charcoal-100 gap-2">
                      <Link to={`/reservation/${r._id}`}>
                        <Button size="sm" variant="ghost" iconLeft={Eye}>
                          Details
                        </Button>
                      </Link>

                      <div className="flex items-center gap-2">
                        {r.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              handleOpenActionModal(
                                r,
                                "CONFIRMED",
                                "Confirm Reservation",
                              )
                            }
                          >
                            Confirm
                          </Button>
                        )}

                        {r.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleOpenActionModal(
                                r,
                                "READY_FOR_PICKUP",
                                "Mark Ready for Pickup",
                              )
                            }
                          >
                            Mark Ready
                          </Button>
                        )}

                        {r.status === "READY_FOR_PICKUP" && (
                          <Button
                            size="sm"
                            variant="primary"
                            iconLeft={CheckCircle2}
                            onClick={() =>
                              handleOpenActionModal(
                                r,
                                "COMPLETED",
                                "Complete Pickup",
                              )
                            }
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedAction)}
        onClose={() => setSelectedAction(null)}
        title={selectedAction?.actionTitle || "Confirm Status Change"}
        size="md"
      >
        {selectedAction && (
          <div className="space-y-4 text-xs">
            <p className="text-charcoal-600 leading-relaxed">
              Are you sure you want to update the status for claim{" "}
              <strong>{selectedAction.claimCode}</strong>?
            </p>

            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
                {actionError}
              </div>
            )}

            <div className="p-4 bg-surface-50 rounded-2xl border border-charcoal-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">
                  Food Item:
                </span>
                <span className="font-bold text-charcoal-900">
                  {selectedAction.foodName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">
                  Recipient NGO:
                </span>
                <span className="font-bold text-charcoal-900">
                  {selectedAction.recipientName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">
                  Current Status:
                </span>
                <span className="font-bold text-amber-700">
                  {selectedAction.currentStatus}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-charcoal-200">
                <span className="text-charcoal-500 font-medium">
                  New Target Status:
                </span>
                <span className="font-black text-brand-700">
                  {selectedAction.newStatus}
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-charcoal-100">
              <Button
                variant="outline"
                onClick={() => setSelectedAction(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmStatusChange}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Confirm Status Transition"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default BusinessReservationsPage;
