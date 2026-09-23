import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  QrCode,
  Clock,
  CheckCircle2,
  Package,
  ShieldCheck,
  Building2,
  User,
  MapPin,
  Phone,
  AlertTriangle,
  XCircle,
  Calendar,
} from "lucide-react";

import {
  Card,
  Badge,
  Button,
  Modal,
  LoadingSpinner,
  EmptyState,
} from "../../components/common";
import { reservationService } from "../../services/reservationService";
import { useAuth } from "../../context/AuthContext";

const TIMELINE_STEPS = [
  { status: "PENDING", label: "Reservation Placed", icon: Clock },
  { status: "CONFIRMED", label: "Order Confirmed", icon: CheckCircle2 },
  { status: "READY_FOR_PICKUP", label: "Ready for Pickup", icon: Package },
  { status: "COMPLETED", label: "Pickup Completed", icon: ShieldCheck },
];

const ReservationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Change Modal State
  const [targetStatus, setTargetStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchReservationDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationService.getReservationById(id);
      if (data && data.reservation) {
        setReservation(data.reservation);
      } else {
        setError("Reservation details not found");
      }
    } catch (err) {
      console.error("Error fetching reservation:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to access reservation details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservationDetail();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!targetStatus) return;
    setIsSubmitting(true);
    setModalError(null);
    try {
      if (targetStatus === "CANCEL_RECIPIENT") {
        await reservationService.cancelReservation(reservation._id);
      } else {
        await reservationService.updateReservationStatus(
          reservation._id,
          targetStatus,
        );
      }
      setTargetStatus(null);
      await fetchReservationDetail();
    } catch (err) {
      setModalError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update reservation status",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <LoadingSpinner
          size="lg"
          text="Loading reservation timeline details..."
        />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="Reservation Access Error"
          message={
            error ||
            "You may not have permission to view this reservation or it does not exist."
          }
          actionLabel="Return to Console"
          onAction={() => navigate(-1)}
        />
      </div>
    );
  }

  const food = reservation.foodId || {};
  const business = reservation.businessId || {};
  const recipient = reservation.recipientId || {};

  const currentStatus = reservation.status?.toUpperCase();
  const isCancelled = currentStatus === "CANCELLED";

  const getStepIndex = (status) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "CONFIRMED":
        return 1;
      case "READY_FOR_PICKUP":
        return 2;
      case "COMPLETED":
        return 3;
      default:
        return -1;
    }
  };
  const activeStepIdx = getStepIndex(currentStatus);

  const isBusinessUser = userRole === "business" || userRole === "admin";
  const isRecipientUser = userRole === "recipient" || userRole === "admin";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Navigation */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-600 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Main Reservation Card Header */}
      <Card variant="default" className="shadow-soft-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold border border-brand-200 shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black tracking-widest text-brand-700 uppercase block">
                Claim Code: {reservation.claimCode}
              </span>
              <h1 className="text-xl font-black text-charcoal-900 tracking-tight">
                {food.name || "Surplus Food Claim"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Badge
              variant={
                isCancelled
                  ? "danger"
                  : currentStatus === "COMPLETED"
                    ? "success"
                    : currentStatus === "READY_FOR_PICKUP"
                      ? "brand"
                      : "warning"
              }
              size="lg"
              showDot
            >
              {reservation.status}
            </Badge>
          </div>
        </div>

        {/* Visual Progress Timeline (If not cancelled) */}
        {!isCancelled ? (
          <div className="py-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-500 mb-4">
              Reservation Timeline Progress
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
              {TIMELINE_STEPS.map((step, idx) => {
                const isDone = activeStepIdx >= idx;
                const isCurrent = activeStepIdx === idx;
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.status}
                    className={`
                      p-3.5 rounded-2xl border transition-all flex flex-col items-start space-y-2
                      ${
                        isCurrent
                          ? "bg-brand-50 border-brand-300 text-brand-900 shadow-soft-xs"
                          : isDone
                            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                            : "bg-surface-50 border-charcoal-100 text-charcoal-400"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        Step {idx + 1}
                      </span>
                      <StepIcon className="w-4 h-4 shrink-0" />
                    </div>
                    <span className="font-extrabold text-xs leading-snug">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-900 text-xs flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <p className="font-extrabold">Reservation Cancelled</p>
              <p className="text-[11px] text-red-700">
                This food claim was cancelled on{" "}
                {new Date(
                  reservation.cancelledAt || reservation.updatedAt,
                ).toLocaleString()}
                . Restored stock is back in available inventory.
              </p>
            </div>
          </div>
        )}

        {/* Food Details & Pricing Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-charcoal-100">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-500">
              Food Specification & Claim Summary
            </h3>
            <div className="p-4 bg-surface-50 rounded-2xl border border-charcoal-100 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">
                  Food Name:
                </span>
                <span className="font-bold text-charcoal-900">{food.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">Category:</span>
                <span className="font-semibold text-brand-700">
                  {food.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">
                  Claimed Quantity:
                </span>
                <span className="font-extrabold text-charcoal-900">
                  {reservation.quantity} {food.quantityUnit || "servings"}
                </span>
              </div>
              <div className="flex justify-between border-t border-charcoal-200 pt-2">
                <span className="text-charcoal-500 font-medium">
                  Unit Price:
                </span>
                <span className="font-bold text-charcoal-900">
                  ₹{food.price || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">
                  Total Recovery Amount:
                </span>
                <span className="font-black text-emerald-700 text-sm">
                  ₹{reservation.totalPrice}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-500">
              Pickup Instructions & Schedule
            </h3>
            <div className="p-4 bg-surface-50 rounded-2xl border border-charcoal-100 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">
                  Pickup Window:
                </span>
                <span className="font-extrabold text-amber-700">
                  {reservation.pickupTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">
                  Reserved Timestamp:
                </span>
                <span className="font-medium text-charcoal-800">
                  {new Date(
                    reservation.reservedAt || reservation.createdAt,
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-charcoal-200 pt-2">
                <span className="text-charcoal-500 font-medium">
                  Commercial Donor:
                </span>
                <span className="font-bold text-charcoal-900">
                  {business.organizationName ||
                    business.name ||
                    "Commercial Kitchen Partner"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">
                  Recipient Partner:
                </span>
                <span className="font-bold text-charcoal-900">
                  {recipient.organizationName ||
                    recipient.name ||
                    "Verified NGO"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="pt-4 border-t border-charcoal-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-charcoal-500 font-medium">
            Authorized portal role:{" "}
            <strong className="capitalize text-charcoal-800">{userRole}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Business Status Actions */}
            {isBusinessUser && currentStatus === "PENDING" && (
              <Button
                variant="primary"
                onClick={() => setTargetStatus("CONFIRMED")}
              >
                Confirm Reservation
              </Button>
            )}

            {isBusinessUser && currentStatus === "CONFIRMED" && (
              <Button
                variant="outline"
                onClick={() => setTargetStatus("READY_FOR_PICKUP")}
              >
                Mark Ready for Pickup
              </Button>
            )}

            {isBusinessUser && currentStatus === "READY_FOR_PICKUP" && (
              <Button
                variant="primary"
                iconLeft={CheckCircle2}
                onClick={() => setTargetStatus("COMPLETED")}
              >
                Complete Pickup
              </Button>
            )}

            {isBusinessUser &&
              !["COMPLETED", "CANCELLED"].includes(currentStatus) && (
                <Button
                  variant="danger"
                  onClick={() => setTargetStatus("CANCELLED")}
                >
                  Cancel Order
                </Button>
              )}

            {/* Recipient Action */}
            {isRecipientUser &&
              ["PENDING", "CONFIRMED"].includes(currentStatus) && (
                <Button
                  variant="danger"
                  onClick={() => setTargetStatus("CANCEL_RECIPIENT")}
                >
                  Cancel Reservation
                </Button>
              )}
          </div>
        </div>
      </Card>

      {/* Confirmation Dialog Modal */}
      <Modal
        isOpen={Boolean(targetStatus)}
        onClose={() => setTargetStatus(null)}
        title="Confirm Reservation Action"
        size="md"
      >
        {targetStatus && (
          <div className="space-y-4 text-xs">
            <p className="text-charcoal-600 leading-relaxed">
              Are you sure you want to execute action for claim{" "}
              <strong>{reservation.claimCode}</strong>?
            </p>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
                {modalError}
              </div>
            )}

            <div className="p-4 bg-surface-50 rounded-2xl border border-charcoal-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">
                  Current Status:
                </span>
                <span className="font-bold text-amber-700">
                  {reservation.status}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-charcoal-200">
                <span className="text-charcoal-500 font-medium">
                  Target Status:
                </span>
                <span className="font-black text-brand-700">
                  {targetStatus === "CANCEL_RECIPIENT"
                    ? "CANCELLED"
                    : targetStatus}
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-charcoal-100">
              <Button
                variant="outline"
                onClick={() => setTargetStatus(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateStatus}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Confirm Action"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReservationDetailPage;
