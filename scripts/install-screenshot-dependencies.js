const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Installing screenshot dependencies...');

try {
  // Check if package.json exists
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    console.log('📦 Installing Puppeteer...');
    
    // Install puppeteer
    execSync('npm install puppeteer --save-dev', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    console.log('✅ Puppeteer installed successfully!');
    
    // Update package.json with screenshot script
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts['screenshots'] = 'node scripts/take-screenshots.js';
    packageJson.scripts['setup-screenshots'] = 'node scripts/install-screenshot-dependencies.js';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Added screenshot scripts to package.json');
    
  } else {
    console.log('❌ package.json not found. Please run this from the project root directory.');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}

console.log(`
🎉 Setup complete! 

You can now run:
  npm run screenshots        # Take screenshots of all HTML mockups
  node scripts/take-screenshots.js  # Direct script execution

Screenshots will be saved to: ./screenshots/
`);