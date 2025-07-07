<?php
header('Content-Type: application/json');
require_once 'includes/db.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['email']) || !isset($input['password'])) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos.']);
        exit;
    }
    $email = $input['email'];
    $password = $input['password'];
    $stmt = $conn->prepare('SELECT id, username, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result && $user = $result->fetch_assoc()) {
        if (!password_verify($password, $user['password_hash'])) {
            echo json_encode(['success' => false, 'message' => 'Correo o contraseña incorrectos.']);
        } elseif ($user['status'] !== 'active') {
            echo json_encode(['success' => false, 'message' => 'Tu cuenta está inactiva. Contacta al soporte.']);
        } else {
            // Actualizar last_login
            $update = $conn->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
            $update->bind_param('i', $user['id']);
            $update->execute();
            $update->close();
            echo json_encode(['success' => true, 'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'username' => $user['username'],
                'role' => $user['role'],
                'status' => $user['status']
            ]]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Correo o contraseña incorrectos.']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
} 