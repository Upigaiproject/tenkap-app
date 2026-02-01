const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const keys = webpush.generateVAPIDKeys();

const backendEnvPath = path.join(__dirname, '.env');
const frontendEnvPath = path.join(__dirname, '../frontend/.env');

const backendContent = `
# Push Notifications
VAPID_PUBLIC_KEY=${keys.publicKey}
VAPID_PRIVATE_KEY=${keys.privateKey}
`;

const frontendContent = `
# Push Notifications
VITE_VAPID_PUBLIC_KEY=${keys.publicKey}
`;

// Append to backend .env
fs.appendFileSync(backendEnvPath, backendContent);
console.log('✅ Added keys to backend .env');

// Append to frontend .env (create if not exists)
if (fs.existsSync(frontendEnvPath)) {
    fs.appendFileSync(frontendEnvPath, frontendContent);
    console.log('✅ Added keys to frontend .env');
} else {
    fs.writeFileSync(frontendEnvPath, frontendContent.trim());
    console.log('✅ Created frontend .env with keys');
}

console.log('Public Key:', keys.publicKey);
