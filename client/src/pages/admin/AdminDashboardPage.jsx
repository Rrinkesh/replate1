import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Building2,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Calendar,
  AlertTriangle,
  UserCheck,
  UserX,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  StatCard,
  Card,
  Badge,
  Button,
  Modal,
  LoadingSpinner,
  EmptyState,
  ErrorState,
} from "../../components/common";
import { adminService } from "../../services/adminService";
import { analyticsService } from "../../services/analyticsService";
import {
  DailySurplusChart,
  RevenueRecoveredChart,
} from "../../components/dashboard";
import { useAuth } from "../../context/AuthContext";

const AdminDashboardPage = () => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("businesses"); // 'businesses' | 'recipients'
  const [businesses, setBusinesses] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Platform Analytics & Timeframe state
  const [timeframe, setTimeframe] = useState("30d");
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [dailyTrends, setDailyTrends] = useState([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'verified' | 'unverified'

  // Confirmation Modal State
  const [selectedPartner, setSelectedPartner] = useState(null);
  // selectedPartner shape: { id, type: 'business'|'recipient', name, currentVerified, targetVerified }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [busData, recData, analyticsRes] = await Promise.all([
        adminService.getAllBusinesses().catch(() => ({ businesses: [] })),
        adminService.getAllRecipients().catch(() => ({ recipients: [] })),
        analyticsService.getAdminAnalytics(timeframe).catch(() => null),
      ]);

      setBusinesses(busData.businesses || []);
      setRecipients(recData.recipients || []);
      if (analyticsRes && analyticsRes.metrics) {
        setAdminAnalytics(analyticsRes.metrics);
        setDailyTrends(analyticsRes.dailyTrends || []);
      }
    } catch (err) {
      console.error("Failed to load admin verification data:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to access platform verification records.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [timeframe]);

  const handleOpenVerifyModal = (partner, partnerType) => {
    setModalError(null);
    const partnerName =
      partnerType === "business"
        ? partner.businessName
        : partner.organizationName;

    setSelectedPartner({
      id: partner._id,
      type: partnerType,
      name: partnerName || "Partner Account",
      currentVerified: Boolean(partner.isVerified),
      targetVerified: !partner.isVerified,
    });
  };

  const [selectedDeletePartner, setSelectedDeletePartner] = useState(null);

  const handleOpenDeleteModal = (partner, partnerType) => {
    setModalError(null);
    const partnerName =
      partnerType === "business"
        ? partner.businessName
        : partner.organizationName;

    setSelectedDeletePartner({
      id: partner._id,
      type: partnerType,
      name: partnerName || "Partner Account",
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeletePartner) return;
    setIsSubmitting(true);
    setModalError(null);
    try {
      if (selectedDeletePartner.type === "business") {
        await adminService.rejectBusiness(selectedDeletePartner.id);
      } else {
        await adminService.rejectRecipient(selectedDeletePartner.id);
      }
      setSelectedDeletePartner(null);
      await fetchAdminData();
    } catch (err) {
      console.error("Delete error:", err);
      setModalError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete partner",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmVerificationToggle = async () => {
    if (!selectedPartner) return;
    setIsSubmitting(true);
    setModalError(null);
    try {
      if (selectedPartner.type === "business") {
        await adminService.verifyBusiness(
          selectedPartner.id,
          selectedPartner.targetVerified,
        );
      } else {
        await adminService.verifyRecipient(
          selectedPartner.id,
          selectedPartner.targetVerified,
        );
      }
      setSelectedPartner(null);
      await fetchAdminData();
    } catch (err) {
      console.error("Verification toggle error:", err);
      setModalError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update partner verification",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Aggregated Counts
  const totalBusinessesCount = businesses.length;
  const totalRecipientsCount = recipients.length;

  const verifiedBusinessesCount = businesses.filter((b) => b.isVerified).length;
  const verifiedRecipientsCount = recipients.filter((r) => r.isVerified).length;
  const totalVerifiedCount = verifiedBusinessesCount + verifiedRecipientsCount;

  const unverifiedBusinessesCount =
    totalBusinessesCount - verifiedBusinessesCount;
  const unverifiedRecipientsCount =
    totalRecipientsCount - verifiedRecipientsCount;
  const totalPendingQueueCount =
    unverifiedBusinessesCount + unverifiedRecipientsCount;

  // Filtered List Memo
  const currentList = activeTab === "businesses" ? businesses : recipients;

  const filteredList = useMemo(() => {
    return currentList.filter((item) => {
      // Status Filter
      if (statusFilter === "verified" && !item.isVerified) return false;
      if (statusFilter === "unverified" && item.isVerified) return false;

      // Search Term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const name = (
          item.businessName ||
          item.organizationName ||
          ""
        ).toLowerCase();
        const city = (item.city || "").toLowerCase();
        const phone = (item.phone || "").toLowerCase();
        const category = (
          item.businessType ||
          item.recipientType ||
          ""
        ).toLowerCase();

        if (
          !name.includes(query) &&
          !city.includes(query) &&
          !phone.includes(query) &&
          !category.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [currentList, statusFilter, searchTerm]);

  return (
    <DashboardLayout title="Platform Administration Console">
      <div className="space-y-8">
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">
              Platform Verification & Moderation
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Review and audit commercial donors & NGO recipients across Noida &
              NCR.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              iconLeft={RefreshCw}
              onClick={fetchAdminData}
              disabled={loading}
            >
              Refresh Audit Queue
            </Button>
            <Badge variant="brand" icon={ShieldCheck} size="lg">
              Super Admin Portal
            </Badge>
          </div>
        </div>

        {/* 1. AGGREGATED METRICS STAT CARDS & TIMEFRAME SELECTOR */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-500">
              Platform Verification Overview
            </h3>
            {/* Timeframe Filter Selector for System Analytics */}
            <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-xl border border-charcoal-200 text-xs font-semibold self-start sm:self-auto">
              <span className="text-charcoal-400 text-[10px] uppercase font-extrabold px-2">
                Analytics Window:
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Commercial Donors"
              value={String(
                adminAnalytics?.totalBusinesses ?? totalBusinessesCount,
              )}
              change={`${adminAnalytics?.verifiedBusinesses ?? verifiedBusinessesCount} verified`}
              changeDirection="up"
              icon={Building2}
              helperText="Registered business accounts"
            />
            <StatCard
              title="Total NGO Recipients"
              value={String(
                adminAnalytics?.totalRecipients ?? totalRecipientsCount,
              )}
              change={`${adminAnalytics?.verifiedRecipients ?? verifiedRecipientsCount} verified`}
              changeDirection="up"
              icon={HeartHandshake}
              helperText="Registered recipient accounts"
            />
            <StatCard
              title="Total Meals Rescued"
              value={String(adminAnalytics?.totalQuantityRescued ?? 0)}
              change={`Timeframe: ${timeframe}`}
              changeDirection="up"
              icon={CheckCircle2}
              helperText="System-wide meal claims"
            />
            <StatCard
              title="Total Value Recovered"
              value={`₹${(adminAnalytics?.totalValueRecovered ?? 0).toLocaleString()}`}
              change="Platform recovery"
              changeDirection="up"
              icon={ShieldCheck}
              helperText="Value saved across platform"
            />
          </div>

          {/* SYSTEM-WIDE IMPACT & TREND CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <DailySurplusChart
              title="System-Wide Surplus Volume"
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
            <RevenueRecoveredChart
              title="System Platform Recovery Value (₹)"
              data={
                dailyTrends.length > 0
                  ? dailyTrends.map((t, idx) => ({
                      week: t._id ? t._id.slice(5) : `D${idx + 1}`,
                      value: t.revenue || 0,
                    }))
                  : undefined
              }
            />
          </div>
        </div>

        {/* 2. TABBED PARTNER AUDIT TABLE CARD */}
        <Card variant="default" className="space-y-6">
          {/* Header Controls & Tab Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-charcoal-100">
            {/* Tab Switcher */}
            <div className="flex items-center gap-2 bg-surface-100 p-1 rounded-2xl border border-charcoal-200">
              <button
                onClick={() => setActiveTab("businesses")}
                className={`
                  px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2
                  ${
                    activeTab === "businesses"
                      ? "bg-brand-600 text-white shadow-soft-xs"
                      : "text-charcoal-600 hover:text-charcoal-900"
                  }
                `}
              >
                <Building2 className="w-4 h-4" />
                <span>Commercial Businesses ({totalBusinessesCount})</span>
              </button>

              <button
                onClick={() => setActiveTab("recipients")}
                className={`
                  px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2
                  ${
                    activeTab === "recipients"
                      ? "bg-brand-600 text-white shadow-soft-xs"
                      : "text-charcoal-600 hover:text-charcoal-900"
                  }
                `}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>NGO Recipients ({totalRecipientsCount})</span>
              </button>
            </div>

            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search partner, city, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-charcoal-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto text-xs p-2.5 border border-charcoal-200 rounded-xl bg-white font-semibold text-charcoal-700 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified / Pending</option>
              </select>
            </div>
          </div>

          {/* Table Content / Loading / Error / Empty */}
          {loading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner
                size="lg"
                text="Loading partner audit records..."
              />
            </div>
          ) : error ? (
            <ErrorState
              title="Unable to load verification records"
              message={error}
              onRetry={fetchAdminData}
            />
          ) : filteredList.length === 0 ? (
            <EmptyState
              title="No partner accounts found"
              message={
                searchTerm || statusFilter !== "all"
                  ? "No records match your active search and status filter criteria."
                  : `No registered ${activeTab} accounts exist in the database yet.`
              }
              actionLabel="Reset Search & Filters"
              onAction={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-charcoal-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-50 text-charcoal-500 uppercase font-bold text-[10px] tracking-wider border-b border-charcoal-100">
                    <tr>
                      <th className="py-3.5 px-4">Partner Organization</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Phone / Contact</th>
                      <th className="py-3.5 px-4">Registered Date</th>
                      <th className="py-3.5 px-4">Verification</th>
                      <th className="py-3.5 px-4 text-right">
                        Moderation Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100 font-medium">
                    {filteredList.map((item) => {
                      const isBus = activeTab === "businesses";
                      const name = isBus
                        ? item.businessName
                        : item.organizationName;
                      const category = isBus
                        ? item.businessType
                        : item.recipientType;

                      return (
                        <tr
                          key={item._id}
                          className="hover:bg-surface-50 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-extrabold text-charcoal-900">
                            {name || "Unnamed Partner"}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-brand-700">
                            {category || "Standard Partner"}
                          </td>
                          <td className="py-3.5 px-4 text-charcoal-600">
                            {item.city}, {item.state}
                          </td>
                          <td className="py-3.5 px-4 text-charcoal-600 font-mono">
                            {item.phone || item.userId?.phone || "N/A"}
                          </td>
                          <td className="py-3.5 px-4 text-charcoal-500 font-medium">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={item.isVerified ? "success" : "warning"}
                              size="sm"
                              showDot
                            >
                              {item.isVerified ? "Verified" : "Unverified"}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              {item.isVerified ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  iconLeft={UserX}
                                  onClick={() =>
                                    handleOpenVerifyModal(
                                      item,
                                      isBus ? "business" : "recipient",
                                    )
                                  }
                                >
                                  Revoke Verification
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  iconLeft={UserCheck}
                                  onClick={() =>
                                    handleOpenVerifyModal(
                                      item,
                                      isBus ? "business" : "recipient",
                                    )
                                  }
                                >
                                  Verify Partner
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() =>
                                  handleOpenDeleteModal(
                                    item,
                                    isBus ? "business" : "recipient",
                                  )
                                }
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Touch-Friendly Card View */}
              <div className="md:hidden space-y-4">
                {filteredList.map((item) => {
                  const isBus = activeTab === "businesses";
                  const name = isBus
                    ? item.businessName
                    : item.organizationName;
                  const category = isBus
                    ? item.businessType
                    : item.recipientType;

                  return (
                    <Card
                      key={item._id}
                      variant="default"
                      className="space-y-3 shadow-soft-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-charcoal-100">
                        <h4 className="font-extrabold text-charcoal-900 text-sm">
                          {name || "Unnamed Partner"}
                        </h4>
                        <Badge
                          variant={item.isVerified ? "success" : "warning"}
                          size="sm"
                        >
                          {item.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs text-charcoal-600">
                        <div className="flex justify-between">
                          <span className="text-charcoal-400">Category:</span>
                          <span className="font-bold text-brand-700">
                            {category}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-400">Location:</span>
                          <span className="font-medium text-charcoal-800">
                            {item.city}, {item.state}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-400">Phone:</span>
                          <span className="font-mono text-charcoal-800">
                            {item.phone || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-400">Registered:</span>
                          <span className="font-medium text-charcoal-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-charcoal-100 flex justify-end">
                        {item.isVerified ? (
                          <Button
                            size="sm"
                            variant="outline"
                            iconLeft={UserX}
                            onClick={() =>
                              handleOpenVerifyModal(
                                item,
                                isBus ? "business" : "recipient",
                              )
                            }
                          >
                            Revoke
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            iconLeft={UserCheck}
                            onClick={() =>
                              handleOpenVerifyModal(
                                item,
                                isBus ? "business" : "recipient",
                              )
                            }
                          >
                            Verify Partner
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full mt-2"
                          onClick={() =>
                            handleOpenDeleteModal(
                              item,
                              isBus ? "business" : "recipient",
                            )
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Verification Toggle Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedPartner)}
        onClose={() => setSelectedPartner(null)}
        title={
          selectedPartner?.targetVerified
            ? "Confirm Partner Verification"
            : "Revoke Partner Verification"
        }
        size="md"
      >
        {selectedPartner && (
          <div className="space-y-4 text-xs">
            <p className="text-charcoal-600 leading-relaxed">
              Are you sure you want to{" "}
              <strong>
                {selectedPartner.targetVerified
                  ? "verify"
                  : "revoke verification for"}
              </strong>{" "}
              <strong>{selectedPartner.name}</strong>?
            </p>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
                {modalError}
              </div>
            )}

            <div className="p-4 bg-surface-50 rounded-2xl border border-charcoal-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">
                  Partner Name:
                </span>
                <span className="font-bold text-charcoal-900">
                  {selectedPartner.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 font-medium">
                  Account Type:
                </span>
                <span className="font-bold text-brand-700 uppercase">
                  {selectedPartner.type} Account
                </span>
              </div>
              <div className="flex justify-between border-t border-charcoal-200 pt-2">
                <span className="text-charcoal-500 font-medium">
                  New Status:
                </span>
                <span
                  className={`font-black ${
                    selectedPartner.targetVerified
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {selectedPartner.targetVerified ? "VERIFIED" : "UNVERIFIED"}
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-charcoal-100">
              <Button
                variant="outline"
                onClick={() => setSelectedPartner(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant={selectedPartner.targetVerified ? "primary" : "danger"}
                onClick={handleConfirmVerificationToggle}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Updating..."
                  : selectedPartner.targetVerified
                    ? "Confirm Verification"
                    : "Confirm Revocation"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedDeletePartner)}
        onClose={() => setSelectedDeletePartner(null)}
        title="Delete Partner Account"
        size="md"
      >
        {selectedDeletePartner && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium flex gap-2 items-start">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>
                Are you sure you want to completely delete{" "}
                <strong>{selectedDeletePartner.name}</strong>? This action is
                irreversible and will remove all their data from the platform.
              </p>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
                {modalError}
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-charcoal-100">
              <Button
                variant="outline"
                onClick={() => setSelectedDeletePartner(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 border-red-700 text-white"
              >
                {isSubmitting ? "Deleting..." : "Delete Permanently"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
