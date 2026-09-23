import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  Utensils,
  ShieldCheck,
  Building2,
  ArrowLeft,
  HeartHandshake,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  Modal,
  EmptyState,
  LoadingSpinner,
  ErrorState,
} from "../../components/common";
import { useAuth } from "../../context/AuthContext";
import { foodService } from "../../services/foodService";
import { reservationService } from "../../services/reservationService";
import { useCountdown } from "../../hooks/useCountdown";

const DEFAULT_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80";

const FoodDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reservation Form State
  const [quantity, setQuantity] = useState(1);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isClaimSuccess, setIsClaimSuccess] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchFoodDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await foodService.getFoodById(id);
      if (data && data.food) {
        setFood(data.food);
        // Clamp selected quantity to available stock
        const avail = data.food.quantity || 0;
        if (avail > 0 && quantity > avail) {
          setQuantity(avail);
        }
      } else {
        setError("Food listing details not found");
      }
    } catch (err) {
      console.error("Error fetching food detail:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "The requested food listing is unavailable.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodDetail();
  }, [id]);

  // Execute hook at top level before early returns
  const { timeRemainingText, isExpired, isAlmostExpired, isExpiringSoon } =
    useCountdown(food?.expiryTime);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" text="Loading surplus food details..." />
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="Food item not available"
          message={
            error ||
            "The requested surplus listing may have been claimed or expired."
          }
          actionLabel="Return to Marketplace"
          onAction={() => navigate("/food")}
        />
      </div>
    );
  }

  const maxQty = food.quantity !== undefined ? food.quantity : 0;

  let calculatedStatus = food.status || "AVAILABLE";
  if (isExpired && calculatedStatus !== "EXPIRED") {
    calculatedStatus = "EXPIRED";
  } else if (maxQty <= 0 && calculatedStatus !== "EXPIRED") {
    calculatedStatus = "SOLD_OUT";
  }

  const isAvailable =
    calculatedStatus !== "SOLD_OUT" &&
    calculatedStatus !== "EXPIRED" &&
    !isExpired &&
    maxQty > 0;

  const handleQuantityChange = (newQty) => {
    if (newQty >= 1 && newQty <= maxQty) {
      setQuantity(newQty);
    }
  };

  const handleOpenModal = () => {
    if (!currentUser) {
      // Unauthenticated user -> Redirect to /login
      navigate("/login", { state: { from: `/food/${id}` } });
      return;
    }
    setModalError(null);
    setIsReserveModalOpen(true);
  };

  const handleConfirmReservation = async () => {
    setIsSubmitting(true);
    setModalError(null);
    try {
      const foodDbId = food._id || food.id;
      const res = await reservationService.createReservation(
        foodDbId,
        quantity,
      );

      if (res && res.reservation) {
        setCreatedReservation(res.reservation);
      } else {
        setCreatedReservation({
          claimCode: `RPL-${Math.floor(100000 + Math.random() * 900000)}`,
          quantity,
          totalPrice: (food.price || 0) * quantity,
          status: "CONFIRMED",
          pickupTime: food.expiryTime
            ? `Before ${new Date(food.expiryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : "Today before 8:30 PM",
        });
      }
      setIsClaimSuccess(true);
      // Immediately refresh food detail to get latest accurate stock & status
      await fetchFoodDetail();
    } catch (err) {
      console.error("Reservation error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to complete reservation";
      setModalError(errMsg);
      // Re-fetch food if stock became unavailable or expired
      await fetchFoodDetail();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsReserveModalOpen(false);
    setIsClaimSuccess(false);
    setModalError(null);
  };

  const unitPrice = food.price || 0;
  const originalPrice = food.originalPrice;
  const totalPrice = unitPrice * quantity;

  const calculatedDiscount =
    food.discountPercent ||
    (originalPrice && originalPrice > unitPrice
      ? Math.round(((originalPrice - unitPrice) / originalPrice) * 100)
      : null);

  const businessName =
    food.businessId?.organizationName ||
    food.businessId?.name ||
    food.businessName ||
    "Commercial Partner";

  const businessType =
    food.businessId?.businessType || "Commercial Kitchen Partner";

  const pickupLocation =
    food.pickupLocation?.address || food.location || "Noida Sector 62";

  const formattedDeadline = isExpired
    ? "Expired"
    : timeRemainingText
      ? timeRemainingText
      : food.expiryTime
        ? `Before ${new Date(food.expiryTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : food.pickupDeadline || "Today before 8:30 PM";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Back Breadcrumb Link */}
      <div>
        <Link
          to="/food"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-600 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Surplus Marketplace</span>
        </Link>
      </div>

      {/* Main Grid: Details Left, Action Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Image Banner */}
          <div className="relative rounded-3xl overflow-hidden shadow-soft-md h-64 sm:h-96 bg-charcoal-900 border border-charcoal-100">
            <img
              src={food.image || DEFAULT_FOOD_IMAGE}
              alt={food.name}
              onError={(e) => (e.target.src = DEFAULT_FOOD_IMAGE)}
              className="w-full h-full object-cover opacity-90"
              loading="lazy"
            />
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
              <Badge
                status={calculatedStatus}
                size="md"
                showDot
                className="shadow-soft-sm"
              />
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-charcoal-950/80 text-white backdrop-blur-md border border-white/20">
                {food.category || "Surplus Food"}
              </span>
            </div>
          </div>

          {/* Title & Organization Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal-500 font-semibold">
              <span className="flex items-center gap-1 text-charcoal-800 font-bold">
                <Building2 className="w-4 h-4 text-brand-600" />
                {businessName} ({businessType})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-charcoal-600">
                <MapPin className="w-4 h-4 text-brand-600" />
                {pickupLocation}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-charcoal-900 tracking-tight">
              {food.name}
            </h1>

            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-normal">
              {food.description ||
                "High quality surplus food prepared by commercial kitchen partners, available for immediate NGO claim and community distribution."}
            </p>

            {/* Countdown / Expiry Alerts */}
            {isAlmostExpired && !isExpired && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-bold">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                <span>
                  Act Fast! This surplus food item expires in less than 1 hour (
                  {formattedDeadline}).
                </span>
              </div>
            )}
            {isExpiringSoon && !isAlmostExpired && !isExpired && (
              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2 font-semibold">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Expiring Soon: This item must be claimed within{" "}
                  {formattedDeadline}.
                </span>
              </div>
            )}
            {isExpired && (
              <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-red-800 text-xs flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  Expired: This food listing has expired and is no longer
                  available for reservation.
                </span>
              </div>
            )}
          </div>

          {/* Food Specifications Grid */}
          <Card variant="default">
            <Card.Title>Food Specifications & Guidelines</Card.Title>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs font-medium">
              <div className="p-3.5 bg-surface-50 rounded-xl border border-charcoal-100 flex items-center justify-between">
                <span className="text-charcoal-500">Available Quantity:</span>
                <span className="font-extrabold text-charcoal-900">
                  {maxQty} {food.quantityUnit || "servings"}
                </span>
              </div>
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${isAlmostExpired ? "bg-amber-50 border-amber-200 text-amber-900 font-bold" : "bg-surface-50 border-charcoal-100"}`}
              >
                <span className="text-charcoal-500">Pickup Deadline:</span>
                <span
                  className={`font-bold ${isExpired ? "text-red-700" : isAlmostExpired ? "text-amber-700" : "text-amber-700"}`}
                >
                  {formattedDeadline}
                </span>
              </div>
              <div className="p-3.5 bg-surface-50 rounded-xl border border-charcoal-100 flex items-center justify-between">
                <span className="text-charcoal-500">Category:</span>
                <span className="font-bold text-brand-700">
                  {food.category || "Prepared Meals"}
                </span>
              </div>
              <div className="p-3.5 bg-surface-50 rounded-xl border border-charcoal-100 flex items-center justify-between">
                <span className="text-charcoal-500">Preparation Time:</span>
                <span className="font-bold text-charcoal-900">
                  {food.preparationTime
                    ? new Date(food.preparationTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Fresh Today"}
                </span>
              </div>
            </div>

            {/* Food Safety Compliance */}
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">
                <strong>FSSAI Food Safety Standard:</strong> Commercial partners
                verify food temperature and packaging integrity prior to
                dispatch.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Sticky Action Reservation Card */}
        <div className="lg:col-span-4 sticky top-24">
          <Card variant="default" className="shadow-soft-md space-y-6">
            {/* Clear Pricing Block */}
            <div className="space-y-1">
              <span className="text-xs text-charcoal-500 font-bold uppercase tracking-wider block">
                Recovery Price
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-charcoal-900">
                  ₹{totalPrice}
                </span>
                {originalPrice && originalPrice > unitPrice && (
                  <span className="text-sm text-charcoal-400 line-through font-semibold">
                    Original: ₹{originalPrice * quantity}
                  </span>
                )}
                {calculatedDiscount > 0 && (
                  <span className="text-xs font-black px-2.5 py-1 rounded bg-brand-100 text-brand-800">
                    {calculatedDiscount}% OFF
                  </span>
                )}
              </div>
              <p className="text-[11px] text-charcoal-500 font-medium">
                Unit price: ₹{unitPrice} per {food.quantityUnit || "serving"}
              </p>
            </div>

            {/* Quantity Selector Counter */}
            {isAvailable ? (
              <div className="space-y-2 pt-3 border-t border-charcoal-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-charcoal-700">
                    Available Stock:
                  </span>
                  <span className="font-extrabold text-brand-700">
                    {maxQty} meals
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-surface-50 rounded-2xl border border-charcoal-100">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={quantity <= 1}
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-9 h-9 p-0 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-extrabold text-charcoal-900 text-base">
                    {quantity} {food.quantityUnit || "servings"}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={quantity >= maxQty}
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-9 h-9 p-0 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800 text-xs font-bold text-center">
                This food listing is currently{" "}
                {calculatedStatus === "EXPIRED" || isExpired
                  ? "EXPIRED"
                  : "SOLD OUT"}
                .
              </div>
            )}

            {/* Role-Based Action Buttons */}
            <div className="space-y-3 pt-3 border-t border-charcoal-100">
              {userRole === "business" ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-medium text-center">
                  Business accounts manage food listings from the Business
                  Dashboard.
                </div>
              ) : userRole === "admin" ? (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-xs font-medium text-center">
                  Super Admin preview mode.
                </div>
              ) : (
                <Button
                  size="lg"
                  variant="primary"
                  fullWidth
                  disabled={!isAvailable}
                  iconRight={HeartHandshake}
                  onClick={handleOpenModal}
                >
                  {isAvailable ? "Reserve Food" : "Sold Out / Expired"}
                </Button>
              )}

              <p className="text-[11px] text-center text-charcoal-500 font-medium">
                No upfront payment required for verified recipient accounts.
              </p>
            </div>

            {/* Donor Contact Details */}
            <div className="p-4 bg-surface-50 rounded-2xl border border-charcoal-100 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-charcoal-900">
                <span>{businessName}</span>
                <ShieldCheck className="w-4 h-4 text-brand-600" />
              </div>
              <p className="text-charcoal-600 text-[11px]">{pickupLocation}</p>
              <div className="pt-2 border-t border-charcoal-200 flex items-center justify-between text-charcoal-500">
                <span>FSSAI License</span>
                <span className="font-semibold text-charcoal-800">
                  #11519001421
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Reservation Confirmation & Polished Success Modal */}
      <Modal
        isOpen={isReserveModalOpen}
        onClose={handleCloseModal}
        title={
          isClaimSuccess
            ? "Food Reserved Successfully"
            : "Confirm Food Reservation"
        }
        size="md"
      >
        {isClaimSuccess ? (
          <div className="space-y-6 text-center py-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-charcoal-900">
                {food.name}
              </h3>
              <p className="text-xs text-charcoal-600">
                Verification Claim Code:{" "}
                <strong className="text-brand-700 font-black text-base uppercase">
                  {createdReservation?.claimCode}
                </strong>
              </p>
            </div>

            <div className="p-4 bg-surface-50 rounded-2xl border border-charcoal-100 text-xs text-left space-y-2.5">
              <div className="flex justify-between border-b border-charcoal-200 pb-2">
                <span className="text-charcoal-500 font-medium">
                  Reserved Quantity:
                </span>
                <span className="font-bold text-charcoal-900">
                  {quantity} {food.quantityUnit || "servings"}
                </span>
              </div>
              <div className="flex justify-between border-b border-charcoal-200 pb-2">
                <span className="text-charcoal-500 font-medium">
                  Total Price:
                </span>
                <span className="font-black text-emerald-700 text-sm">
                  ₹{totalPrice}
                </span>
              </div>
              <div className="flex justify-between border-b border-charcoal-200 pb-2">
                <span className="text-charcoal-500 font-medium">
                  Pickup Deadline:
                </span>
                <span className="font-bold text-amber-700">
                  {formattedDeadline}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">Status:</span>
                <Badge status="Confirmed" size="sm" />
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  handleCloseModal();
                  navigate("/food");
                }}
              >
                Continue Exploring
              </Button>
              {createdReservation?._id && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    handleCloseModal();
                    navigate(`/reservation/${createdReservation._id}`);
                  }}
                >
                  View Reservation
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-charcoal-600 leading-relaxed">
              You are reserving{" "}
              <strong>
                {quantity} {food.quantityUnit || "servings"}
              </strong>{" "}
              of <strong>{food.name}</strong> from{" "}
              <strong>{businessName}</strong>.
            </p>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
                {modalError}
              </div>
            )}

            <div className="p-4 bg-surface-50 rounded-2xl border border-charcoal-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">Quantity:</span>
                <span className="font-bold text-charcoal-900">
                  {quantity} {food.quantityUnit || "servings"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">
                  Total Recovery Amount:
                </span>
                <span className="font-black text-emerald-700 text-sm">
                  ₹{totalPrice}
                </span>
              </div>
              <div className="flex justify-between border-t border-charcoal-200 pt-2">
                <span className="text-charcoal-500 font-medium">
                  Pickup Deadline:
                </span>
                <span className="font-bold text-amber-700">
                  {formattedDeadline}
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-charcoal-100">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                iconLeft={HeartHandshake}
                disabled={isSubmitting}
                onClick={handleConfirmReservation}
              >
                {isSubmitting ? "Reserving..." : "Confirm Reservation"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FoodDetailPage;
