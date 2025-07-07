<?php
require_once 'includes/db.php';
header('Content-Type: application/json');
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    $stmt = $conn->prepare("SELECT * FROM orders WHERE id=?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $order = $result->fetch_assoc();
    echo json_encode($order);
    $stmt->close();
} else {
    $result = $conn->query("SELECT * FROM orders");
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    echo json_encode($orders);
} 