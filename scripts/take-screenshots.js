const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const MOCKUPS_DIR = path.join(__dirname, '..', 'mockups');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;

// HTML files to screenshot
const HTML_FILES = [
  '01-register-page.html',
  '02-login-page.html', 
  '03-home-page.html',
  '04-chat-page.html',
  '05-templates-page.html',
  '06-search-page.html',
  '07-admin-page.html'
];

async function takeScreenshots() {
  console.log('🚀 Starting screenshot automation...');
  
  // Create screenshots directory if it doesn't exist
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    console.log(`📁 Created screenshots directory: ${SCREENSHOTS_DIR}`);
  }

  // Launch browser
  console.log('🌐 Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--allow-file-access-from-files'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
      deviceScaleFactor: 1
    });

    // Process each HTML file
    for (const htmlFile of HTML_FILES) {
      const htmlPath = path.join(MOCKUPS_DIR, htmlFile);
      const pngFileName = htmlFile.replace('.html', '.png');
      const pngPath = path.join(SCREENSHOTS_DIR, pngFileName);
      
      console.log(`📄 Processing: ${htmlFile}`);
      
      // Check if HTML file exists
      if (!fs.existsSync(htmlPath)) {
        console.log(`❌ File not found: ${htmlPath}`);
        continue;
      }
      
      try {
        // Navigate to the HTML file
        await page.goto(`file://${htmlPath}`, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });
        
        // Wait a bit for any animations/loading
        await page.waitForTimeout(2000);
        
        // Take full page screenshot
        await page.screenshot({
          path: pngPath,
          fullPage: true,
          type: 'png'
        });
        
        console.log(`✅ Screenshot saved: ${pngFileName}`);
        
      } catch (error) {
        console.log(`❌ Error processing ${htmlFile}:`, error.message);
      }
    }
    
    console.log('🎉 Screenshot automation completed!');
    
  } catch (error) {
    console.error('❌ Browser error:', error);
  } finally {
    await browser.close();
  }
}

// Helper function to get file info
function getFileInfo() {
  console.log('\n📊 Screenshot Summary:');
  console.log('=' .repeat(50));
  
  HTML_FILES.forEach(htmlFile => {
    const htmlPath = path.join(MOCKUPS_DIR, htmlFile);
    const pngFileName = htmlFile.replace('.html', '.png');
    const pngPath = path.join(SCREENSHOTS_DIR, pngFileName);
    
    const htmlExists = fs.existsSync(htmlPath);
    const pngExists = fs.existsSync(pngPath);
    
    console.log(`${htmlFile}:`);
    console.log(`  HTML: ${htmlExists ? '✅ Found' : '❌ Missing'}`);
    console.log(`  PNG:  ${pngExists ? '✅ Generated' : '⏳ Pending'}`);
    
    if (pngExists) {
      const stats = fs.statSync(pngPath);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`  Size: ${sizeKB} KB`);
    }
    console.log('');
  });
}

// Main execution
if (require.main === module) {
  takeScreenshots()
    .then(() => {
      getFileInfo();
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { takeScreenshots };