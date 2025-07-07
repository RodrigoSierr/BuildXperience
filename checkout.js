// Mostrar resumen del carrito en checkout

document.addEventListener('DOMContentLoaded', () => {
    // Forzar login al cargar checkout (DESACTIVADO PARA PRUEBAS)
    // const userData = getUserData();
    // if (!userData || !userData.email) {
    //     localStorage.setItem('redirectAfterLogin', 'checkout.html');
    //     window.location.href = 'login.html';
    //     return;
    // }
    // Limpiar carritos viejos
    localStorage.removeItem('cart_null');
    localStorage.removeItem('cart_guest');
    renderCartSummary();
    fillUserData();
    const form = document.getElementById('checkout-form');
    form.addEventListener('submit', handleCheckoutSubmit);
});

function getUserData() {
    try {
        const userStr = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        if (!userStr) return null;
        const userData = JSON.parse(userStr);
        if (!userData || !userData.id) return null;
        return userData;
    } catch (e) {
        return null;
    }
}

function getUserId() {
    // Usar id numérico como userId
    const userData = getUserData();
    return userData ? userData.id : null;
}

function getCart() {
    // Prioridad: carrito del usuario logueado, si no, carrito de invitado
    const user = getUserData();
    let cart = [];
    if (user && user.email) {
        cart = JSON.parse(localStorage.getItem(`cart_${user.email}`) || '[]');
        if (cart.length > 0) return cart;
    }
    // Si no hay carrito de usuario o está vacío, usar el de invitado
    cart = JSON.parse(localStorage.getItem('cart_guest') || '[]');
    return cart;
}

function fillUserData() {
    // Autocompletar dirección si está en userData
    const userData = getUserData();
    if (!userData) return;
    if (userData.address) {
        document.getElementById('direccion_envio').value = userData.address;
        document.getElementById('direccion_facturacion').value = userData.address;
    }
}

function renderCartSummary() {
    const cart = getCart();
    const cartSummary = document.getElementById('cart-summary');
    const subtotalEl = document.getElementById('cart-subtotal');
    const shippingEl = document.getElementById('cart-shipping');
    const totalEl = document.getElementById('cart-total');
    if (!cart.length) {
        cartSummary.innerHTML = '<em>Tu carrito está vacío. <a href="productos.html">Agrega productos</a>.</em>';
        subtotalEl.textContent = '0.00';
        shippingEl.textContent = '0.00';
        totalEl.textContent = '0.00';
        return;
    }
    let subtotal = 0;
    cartSummary.innerHTML = cart.map((item, idx) => `
        <div class="checkout-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
            <div class="checkout-item-details">
                <span class="cart-summary-name"><b>${item.name}</b></span>
                <span class="cart-summary-qty">Cantidad: 
                    <button class="qty-btn" data-action="decrease" data-idx="${idx}">-</button>
                    <span class="qty-num">${item.quantity}</span>
                    <button class="qty-btn" data-action="increase" data-idx="${idx}">+</button>
                </span>
                <span class="cart-summary-price">Precio: $${item.price.toFixed(2)}</span>
                <span class="cart-summary-subtotal">Subtotal: $${(item.price * item.quantity).toFixed(2)}</span>
                <button class="remove-item-btn" data-idx="${idx}"><i class="fas fa-trash"></i> Quitar</button>
            </div>
        </div>
    `).join('');
    subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 1000 ? 0 : (subtotal > 0 ? 80 : 0);
    subtotalEl.textContent = subtotal.toFixed(2);
    shippingEl.textContent = shipping.toFixed(2);
    totalEl.textContent = (subtotal + shipping).toFixed(2);
}

function handleCheckoutSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const cart = getCart();
    if (!cart.length) {
        showMessage('El carrito está vacío.', true);
        return;
    }
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const envio = subtotal > 1000 ? 0 : (subtotal > 0 ? 80 : 0);
    const total = subtotal + envio;
    const userData = getUserData();
    if (!userData || !userData.id) {
        showMessage('No se pudo obtener el ID del usuario. Por favor, vuelve a iniciar sesión.', true);
        return;
    }
    const data = {
        id_usuario: userData.id,
        total: total,
        estado: 'pending',
        direccion_envio: form.direccion_envio.value,
        direccion_facturacion: form.direccion_facturacion.value,
        metodo_envio: form.metodo_envio.value,
        numero_seguimiento: '',
        fecha_pedido: '',
        fecha_entrega: '',
        notas: form.notas.value,
        metodo_pago: form.metodo_pago.value,
        productos: cart
    };
    fetch('add_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(res => {
        if (res.success) {
            showMessage('¡Pedido realizado con éxito!');
            if (userData && userData.email) {
                localStorage.removeItem(`cart_${userData.email}`);
            }
            renderCartSummary();
            form.reset();
        } else {
            showMessage('Error al procesar el pedido: ' + (res.message || 'Intenta de nuevo.'), true);
        }
    })
    .catch(() => showMessage('Error de conexión con el servidor.', true));
}

function showMessage(msg, error = false) {
    const div = document.getElementById('checkout-message');
    div.textContent = msg;
    div.style.color = error ? '#dc3545' : '#28a745';
}