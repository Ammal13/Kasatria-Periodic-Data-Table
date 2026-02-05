# PHP Authentication System - README

## 🎯 Overview
This project now uses PHP session-based authentication with Google OAuth integration.

## 📁 File Structure

### PHP Backend Files
- `config.php` - Session management and configuration
- `login.php` - Handles Google OAuth callbacks
- `logout.php` - Destroys user sessions
- `check_auth.php` - Authentication middleware
- `test_login.php` - Bypass login for testing

### Frontend Files
- `login_page.php` - Login page with Google Sign-In
- `index.php` - Main visualization (protected by authentication)
- `data-loader.js` - Loads data from Google Sheets
- `threejs-visualizations.js` - 3D visualization logic
- `script.js` - Layout switching logic

## 🚀 How to Use

### 1. Start XAMPP
- Open XAMPP Control Panel
- Start Apache server
- Make sure PHP is enabled

### 2. Access the Application
Navigate to: `http://localhost/Kasatria/periodic-table-project/`

You'll be redirected to the login page automatically.

### 3. Login Options

#### Option A: Google Sign-In
1. Click "Sign in with Google" button
2. Choose your Google account
3. You'll be redirected to the visualization

#### Option B: Test Login (Skip Authentication)
1. Click "Load Test Data (Skip Login)" button
2. Instantly access the visualization
3. Perfect for testing and assignment demonstration

### 4. Using the Visualization
- Use the layout buttons to switch between:
  - 📋 Table Layout (20×10)
  - 🌐 Sphere Layout
  - 🧬 Double Helix Layout
  - 🔲 Grid Layout (5×4×10)
- Click "Sign Out" to logout

## 🔧 Google Cloud Console Configuration

For Google Sign-In to work, configure your OAuth client:

1. Go to https://console.cloud.google.com/
2. Navigate to APIs & Services → Credentials
3. Find your OAuth Client ID: `618402076762-i48nl6v0rlarov55qt0fuoqpr3s4dgpr`
4. Add to **Authorized JavaScript origins**:
   ```
   http://localhost
   http://localhost/Kasatria/periodic-table-project
   ```
5. Add to **Authorized redirect URIs**:
   ```
   http://localhost/Kasatria/periodic-table-project/login.php
   ```

## ✅ Assignment Requirements

✅ **Requirement 1**: Google Sheet with data  
✅ **Requirement 2**: Google login credential (PHP-based)  
✅ **Requirement 3**: Data from Google Sheets  
✅ **Requirement 4**: Data structure in tiles  
✅ **Requirement 5**: Color coding by Net Worth  
✅ **Requirement 6**: 4 different layouts  
✅ **Requirement 7**: Table 20×10  
✅ **Requirement 8**: Double Helix  
✅ **Requirement 9**: Grid 5×4×10  

## 🐛 Troubleshooting

### "Session not starting"
- Make sure XAMPP Apache is running
- Check that PHP is enabled in XAMPP

### "Google Sign-In not working"
- Use the "Load Test Data" button instead
- Or configure Google Cloud Console (see above)

### "Page not loading"
- Clear browser cache
- Check XAMPP Apache is running
- Navigate to `http://localhost/Kasatria/periodic-table-project/`

## 📝 Tech Stack

- **Web Server**: XAMPP Apache
- **Backend**: PHP (session-based authentication)
- **Frontend**: HTML, CSS, JavaScript
- **3D Library**: Three.js
- **Data Source**: Google Sheets API
- **Authentication**: Google OAuth 2.0
