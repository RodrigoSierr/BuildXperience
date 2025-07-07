<?php
require_once 'includes/db.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $user_id = $_POST['user_id'];
    $total_amount = $_POST['total_amount'];
    $status = $_POST['status'];
    $shipping_address = $_POST['shipping_address'];
    $billing_address = $_POST['billing_address'];
    $shipping_method = $_POST['shipping_method'];
    $tracking_number = $_POST['tracking_number'];
    $expected_delivery_date = $_POST['expected_delivery_date'];
    $notes = $_POST['notes'];
    $payment_method = $_POST['payment_method'];
    $stmt = $conn->prepare("UPDATE orders SET user_id=?, total_amount=?, status=?, shipping_address=?, billing_address=?, shipping_method=?, tracking_number=?, expected_delivery_date=?, notes=?, payment_method=? WHERE id=?");
    $stmt->bind_param('idssssssssi', $user_id, $total_amount, $status, $shipping_address, $billing_address, $shipping_method, $tracking_number, $expected_delivery_date, $notes, $payment_method, $id);
    $stmt->execute();
    $stmt->close();
    echo 'OK';
} 