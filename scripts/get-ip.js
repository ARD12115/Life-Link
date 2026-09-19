const os = require('os');
const fs = require('fs');
const path = require('path');

const networkInterfaces = os.networkInterfaces();
const ip = Object.values(networkInterfaces)
  .flat()
  .find(i => i.family === 'IPv4' && !i.internal)?.address;

if (!ip) { 
  console.warn('\n⚠️ Could not detect local IP. QR codes may be inactive.'); 
  process.exit(0); 
}

const envPath = path.join(__dirname, '..', 'hospital_web', '.env.local');
if (!fs.existsSync(path.dirname(envPath))) { 
  console.error('❌ hospital_web folder not found'); 
  process.exit(1); 
}

const envContent = `REACT_APP_EXPO_URL=exp://${ip}:8081\n`;
fs.writeFileSync(envPath, envContent);
console.log(`\n📡 LifeLink Bridge: Expo URL set to exp://${ip}:8081`);