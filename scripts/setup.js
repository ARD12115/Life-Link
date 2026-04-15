const fs = require('fs');
const path = require('path');

console.log('🚀 Starting LifeLink Setup Check...\n');

const envPath = path.join(__dirname, '..', '.env');
const mcpPath = path.join(__dirname, '..', '.mcp.json');

let errors = 0;

// 1. Check .env existence
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file missing. Creating a template...');
  const template = `# Supabase Configuration\nREACT_APP_SUPABASE_URL=\nREACT_APP_SUPABASE_PUBLISHABLE_KEY=\n`;
  fs.writeFileSync(envPath, template);
  console.log('✅ .env template created. Please fill it with your keys.');
  errors++;
} else {
  const content = fs.readFileSync(envPath, 'utf8');
  if (!content.includes('http') || content.includes('_URL=')) {
    // Check if values are actually filled after the '='
    const lines = content.split('\n');
    const urlSet = lines.find(l => l.startsWith('REACT_APP_SUPABASE_URL=') && l.split('=')[1].trim().length > 0);
    const keySet = lines.find(l => l.startsWith('REACT_APP_SUPABASE_PUBLISHABLE_KEY=') && l.split('=')[1].trim().length > 0);
    
    if (!urlSet || !keySet) {
       console.log('❌ .env exists but keys seem to be empty.');
       errors++;
    } else {
       console.log('✅ .env configured correctly.');
    }
  } else {
    console.log('✅ .env configured correctly.');
  }
}

// 2. Check for node_modules
if (!fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
  console.log('❌ node_modules missing. Please run "npm install".');
  errors++;
} else {
  console.log('✅ node_modules found.');
}

// 3. Check for .mcp.json
if (!fs.existsSync(mcpPath)) {
  console.log('⚠️ .mcp.json missing. This is needed for the agent to know your project_ref.');
} else {
  try {
    const mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
    if (mcp.serverUrl && mcp.serverUrl.includes('project_ref')) {
      console.log('✅ .mcp.json found with project_ref.');
    } else {
      console.log('⚠️ .mcp.json found but project_ref might be missing.');
    }
  } catch (e) {
    console.log('❌ .mcp.json is invalid JSON.');
    errors++;
  }
}

console.log('\n---');
if (errors === 0) {
  console.log('✨ Everything looks good! You are ready to run "npm start".');
} else {
  console.log('📌 Please fix the issues above to finish your setup.');
}
