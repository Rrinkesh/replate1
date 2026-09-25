import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  Lock,
  User,
  HeartHandshake,
  ArrowRight,
  AlertCircle,
  Phone,
  MapPin,
  LocateFixed,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Card, Input, Button, ImageUploader } from "../../components/common";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();

  const [role, setRole] = useState("business");
  const [recipientType, setRecipientType] = useState("NGO");
  const [businessType, setBusinessType] = useState("RESTAURANT");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [eventCardImage, setEventCardImage] = useState(""); // 'business' or 'recipient'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  
  const handleGPSClick = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`${latitude}, ${longitude}`);
          }
        } catch (err) {
          console.error(err);
          setErrorMessage("Failed to retrieve address from GPS.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        setErrorMessage("Please allow location permissions to use GPS.");
      }
    );
  };

  const validateForm = () => {
    if (!name.trim()) {
      setErrorMessage("Please enter your name or organization name.");
      return false;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return false;
    }
    if (!phone.trim()) {
      setErrorMessage("Please enter your contact phone number.");
      return false;
    }
    if (!address.trim()) {
      setErrorMessage("Please enter your full address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await signup(email, password, name, role, {
        phone,
        location: { address },
        ...(role === "recipient" && { recipientType, registrationNumber }),
        ...(role === "business" && { businessType, registrationNumber, eventCardImage }),
        ...(role === "business" && { businessType, registrationNumber, eventCardImage })
      });
      // Redirect to specific portal
      navigate(
        role === "business" ? "/business/dashboard" : "/recipient/dashboard",
        {
          replace: true,
        },
      );
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setErrorMessage(
          "This email is already registered. Please sign in instead.",
        );
      } else if (err.code === "auth/invalid-email") {
        setErrorMessage("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setErrorMessage("Password is too weak. Choose a stronger password.");
      } else if (
        err.code === "auth/invalid-api-key" ||
        err.message?.includes("API key")
      ) {
        setErrorMessage(
          "Firebase API key is unconfigured. Using dev fallback session.",
        );
      } else {
        setErrorMessage(
          err.message || "Failed to create account. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMessage("");
    try {
      setIsGoogleSubmitting(true);
      await loginWithGoogle(role, {
        ...(role === "recipient" && { recipientType, registrationNumber })
      });
      navigate(
        role === "business" ? "/business/dashboard" : "/recipient/dashboard",
        {
          replace: true,
        },
      );
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setErrorMessage(
          err.message || "Failed to sign up with Google. Please try again.",
        );
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 page-enter">
      <Card variant="default" className="shadow-soft-xl border-charcoal-200 hover-3d-mild">
        <Card.Header className="text-center">
          <Card.Title className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Join RePlate
          </Card.Title>
          <Card.Description className="mt-1">
            "Good food deserves another plate."
          </Card.Description>
        </Card.Header>

        <Card.Content className="space-y-6">
          {/* Role Selection Segmented Bar */}
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2">
              Select Your Organization Category:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-100 rounded-2xl border border-charcoal-200">
              <button
                type="button"
                onClick={() => setRole("business")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all ${
                  role === "business"
                    ? "bg-brand-600 text-white shadow-soft-xs"
                    : "text-charcoal-700 hover:bg-surface-200"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>I am a Business</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("recipient")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all ${
                  role === "recipient"
                    ? "bg-brand-600 text-white shadow-soft-xs"
                    : "text-charcoal-700 hover:bg-surface-200"
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>I am a Recipient</span>
              </button>
            </div>
            <p className="text-[11px] text-charcoal-500 mt-1.5 text-center">
              {role === "business"
                ? "For hotels, restaurants, bakeries, and cloud kitchens posting food surplus."
                : "For verified NGOs, shelters, and community kitchens receiving food."}
            </p>
          </div>

          {/* Business Type Sub-Selection */}
          {role === 'business' && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl mb-4">
              <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                What type of donor are you?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="businessType" value="RESTAURANT" checked={businessType === 'RESTAURANT'} onChange={(e) => setBusinessType(e.target.value)} className="accent-emerald-600 w-4 h-4" />
                  <span className="text-sm font-semibold text-charcoal-900">Restaurant / Hotel</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="businessType" value="PARTY" checked={businessType === 'PARTY'} onChange={(e) => setBusinessType(e.target.value)} className="accent-emerald-600 w-4 h-4" />
                  <span className="text-sm font-semibold text-charcoal-900">Event / Party</span>
                </label>
              </div>
              <p className="text-xs text-emerald-700 mt-2 font-medium">
                {businessType === 'RESTAURANT' ? 'For commercial food businesses.' : 'For individuals or event organizers donating large-scale leftover food.'}
              </p>
            </div>
          )}

          {/* Recipient Type Sub-Selection */}
          {role === 'recipient' && (
            <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl mb-4">
              <label className="block text-xs font-bold text-brand-900 uppercase tracking-wider mb-2">
                Are you an NGO or a Business Buyer?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="recipientType" value="NGO" checked={recipientType === 'NGO'} onChange={(e) => setRecipientType(e.target.value)} className="accent-brand-600 w-4 h-4" />
                  <span className="text-sm font-semibold text-charcoal-900">NGO / Charity</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="recipientType" value="BUSINESS" checked={recipientType === 'BUSINESS'} onChange={(e) => setRecipientType(e.target.value)} className="accent-brand-600 w-4 h-4" />
                  <span className="text-sm font-semibold text-charcoal-900">Business Buyer</span>
                </label>
              </div>
              <p className="text-xs text-brand-700 mt-2 font-medium">
                {recipientType === 'NGO' ? 'NGOs get a 100% discount on all platform food.' : 'Business buyers can purchase surplus food at heavily discounted rates.'}
              </p>
            </div>
          )}

          
          {/* Recipient Registration Number Input */}
          {role === 'recipient' && (
            <div className="mb-4">
              <Input
                label={recipientType === 'NGO' ? "NGO Registration / Trust Number" : "Business Registration Number"}
                type="text"
                placeholder={recipientType === 'NGO' ? "e.g. NGO-12345678" : "e.g. BUS-12345678"}
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                required
              />
            </div>
          )}

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Dynamic Business Inputs */}
            {role === 'business' && (
              <div className="space-y-4 mb-4">
                {businessType === 'RESTAURANT' ? (
                  <Input
                    label="Official Registration / FSSAI Number"
                    type="text"
                    placeholder="e.g. 12345678901234"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    required
                  />
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2">
                      Event Invitation Card (Proof of Event)
                    </label>
                    <ImageUploader
                      currentImage={eventCardImage}
                      onUploadSuccess={(url) => setEventCardImage(url)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={
                role === "business"
                  ? "Business / Kitchen Name"
                  : "Organization / NGO Name"
              }
              type="text"
              placeholder={
                role === "business"
                  ? "Radisson Blu Noida"
                  : "Hope Care Foundation"
              }
              iconLeft={role === "business" ? Building2 : User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Work Email Address"
              type="email"
              placeholder="contact@partner.com"
              iconLeft={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              iconLeft={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <Input
              label="Full Address"
              type="text"
              placeholder={
                role === "business"
                  ? "123 Kitchen St, Sector 62, Noida"
                  : "45 Relief Rd, Sector 62, Noida"
              }
              iconLeft={MapPin}
              iconRight={isLocating ? Loader2 : LocateFixed}
              onRightIconClick={handleGPSClick}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="At least 6 chars"
                iconLeft={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                iconLeft={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              iconRight={ArrowRight}
            >
              Create {role === "business" ? "Business Partner" : "Recipient"}{" "}
              Account
            </Button>
          </form>

          {/* Divider */}
          <div className="relative py-1 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-charcoal-200" />
            </div>
            <span className="relative px-3 bg-white text-[11px] uppercase font-bold text-charcoal-400">
              Or sign up with
            </span>
          </div>

          {/* Google Signup Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleSubmitting}
            className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-charcoal-200 bg-white hover:bg-surface-50 text-charcoal-800 font-semibold text-sm shadow-soft-xs transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
          >
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
                ? "Signing up with Google..."
                : "Sign up with Google"}
            </span>
          </button>
        </Card.Content>

        <Card.Footer className="justify-center text-xs text-charcoal-500">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-brand-700 font-bold ml-1 hover:underline"
          >
            Sign In Here
          </Link>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default SignupPage;
