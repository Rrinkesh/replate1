import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner } from "../../components/common";

const DashboardRedirectPage = () => {
  const navigate = useNavigate();
  const { userRole, mongoUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Use mongoUser role if available for maximum accuracy, otherwise fallback to userRole state
    const currentRole = mongoUser?.role?.toLowerCase() || userRole;

    if (currentRole === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else if (currentRole === "recipient") {
      navigate("/recipient/dashboard", { replace: true });
    } else {
      navigate("/business/dashboard", { replace: true });
    }
  }, [userRole, mongoUser, loading, navigate]);

  return (
    <LoadingSpinner
      size="lg"
      message="Routing to your dashboard..."
      fullScreen
    />
  );
};

export default DashboardRedirectPage;
