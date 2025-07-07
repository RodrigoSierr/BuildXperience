<?php
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['email']) || !isset($input['password'])) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos.']);
        exit;
    }
    $email = $input['email'];
    $username = explode('@', $email)[0];
    echo json_encode(['success' => true, 'user' => [
        'id' => 0,
        'email' => $email,
        'username' => $username
    ]]);
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
} 