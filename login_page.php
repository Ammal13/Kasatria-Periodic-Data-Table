<?php
// login_page.php - Google Sign-In Page
require_once 'config.php';

// If already authenticated, redirect to main page
if (isAuthenticated()) {
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Periodic Table Data Visualization - Login</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .login-container {
            background: white;
            padding: 50px 60px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 450px;
            width: 90%;
        }
        
        h1 {
            color: #333;
            font-size: 28px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .subtitle {
            color: #666;
            font-size: 16px;
            margin-bottom: 40px;
            line-height: 1.5;
        }
        
        .google-btn-container {
            margin: 30px 0;
        }
        
        .divider {
            margin: 30px 0;
            display: flex;
            align-items: center;
            color: #999;
            font-size: 14px;
        }
        
        .divider::before,
        .divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #ddd;
        }
        
        .divider::before {
            margin-right: 15px;
        }
        
        .divider::after {
            margin-left: 15px;
        }
        
        .test-btn {
            background: #6c757d;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 500;
            transition: all 0.3s ease;
            width: 100%;
        }
        
        .test-btn:hover {
            background: #5a6268;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .info-text {
            color: #999;
            font-size: 13px;
            margin-top: 15px;
            line-height: 1.4;
        }
        
        .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .success-message {
            background: #d4edda;
            color: #155724;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1>🧪 Periodic Table Data Visualization</h1>
        <p class="subtitle">Sign in with Google to view the interactive 3D data visualization</p>
        
        <?php if (isset($_GET['error'])): ?>
            <div class="error-message">
                ❌ Authentication failed. Please try again.
            </div>
        <?php endif; ?>
        
        <?php if (isset($_GET['logout']) && $_GET['logout'] === 'success'): ?>
            <div class="success-message">
                ✅ You have been successfully logged out.
            </div>
        <?php endif; ?>
        
        <!-- Google Sign-In Button -->
        <div class="google-btn-container">
            <div id="g_id_onload"
                 data-client_id="<?php echo GOOGLE_CLIENT_ID; ?>"
                 data-callback="handleGoogleLogin"
                 data-auto_prompt="false">
            </div>
            
            <div class="g_id_signin"
                 data-type="standard"
                 data-shape="rectangular"
                 data-theme="outline"
                 data-text="signin_with"
                 data-size="large"
                 data-logo_alignment="left"
                 data-width="350">
            </div>
        </div>
        
        <div class="divider">OR</div>
        
        <!-- Test Data Button -->
        <form action="test_login.php" method="POST">
            <button type="submit" class="test-btn">
                🧪 Load Test Data (Skip Login)
            </button>
        </form>
        <p class="info-text">
            For assignment testing purposes only.<br>
            Bypasses authentication and loads data directly.
        </p>
    </div>
    
    <!-- Load Google Identity Services -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    
    <script>
        // Handle Google login callback
        function handleGoogleLogin(response) {
            console.log('Google login successful!');
            
            // Send credential to PHP backend
            fetch('login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'credential=' + encodeURIComponent(response.credential)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Redirect to main page
                    window.location.href = data.redirect;
                } else {
                    alert('Login failed: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Login failed. Please try again.');
            });
        }
        
        // Make function globally accessible
        window.handleGoogleLogin = handleGoogleLogin;
    </script>
</body>
</html>
