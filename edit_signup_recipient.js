const fs = require('fs');

let file = fs.readFileSync('client/src/pages/auth/SignupPage.jsx', 'utf8');

const uiSearch = `{/* Global Error Banner */}`;

const uiReplace = `
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

          {/* Global Error Banner */}`;

file = file.replace(uiSearch, uiReplace);

fs.writeFileSync('client/src/pages/auth/SignupPage.jsx', file);
