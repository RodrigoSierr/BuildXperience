<?php
require_once 'includes/db.php';
header('Content-Type: application/json');
$result = $conn->query("SELECT * FROM favorites");
$favs = [];
while ($row = $result->fetch_assoc()) {
    $favs[] = $row;
}
echo json_encode($favs); 