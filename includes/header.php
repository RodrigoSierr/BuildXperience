<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($pageTitle) ? $pageTitle : 'BuildXperience'; ?></title>
    <link rel="stylesheet" href="/BuildXperience/styles.css">
    <link rel="stylesheet" href="/BuildXperience/productos.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script>
        (function () {
            const isDarkModeEnabled = localStorage.getItem('darkModeEnabled') === 'true';
            if (isDarkModeEnabled) {
                document.documentElement.classList.add('dark-mode');
            }
        })();
    </script>
</head>
<body>
<header>
    <nav>
        <div class="logo">
            <h1>BuildXperience</h1>
        </div>
        <button class="mobile-menu-toggle" aria-label="Menú">
            <i class="fas fa-bars"></i>
        </button>
        <div class="nav-links">
            <a href="/BuildXperience/index.php">Inicio</a>
            <a href="/BuildXperience/productos.php">Productos</a>
            <a href="#contacto">Contacto</a>
            <div class="account-container">
                <?php if(isset($_SESSION['user'])): ?>
                    <a href="#" class="account-link" id="accountButton">Mi Cuenta</a>
                    <div class="account-dropdown" id="accountDropdown">
                        <span class="user-email"><?= htmlspecialchars($_SESSION['user']['email']); ?></span>
                        <a href="/BuildXperience/perfil.php" class="menu-link">Mi Perfil</a>
                        <a href="/BuildXperience/perfil.php#purchase-history" class="menu-link">Mis Pedidos</a>
                        <a href="/BuildXperience/logout.php" id="logoutButton" class="logout-button">Cerrar Sesión</a>
                    </div>
                <?php else: ?>
                    <a href="/BuildXperience/login.php">Iniciar Sesión</a>
                <?php endif; ?>
                <a href="/BuildXperience/cart.php" class="cart-link">
                    <i class="fas fa-shopping-cart"></i>
                    <span id="cartCount" class="cart-count"><?= isset($_SESSION['cart']) ? array_sum(array_column($_SESSION['cart'],'quantity')) : 0; ?></span>
                </a>
            </div>
        </div>
    </nav>
</header>
