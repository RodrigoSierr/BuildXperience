<?php
require_once 'includes/db.php';
$id = $_POST['id'] ?? '';
$name = $_POST['name'] ?? '';
$description = $_POST['description'] ?? '';
$parent_id = $_POST['parent_id'] !== '' ? $_POST['parent_id'] : null;
$slug = $_POST['slug'] ?? '';
if ($id && $name && $slug) {
    $stmt = $conn->prepare("UPDATE categories SET name=?, description=?, parent_id=?, slug=? WHERE id=?");
    $stmt->bind_param('ssisi', $name, $description, $parent_id, $slug, $id);
    $stmt->execute();
    $stmt->close();
    echo 'OK';
} else {
    echo 'Faltan datos obligatorios';
} 