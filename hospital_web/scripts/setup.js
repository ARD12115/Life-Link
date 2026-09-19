const fs = require('fs');
const path = require('path');

console.log('🚀 Starting LifeLink Setup Check...\n');

const envPath = path.join(__dirname, '..', '.env');
const mcpPath = path.join(__dirname, '..', '.mcp.json');
let errors = 0;

function logError(msg) { console.log(`❌ ${msg}`); errors++; }
function logWarn(msg) { console.log(`⚠️ ${msg}`); }
function logOk(msg) { console.log(`✅ ${msg}`); }

// 1. Check .env
if (!fs.existsSync(envPath)) {
  logError('.env file missing. Creating template...');
  fs.writeFileSync(envPath, `# Supabase Configuration\nREACT_APP_SUPABASE_URL=\nREACT_APP_SUPABASE_PUBLISHABLE_KEY=\n`);
  logOk('.env template created. Please fill in your keys.');
} else {
  const content = fs.readFileSync(envPath, 'utf8');
  const urlSet = /^REACT_APP_SUPABASE_URL=.+/m.test(content);
  const keySet = /^REACT_APP_SUPABASE_PUBLISHABLE_KEY=.+/m.test(content);
  if (!urlSet || !keySet) { logError('.env exists but keys are empty.'); }
  else { logOk('.env configured correctly.'); }
}

// 2. node_modules
if (!fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
  logError('node_modules missing. Run "npm install".');
} else { logOk('node_modules found.'); }

// 3. .mcp.json
if (!fs.existsSync(mcpPath)) {
  logWarn('.mcp.json missing — needed for agent projectRef.');
} else {
  try {
    const mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
    if (mcp.projectRef || mcp.serverUrl?.includes('projectRef')) { logOk('.mcp.json has projectRef.'); }
    else { logWarn('.mcp.json found but projectRef may be missing.'); }
  } catch { logError('.mcp.json is invalid JSON.'); }
}

console.log('\n---');
if (errors === 0) { console.log('✨ Ready! Run "npm start".'); process.exit(0); }
else { console.log('📌 Fix issues above.'); process.exit(1); }