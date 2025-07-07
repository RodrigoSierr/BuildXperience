<?php
require_once 'includes/db.php';
header('Content-Type: application/json');
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    $stmt = $conn->prepare("SELECT * FROM users WHERE id=?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    unset($user['password_hash']); // No exponer el hash
    echo json_encode($user);
    $stmt->close();
} else {
    $result = $conn->query("SELECT id, username, email, first_name, last_name, phone, address, role FROM users");
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    echo json_encode($users);
} 