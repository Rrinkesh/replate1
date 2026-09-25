const fs = require('fs');
let file = fs.readFileSync('client/src/pages/auth/SignupPage.jsx', 'utf8');

file = file.replace('const [role, setRole] = useState("business");', 'const [role, setRole] = useState("business");\n  const [recipientType, setRecipientType] = useState("NGO");');

file = file.replace(
  'await signup(email, password, name, role, {\n        phone,\n        location: { address },\n      });',
  'await signup(email, password, name, role, {\n        phone,\n        location: { address },\n        ...(role === "recipient" && { recipientType })\n      });'
);

file = file.replace(
  'await loginWithGoogle(role);',
  'await loginWithGoogle(role, {\n        ...(role === "recipient" && { recipientType })\n      });'
);

// Now for the UI part, right below the Role Selection Segmented Bar
const uiSearch = '</p>\n            </div>\n\n\n            {/* Signup Form */}';
const uiReplace = `</p>
            </div>

            {/* Recipient Type Sub-Selection */}
            {role === 'recipient' && (
              <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl">
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


            {/* Signup Form */}`;

file = file.replace(uiSearch, uiReplace);
fs.writeFileSync('client/src/pages/auth/SignupPage.jsx', file);
