<<<<<<< HEAD
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
    // Para pruebas, siempre usar el carrito global 'cart_guest'
    return JSON.parse(localStorage.getItem('cart_guest')) || [];
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
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const envioEl = document.getElementById('checkoutEnvio');
    const totalEl = document.getElementById('cart-total');
    if (!cart.length) {
        cartSummary.innerHTML = '<em>Tu carrito está vacío. Agrega productos antes de continuar.</em>';
        subtotalEl.textContent = '0.00';
        envioEl.textContent = '0.00';
        totalEl.textContent = '0.00';
        return;
    }
    let html = '<ul class="cart-summary-list">';
    let subtotal = 0;
    cart.forEach(item => {
        const img = item.image_url ? `<img src="${item.image_url}" class="cart-summary-img" alt="${item.name}">` : '<div class="cart-summary-img" style="background:#eee"></div>';
        html += `<li class="cart-summary-item">${img}<div class="cart-summary-details"><span class="cart-summary-name">${item.name}</span><span class="cart-summary-qty">Cantidad: ${item.quantity}</span><span class="cart-summary-subtotal">$${(item.price * item.quantity).toFixed(2)}</span></div></li>`;
        subtotal += item.price * item.quantity;
    });
    html += '</ul>';
    cartSummary.innerHTML = html;
    subtotalEl.textContent = subtotal.toFixed(2);
    // Envío: gratis si subtotal > 1000, si no $80
    let envio = subtotal > 1000 ? 0 : (subtotal > 0 ? 80 : 0);
    envioEl.textContent = envio.toFixed(2);
    totalEl.textContent = (subtotal + envio).toFixed(2);
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

