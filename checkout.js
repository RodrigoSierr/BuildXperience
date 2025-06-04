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