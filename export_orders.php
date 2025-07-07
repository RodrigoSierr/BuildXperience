<?php
require_once 'includes/db.php';
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=pedidos.csv');
$output = fopen('php://output', 'w');
fputcsv($output, ['ID', 'ID Usuario', 'Total', 'Estado', 'Dirección Envío', 'Dirección Facturación', 'Método Envío', 'Número Seguimiento', 'Fecha Pedido', 'Fecha Entrega', 'Notas']);
$result = $conn->query("SELECT id, user_id, total_amount, status, shipping_address, billing_address, shipping_method, tracking_number, order_date, expected_delivery_date, notes FROM orders");
while ($row = $result->fetch_assoc()) {
    fputcsv($output, $row);
}
fclose($output); 