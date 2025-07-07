<?php
require_once 'includes/db.php';
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=productos.csv');
$output = fopen('php://output', 'w');
fputcsv($output, ['ID', 'Nombre', 'Descripción', 'Precio', 'Stock', 'SKU', 'ID Categoría']);
$result = $conn->query("SELECT id, name, description, price, stock, sku, category_id FROM products");
while ($row = $result->fetch_assoc()) {
    fputcsv($output, $row);
}
fclose($output); 