const fs = require('fs');

let file = fs.readFileSync('client/src/components/common/UserLocationWidget.jsx', 'utf8');

if (!file.includes('const [manualAddress')) {
  file = file.replace(
    'const [isLocating, setIsLocating] = useState(false);',
    'const [isLocating, setIsLocating] = useState(false);\n  const [manualAddress, setManualAddress] = useState("");'
  );

  file = file.replace(
    'import { MapPin, Navigation, ChevronDown, Loader2 } from "lucide-react";',
    'import { MapPin, Navigation, ChevronDown, Loader2, Search } from "lucide-react";'
  );

  const handleManualSearch = `  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualAddress.trim()) return;
    setIsLocating(true);
    try {
      const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(manualAddress)}&limit=1\`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        let address = data[0].display_name;
        const parts = address.split(",").map(p => p.trim());
        if (parts.length > 3) {
          address = parts.slice(0, 3).join(", ");
        }
        
        setLocationName(address);
        localStorage.setItem("user_location_name", address);
        localStorage.setItem("user_location_coords", JSON.stringify({lat, lng}));
        setShowDropdown(false);
        // Force reload so map picks up new localStorage
        window.location.reload();
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (err) {
      console.error(err);
      alert("Error searching location.");
    } finally {
      setIsLocating(false);
    }
  };
`;

  file = file.replace(
    '  const handleDetectLocation',
    handleManualSearch + '\n  const handleDetectLocation'
  );
  
  // also make GPS reload the page so the map updates
  file = file.replace(
    'setShowDropdown(false);',
    'setShowDropdown(false);\n            window.location.reload();'
  );

  const uiBlock = `            <div className="my-2 border-t border-charcoal-100"></div>
            <div className="px-3 py-2 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
              Manual Search
            </div>
            <form onSubmit={handleManualSearch} className="px-3 pb-3 flex gap-2">
              <input 
                type="text" 
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="e.g. New Delhi" 
                className="w-full text-sm border-charcoal-200 rounded-lg focus:ring-brand-500 py-2"
              />
              <button 
                type="submit"
                disabled={isLocating}
                className="bg-brand-600 text-white p-2 rounded-lg hover:bg-brand-700 disabled:opacity-70"
              >
                {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </form>
            <div className="my-2 border-t border-charcoal-100"></div>`;

  file = file.replace(
    '<div className="my-2 border-t border-charcoal-100"></div>',
    uiBlock
  );

  fs.writeFileSync('client/src/components/common/UserLocationWidget.jsx', file);
}

// Map Tile Fix
let mapFile = fs.readFileSync('client/src/components/food/FoodMap.jsx', 'utf8');
mapFile = mapFile.replace(
  'url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"',
  'url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"'
);
fs.writeFileSync('client/src/components/food/FoodMap.jsx', mapFile);
