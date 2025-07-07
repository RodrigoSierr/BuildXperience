<?php
require_once 'includes/db.php';
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=usuarios.csv');
$output = fopen('php://output', 'w');
fputcsv($output, ['ID', 'Usuario', 'Email', 'Nombre', 'Apellido', 'Teléfono', 'Dirección', 'Rol']);
$result = $conn->query("SELECT id, username, email, first_name, last_name, phone, address, role FROM users");
while ($row = $result->fetch_assoc()) {
    fputcsv($output, $row);
}
fclose($output); 