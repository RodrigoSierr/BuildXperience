<?php
require_once 'includes/db.php';
header('Content-Type: application/json');
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $result = $conn->query("SELECT * FROM categories WHERE id = $id");
    echo json_encode($result->fetch_assoc());
} else {
    $result = $conn->query("SELECT * FROM categories");
    $cats = [];
    while ($row = $result->fetch_assoc()) {
        $cats[] = $row;
    }
    echo json_encode($cats);
} 