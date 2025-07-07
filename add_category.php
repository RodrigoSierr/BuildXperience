<?php
require_once 'includes/db.php';
$name = $_POST['name'] ?? '';
$description = $_POST['description'] ?? '';
$parent_id = $_POST['parent_id'] !== '' ? $_POST['parent_id'] : null;
$slug = $_POST['slug'] ?? '';
if ($name && $slug) {
    $stmt = $conn->prepare("INSERT INTO categories (name, description, parent_id, slug) VALUES (?, ?, ?, ?)");
    $stmt->bind_param('ssis', $name, $description, $parent_id, $slug);
    $stmt->execute();
    $stmt->close();
    echo 'OK';
} else {
    echo 'Faltan datos obligatorios';
} 