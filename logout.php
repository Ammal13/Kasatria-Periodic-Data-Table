<?php
// logout.php - Handle user logout

require_once 'config.php';

// Destroy the session
destroyUserSession();

// Redirect to login page
header('Location: login_page.php?logout=success');
exit;
?>
