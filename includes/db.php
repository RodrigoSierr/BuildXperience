<?php
// Conexion a la base de datos  (XAMPP por defecto)
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'BuildXperience';

// Crear conexión y habilitar excepciones
$conn = new mysqli($host, $username, $password, $database);
if ($conn->connect_error) {
    die('Error de conexión: ' . $conn->connect_error);
}

// Forzar UTF-8
$conn->set_charset('utf8mb4');

// Iniciar sesión para carrito u otras funcionalidades
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
