const fs = require('fs');

let file = fs.readFileSync('client/src/components/dashboard/AIForecasterCard.jsx', 'utf8');

// Remove from state
file = file.replace(
  'mealsSold: "",\n    previousSurplus: ""',
  'mealsSold: ""'
);

// Remove the input block
const blockToRemove = `<div>
            <label className="block text-xs font-bold text-charcoal-500 mb-1">Yesterday's Surplus</label>
            <input type="number" name="previousSurplus" value={formData.previousSurplus} onChange={handleChange} className="w-full text-sm border-charcoal-200 rounded-lg focus:ring-brand-500" required />
          </div>`;

file = file.replace(blockToRemove, '');

fs.writeFileSync('client/src/components/dashboard/AIForecasterCard.jsx', file);