// Mostrar resumen del carrito en checkout

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed'); // Log to check if DOMContentLoaded fires
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
    const phoneInput = document.getElementById('phone');
    const shippingForm = document.getElementById('shippingForm');

    // Check if the form element was found
    if (!shippingForm) {
        console.error('Shipping form element not found!');
    }

    // Configurar validación del campo de teléfono
    if (phoneInput) {
        // Prevenir entrada de letras
        phoneInput.addEventListener('keypress', function(e) {
            if (!/^\d$/.test(e.key)) {
                e.preventDefault();
            }
        });

        // Prevenir pegado de texto no numérico
        phoneInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const numbersOnly = pastedText.replace(/[^\d]/g, '');
            if (numbersOnly) {
                const start = this.selectionStart;
                const end = this.selectionEnd;
                this.value = this.value.substring(0, start) + numbersOnly + this.value.substring(end);
                this.setSelectionRange(start + numbersOnly.length, start + numbersOnly.length);
            }
        });

        // Limitar a 9 dígitos
        phoneInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^\d]/g, '').slice(0, 9);
        });
    }

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

    // Función para mostrar notificación
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `checkout-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        // Animar la notificación
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remover la notificación después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Manejar el envío del formulario de compra
    if (shippingForm) {
        shippingForm.addEventListener('submit', function(e) {
            console.log('Shipping form submitted'); // Log to check if submit event fires
            e.preventDefault();

            // Validar que el carrito no esté vacío
            if (cartItems.length === 0) {
                showNotification('Tu carrito está vacío', 'error');
                return;
            }

            // Validar el número de teléfono
            const phone = document.getElementById('phone').value;
            if (phone && phone.length !== 9) {
                showNotification('El número de teléfono debe tener 9 dígitos', 'error');
                return;
            }

            // Obtener método de pago
            const paymentMethod = document.getElementById('payment_method').value;

            // Construir FormData para enviar al backend
            const formData = new FormData();
            formData.append('user_id', user.id || 1); // Si no hay usuario logueado, usar 1
            formData.append('total_amount', subtotal + 10);
            formData.append('status', 'pending');
            formData.append('shipping_address', document.getElementById('address').value);
            formData.append('billing_address', document.getElementById('billing_address').value);
            formData.append('shipping_method', document.getElementById('shipping_method').value);
            formData.append('tracking_number', '');
            formData.append('expected_delivery_date', document.getElementById('expected_delivery_date').value);
            formData.append('notes', document.getElementById('notes').value);
            formData.append('payment_method', paymentMethod);

            fetch('add_order.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.text())
            .then(msg => {
                // Limpiar el carrito
                localStorage.removeItem(cartKey);
                // Mostrar pantalla modal de compra realizada
                showSuccessModal(paymentMethod);
            });
        });
    }
});

function showSuccessModal(paymentMethod) {
    // Crear el modal
    const modal = document.createElement('div');
    modal.className = 'checkout-success-modal';
    modal.innerHTML = `
        <div class="checkout-success-content">
            <i class="fas fa-check-circle" style="font-size:3rem;color:#4CAF50;"></i>
            <h2>¡Compra realizada!</h2>
            <p>Tu compra ha sido registrada correctamente.</p>
            <p>Método de pago: <b>${paymentMethod === 'tarjeta' ? 'Tarjeta' : 'Efectivo'}</b></p>
            <button id="closeSuccessModal" class="auth-button" style="margin-top:1.5rem;">Aceptar</button>
        </div>
    `;
    Object.assign(modal.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
    });
    document.body.appendChild(modal);
    document.getElementById('closeSuccessModal').onclick = function() {
        modal.remove();
        window.location.href = 'perfil.html';
    };
} 
=======
// Mostrar resumen del carrito en checkout

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed'); // Log to check if DOMContentLoaded fires
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
    const phoneInput = document.getElementById('phone');
    const shippingForm = document.getElementById('shippingForm');

    // Check if the form element was found
    if (!shippingForm) {
        console.error('Shipping form element not found!');
    }

    // Configurar validación del campo de teléfono
    if (phoneInput) {
        // Prevenir entrada de letras
        phoneInput.addEventListener('keypress', function(e) {
            if (!/^\d$/.test(e.key)) {
                e.preventDefault();
            }
        });

        // Prevenir pegado de texto no numérico
        phoneInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const numbersOnly = pastedText.replace(/[^\d]/g, '');
            if (numbersOnly) {
                const start = this.selectionStart;
                const end = this.selectionEnd;
                this.value = this.value.substring(0, start) + numbersOnly + this.value.substring(end);
                this.setSelectionRange(start + numbersOnly.length, start + numbersOnly.length);
            }
        });

        // Limitar a 10 dígitos
        phoneInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^\d]/g, '').slice(0, 10);
        });
    }

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

    // Función para mostrar notificación
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `checkout-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        // Animar la notificación
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remover la notificación después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Manejar el envío del formulario de compra
    if (shippingForm) {
        shippingForm.addEventListener('submit', function(e) {
            console.log('Shipping form submitted'); // Log to check if submit event fires
            e.preventDefault();

            // Validar que el carrito no esté vacío
            if (cartItems.length === 0) {
                showNotification('Tu carrito está vacío', 'error');
                return;
            }

            // Validar el número de teléfono
            const phone = document.getElementById('phone').value;
            if (phone && phone.length !== 10) {
                showNotification('El número de teléfono debe tener 10 dígitos', 'error');
                return;
            }

            // Crear objeto de compra
            const purchase = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                items: cartItems,
                subtotal: subtotal,
                shipping: 10,
                total: subtotal + 10,
                status: 'Completado',
                shippingInfo: {
                    name: document.getElementById('name').value,
                    phone: phone,
                    address: document.getElementById('address').value,
                    city: document.getElementById('city').value,
                    postalCode: document.getElementById('postalCode').value,
                    country: document.getElementById('country').value
                }
            };

            // Guardar la compra en el historial del usuario
            if (!user.purchaseHistory) {
                user.purchaseHistory = [];
            }
            user.purchaseHistory.unshift(purchase); // Añadir al inicio del array

            // Actualizar datos del usuario
            const storage = document.querySelector('#remember')?.checked ? localStorage : sessionStorage;
            storage.setItem('userData', JSON.stringify(user));

            // Limpiar el carrito
            localStorage.removeItem(cartKey);

            // Mostrar notificación de éxito
            showNotification('¡Compra confirmada! Redirigiendo a tu perfil...');

            // Redirigir al perfil después de un breve delay
            setTimeout(() => {
                window.location.href = 'perfil.html#purchase-history';
            }, 2000);
        });
    }
}); 
>>>>>>> f5ce1d610eeb4717afaf52d3a7d31dd99ff04d39
