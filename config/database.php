<?php
// Configuración de la base de datos para XAMPP
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'BuildXperience';

// Crear conexión
$conn = new mysqli($host, $username, $password);

// Verificar conexión
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Ejecutar el script SQL para crear la base de datos y tablas
$sql = file_get_contents('../database.sql');
$statements = explode(';', $sql);

foreach ($statements as $statement) {
    if (trim($statement) !== '') {
        $conn->query($statement);
    }
}

// Seleccionar la base de datos
$conn->select_db($database);

if ($conn->error) {
    die("Error: " . $conn->error);
}

echo "Base de datos configurada exitosamente!";
?>
