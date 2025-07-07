<?php
require_once 'includes/db.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    // Eliminar registros relacionados
    // 1. Eliminar items del carrito
    $conn->query("DELETE FROM cart_items WHERE user_id = $id");
    // 2. Eliminar favoritos
    $conn->query("DELETE FROM favorites WHERE user_id = $id");
    // 3. Eliminar historial de búsqueda
    $conn->query("DELETE FROM search_history WHERE user_id = $id");
    // 4. Eliminar notificaciones
    $conn->query("DELETE FROM notifications WHERE user_id = $id");
    // 5. Eliminar reseñas
    $conn->query("DELETE FROM reviews WHERE user_id = $id");
    // 6. Eliminar pedidos y sus items
    $orders = $conn->query("SELECT id FROM orders WHERE user_id = $id");
    if ($orders) {
        while ($order = $orders->fetch_assoc()) {
            $orderId = $order['id'];
            $conn->query("DELETE FROM order_items WHERE order_id = $orderId");
        }
        $conn->query("DELETE FROM orders WHERE user_id = $id");
    }
    // Finalmente, eliminar el usuario
    $stmt = $conn->prepare("DELETE FROM users WHERE id=?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();
    echo 'OK';
} 