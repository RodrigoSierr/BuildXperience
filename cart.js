// Cache para datos del usuario
const userDataCache = {
    data: null,
    timestamp: null,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas en milisegundos

    get() {
        if (this.data && this.timestamp && (Date.now() - this.timestamp) < this.maxAge) {
            return this.data;
        }
        return null;
    },

    set(data) {
        this.data = data;
        this.timestamp = Date.now();
    },

    clear() {
        this.data = null;
        this.timestamp = null;
    }
};

// Función para obtener datos del usuario desde el almacenamiento
function getUserData() {
    try {
        const cachedData = userDataCache.get();
        if (cachedData) return cachedData;

        const userStr = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        if (!userStr) return null;

        const userData = JSON.parse(userStr);
        if (!userData || !userData.timestamp) return null;

        const now = Date.now();
        const hoursSinceLogin = (now - userData.timestamp) / (1000 * 60 * 60);
        
        if (hoursSinceLogin > 24) {
            logout();
            return null;
        }

        userDataCache.set(userData);
        return userData;
    } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
    }
}

// Clase principal para manejar el carrito de compras
class Cart {
    constructor() {
        this.userId = this.getUserId();
        this.items = [];
        this.cartKey = `cart_${this.userId}`;
        this.domCache = {};
        this.loadCart();
        this.updateCartCount();
        this.setupEventListeners();
        this.checkAuthState();
        this.renderCartItems();
        this.renderRecommendations();
    }

    // Obtener ID del usuario actual
    getUserId() {
        const userData = this.getUserData();
        return userData ? userData.email : null;
    }

    // Obtener datos del usuario
    getUserData() {
        return getUserData();
    }

    // Verificar estado de autenticación
    checkAuthState() {
        const userData = this.getUserData();
        if (!userData) {
            window.location.href = 'login.html';
            return;
        }

        this.updateUserInterface(userData);
    }

    // Actualizar interfaz de usuario
    updateUserInterface(userData) {
        const elements = {
            userEmail: document.querySelector('.user-email'),
            accountButton: document.getElementById('accountButton'),
            accountDropdown: document.getElementById('accountDropdown')
        };

        if (elements.userEmail) elements.userEmail.textContent = userData.email;
        if (elements.accountButton) elements.accountButton.style.display = 'block';
        if (elements.accountDropdown) elements.accountDropdown.style.display = 'none';
    }

    // Cerrar sesión
    logout() {
        userDataCache.clear();
        localStorage.removeItem('userData');
        sessionStorage.removeItem('userData');
        window.location.href = 'login.html';
    }

    // Cargar carrito desde el almacenamiento
    loadCart() {
        const savedCart = localStorage.getItem(this.cartKey);
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
    }

    // Guardar carrito en el almacenamiento
    saveCart() {
        localStorage.setItem(this.cartKey, JSON.stringify(this.items));
    }

