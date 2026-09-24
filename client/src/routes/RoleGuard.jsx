import React from "react";
import { Navigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner, EmptyState } from "../components/common";
import { ShieldAlert } from "lucide-react";

const RoleGuard = ({
  allowedRoles = [],
  redirectTo = "/dashboard",
  children,
}) => {
  const { userRole, mongoUser, loading } = useAuth();

  if (loading) {
    return (
      <LoadingSpinner size="lg" message="Checking permissions..." fullScreen />
    );
  }

  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  if ((!mongoUser || !mongoUser.isVerified) && userRole !== "admin") {
    return (
      <div className="pt-20 max-w-2xl mx-auto px-4">
        <EmptyState
          icon={ShieldAlert}
          title="Account Pending Verification"
          description="Your account is currently under review by our administration team. You will be able to access this portal once your organization's details have been fully verified to ensure food safety and compliance."
          actionLabel="Go to Profile"
          onAction={null}
        />
        <div className="text-center mt-4">
          <Link
            to="/profile"
            className="text-brand-600 font-bold hover:underline"
          >
            Update Profile Information
          </Link>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default RoleGuard;
