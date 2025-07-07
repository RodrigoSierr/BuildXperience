<?php
require_once 'includes/db.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $username = $_POST['username'];
    $email = $_POST['email'];
    $first_name = $_POST['first_name'];
    $last_name = $_POST['last_name'];
    $phone = $_POST['phone'];
    $address = $_POST['address'];
    $role = $_POST['role'];
    $password = $_POST['password'];
    if (!empty($password)) {
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE users SET username=?, email=?, password_hash=?, first_name=?, last_name=?, phone=?, address=?, role=? WHERE id=?");
        $stmt->bind_param('ssssssssi', $username, $email, $password_hash, $first_name, $last_name, $phone, $address, $role, $id);
    } else {
        $stmt = $conn->prepare("UPDATE users SET username=?, email=?, first_name=?, last_name=?, phone=?, address=?, role=? WHERE id=?");
        $stmt->bind_param('sssssssi', $username, $email, $first_name, $last_name, $phone, $address, $role, $id);
    }
    $stmt->execute();
    $stmt->close();
    echo 'OK';
} 