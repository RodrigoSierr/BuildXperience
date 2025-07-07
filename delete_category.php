<?php
require_once 'includes/db.php';
$id = $_POST['id'] ?? '';
if ($id) {
    $stmt = $conn->prepare("DELETE FROM categories WHERE id=?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();
    echo 'OK';
} else {
    echo 'ID no proporcionado';
} 