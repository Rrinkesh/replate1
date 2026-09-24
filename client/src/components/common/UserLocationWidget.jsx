
import React, { useState, useEffect } from "react";
import { MapPin, Navigation, ChevronDown, Loader2 } from "lucide-react";

const UserLocationWidget = () => {
  const [locationName, setLocationName] = useState("Select Location");
  const [isLocating, setIsLocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("user_location_name");
    if (saved) setLocationName(saved);
  }, []);

  const handleDetectLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Reverse geocode
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            
            let address = "Unknown Location";
            if (data && data.display_name) {
              // Extract the first 3 or 4 meaningful parts of the exact address to provide street-level detail
              // without showing the entire state/country/zipcode string.
              const parts = data.display_name.split(",").map(p => p.trim());
              if (parts.length > 3) {
                address = parts.slice(0, 3).join(", ");
              } else {
                address = data.display_name;
              }
            }
            
            setLocationName(address);
            localStorage.setItem("user_location_name", address);
            localStorage.setItem("user_location_coords", JSON.stringify({lat, lng}));
            setShowDropdown(false);
          } catch (err) {
            console.error("Geocoding error:", err);
            setLocationName("Location Detected");
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          alert("Please allow location access in your browser settings.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

  return (
    <div className="relative z-50">
      <div 
        onClick={() => setShowDropdown(!showDropdown)}
        className="hidden md:flex items-center gap-1.5 px-3 py-2 hover:bg-surface-100 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-charcoal-200"
      >
        <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
        <span className="text-sm font-bold text-charcoal-800 max-w-[150px] truncate">
          {locationName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-charcoal-500" />
      </div>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-soft-xl border border-charcoal-100 p-3 z-50 animate-in fade-in slide-in-from-top-2">
            <button
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="w-full flex items-center gap-3 p-3 hover:bg-brand-50 text-brand-700 rounded-xl transition-colors font-bold text-sm disabled:opacity-70"
            >
              {isLocating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Navigation className="w-5 h-5" />
              )}
              <div className="text-left">
                <div>Detect Current Location</div>
                <div className="text-xs font-medium text-brand-600/70">Using GPS</div>
              </div>
            </button>
            <div className="my-2 border-t border-charcoal-100"></div>
            <div className="px-3 py-2 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
              Recent Locations
            </div>
            <button className="w-full text-left px-3 py-2 hover:bg-surface-50 text-sm font-medium text-charcoal-700 rounded-lg">
              Noida Sector 62, Noida
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-surface-50 text-sm font-medium text-charcoal-700 rounded-lg">
              Connaught Place, New Delhi
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserLocationWidget;

