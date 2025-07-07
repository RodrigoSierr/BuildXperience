<?php
require_once 'includes/db.php';

$query = "SELECT id, password_hash FROM users";
$result = $conn->query($query);

$updated = 0;
while ($row = $result->fetch_assoc()) {
    $id = $row['id'];
    $password = $row['password_hash'];
    // Si la contraseña es muy corta, probablemente está en texto plano
    if (strlen($password) < 50) {
        $new_hash = password_hash($password, PASSWORD_DEFAULT);
        $update = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $update->bind_param('si', $new_hash, $id);
        if ($update->execute()) {
            $updated++;
            echo "Usuario ID $id actualizado.<br>";
        }
        $update->close();
    }
}
echo "<br>Actualización completada. Usuarios actualizados: $updated";
?> 