class UserProfile {
    constructor() {
        this.init();
        // activeTab se inicializa en setupTabNavigation
    }

    init() {
        // Obtener el usuario usando la función de auth.js
        const userData = window.getUserData();
        if (!userData) {
            // auth.js debería manejar la redirección, pero agregamos un fallback visual
            document.body.innerHTML = '<p>Cargando datos de usuario o acceso no autorizado...</p>';
            return;
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
            
            // Información detallada (adaptado a la nueva estructura)
            const infoUsernameElement = document.querySelector('#info-section .info-item[data-field="username"] .info-value');
            if(infoUsernameElement) infoUsernameElement.textContent = this.user.username || 'Usuario';

            const infoEmailElement = document.querySelector('#info-section .info-item[data-field="email"] .info-value');
            if(infoEmailElement) infoEmailElement.textContent = this.user.email || 'email@example.com';

            document.getElementById('info-register-date').textContent = this.formatDate(this.user.timestamp);
            document.getElementById('info-last-login').textContent = this.formatDate(new Date().getTime());

            // Avatar
            const avatarImg = document.getElementById('avatarImage');
            const avatarPlaceholder = document.getElementById('profileAvatarPlaceholder');

            if (this.user.avatar) {
                if(avatarImg) avatarImg.src = this.user.avatar;
                if(avatarImg) avatarImg.style.display = 'block';
                if(avatarPlaceholder) avatarPlaceholder.style.display = 'none';
            } else {
                 if(avatarImg) avatarImg.style.display = 'none';
                 if(avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
            }

            // Preferencias (adaptado a los nuevos IDs)
            const preferences = this.user.preferences || {};
            const emailToggle = document.getElementById('email-notifications-toggle');
            const newsletterToggle = document.getElementById('newsletter-toggle');
            const darkModeToggle = document.getElementById('dark-mode-toggle');

            if(emailToggle) emailToggle.checked = preferences.emailNotifications || false;
            if(newsletterToggle) newsletterToggle.checked = preferences.newsletter || false;
            if(darkModeToggle) darkModeToggle.checked = preferences.darkMode || false;

            // Aplicar estado visual inicial de los toggles
            [emailToggle, newsletterToggle, darkModeToggle].forEach(toggle => {
                if(toggle) {
                    const toggleSlider = toggle.parentElement.querySelector('.toggle-slider');
                     if (toggleSlider) {
                        if (toggle.checked) {
                             const sliderWidth = toggleSlider.offsetWidth;
                             const toggleContainerWidth = toggle.parentElement.offsetWidth;
                             let padding = 4;
                             if (sliderWidth === 16) padding = 3;

                             const translateXValue = toggleContainerWidth - sliderWidth - (padding * 2);
                            toggleSlider.style.transform = `translateX(${translateXValue}px)`;
                        } else {
                            toggleSlider.style.transform = 'translateX(0)';
                        }
                     }
                }
            });

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
            const editAvatarBtn = document.querySelector('.edit-avatar-btn');
            if (editAvatarBtn) {
                editAvatarBtn.addEventListener('click', () => this.showAvatarUpload());
            }

            // Campos editables
            document.querySelectorAll('.edit-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const infoItem = e.target.closest('.info-item');
                    const valueElement = infoItem.querySelector('.info-value');
                    if (valueElement) {
                         this.makeEditable(valueElement);
                    } else {
                        console.error('Info value element not found for editing.');
                    }
                });
            });

