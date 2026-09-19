const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');

if (!fs.existsSync(buildDir)) {
  console.log('Build directory not found. Please run the build first.');
  process.exit(1);
}

// Remove all .map files recursively
function removeMapFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      removeMapFiles(filePath);
    } else if (path.extname(file) === '.map') {
      fs.unlinkSync(filePath);
      console.log(`Removed source map: ${filePath}`);
    }
  });
}

removeMapFiles(buildDir);
console.log('Source map removal completed.');