<?php
require_once 'includes/db.php';
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $first_name = $_POST['first_name'];
    $last_name = $_POST['last_name'];
    $phone = $_POST['phone'];
    $address = $_POST['address'];
    $role = isset($_POST['role']) ? $_POST['role'] : 'user';
    // Verificar si el email ya existe
    $check = $conn->prepare('SELECT id FROM users WHERE email = ?');
    $check->bind_param('s', $email);
    $check->execute();
    $check->store_result();
    if ($check->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'El email ya está registrado.']);
        $check->close();
        exit;
    }
    $check->close();
    $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Error en la base de datos.']);
        exit;
    }
    $stmt->bind_param('ssssssss', $username, $email, $password, $first_name, $last_name, $phone, $address, $role);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Usuario registrado correctamente.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al registrar usuario.']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
} 