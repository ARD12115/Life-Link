const os = require('os');
const fs = require('fs');
const path = require('path');

const networkInterfaces = os.networkInterfaces();
const ip = Object.values(networkInterfaces)
  .flat()
  .find(i => i.family === 'IPv4' && !i.internal)?.address;

if (ip) {
  const envPath = path.join(__dirname, '..', 'hospital_web', '.env.local');
  const envContent = `REACT_APP_EXPO_URL=exp://${ip}:8081\n`;
  fs.writeFileSync(envPath, envContent);
  console.log(`\n📡 LifeLink Bridge: Expo URL set to exp://${ip}:8081`);
} else {
  console.warn('\n⚠️ LifeLink Bridge: Could not detect local IP. QR codes may be inactive.');
}
