<?php
require_once 'includes/db.php';
header('Content-Type: application/json');
$result = $conn->query("SELECT * FROM search_history");
$history = [];
while ($row = $result->fetch_assoc()) {
    $history[] = $row;
}
echo json_encode($history); 