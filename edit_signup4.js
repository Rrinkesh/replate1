const fs = require('fs');
let file = fs.readFileSync('client/src/pages/auth/SignupPage.jsx', 'utf8');

if (!file.includes('const [registrationNumber')) {
  file = file.replace(
    'const [businessType, setBusinessType] = useState("RESTAURANT");',
    'const [businessType, setBusinessType] = useState("RESTAURANT");\n  const [registrationNumber, setRegistrationNumber] = useState("");\n  const [eventCardImage, setEventCardImage] = useState("");'
  );
}

if (!file.includes('ImageUploader')) {
  file = file.replace(
    'import { Input, Button, Card } from "../../components/common";',
    'import { Input, Button, Card, ImageUploader } from "../../components/common";'
  );
}

file = file.replace(
  '...(role === "business" && { businessType })',
  '...(role === "business" && { businessType, registrationNumber, eventCardImage })'
);
file = file.replace(
  '...(role === "business" && { businessType })',
  '...(role === "business" && { businessType, registrationNumber, eventCardImage })'
);

const uiSearch = '{/* Signup Form */}';
const uiReplace = `{/* Dynamic Business Inputs */}
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

            {/* Signup Form */}`;

file = file.replace(uiSearch, uiReplace);
fs.writeFileSync('client/src/pages/auth/SignupPage.jsx', file);
