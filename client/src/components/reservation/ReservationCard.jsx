import React from "react";
import {
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  XCircle,
  Building2,
  ShieldCheck,
  Package,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Card, Badge, Button } from "../common";

const getReservationStatusConfig = (status) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return { variant: "warning", label: "Claim Pending", icon: Clock };
    case "CONFIRMED":
      return { variant: "info", label: "Confirmed", icon: CheckCircle2 };
    case "READY_FOR_PICKUP":
      return { variant: "brand", label: "Ready for Pickup", icon: Package };
    case "COMPLETED":
      return { variant: "success", label: "Completed", icon: ShieldCheck };
    case "CANCELLED":
      return { variant: "danger", label: "Cancelled", icon: XCircle };
    case "EXPIRED":
      return { variant: "neutral", label: "Expired", icon: AlertCircle };
    default:
      return { variant: "neutral", label: status || "Pending", icon: Clock };
  }
};

const ReservationCard = ({
  reservation,
  userRole = "RECIPIENT",
  onStatusChange,
  onCancel,
  isUpdating = false,
}) => {
  if (!reservation) return null;

  const food = reservation.foodId || {};
  const business = reservation.businessId || {};
  const recipient = reservation.recipientId || {};

  const statusConfig = getReservationStatusConfig(reservation.status);
  const StatusIcon = statusConfig.icon;

  const isRecipient = userRole === "RECIPIENT";
  const isBusiness = userRole === "BUSINESS" || userRole === "ADMIN";

  const canRecipientCancel =
    isRecipient &&
    ["PENDING", "CONFIRMED"].includes(reservation.status?.toUpperCase());

  return (
    <Card
      variant="default"
      className="shadow-soft-sm hover:shadow-soft-md transition-shadow"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm border border-brand-200 shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-brand-700 uppercase">
                {reservation.claimCode}
              </span>
              <span className="text-[11px] text-charcoal-400 font-medium">
                • Reserved{" "}
                {new Date(
                  reservation.reservedAt || reservation.createdAt,
                ).toLocaleDateString()}
              </span>
            </div>
            <h4 className="text-base font-extrabold text-charcoal-900 tracking-tight">
              {food.name || "Surplus Food Claim"}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <Badge variant={statusConfig.variant} size="md" icon={StatusIcon}>
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4 text-xs">
        {/* Quantity & Unit */}
        <div className="p-3 bg-surface-50 rounded-xl border border-charcoal-100">
          <span className="text-charcoal-500 font-medium block mb-0.5">
            Reserved Quantity:
          </span>
          <span className="font-extrabold text-charcoal-900 text-sm">
            {reservation.quantity} {food.quantityUnit || "servings"}
          </span>
        </div>

        {/* Total Price */}
        <div className="p-3 bg-surface-50 rounded-xl border border-charcoal-100">
          <span className="text-charcoal-500 font-medium block mb-0.5">
            Recovery Price:
          </span>
          <span className="font-black text-emerald-700 text-sm">
            ₹{reservation.totalPrice}
          </span>
        </div>

        {/* Counterpart Partner (Business vs Recipient) */}
        <div className="p-3 bg-surface-50 rounded-xl border border-charcoal-100">
          <span className="text-charcoal-500 font-medium block mb-0.5">
            {isRecipient ? "Donor Kitchen:" : "Claiming Recipient:"}
          </span>
          <span className="font-bold text-charcoal-900 block truncate">
            {isRecipient
              ? business.organizationName || business.name || "Donor Partner"
              : recipient.organizationName || recipient.name || "NGO Recipient"}
          </span>
        </div>

        {/* Pickup Window */}
        <div className="p-3 bg-surface-50 rounded-xl border border-charcoal-100">
          <span className="text-charcoal-500 font-medium block mb-0.5">
            Pickup Deadline:
          </span>
          <span className="font-semibold text-amber-700 block truncate">
            <Clock className="w-3.5 h-3.5 inline mr-1" />
            {reservation.pickupTime || "Today before 8:30 PM"}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-charcoal-100 text-xs">
        <div className="flex items-center gap-1.5 text-charcoal-500 font-medium">
          <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
          <span className="truncate">
            {food.pickupLocation?.address || "Pickup Point, Noida Sector 62"}
          </span>
        </div>

        {/* Dynamic Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Business Owner Actions */}
          {isBusiness && reservation.status === "PENDING" && (
            <Button
              size="sm"
              variant="primary"
              disabled={isUpdating}
              onClick={() =>
                onStatusChange && onStatusChange(reservation._id, "CONFIRMED")
              }
            >
              Confirm Claim
            </Button>
          )}

          {isBusiness &&
            ["PENDING", "CONFIRMED"].includes(reservation.status) && (
              <Button
                size="sm"
                variant="outline"
                disabled={isUpdating}
                onClick={() =>
                  onStatusChange &&
                  onStatusChange(reservation._id, "READY_FOR_PICKUP")
                }
              >
                Mark Ready for Pickup
              </Button>
            )}

          {isBusiness && reservation.status === "READY_FOR_PICKUP" && (
            <Button
              size="sm"
              variant="primary"
              disabled={isUpdating}
              iconLeft={CheckCircle2}
              onClick={() =>
                onStatusChange && onStatusChange(reservation._id, "COMPLETED")
              }
            >
              Complete Pickup
            </Button>
          )}

          {isBusiness &&
            !["COMPLETED", "CANCELLED"].includes(reservation.status) && (
              <Button
                size="sm"
                variant="danger"
                disabled={isUpdating}
                onClick={() =>
                  onStatusChange && onStatusChange(reservation._id, "CANCELLED")
                }
              >
                Cancel
              </Button>
            )}

          {/* Recipient Action */}
          {canRecipientCancel && (
            <Button
              size="sm"
              variant="danger"
              disabled={isUpdating}
              onClick={() => onCancel && onCancel(reservation._id)}
            >
              Cancel Reservation
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ReservationCard;
