import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Utensils,
  Plus,
  Clock,
  DollarSign,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Sparkles,
  ArrowRight,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  FileText,
  PackageCheck,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  StatCard,
  Card,
  Badge,
  Button,
  LoadingSpinner,
  EmptyState,
  Modal,
} from "../../components/common";
import ReservationCard from "../../components/reservation/ReservationCard";
import {
  DailySurplusChart,
  FoodRescuedChart,
  RevenueRecoveredChart,
  WasteReductionChart,
  AIForecasterCard,
  ImpactWidget,
  RewardsPanel
} from "../../components/dashboard";
import { reservationService } from "../../services/reservationService";
import { foodService } from "../../services/foodService";
import { analyticsService } from "../../services/analyticsService";
import { useAuth } from "../../context/AuthContext";

const BusinessDashboardPage = () => {
  const { currentUser, mongoUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [myFoodListings, setMyFoodListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Analytics & Timeframe state
  const [timeframe, setTimeframe] = useState("30d");
  const [analytics, setAnalytics] = useState(null);
  const [dailyTrends, setDailyTrends] = useState([]);

  // Edit / Delete Food Modal State
  const [deletingFoodId, setDeletingFoodId] = useState(null);
  const [editingFood, setEditingFood] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    quantity: "",
    price: "",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      try {
        const resData = await reservationService.getBusinessReservations();
        if (resData && resData.reservations) {
          setReservations(resData.reservations);
        }
      } catch (err) {
        console.warn("Business reservations fetch failed:", err.message);
      }

      try {
        const foodData = await foodService.getMyFoodListings();
        const items = foodData?.foods || foodData?.food || [];
        setMyFoodListings(items);
      } catch (err) {
        console.warn("Business listings fetch failed:", err.message);
      }

      try {
        const analyticsRes =
          await analyticsService.getBusinessAnalytics(timeframe);
        if (analyticsRes && analyticsRes.metrics) {
          setAnalytics(analyticsRes.metrics);
          setDailyTrends(analyticsRes.dailyTrends || []);
        }
      } catch (err) {
        console.warn("Business analytics fetch failed:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const handleStatusChange = async (reservationId, newStatus) => {
    setActionLoadingId(reservationId);
    try {
      await reservationService.updateReservationStatus(
        reservationId,
        newStatus,
      );
      await fetchDashboardData();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to update reservation status",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (!window.confirm("Are you sure you want to delete this food listing?"))
      return;
    setDeletingFoodId(foodId);
    try {
      await foodService.deleteFood(foodId);
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete food listing");
    } finally {
      setDeletingFoodId(null);
    }
  };

  const handleOpenEditModal = (foodItem) => {
    setEditingFood(foodItem);
    setEditFormData({
      name: foodItem.name || "",
      quantity: foodItem.quantity || "",
      price: foodItem.price || "",
    });
  };

  const handleSaveEditFood = async () => {
    if (!editingFood) return;
    setIsSubmittingEdit(true);
    try {
      await foodService.updateFood(editingFood._id || editingFood.id, {
        name: editFormData.name,
        quantity: parseInt(editFormData.quantity, 10) || 1,
        price: parseFloat(editFormData.price) || 0,
      });
      setEditingFood(null);
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update food listing");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Aggregated Summary Calculations
  const activeListingsCount = myFoodListings.filter(
    (f) => f.quantity > 0 && f.status !== "EXPIRED",
  ).length;

  const pendingReservationsCount = reservations.filter(
    (r) => r.status?.toUpperCase() === "PENDING",
  ).length;

  const totalMealsReserved = reservations
    .filter((r) => r.status?.toUpperCase() !== "CANCELLED")
    .reduce((sum, r) => sum + (r.quantity || 1), 0);

  const totalMealsCompleted = reservations
    .filter((r) => r.status?.toUpperCase() === "COMPLETED")
    .reduce((sum, r) => sum + (r.quantity || 1), 0);

  // Map reservation count per food item
  const getReservationCountForFood = (foodId) => {
    return reservations.filter(
      (r) =>
        (r.foodId?._id || r.foodId) === foodId &&
        r.status?.toUpperCase() !== "CANCELLED",
    ).length;
  };

  return (
    <DashboardLayout title="Business Executive Console">
      <div className="space-y-8">
        {/* Header Greeting & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">
              {mongoUser?.organizationName || currentUser?.name || "Verified Business Partner"}
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              {mongoUser?.location?.city || "Noida"} • Food Surplus Partner
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              iconLeft={RefreshCw}
              onClick={fetchDashboardData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Link to="/business/reservations">
              <Button variant="outline" size="sm" iconLeft={FileText}>
                Manage Orders ({reservations.length})
              </Button>
            </Link>
            <Link to="/business/food">
              <Button variant="outline" size="sm" iconLeft={Utensils}>
                Manage Inventory
              </Button>
            </Link>
            <Link to="/list-food">
              <Button variant="primary" iconLeft={Plus}>
                Post Surplus Food
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. AGGREGATED METRICS SUMMARY CARDS & TIMEFRAME SELECTOR */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-500">
              Business Summary Overview
            </h3>
            {/* Timeframe Filter Selector */}
            <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-xl border border-charcoal-200 text-xs font-semibold self-start sm:self-auto">
              <span className="text-charcoal-400 text-[10px] uppercase font-extrabold px-2">
                Period:
              </span>
              {[
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "90 Days" },
                { id: "all", label: "All Time" },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                    timeframe === tf.id
                      ? "bg-brand-600 text-white shadow-soft-xs font-extrabold"
                      : "text-charcoal-600 hover:text-charcoal-900"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Listings"
              value={String(analytics?.activeListings ?? activeListingsCount)}
              change="Available online"
              changeDirection="neutral"
              icon={Utensils}
              helperText="Marketplace listings"
            />
            <StatCard
              title="Pending Claims"
              value={String(pendingReservationsCount)}
              change="Requires confirmation"
              changeDirection={
                pendingReservationsCount > 0 ? "warning" : "neutral"
              }
              icon={Clock}
              helperText="Awaiting business action"
            />
            <StatCard
              title="Meals Rescued"
              value={String(
                analytics?.totalQuantityRescued ?? totalMealsCompleted,
              )}
              change="Total plates claimed"
              changeDirection="up"
              icon={PackageCheck}
              helperText={`Timeframe: ${timeframe}`}
            />
            <StatCard
              title="Revenue Recovered"
              value={`₹${(analytics?.totalValueRecovered ?? 0).toLocaleString()}`}
              change="Value rescued"
              changeDirection="up"
              icon={DollarSign}
              helperText="Value saved from disposal"
            />
          </div>
        </div>

        {/* 2. ISOLATED CHARTS GRID */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-500 mb-3">
            Analytics & Impact Trends
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DailySurplusChart
              data={
                dailyTrends.length > 0
                  ? dailyTrends.map((t) => ({
                      day: t._id ? t._id.slice(5) : "Day",
                      kg: Number((t.meals * 0.4).toFixed(1)),
                      meals: t.meals,
                    }))
                  : undefined
              }
            />
            <FoodRescuedChart />
            <RevenueRecoveredChart
              data={
                dailyTrends.length > 0
                  ? dailyTrends.map((t, idx) => ({
                      week: t._id ? t._id.slice(5) : `D${idx + 1}`,
                      value: t.revenue || 0,
                    }))
                  : undefined
              }
            />
            <WasteReductionChart
              valueKg={Number(
                ((analytics?.totalQuantityRescued || 0) * 0.4).toFixed(1),
              )}
            />
          </div>
        </div>

        <ImpactWidget />
        <div className='mt-6'>
          <RewardsPanel userRole='BUSINESS' credits={currentUser?.impactCredits || 0} level={currentUser?.rewardLevel || 'NEW'} />
        </div>
        <AIForecasterCard />
        
        {/* 3. BUSINESS SECTIONS & FOOD LISTINGS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: My Food Listings Table & Incoming Pickups */}
          <div className="lg:col-span-8 space-y-6">
            {/* My Food Listings Section */}
            <Card variant="default">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-charcoal-100">
                <div>
                  <h3 className="text-base font-bold text-charcoal-900 tracking-tight">
                    My Food Listings
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Live surplus food inventory and reservation count
                  </p>
                </div>
                <Link to="/list-food">
                  <Button size="sm" variant="primary" iconLeft={Plus}>
                    Post New
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="py-8 flex justify-center">
                  <LoadingSpinner size="md" text="Loading food inventory..." />
                </div>
              ) : myFoodListings.length === 0 ? (
                <EmptyState
                  title="No surplus food listed"
                  message="You haven't posted any surplus food listings yet."
                  actionLabel="Post Surplus Food"
                  onAction={() => (window.location.href = "/list-food")}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-50 text-charcoal-500 uppercase font-bold text-[10px] tracking-wider border-b border-charcoal-100">
                      <tr>
                        <th className="py-3 px-3">Item Title</th>
                        <th className="py-3 px-3">Qty Remaining</th>
                        <th className="py-3 px-3">Price</th>
                        <th className="py-3 px-3">Claims</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-100 font-medium">
                      {myFoodListings.map((item) => {
                        const foodId = item._id || item.id;
                        const claimsCount = getReservationCountForFood(foodId);

                        return (
                          <tr
                            key={foodId}
                            className="hover:bg-surface-50 transition-colors"
                          >
                            <td className="py-3 px-3 font-bold text-charcoal-900">
                              {item.name}
                            </td>
                            <td className="py-3 px-3 font-bold text-charcoal-800">
                              {item.quantity} {item.quantityUnit || "servings"}
                            </td>
                            <td className="py-3 px-3 font-black text-emerald-700">
                              ₹{item.price}
                            </td>
                            <td className="py-3 px-3 font-extrabold text-brand-700">
                              {claimsCount} claims
                            </td>
                            <td className="py-3 px-3">
                              <Badge status={item.status} size="sm" />
                            </td>
                            <td className="py-3 px-3 text-right space-x-1">
                              <Link to={`/food/${foodId}`}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="p-1.5 text-charcoal-600"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-1.5 text-charcoal-600 hover:text-brand-700"
                                onClick={() => handleOpenEditModal(item)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-1.5 text-rose-600 hover:bg-rose-50"
                                disabled={deletingFoodId === foodId}
                                onClick={() => handleDeleteFood(foodId)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Recent Orders Overview */}
            <Card variant="default">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-charcoal-100">
                <div>
                  <h3 className="text-base font-bold text-charcoal-900 tracking-tight">
                    Recent Recipient Orders
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Live incoming claims needing confirmation
                  </p>
                </div>
                <Link to="/business/reservations">
                  <Button size="sm" variant="ghost" iconRight={ArrowRight}>
                    View All Orders
                  </Button>
                </Link>
              </div>

              {reservations.length === 0 ? (
                <EmptyState
                  title="No incoming claims yet"
                  message="When recipient NGOs reserve your items, claims will appear here."
                />
              ) : (
                <div className="space-y-4">
                  {reservations.slice(0, 3).map((res) => (
                    <ReservationCard
                      key={res._id || res.id}
                      reservation={res}
                      userRole="BUSINESS"
                      onStatusChange={handleStatusChange}
                      isUpdating={actionLoadingId === res._id}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: AI Insights & Impact Summary */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Insights Section */}
            <Card variant="glass" className="border-brand-200 shadow-soft-md">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-charcoal-100">
                <div className="flex items-center gap-2 text-brand-700 font-extrabold text-xs">
                  <Bot className="w-4 h-4 text-brand-600" />
                  <span>AI Predictive Insights</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                  AI Preview
                </span>
              </div>

              <div className="p-4 bg-white/80 rounded-2xl border border-brand-100 space-y-2">
                <p className="text-xs text-charcoal-800 font-semibold leading-relaxed">
                  "Your kitchen may generate{" "}
                  <strong className="text-brand-700">
                    18–25 surplus meals
                  </strong>{" "}
                  today by 8:00 PM based on occupancy patterns."
                </p>

                <div className="pt-2 text-[11px] text-charcoal-500 font-medium border-t border-charcoal-100">
                  Recommendation: Schedule pickup alerts for 7:45 PM window.
                </div>
              </div>
            </Card>

            {/* Impact Summary Card */}
            <Card variant="default">
              <Card.Title>Impact Summary</Card.Title>
              <Card.Description>
                Monthly sustainability highlights
              </Card.Description>
              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 bg-surface-50 rounded-xl flex justify-between items-center">
                  <span className="text-charcoal-600 font-medium">
                    Monthly CO₂ Avoided:
                  </span>
                  <span className="font-bold text-emerald-700">
                    320 kg CO₂e
                  </span>
                </div>
                <div className="p-3 bg-surface-50 rounded-xl flex justify-between items-center">
                  <span className="text-charcoal-600 font-medium">
                    Active NGO Network:
                  </span>
                  <span className="font-bold text-charcoal-900">
                    14 Partners
                  </span>
                </div>
                <div className="p-3 bg-surface-50 rounded-xl flex justify-between items-center">
                  <span className="text-charcoal-600 font-medium">
                    RePlate Star Rating:
                  </span>
                  <span className="font-bold text-amber-600">
                    ★ 4.9 Zero Waste
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Food Item Modal */}
      <Modal
        isOpen={Boolean(editingFood)}
        onClose={() => setEditingFood(null)}
        title="Edit Food Surplus Listing"
        size="md"
      >
        {editingFood && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-charcoal-700 block mb-1">
                Food Item Name:
              </label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-charcoal-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-charcoal-700 block mb-1">
                  Quantity Remaining:
                </label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.quantity}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      quantity: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-charcoal-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-charcoal-700 block mb-1">
                  Recovery Price (₹):
                </label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.price}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-charcoal-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-charcoal-100">
              <Button
                variant="outline"
                onClick={() => setEditingFood(null)}
                disabled={isSubmittingEdit}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEditFood}
                disabled={isSubmittingEdit}
              >
                {isSubmittingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default BusinessDashboardPage;
