<?php
// config.php - Configuration and session management

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Google OAuth Configuration
define('GOOGLE_CLIENT_ID', '618402076762-i48nl6v0rlarov55qt0fuoqpr3s4dgpr.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', ''); // Add your client secret if needed for server-side validation

// Base URL configuration
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$base_path = dirname($_SERVER['PHP_SELF']);
define('BASE_URL', $protocol . '://' . $host . $base_path);

// Helper function to check if user is authenticated
function isAuthenticated() {
    return isset($_SESSION['user_authenticated']) && $_SESSION['user_authenticated'] === true;
}

// Helper function to get user info
function getUserInfo() {
    if (isAuthenticated()) {
        return [
            'email' => $_SESSION['user_email'] ?? '',
            'name' => $_SESSION['user_name'] ?? '',
            'picture' => $_SESSION['user_picture'] ?? ''
        ];
    }
    return null;
}

// Helper function to set user session
function setUserSession($email, $name = '', $picture = '') {
    $_SESSION['user_authenticated'] = true;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_picture'] = $picture;
    $_SESSION['login_time'] = time();
}

// Helper function to destroy user session
function destroyUserSession() {
    $_SESSION = array();
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    session_destroy();
}
?>
