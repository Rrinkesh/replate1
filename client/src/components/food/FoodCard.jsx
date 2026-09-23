import React from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  MapPin,
  Utensils,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { useCountdown } from "../../hooks/useCountdown";

const DEFAULT_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80";

const FoodCard = ({ food, onReserve, className = "" }) => {
  if (!food) return null;

  const foodId = food._id || food.id;

  const name = food.name || "Surplus Food Item";
  const businessName =
    food.businessId?.businessName ||
    food.businessId?.organizationName ||
    food.businessId?.name ||
    food.businessName ||
    "Partner";

  const addressLocation =
    food.pickupLocation?.address ||
    (food.businessId?.city
      ? `${food.businessId.city}, ${food.businessId.state}`
      : "Location provided upon booking");

  const distanceText = food.distanceText || null;

  const imageSrc = food.image || DEFAULT_FOOD_IMAGE;
  const quantity = food.quantity !== undefined ? food.quantity : 1;
  const quantityUnit = food.quantityUnit || "servings";
  const quantityDisplay = food.quantityText || `${quantity} ${quantityUnit}`;

  const price = food.price || 0;
  const originalPrice = food.originalPrice;

  const calculatedDiscount =
    food.discountPercent ||
    (originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null);

  const { timeRemainingText, isExpired, isAlmostExpired, isExpiringSoon } =
    useCountdown(food.expiryTime);

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

  const category = food.category || "Prepared Meals";
  let status = food.status || "AVAILABLE";

  if (isExpired && status !== "EXPIRED") {
    status = "EXPIRED";
  } else if (quantity <= 0 && status !== "EXPIRED") {
    status = "SOLD_OUT";
  }

  const isReservable =
    status !== "EXPIRED" && status !== "SOLD_OUT" && !isExpired && quantity > 0;

  const handleImageError = (e) => {
    e.target.src = DEFAULT_FOOD_IMAGE;
  };

  return (
    <Card
      variant="default"
      padding="none"
      hoverable
      className={`flex flex-col h-full group ${className}`}
    >
      {/* Image Container with Badges & Zoom */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-charcoal-900">
        <img
          src={imageSrc}
          alt={name}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
          loading="lazy"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <Badge status={status} size="sm" showDot className="shadow-soft-xs" />
          {category && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-charcoal-950/75 text-white backdrop-blur-md border border-white/20">
              {category}
            </span>
          )}
        </div>

        {/* Bottom Discount Tag & Expiry Warning Tag */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          {calculatedDiscount > 0 && (
            <div className="bg-brand-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-soft-sm">
              {calculatedDiscount}% OFF
            </div>
          )}
          {isAlmostExpired && (
            <div className="ml-auto bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-soft-sm flex items-center gap-1">
              <Clock className="w-3 h-3" /> Act Fast!
            </div>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Business & Verification */}
          <div className="flex items-center justify-between text-xs text-charcoal-500 font-semibold">
            <span className="flex items-center gap-1 text-charcoal-700 truncate max-w-[180px] sm:max-w-[200px]">
              {businessName}
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            </span>
            <span className="flex items-center gap-1 text-charcoal-500 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              {distanceText}
            </span>
          </div>

          {/* Food Title */}
          <h3 className="text-base font-extrabold text-charcoal-900 tracking-tight line-clamp-1 group-hover:text-brand-700 transition-colors">
            {name}
          </h3>

          {/* Quantity & Pickup Deadline Details */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-medium text-charcoal-600">
            <div className="bg-surface-50 p-2 rounded-xl border border-charcoal-100 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="truncate font-semibold text-charcoal-800">
                {quantityDisplay}
              </span>
            </div>
            <div
              className={`p-2 rounded-xl border flex items-center gap-1.5 ${isAlmostExpired ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-surface-50 border-charcoal-100 text-charcoal-600"}`}
            >
              <Clock
                className={`w-3.5 h-3.5 shrink-0 ${isAlmostExpired ? "text-amber-600 animate-pulse" : "text-amber-600"}`}
              />
              <span className="truncate font-extrabold">
                {formattedDeadline}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Reserve Action Button */}
        <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-charcoal-500 block -mb-0.5 font-medium">
              Recovery Price
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-charcoal-900">
                ₹{price}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-charcoal-400 line-through font-semibold">
                  ₹{originalPrice}
                </span>
              )}
            </div>
          </div>

          {onReserve ? (
            <Button
              size="sm"
              variant={isReservable ? "primary" : "outline"}
              disabled={!isReservable}
              onClick={() => isReservable && onReserve(food)}
              iconRight={isReservable ? ArrowRight : undefined}
            >
              {status === "EXPIRED"
                ? "Expired"
                : status === "SOLD_OUT"
                  ? "Sold Out"
                  : "Reserve"}
            </Button>
          ) : (
            <Link to={`/food/${foodId}`}>
              <Button
                size="sm"
                variant={isReservable ? "primary" : "outline"}
                disabled={!isReservable}
                iconRight={isReservable ? ArrowRight : undefined}
              >
                {status === "EXPIRED"
                  ? "Expired"
                  : status === "SOLD_OUT"
                    ? "Sold Out"
                    : "Reserve"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FoodCard;
