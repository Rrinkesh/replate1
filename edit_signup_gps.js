const fs = require('fs');
let file = fs.readFileSync('client/src/pages/auth/SignupPage.jsx', 'utf8');

if (!file.includes('LocateFixed')) {
  file = file.replace(
    'MapPin,',
    'MapPin,\n  LocateFixed,\n  Loader2,'
  );
}

if (!file.includes('const [isLocating')) {
  file = file.replace(
    'const [isSubmitting, setIsSubmitting] = useState(false);',
    'const [isSubmitting, setIsSubmitting] = useState(false);\n  const [isLocating, setIsLocating] = useState(false);'
  );
}

if (!file.includes('handleGPSClick')) {
  const funcToAdd = `
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
          const response = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${latitude}&lon=\${longitude}\`);
          const data = await response.json();
          
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(\`\${latitude}, \${longitude}\`);
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
`;
  file = file.replace(
    'const validateForm = () => {',
    funcToAdd + '\n  const validateForm = () => {'
  );
}

file = file.replace(
  'iconLeft={MapPin}\n              value={address}\n              onChange={(e) => setAddress(e.target.value)}\n              required',
  'iconLeft={MapPin}\n              iconRight={isLocating ? Loader2 : LocateFixed}\n              onRightIconClick={handleGPSClick}\n              value={address}\n              onChange={(e) => setAddress(e.target.value)}\n              required'
);

fs.writeFileSync('client/src/pages/auth/SignupPage.jsx', file);