    // Añadir producto al carrito
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
        this.renderRecommendations();
        this.showNotification(product.name);
    }

    // Eliminar producto del carrito
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
        this.renderRecommendations();
        
        // Mostrar notificación de eliminación
        const removedItem = this.items.find(item => item.id === productId);
        if (removedItem) {
            this.showNotification(`${removedItem.name} eliminado del carrito`, 'info');
        }
    }

    // Actualizar cantidad de un producto
    updateQuantity(productId, change) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartCount();
                this.renderCartItems();
                this.renderRecommendations();
            }
        }
    }

    // Calcular total del carrito
    calculateTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Actualizar contador del carrito
    updateCartCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const cartCounts = document.querySelectorAll('#cartCount');
        cartCounts.forEach(cartCount => {
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'block' : 'none';
        });
    }

    // Renderizar items del carrito
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        
        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Tu carrito está vacío</p>
                    <a href="productos.html" class="continue-shopping">Continuar comprando</a>
                </div>
            `;
            if (subtotalElement) subtotalElement.textContent = '$0.00';
            if (totalElement) totalElement.textContent = '$0.00';
            return;
        }

        const total = this.calculateTotal();
        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" loading="lazy">
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-button decrease" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-button increase" data-id="${item.id}">+</button>
                    </div>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');

        if (subtotalElement) subtotalElement.textContent = `$${total.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;

        // Añadir event listeners a los botones
        this.setupCartItemListeners();
    }

    // Configurar event listeners para los items del carrito
    setupCartItemListeners() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;

        // Event listeners para botones de cantidad
        cartItemsContainer.querySelectorAll('.quantity-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                const change = e.target.classList.contains('increase') ? 1 : -1;
                this.updateQuantity(productId, change);
            });
        });

        // Event listeners para botones de eliminar
        cartItemsContainer.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('.remove-item').dataset.id;
                this.removeItem(productId);
            });
        });
    }

    // Mostrar notificación de producto añadido
    showNotification(productName, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${productName}</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }

    // Obtener categoría de un producto
    getProductCategory(productId) {
        // Determinar la categoría basada en el ID del producto
        if (productId.startsWith('gpu-')) return 'tarjetas-graficas';
        if (productId.startsWith('cpu-')) return 'procesadores';
        if (productId.startsWith('ram-')) return 'memoria-ram';
        if (productId.startsWith('ssd-')) return 'almacenamiento';
        if (productId.startsWith('mb-')) return 'placas-base';
        if (productId.startsWith('cool-')) return 'refrigeracion';
        return 'otros';
    }

    // Obtener recomendaciones de productos
    getRecommendations() {
        const categories = new Set(this.items.map(item => item.category));
        const recommendations = [];

        // Productos recomendados basados en categorías
        const categoryRecommendations = {
            'tarjetas-graficas': [
                { id: 'gpu-2', name: 'NVIDIA RTX 4080', price: 1099.99, image: 'Imágenes/Tarjetas Gráficas/NVIDIA RTX 4080.jpg', category: 'tarjetas-graficas' },
                { id: 'gpu-3', name: 'AMD RX 7900 XTX', price: 999.99, image: 'Imágenes/Tarjetas Gráficas/AMD RX 7900 XTX.webp', category: 'tarjetas-graficas' }
            ],
            'procesadores': [
                { id: 'cpu-1', name: 'Intel Core i9-14900K', price: 589.99, image: 'Imágenes/Procesadores/Intel Core i9-14900K.webp', category: 'procesadores' },
                { id: 'cpu-2', name: 'AMD Ryzen 9 7950X3D', price: 699.99, image: 'Imágenes/Procesadores/AMD Ryzen 9 7950X3D.jpeg', category: 'procesadores' }
            ],
            'memoria-ram': [
                { id: 'ram-1', name: 'Corsair Dominator Platinum RGB', price: 299.99, image: 'Imágenes/Memoria RAM/Corsair Dominator Platinum RGB.jpg', category: 'memoria-ram' },
                { id: 'ram-3', name: 'Kingston Fury Beast DDR5', price: 219.99, image: 'Imágenes/Memoria RAM/Kingston Fury Beast DDR5.jpg', category: 'memoria-ram' }
            ],
            'almacenamiento': [
                { id: 'ssd-1', name: 'Samsung 990 Pro', price: 169.99, image: 'Imágenes/Almacenamiento/Samsung 990 Pro.jpg', category: 'almacenamiento' },
                { id: 'ssd-2', name: 'WD Black SN850X', price: 149.99, image: 'Imágenes/Almacenamiento/WD Black SN850X.jpg', category: 'almacenamiento' }
            ],
            'placas-base': [
                { id: 'mb-1', name: 'ASUS ROG Maximus Z790', price: 599.99, image: 'Imágenes/Placas Base/ASUS ROG Maximus Z790.jpeg', category: 'placas-base' },
                { id: 'mb-2', name: 'MSI MEG X670E ACE', price: 699.99, image: 'Imágenes/Placas Base/MSI MEG X670E ACE.webp', category: 'placas-base' }
            ],
            'refrigeracion': [
                { id: 'cool-1', name: 'NZXT Kraken Z73', price: 279.99, image: 'Imágenes/Refrigeración/NZXT Kraken Z73.jpg', category: 'refrigeracion' },
                { id: 'cool-2', name: 'Noctua NH-D15', price: 99.99, image: 'Imágenes/Refrigeración/Noctua NH-D15.jpg', category: 'refrigeracion' }
            ]
        };

        // Añadir recomendaciones basadas en las categorías del carrito
        categories.forEach(category => {
            if (categoryRecommendations[category]) {
                recommendations.push(...categoryRecommendations[category]);
            }
        });

        // Añadir recomendaciones complementarias
        if (categories.has('procesadores')) {
            recommendations.push(
                { id: 'mb-3', name: 'Gigabyte X670E Aorus Master', price: 549.99, image: 'Imágenes/Placas Base/Gigabyte X670E Aorus Master.webp', category: 'placas-base' },
                { id: 'cool-3', name: 'Corsair iCUE H150i Elite', price: 199.99, image: 'Imágenes/Refrigeración/Corsair iCUE H150i Elite.webp', category: 'refrigeracion' }
            );
        }

        if (categories.has('tarjetas-graficas')) {
            recommendations.push(
                { id: 'ssd-3', name: 'Crucial P5 Plus', price: 129.99, image: 'Imágenes/Almacenamiento/Crucial P5 Plus.webp', category: 'almacenamiento' },
                { id: 'ram-4', name: 'Crucial Pro DDR5', price: 199.99, image: 'Imágenes/Memoria RAM/Crucial Pro DDR5.jpg', category: 'memoria-ram' }
            );
        }

        // Filtrar productos que ya están en el carrito
        const cartItemIds = new Set(this.items.map(item => item.id));
        const filteredRecommendations = recommendations.filter(rec => !cartItemIds.has(rec.id));

        // Limitar a 4 recomendaciones
        return filteredRecommendations.slice(0, 4);
    }

    // Renderizar recomendaciones
    renderRecommendations() {
        const recommendationsContainer = document.querySelector('.recommendations-grid');
        if (!recommendationsContainer) return;

        const recommendations = this.getRecommendations();
        
        if (recommendations.length === 0) {
            recommendationsContainer.innerHTML = '<p>No hay recomendaciones disponibles en este momento.</p>';
            return;
        }

        recommendationsContainer.innerHTML = recommendations.map(product => `
            <div class="recommended-product" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" data-product='${JSON.stringify(product)}'>
                    <i class="fas fa-shopping-cart"></i>
                    Añadir al Carrito
                </button>
            </div>
        `).join('');

        // Añadir event listeners a los botones de añadir al carrito
        recommendationsContainer.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productData = JSON.parse(e.target.dataset.product);
                this.addItem(productData);
            });
        });
    }

    // Configurar event listeners
    setupEventListeners() {
        // Event listener para el menú de cuenta
        const accountButton = document.getElementById('accountButton');
        const accountDropdown = document.getElementById('accountDropdown');

        if (accountButton && accountDropdown) {
            accountButton.addEventListener('click', (e) => {
                e.preventDefault();
                accountDropdown.classList.toggle('show');
            });

            // Cerrar el menú al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!accountButton.contains(e.target) && !accountDropdown.contains(e.target)) {
                    accountDropdown.classList.remove('show');
                }
            });
        }

        // Event listener para el botón de cerrar sesión
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
}

// Inicializar el carrito
const cart = new Cart();

// Función para manejar el clic en el botón de añadir al carrito
function handleAddToCart(event) {
    const button = event.currentTarget;
    const productCard = button.closest('.product-card');
    
    if (!productCard) return;

    const product = {
        id: productCard.dataset.id,
        name: productCard.querySelector('.product-name').textContent,
        price: parseFloat(productCard.querySelector('.product-price').textContent.replace('$', '')),
        image: productCard.querySelector('.product-image img').src,
        category: productCard.dataset.category
    };

    cart.addItem(product);
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Añadir event listeners a los botones de añadir al carrito
    const addToCartButtons = document.querySelectorAll('.product-button');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });

    // Renderizar recomendaciones iniciales si estamos en la página del carrito
    if (document.querySelector('.recommendations-grid')) {
        cart.renderRecommendations();
    }

    // Configurar botón de checkout
    const checkoutButton = document.querySelector('.checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Checkout button clicked');
            window.location.href = 'checkout.html';
        });
    }
}); 