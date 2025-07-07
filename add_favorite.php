<?php
require_once 'includes/db.php';
$user_id = $_POST['user_id'] ?? '';
$product_id = $_POST['product_id'] ?? '';
if ($user_id && $product_id) {
    $stmt = $conn->prepare("INSERT INTO favorites (user_id, product_id) VALUES (?, ?)");
    $stmt->bind_param('ii', $user_id, $product_id);
    $stmt->execute();
    $stmt->close();
    echo 'OK';
} else {
    echo 'Faltan datos obligatorios';
} 