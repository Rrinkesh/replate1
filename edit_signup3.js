const fs = require('fs');
let file = fs.readFileSync('client/src/pages/auth/SignupPage.jsx', 'utf8');

file = file.replace(
  'const [recipientType, setRecipientType] = useState("NGO");',
  'const [recipientType, setRecipientType] = useState("NGO");\n  const [businessType, setBusinessType] = useState("RESTAURANT");'
);

file = file.replace(
  '...(role === "recipient" && { recipientType })',
  '...(role === "recipient" && { recipientType }),\n        ...(role === "business" && { businessType })'
);

file = file.replace(
  '...(role === "recipient" && { recipientType })',
  '...(role === "recipient" && { recipientType }),\n        ...(role === "business" && { businessType })'
);

const uiSearch = '{/* Recipient Type Sub-Selection */}';
const uiReplace = `{/* Business Type Sub-Selection */}
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

          {/* Recipient Type Sub-Selection */}`;

file = file.replace(uiSearch, uiReplace);
fs.writeFileSync('client/src/pages/auth/SignupPage.jsx', file);
