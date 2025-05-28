class UserProfile {
    constructor() {
        this.init();
        this.activeTab = 'info';
    }

    init() {
        // Obtener el usuario usando la función de auth.js
        const userData = window.getUserData();
        if (!userData) {
            return; // auth.js manejará la redirección
        }

        this.user = userData;
        this.renderUserInfo();
        this.setupEventListeners();
        this.setupTabNavigation();
    }

    renderUserInfo() {
        try {
            // Información básica del perfil
            document.getElementById('profile-username').textContent = this.user.username || 'Usuario';
            document.getElementById('profile-email').textContent = this.user.email || 'email@example.com';
            document.getElementById('member-since').textContent = this.formatDate(this.user.timestamp);
            
            // Información detallada
            document.getElementById('info-username').textContent = this.user.username || 'Usuario';
            document.getElementById('info-email').textContent = this.user.email || 'email@example.com';
            document.getElementById('info-register-date').textContent = this.formatDate(this.user.timestamp);
            document.getElementById('info-last-login').textContent = this.formatDate(new Date().getTime());

            // Avatar
            if (this.user.avatar) {
                const avatarImg = document.getElementById('avatarImage');
                avatarImg.src = this.user.avatar;
                avatarImg.style.display = 'block';
                document.querySelector('#profileAvatar i').style.display = 'none';
            }

            // Preferencias
            const preferences = this.user.preferences || {};
            document.getElementById('email-notifications').checked = preferences.emailNotifications || false;
            document.getElementById('newsletter').checked = preferences.newsletter || false;
            document.getElementById('dark-mode').checked = preferences.darkMode || false;

            // Aplicar modo oscuro si está activado
            if (preferences.darkMode) {
                document.body.classList.add('dark-mode');
            }

            // Renderizar historial de compras si existe
            this.renderPurchaseHistory();
        } catch (error) {
            console.error('Error al renderizar información del usuario:', error);
            this.showNotification('Error al cargar los datos del perfil', 'error');
        }
    }

    setupEventListeners() {
        try {
            // Avatar
            const editAvatarBtn = document.querySelector('.edit-avatar');
            if (editAvatarBtn) {
                editAvatarBtn.addEventListener('click', () => this.showAvatarUpload());
            }

            // Campos editables
            document.querySelectorAll('.edit-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const infoItem = e.target.closest('.info-item');
                    const valueElement = infoItem.querySelector('.info-value');
                    this.makeEditable(valueElement);
                });
            });

            // Preferencias
            ['email-notifications', 'newsletter', 'dark-mode'].forEach(id => {
                const toggle = document.getElementById(id);
                if (toggle) {
                    toggle.addEventListener('change', (e) => {
                        this.updatePreference(id, e.target.checked);
                    });
                }
            });

            // Formulario de cambio de contraseña
            const passwordForm = document.getElementById('password-form');
            if (passwordForm) {
                passwordForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handlePasswordChange();
                });
            }

            // Configuración 2FA
            const setup2FAButton = document.querySelector('.setup-2fa-button');
            if (setup2FAButton) {
                setup2FAButton.addEventListener('click', () => {
                    this.setup2FA();
                });
            }
        } catch (error) {
            console.error('Error al configurar event listeners:', error);
        }
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const sections = document.querySelectorAll('.profile-section');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                
                // Actualizar botones
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Actualizar secciones
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === `${tab}-section`) {
                        section.classList.add('active');
                    }
                });

                this.activeTab = tab;
            });
        });
    }

    makeEditable(element) {
        const currentValue = element.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.className = 'edit-input';

        const saveButton = document.createElement('button');
        saveButton.innerHTML = '<i class="fas fa-check"></i>';
        saveButton.className = 'save-button';

        const cancelButton = document.createElement('button');
        cancelButton.innerHTML = '<i class="fas fa-times"></i>';
        cancelButton.className = 'cancel-button';

        element.textContent = '';
        element.appendChild(input);
        element.appendChild(saveButton);
        element.appendChild(cancelButton);

        input.focus();

        saveButton.addEventListener('click', () => {
            const newValue = input.value.trim();
            if (newValue && newValue !== currentValue) {
                this.updateUserInfo(element.id.replace('info-', ''), newValue);
            }
            this.restoreElement(element, newValue || currentValue);
        });

        cancelButton.addEventListener('click', () => {
            this.restoreElement(element, currentValue);
        });
    }

    restoreElement(element, value) {
        element.textContent = value;
    }

    updateUserInfo(field, value) {
        try {
            this.user[field] = value;
            const storage = document.querySelector('#remember')?.checked ? localStorage : sessionStorage;
            storage.setItem('userData', JSON.stringify(this.user));
            this.showNotification('Información actualizada correctamente');
        } catch (error) {
            console.error('Error al actualizar información:', error);
            this.showNotification('Error al actualizar la información', 'error');
        }
    }

    handlePasswordChange() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        // Aquí iría la lógica de cambio de contraseña
        this.showNotification('Contraseña actualizada correctamente');
        document.getElementById('password-form').reset();
    }

    setup2FA() {
        // Aquí iría la lógica de configuración de 2FA
        this.showNotification('Función de 2FA en desarrollo');
    }

    showAvatarUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.uploadAvatar(file);
            }
        };
        input.click();
    }

    uploadAvatar(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const avatarImg = document.getElementById('avatarImage');
            avatarImg.src = e.target.result;
            avatarImg.style.display = 'block';
            document.querySelector('#profileAvatar i').style.display = 'none';

            // Guardar el avatar en el usuario
            this.user.avatar = e.target.result;
            const storage = document.querySelector('#remember')?.checked ? localStorage : sessionStorage;
            storage.setItem('userData', JSON.stringify(this.user));
        };
        reader.readAsDataURL(file);
        this.showNotification('Avatar actualizado correctamente');
    }

    updatePreference(key, value) {
        try {
            if (!this.user.preferences) {
                this.user.preferences = {};
            }
            this.user.preferences[key] = value;
            
            const storage = document.querySelector('#remember')?.checked ? localStorage : sessionStorage;
            storage.setItem('userData', JSON.stringify(this.user));

            if (key === 'darkMode') {
                document.body.classList.toggle('dark-mode', value);
            }
            
            this.showNotification('Preferencias actualizadas');
        } catch (error) {
            console.error('Error al actualizar preferencias:', error);
            this.showNotification('Error al guardar las preferencias', 'error');
        }
    }

    renderPurchaseHistory() {
        const purchaseHistoryContainer = document.getElementById('purchase-history');
        if (!purchaseHistoryContainer) return;

        if (!this.user.purchaseHistory || this.user.purchaseHistory.length === 0) {
            purchaseHistoryContainer.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-shopping-bag"></i>
                    <p>No tienes compras registradas</p>
                    <a href="productos.html" class="continue-shopping">Ir a comprar</a>
                </div>
            `;
            return;
        }

        purchaseHistoryContainer.innerHTML = this.user.purchaseHistory.map(purchase => this.createPurchaseCard(purchase)).join('');
    }

    createPurchaseCard(purchase) {
        const formattedDate = this.formatDate(new Date(purchase.date));
        const itemsList = purchase.items.map(item => `
            <div class="purchase-item">
                <img src="${item.image}" alt="${item.name}" class="purchase-item-image">
                <div class="purchase-item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">Cantidad: ${item.quantity}</span>
                    <span class="item-price">$${item.price.toFixed(2)}</span>
                </div>
            </div>
        `).join('');

        return `
            <div class="purchase-card">
                <div class="purchase-header">
                    <div class="purchase-info">
                        <span class="purchase-id">Pedido #${purchase.id}</span>
                        <span class="purchase-date">${formattedDate}</span>
                    </div>
                    <span class="purchase-status ${purchase.status.toLowerCase()}">${purchase.status}</span>
                </div>
                <div class="purchase-items">
                    ${itemsList}
                </div>
                <div class="purchase-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>$${purchase.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Envío:</span>
                        <span>$${purchase.shipping.toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>$${purchase.total.toFixed(2)}</span>
                    </div>
                </div>
                <div class="shipping-info">
                    <h4>Información de envío</h4>
                    <p>${purchase.shippingInfo.name}</p>
                    <p>${purchase.shippingInfo.address}</p>
                    <p>${purchase.shippingInfo.city}, ${purchase.shippingInfo.postalCode}</p>
                    <p>${purchase.shippingInfo.country}</p>
                </div>
            </div>
        `;
    }

    formatDate(timestamp) {
        if (!timestamp) return 'No disponible';
        return new Date(timestamp).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Inicializar el perfil cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new UserProfile();
}); 