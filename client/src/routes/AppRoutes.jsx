import React from "react";
import { Routes, Route } from "react-router-dom";

// Public Pages
import HomePage from "../pages/public/HomePage";
import HowItWorksPage from "../pages/public/HowItWorksPage";
import BusinessPage from "../pages/public/BusinessPage";
import RecipientPage from "../pages/public/RecipientPage";
import ImpactPage from "../pages/public/ImpactPage";
import AboutPage from "../pages/public/AboutPage";
import NotFoundPage from "../pages/public/NotFoundPage";
import DashboardRedirectPage from "../pages/public/DashboardRedirectPage";
import ProfilePage from "../pages/public/ProfilePage";
import SettingsPage from "../pages/public/SettingsPage";

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";

// Business Pages
import BusinessDashboardPage from "../pages/business/BusinessDashboardPage";
import BusinessReservationsPage from "../pages/business/BusinessReservationsPage";
import ListFoodPage from "../pages/business/ListFoodPage";
import BusinessFoodPage from "../pages/business/BusinessFoodPage";

// Recipient Pages
import RecipientDashboardPage from "../pages/recipient/RecipientDashboardPage";
import RecipientReservationsPage from "../pages/recipient/RecipientReservationsPage";
import FoodDirectoryPage from "../pages/recipient/FoodDirectoryPage";
import FoodDetailPage from "../pages/food/FoodDetailPage";

// Reservation Detail Page
import ReservationDetailPage from "../pages/reservation/ReservationDetailPage";

// Notification Center Page
import NotificationsPage from "../pages/notification/NotificationsPage";

// Admin Pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminVerificationsPage from "../pages/admin/AdminVerificationsPage";

// Route Guards
import ProtectedRoute from "./ProtectedRoute";
import RoleGuard from "./RoleGuard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Core Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/business" element={<BusinessPage />} />
      <Route path="/recipient" element={<RecipientPage />} />
      <Route path="/impact" element={<ImpactPage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Food Surplus Marketplace Routes */}
      <Route path="/food" element={<FoodDirectoryPage />} />
      <Route path="/food/:id" element={<FoodDetailPage />} />

      {/* Protected Application Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard Portal Router Hub */}
        <Route path="/dashboard" element={<DashboardRedirectPage />} />

        {/* Notification Center */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Single Reservation Detail View */}
        <Route path="/reservation/:id" element={<ReservationDetailPage />} />

        {/* Business Partner Routes */}
        <Route element={<RoleGuard allowedRoles={["business", "admin"]} />}>
          <Route
            path="/business/dashboard"
            element={<BusinessDashboardPage />}
          />
          <Route
            path="/business/reservations"
            element={<BusinessReservationsPage />}
          />
          <Route path="/business/food" element={<BusinessFoodPage />} />
          <Route path="/list-food" element={<ListFoodPage />} />
        </Route>

        {/* Recipient NGO Routes */}
        <Route element={<RoleGuard allowedRoles={["recipient", "admin"]} />}>
          <Route
            path="/recipient/dashboard"
            element={<RecipientDashboardPage />}
          />
          <Route
            path="/recipient/reservations"
            element={<RecipientReservationsPage />}
          />
        </Route>

        {/* Super Admin Routes */}
        <Route element={<RoleGuard allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route
            path="/admin/verifications"
            element={<AdminVerificationsPage />}
          />
        </Route>

        {/* Account Profile & Settings */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 404 Catch-All Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
