<?php
require_once 'includes/db.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'];
    $description = $_POST['description'];
    $price = $_POST['price'];
    $stock = $_POST['stock'];
    $sku = $_POST['sku'];
    $category_id = $_POST['category_id'];
    $stmt = $conn->prepare("INSERT INTO products (name, description, price, stock, sku, category_id) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('ssdisi', $name, $description, $price, $stock, $sku, $category_id);
    $stmt->execute();
    $stmt->close();
    echo 'OK';
} 