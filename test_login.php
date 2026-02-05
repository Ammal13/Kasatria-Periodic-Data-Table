<?php
// test_login.php - Bypass login for testing purposes

require_once 'config.php';

// Create a test session
setUserSession(
    'test@example.com',
    'Test User',
    ''
);

// Redirect to main page
header('Location: index.php');
exit;
?>
