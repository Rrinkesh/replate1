const fs = require('fs');
let file = fs.readFileSync('client/src/context/AuthContext.jsx', 'utf8');
file = file.replace('const loginWithGoogle = async (role = \"business\") => {', 'const loginWithGoogle = async (role = \"business\", extraData = {}) => {');
file = file.replace('await syncWithMongoDB(user, role);', 'await syncWithMongoDB(user, role, extraData);');
fs.writeFileSync('client/src/context/AuthContext.jsx', file);
