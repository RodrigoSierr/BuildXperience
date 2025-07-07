<?php
require_once 'includes/db.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $name = $_POST['name'];
    $description = $_POST['description'];
    $price = $_POST['price'];
    $stock = $_POST['stock'];
    $sku = $_POST['sku'];
    $category_id = $_POST['category_id'];
    $stmt = $conn->prepare("UPDATE products SET name=?, description=?, price=?, stock=?, sku=?, category_id=? WHERE id=?");
    $stmt->bind_param('ssdisii', $name, $description, $price, $stock, $sku, $category_id, $id);
    $stmt->execute();
    $stmt->close();
    echo 'OK';
} 