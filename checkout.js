// Mostrar resumen del carrito en checkout

document.addEventListener('DOMContentLoaded', function() {
    // Obtener datos del usuario desde el almacenamiento
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    let user = userData ? JSON.parse(userData) : {};
    
    // Rellenar el campo de nombre si existe el usuario
    if (user.username) document.getElementById('name').value = user.username;

    // Obtener items del carrito del usuario
    const userId = user.email;
    const cartKey = `cart_${userId}`;
    const cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    // Referencias a elementos del DOM
    const cartContainer = document.getElementById('checkoutCartItems');
    const subtotalElement = document.getElementById('checkoutSubtotal');
    const totalElement = document.getElementById('checkoutTotal');

    let subtotal = 0;
    // Mostrar mensaje si el carrito está vacío
    if (cartItems.length === 0) {
        cartContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
    } else {
        // Renderizar items del carrito
        cartContainer.innerHTML = cartItems.map(item => `
            <div class="checkout-item">
                <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
                <div class="checkout-item-details">
                    <span><b>${item.name}</b></span>
                    <span>Cantidad: ${item.quantity}</span>
                    <span>Precio: $${item.price.toFixed(2)}</span>
                </div>
            </div>
        `).join('');
        // Calcular subtotal
        subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    
    // Actualizar totales en la interfaz
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${(subtotal + 10).toFixed(2)}`;

    // Manejar el envío del formulario de compra
    document.getElementById('shippingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('¡Compra confirmada!');
        window.location.href = 'perfil.html';
    });
}); 