            // Preferencias
            ['email-notifications-toggle', 'newsletter-toggle', 'dark-mode-toggle'].forEach(id => {
                const toggleInput = document.getElementById(id);
                if (toggleInput) {
                    toggleInput.addEventListener('change', (e) => {
                        const preferenceKey = id.replace('-toggle', '');
                        const isChecked = e.target.checked;

                        // Guardar la preferencia
                        this.updatePreference(preferenceKey, isChecked);
                        
                        // Forzar el cambio visual de la posición del slider
                         const currentToggleSlider = e.target.parentElement.querySelector('.toggle-slider');
                         if (currentToggleSlider) {
                            if (isChecked) {
                                const sliderWidth = currentToggleSlider.offsetWidth;
                                const toggleContainerWidth = e.target.parentElement.offsetWidth;
                                let padding = 4;
                                if (sliderWidth === 16) padding = 3;
                                const translateXValue = toggleContainerWidth - sliderWidth - (padding * 2);
                                currentToggleSlider.style.transform = `translateX(${translateXValue}px)`;
                            } else {
                                currentToggleSlider.style.transform = 'translateX(0)';
                            }
                         }
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

            // Botón Explorar Productos en historial vacío
            const browseProductsBtn = document.querySelector('.browse-products-btn');
            if (browseProductsBtn) {
                 browseProductsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = browseProductsBtn.href;
                 });
            }

        } catch (error) {
            console.error('Error al configurar event listeners:', error);
        }
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const sections = document.querySelectorAll('.profile-section');
        const sectionsContent = document.querySelector('.profile-sections-content');

        if (!sectionsContent) {
             console.error('Profile sections content container not found.');
             return;
        }

        let initialActiveTab = 'info';
        const firstTabButton = document.querySelector('.tab-button');
        if (firstTabButton) {
             initialActiveTab = firstTabButton.dataset.tab || initialActiveTab;
        }

         const activeTabButton = document.querySelector('.tab-button.active');
         if (activeTabButton) {
             initialActiveTab = activeTabButton.dataset.tab || initialActiveTab;
         } else if (firstTabButton) {
             firstTabButton.classList.add('active');
         }

        this.activeTab = initialActiveTab;
        this.showTab(this.activeTab);

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                if (tab && tab !== this.activeTab) {
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    this.showTab(tab);
                    this.activeTab = tab;
                }
            });
        });
    }

    showTab(tabId) {
         const sections = document.querySelectorAll('.profile-section');
         sections.forEach(section => {
             section.classList.remove('active');
         });
         const targetSection = document.getElementById(`${tabId}-section`);
         if (targetSection) {
             targetSection.classList.add('active');
         } else {
             console.error(`Section with ID ${tabId}-section not found.`);
         }
    }

    makeEditable(element) {
        const currentValue = element.textContent;
        const infoItem = element.closest('.info-item');
        if (!infoItem) return;

        const editButton = infoItem.querySelector('.edit-button');
        if (editButton) editButton.style.display = 'none';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.className = 'edit-input';
        element.textContent = '';
        element.appendChild(input);

         const actionsContainer = document.createElement('div');
         actionsContainer.className = 'edit-actions';

        const saveButton = document.createElement('button');
        saveButton.innerHTML = '<i class="fas fa-check"></i>';
        saveButton.className = 'save-button';

        const cancelButton = document.createElement('button');
        cancelButton.innerHTML = '<i class="fas fa-times"></i>';
        cancelButton.className = 'cancel-button';

         actionsContainer.appendChild(saveButton);
         actionsContainer.appendChild(cancelButton);
         element.appendChild(actionsContainer);

        input.focus();

        saveButton.addEventListener('click', () => {
            const newValue = input.value.trim();
            const field = infoItem.dataset.field;
            if (field && newValue && newValue !== currentValue) {
                this.updateUserInfo(field, newValue);
                this.restoreElement(element, newValue);
            } else {
                 this.restoreElement(element, currentValue);
            }
        });

        cancelButton.addEventListener('click', () => {
            this.restoreElement(element, currentValue);
        });
    }

    restoreElement(element, value) {
        element.textContent = value;

        const input = element.querySelector('.edit-input');
        if(input) input.remove();

        const actionsContainer = element.querySelector('.edit-actions');
        if(actionsContainer) actionsContainer.remove();

        const infoItem = element.closest('.info-item');
        const editButton = infoItem.querySelector('.edit-button');
        if (editButton) editButton.style.display = 'block';
    }

    updateUserInfo(field, value) {
        try {
            if (!this.user) return;

            this.user[field] = value;
            
            const storage = document.querySelector('#remember')?.checked ? localStorage : sessionStorage;
            storage.setItem('userData', JSON.stringify(this.user));

            this.showNotification(`Campo '${field}' actualizado correctamente`);
            console.log(`Usuario actualizado: ${field} = ${value}`, this.user);

        } catch (error) {
            console.error('Error al actualizar información del usuario:', error);
            this.showNotification('Error al actualizar la información', 'error');
        }
    }

    handlePasswordChange() {
        const currentPasswordInput = document.getElementById('current-password');
        const newPasswordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-password');

        if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
             console.error('Password change form elements not found.');
             return;
        }

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword !== confirmPassword) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        console.log('Attempting to change password...');
        this.showNotification('Contraseña actualizada correctamente');
        document.getElementById('password-form')?.reset();
    }

    setup2FA() {
        this.showNotification('Función de 2FA en desarrollo');
        console.log('Configurar 2FA clicked');
    }

    showAvatarUpload() {
        console.log('Edit Avatar clicked');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files ? e.target.files[0] : null;
            if (file) {
                this.uploadAvatar(file);
            }
        };
        input.click();
    }

    uploadAvatar(file) {
        console.log('Uploading avatar...');
        const reader = new FileReader();
        reader.onload = (e) => {
            const avatarImg = document.getElementById('avatarImage');
            const avatarPlaceholder = document.getElementById('profileAvatarPlaceholder');

            if (avatarImg) {
                avatarImg.src = e.target?.result || '';
                avatarImg.style.display = 'block';
            }
            if(avatarPlaceholder) avatarPlaceholder.style.display = 'none';

            if (this.user) {
                 this.user.avatar = e.target?.result || null;
                 const storage = document.querySelector('#remember')?.checked ? localStorage : sessionStorage;
                 storage.setItem('userData', JSON.stringify(this.user));
            }

            this.showNotification('Avatar actualizado correctamente');
        };
         reader.onerror = (error) => {
             console.error('Error reading file:', error);
             this.showNotification('Error al leer el archivo de imagen', 'error');
         };
        reader.readAsDataURL(file);
    }

    updatePreference(key, value) {
        try {
            if (!this.user) return;

            if (!this.user.preferences) {
                this.user.preferences = {};
            }
            this.user.preferences[key] = value;
            
            if (key === 'dark-mode') {
                if (value) {
                    localStorage.setItem('darkModeEnabled', 'true');
                } else {
                    localStorage.removeItem('darkModeEnabled');
                }
            }

            const storage = document.querySelector('#remember')?.checked ? localStorage : sessionStorage;
            storage.setItem('userData', JSON.stringify(this.user));

            this.showNotification(`Preferencia '${key}' actualizada a ${value}`);
            console.log(`Preferencias actualizadas: ${key} = ${value}`, this.user.preferences);

        } catch (error) {
            console.error('Error al actualizar preferencias:', error);
            this.showNotification('Error al guardar las preferencias', 'error');
        }
    }

    renderPurchaseHistory() {
        const purchaseHistoryContainer = document.getElementById('purchase-history');
        if (!purchaseHistoryContainer) {
             console.error('Purchase history container not found.');
             return;
        }

        purchaseHistoryContainer.innerHTML = '';

        if (!this.user || !this.user.purchaseHistory || this.user.purchaseHistory.length === 0) {
            purchaseHistoryContainer.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-shopping-bag"></i>
                    <p>No tienes compras registradas</p>
                    <a href="productos.html" class="browse-products-btn">Ir a comprar</a>
                </div>
            `;
            const browseProductsBtn = purchaseHistoryContainer.querySelector('.browse-products-btn');
            if (browseProductsBtn) {
                 browseProductsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = browseProductsBtn.href;
                 });
            }

            return;
        }

        purchaseHistoryContainer.innerHTML = this.user.purchaseHistory.map(purchase => this.createPurchaseCard(purchase)).join('');

         const browseProductsBtn = document.querySelector('.browse-products-btn');
         if (browseProductsBtn && !browseProductsBtn.dataset.listenerAdded) {
              browseProductsBtn.addEventListener('click', (e) => {
                 e.preventDefault();
                 window.location.href = browseProductsBtn.href;
              });
              browseProductsBtn.dataset.listenerAdded = 'true';
         }
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
                    <span class="purchase-status ${purchase.status.toLowerCase().replace(' ', '-')}">${purchase.status}</span>
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
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) {
             console.error('Notification element not found.');
             return;
        }
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.getUserData) {
        new UserProfile();
    } else {
        console.error('auth.js or getUserData function not loaded.');
         document.body.innerHTML = '<p>Error: No se pudieron cargar las funciones de autenticación.</p>';
    }
});