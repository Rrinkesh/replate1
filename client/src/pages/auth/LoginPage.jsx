import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Card, Input, Button, Modal } from "../../components/common";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, resetPassword } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Password reset modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");
  const [resetErrorMessage, setResetErrorMessage] = useState("");

  // Map Firebase Auth errors to user-friendly messages
  const getFriendlyErrorMessage = (code) => {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password. Please check your credentials.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled. Contact support.";
      case "auth/too-many-requests":
        return "Too many failed login attempts. Please try again later.";
      default:
        return "Failed to log in. Please try again.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const code = err.code || "";
      setErrorMessage(getFriendlyErrorMessage(code));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage("");
    try {
      setIsGoogleSubmitting(true);
      await loginWithGoogle("business");
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setErrorMessage("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSendResetPassword = async (e) => {
    e.preventDefault();
    setResetErrorMessage("");
    setResetSuccessMessage("");

    if (!resetEmail) {
      setResetErrorMessage("Please enter your account email address.");
      return;
    }

    try {
      await resetPassword(resetEmail);
      setResetSuccessMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      setResetErrorMessage("Failed to send reset email. Verify email address.");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Card variant="default" className="shadow-soft-xl border-charcoal-200">
        <Card.Header className="text-center">
          <Card.Title className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Welcome Back
          </Card.Title>
          <Card.Description className="mt-1">
            Sign in to access your RePlate partner dashboard
          </Card.Description>
        </Card.Header>

        <Card.Content className="space-y-5">
          {/* Global Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email Address"
              type="email"
              placeholder="partner@hotel.com"
              iconLeft={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              iconLeft={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Remember Me & Forgot Password Options */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 font-medium text-charcoal-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 border-charcoal-300"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setIsResetModalOpen(true);
                }}
                className="font-bold text-brand-700 hover:text-brand-800 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              iconRight={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-charcoal-200" />
            </div>
            <span className="relative px-3 bg-white text-[11px] uppercase font-bold text-charcoal-400">
              Or continue with
            </span>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleSubmitting}
            className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-charcoal-200 bg-white hover:bg-surface-50 text-charcoal-800 font-semibold text-sm shadow-soft-xs transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
          >
            {/* Google G Logo SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {isGoogleSubmitting
                ? "Signing in with Google..."
                : "Continue with Google"}
            </span>
          </button>
        </Card.Content>

        <Card.Footer className="justify-center text-xs text-charcoal-500">
          Don't have an account yet?{" "}
          <Link
            to="/signup"
            className="text-brand-700 font-bold ml-1 hover:underline"
          >
            Register Here
          </Link>
        </Card.Footer>
      </Card>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Password"
        subtitle="Enter your account email to receive a password reset link."
        footer={
          <Button variant="primary" onClick={handleSendResetPassword}>
            Send Reset Email
          </Button>
        }
      >
        <form onSubmit={handleSendResetPassword} className="space-y-3">
          {resetSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}
          {resetErrorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{resetErrorMessage}</span>
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="partner@hotel.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
};

export default LoginPage;
