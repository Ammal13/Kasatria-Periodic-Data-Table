<?php
// check_auth.php - Authentication middleware

require_once 'config.php';

// Check if user is authenticated
if (!isAuthenticated()) {
    // Redirect to login page
    header('Location: login_page.php');
    exit;
}

// User is authenticated, continue with the page
?>
