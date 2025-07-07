<?php
require_once 'includes/db.php';
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
        exit;
    }
    $id_usuario = $input['id_usuario'];
    $total = $input['total'];
    $estado = $input['estado'];
    $direccion_envio = $input['direccion_envio'];
    $direccion_facturacion = $input['direccion_facturacion'];
    $metodo_envio = $input['metodo_envio'];
    $numero_seguimiento = ''; // Vacío al crear
    $fecha_pedido = date('Y-m-d H:i:s');
    $expected_delivery_date = null; // Vacío al crear
    $notas = $input['notas'];
    $metodo_pago = $input['metodo_pago'];
    $productos = $input['productos'];
    // Guardar pedido
    $stmt = $conn->prepare("INSERT INTO orders (user_id, total_amount, status, shipping_address, billing_address, shipping_method, tracking_number, order_date, expected_delivery_date, notes, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('idsssssssss', $id_usuario, $total, $estado, $direccion_envio, $direccion_facturacion, $metodo_envio, $numero_seguimiento, $fecha_pedido, $expected_delivery_date, $notas, $metodo_pago);
    if ($stmt->execute()) {
        $order_id = $conn->insert_id;
        $stmt->close();
        // Guardar productos del pedido
        if (is_array($productos)) {
            $itemStmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)");
            foreach ($productos as $item) {
                $pid = isset($item['id']) ? $item['id'] : (isset($item['product_id']) ? $item['product_id'] : null);
                $qty = isset($item['quantity']) ? $item['quantity'] : 1;
                $price = isset($item['price']) ? $item['price'] : 0;
                $subtotal = $price * $qty;
                if ($pid) {
                    $itemStmt->bind_param('iiidd', $order_id, $pid, $qty, $price, $subtotal);
                    $itemStmt->execute();
                    // Actualizar el stock del producto
                    $updateStockStmt = $conn->prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?");
                    $updateStockStmt->bind_param('iii', $qty, $pid, $qty);
                    $updateStockStmt->execute();
                    $updateStockStmt->close();
                }
            }
            $itemStmt->close();
        }
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
} 