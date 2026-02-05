<?php
// login.php - Handle Google OAuth callback

require_once 'config.php';

// Check if this is a POST request with Google credential
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['credential'])) {
    $credential = $_POST['credential'];
    
    // Verify the Google JWT token
    // For production, you should verify the token with Google's API
    // For now, we'll decode it to get user info (client-side validation)
    
    $parts = explode('.', $credential);
    if (count($parts) === 3) {
        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
        
        if ($payload && isset($payload['email'])) {
            // Set user session
            setUserSession(
                $payload['email'],
                $payload['name'] ?? '',
                $payload['picture'] ?? ''
            );
            
            // Return success response
            echo json_encode([
                'success' => true,
                'redirect' => 'index.php'
            ]);
            exit;
        }
    }
    
    // If we get here, authentication failed
    echo json_encode([
        'success' => false,
        'error' => 'Invalid credentials'
    ]);
    exit;
}

// If GET request with credential (alternative flow)
if (isset($_GET['credential'])) {
    $credential = $_GET['credential'];
    
    $parts = explode('.', $credential);
    if (count($parts) === 3) {
        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
        
        if ($payload && isset($payload['email'])) {
            setUserSession(
                $payload['email'],
                $payload['name'] ?? '',
                $payload['picture'] ?? ''
            );
            
            header('Location: index.php');
            exit;
        }
    }
}

// If no valid authentication, redirect to login page
header('Location: login_page.php?error=invalid_request');
exit;
?>
