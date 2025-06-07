# Screenshot Guide for HTML Mockups

This guide provides multiple methods to capture screenshots of the HTML mockup files.

## 📁 HTML Files Location
All HTML mockup files are located in the `/mockups/` directory:
- `01-register-page.html` - User registration page
- `02-login-page.html` - User login page  
- `03-home-page.html` - Application home page
- `04-chat-page.html` - Chat interface page
- `05-templates-page.html` - Template library page
- `06-search-page.html` - Search functionality page
- `07-admin-page.html` - Admin management page

## 🤖 Automated Screenshot Method (Recommended)

### Prerequisites
- Node.js installed on your system
- npm/yarn package manager

### Quick Start
```bash
# For Windows users
./scripts/take-screenshots.bat

# For Mac/Linux users  
chmod +x scripts/take-screenshots.sh
./scripts/take-screenshots.sh

# Or use npm (after installing dependencies)
npm install puppeteer --save-dev
npm run screenshots
```

### Manual Dependency Installation
```bash
# Install Puppeteer
npm install puppeteer --save-dev

# Run screenshot script
node scripts/take-screenshots.js
```

## 📸 Manual Screenshot Methods

### Method 1: Browser Screenshots
1. **Open HTML files in browser:**
   - Navigate to the `/mockups/` folder
   - Double-click each HTML file to open in your default browser
   - Or drag and drop files into browser window

2. **Take screenshots:**
   - **Chrome/Edge:** Press `F12` → Click mobile/tablet icon → Select device → Press `Ctrl+Shift+P` → Type "screenshot" → Select "Capture full size screenshot"
   - **Firefox:** Press `F12` → Click responsive design icon → Press `Shift+F2` → Type `:screenshot --fullpage`
   - **Safari:** Develop menu → Show Web Inspector → Select device → File → Export Image

### Method 2: Browser Extensions
Install screenshot extensions:
- **Chrome:** "GoFullPage", "Awesome Screenshot"
- **Firefox:** "FireShot", "Screenshot Tool"
- **Edge:** "Web Capture", "GoFullPage"

### Method 3: Operating System Tools
- **Windows:** Use Snipping Tool or Snip & Sketch (`Win + Shift + S`)
- **macOS:** Use Screenshot utility (`Cmd + Shift + 5`)
- **Linux:** Use gnome-screenshot, Spectacle, or similar tools

### Method 4: Online Tools
1. Upload HTML files to online screenshot services:
   - htmlcsstoimage.com
   - web-capture.net
   - screenshot.guru

## 📱 Recommended Screenshot Settings

### Desktop Screenshots
- **Resolution:** 1920x1080 (Full HD)
- **Format:** PNG (for best quality)
- **Capture:** Full page (not just visible area)

### Mobile Screenshots  
- **iPhone:** 375x812 (iPhone X/11/12)
- **Android:** 360x640 (Standard Android)
- **Tablet:** 768x1024 (iPad)

## 📂 Output Organization

Create a `screenshots` folder in your project root with this structure:
```
screenshots/
├── 01-register-page.png
├── 02-login-page.png
├── 03-home-page.png
├── 04-chat-page.png
├── 05-templates-page.png
├── 06-search-page.png
└── 07-admin-page.png
```

## 🎨 Screenshot Quality Tips

1. **Full Page Capture:** Always capture the complete page, not just the visible viewport
2. **High Resolution:** Use at least 1920px width for desktop screenshots
3. **Clean Browser:** Disable extensions, clear cache, use incognito mode
4. **Consistent Viewport:** Use the same browser window size for all screenshots
5. **PNG Format:** Use PNG for crisp text and UI elements

## 🔧 Troubleshooting

### Common Issues
1. **Fonts not loading:** Ensure internet connection for web fonts
2. **Images not showing:** Check if HTML files reference correct image paths  
3. **Layout broken:** Verify Tailwind CSS is loading correctly
4. **Colors wrong:** Check if CSS custom properties are supported

### Browser Compatibility
- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 90+

### Puppeteer Issues
- **Installation fails:** Try `npm install puppeteer --unsafe-perm=true`
- **Permission errors:** Run with `sudo` on Linux/Mac
- **Memory issues:** Add `--max-old-space-size=4096` to Node.js

## 📋 Screenshot Checklist

- [ ] All 7 HTML files opened successfully
- [ ] Screenshots captured in PNG format
- [ ] Full page content visible (no cropping)
- [ ] Text is crisp and readable
- [ ] Colors match the design specifications
- [ ] Screenshots saved with consistent naming
- [ ] Files organized in dedicated screenshots folder

## 🚀 Advanced Options

### Custom Screenshot Script
You can modify `scripts/take-screenshots.js` to:
- Change viewport sizes
- Add delays for animations
- Capture specific elements only
- Generate mobile/tablet versions
- Add timestamps to filenames

### Batch Processing
For multiple screen sizes:
```javascript
const viewports = [
  { width: 1920, height: 1080, name: 'desktop' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 375, height: 812, name: 'mobile' }
];
```

This will help you create a comprehensive screenshot library for your HTML mockups!