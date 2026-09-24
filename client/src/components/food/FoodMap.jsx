import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { calculateDistance, formatDistance } from "../../utils/geo";
import { Navigation2 } from "lucide-react";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapBoundsFitter = ({ foods, userLocation }) => {
  const map = useMap();
  useEffect(() => {
    const validFoods = foods.filter(f => f.pickupLocation?.coordinates?.lat && f.pickupLocation?.coordinates?.lng);
    if (validFoods.length === 0 && !userLocation) return;
    const bounds = L.latLngBounds();
    if (userLocation) bounds.extend([userLocation.lat, userLocation.lng]);
    validFoods.forEach((food) => bounds.extend([food.pickupLocation.coordinates.lat, food.pickupLocation.coordinates.lng]));
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [foods, userLocation, map]);
  return null;
};

const RouteBoundsFitter = ({ routeCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (routeCoords && routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords);
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeCoords, map]);
  return null;
};

const FoodMap = ({ foods }) => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationName, setUserLocationName] = useState(null);
  
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [activeDest, setActiveDest] = useState(null);
  
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const watchIdRef = React.useRef(null);

  useEffect(() => {
    if (isLiveTracking && activeRouteId && activeDest && userLocation) {
      const timer = setTimeout(() => {
        fetchRoute(activeRouteId, activeDest.lat, activeDest.lng, userLocation);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [userLocation, isLiveTracking]);

  const toggleLiveTracking = () => {
    if (isLiveTracking) {
      setIsLiveTracking(false);
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    } else {
      if ("geolocation" in navigator) {
        setIsLiveTracking(true);
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setUserLocation({ lat, lng });
          },
          (error) => {
            console.error("Live tracking error", error);
            setIsLiveTracking(false);
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
        );
      } else {
        alert("Geolocation is not supported by your browser");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const fetchRoute = async (foodId, destLat, destLng, currentLoc = userLocation) => {
    if (!currentLoc) {
      alert("Please detect your location first using the top bar widget!");
      return;
    }
    
    setIsLoadingRoute(true);
    setActiveRouteId(foodId);
    setActiveDest({ lat: destLat, lng: destLng });
    
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${currentLoc.lng},${currentLoc.lat};${destLng},${destLat}?overview=full&geometries=geojson`);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoords(coordinates);
      }
    } catch (err) {
      console.error("Failed to fetch route:", err);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  useEffect(() => {
    const savedCoords = localStorage.getItem("user_location_coords");
    const savedName = localStorage.getItem("user_location_name");
    if (savedName) setUserLocationName(savedName);
    if (savedCoords) {
      try { setUserLocation(JSON.parse(savedCoords)); } catch(e) {}
    }
  }, []);

  const center = userLocation ? [userLocation.lat, userLocation.lng] : [28.5355, 77.3910];
  const validFoods = foods.filter(f => f.pickupLocation?.coordinates?.lat && f.pickupLocation?.coordinates?.lng);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-charcoal-200 shadow-soft-md z-0 relative group">
      
      {/* Live Tracking Floating Toggle */}
      <div className="absolute top-4 right-4 z-[400]">
        <button
          onClick={toggleLiveTracking}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shadow-soft-lg transition-all ${
            isLiveTracking 
              ? "bg-brand-600 text-white animate-pulse"
              : "bg-white text-charcoal-700 hover:bg-surface-50 border border-charcoal-200"
          }`}
        >
          <Navigation2 className={`w-4 h-4 ${isLiveTracking ? "text-white" : "text-brand-600"}`} />
          {isLiveTracking ? "Live Tracking ON" : "Start Live Tracking"}
        </button>
      </div>

      <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={false}
        className="w-full h-full min-h-[400px]"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong className="block mb-1 text-brand-600">You are here</strong>
                {userLocationName && <span className="text-xs font-semibold text-charcoal-600">{userLocationName}</span>}
              </div>
            </Popup>
          </Marker>
        )}

        {validFoods.map((food) => {
          let distanceStr = null;
          if (userLocation) {
            const dist = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              food.pickupLocation.coordinates.lat,
              food.pickupLocation.coordinates.lng
            );
            distanceStr = formatDistance(dist);
          }

          return (
            <Marker 
              key={food._id || food.id} 
              position={[food.pickupLocation.coordinates.lat, food.pickupLocation.coordinates.lng]}
              icon={customIcon}
            >
              <Popup>
                <div className="text-center min-w-[150px]">
                  <div className="font-extrabold text-charcoal-900 mb-1">{food.name}</div>
                  <div className="text-xs text-charcoal-600 mb-1">
                    {food.pickupLocation?.address || 
                     (food.businessId?.city ? `${food.businessId.city}, ${food.businessId.state || ""}` : "Location provided upon booking")}
                  </div>
                  {distanceStr && (
                    <div className="text-[10px] font-bold text-emerald-600 mb-2 bg-emerald-50 py-0.5 px-2 rounded-full inline-block">
                      ?? {distanceStr}
                    </div>
                  )}
                  <div className="text-sm font-bold text-brand-600 mb-3">?{food.price === 0 ? "Free" : food.price}</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/food/${food._id || food.id}`)}
                      className="flex-1 bg-brand-600 text-white text-[11px] font-bold py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
                    >
                      Details
                    </button>
                    {userLocation && (
                      <button 
                        onClick={() => fetchRoute(food._id || food.id, food.pickupLocation.coordinates.lat, food.pickupLocation.coordinates.lng)}
                        disabled={isLoadingRoute && activeRouteId === (food._id || food.id)}
                        className="flex-1 bg-charcoal-900 text-white text-[11px] font-bold py-1.5 rounded-lg hover:bg-charcoal-800 transition-colors disabled:opacity-50"
                      >
                        {isLoadingRoute && activeRouteId === (food._id || food.id) ? "..." : "Route"}
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {activeRouteId && routeCoords.length > 0 && (
          <>
            <Polyline 
              key={activeRouteId + routeCoords.length}
              positions={routeCoords} 
              color="#0ea5e9" 
              weight={5} 
              opacity={0.8}
              dashArray="10, 10"
              lineCap="round"
            />
            {!isLiveTracking && <RouteBoundsFitter routeCoords={routeCoords} />}
          </>
        )}

        {(!activeRouteId || routeCoords.length === 0) && (
          <MapBoundsFitter foods={foods} userLocation={userLocation} />
        )}
      </MapContainer>
    </div>
  );
};

export default FoodMap;

