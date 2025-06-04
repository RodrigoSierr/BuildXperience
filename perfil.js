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
        this.applyInitialTheme(); // Aplicar el tema al cargar la página
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
            const darkModeToggle = document.getElementById('dark-mode-toggle'); // Usar nuevo ID

            if(emailToggle) emailToggle.checked = preferences.emailNotifications || false;
            if(newsletterToggle) newsletterToggle.checked = preferences.newsletter || false;
            if(darkModeToggle) darkModeToggle.checked = preferences.darkMode || false;

            // Aplicar estado visual inicial de los toggles
            [emailToggle, newsletterToggle, darkModeToggle].forEach(toggle => {
                if(toggle) {
                    const toggleSlider = toggle.parentElement.querySelector('.toggle-slider');
                     if (toggleSlider) {
                        if (toggle.checked) {
                            // Calcular la traslación basada en el tamaño del toggle
                            // Ancho del toggle (50px) - padding horizontal (4px*2) - ancho de la palanca (18px)
                            // Para 50px width, 26px height, 18px palanca, 4px padding: translateX(50 - 4*2 - 18) = translateX(24px)
                            // Para 40px width, 22px height, 16px palanca, 3px padding: translateX(40 - 3*2 - 16) = translateX(18px)
                            // Para 60px width, 34px height, 26px palanca, 4px padding: translateX(60 - 4*2 - 26) = translateX(26px)
                             const sliderWidth = toggleSlider.offsetWidth; // Ancho de la palanca
                             const toggleContainerWidth = toggle.parentElement.offsetWidth; // Ancho total del switch (etiqueta)
                             // Asumiendo un padding consistente de 4px en cada lado del slider para la palanca de 18px/26px, 3px para 16px
                             let padding = 4; // Default para 50/60px
                             if (sliderWidth === 16) padding = 3; // Para 40px toggle

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

     applyInitialTheme() {
        // Leer el estado del modo oscuro desde localStorage
        const darkModeEnabled = localStorage.getItem('darkModeEnabled') === 'true';

        if (darkModeEnabled) {
            document.body.classList.add('dark-mode');
        } else {
             document.body.classList.remove('dark-mode');
        }
        // Sincronizar el toggle del perfil si existe
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = darkModeEnabled;
            // Trigger change event to visually update the slider
            const event = new Event('change');
            darkModeToggle.dispatchEvent(event);
        }
     }

    setupEventListeners() {
        try {
            // Avatar
            const editAvatarBtn = document.querySelector('.edit-avatar-btn'); // Usar nueva clase
            if (editAvatarBtn) {
                editAvatarBtn.addEventListener('click', () => this.showAvatarUpload());
            }

            // Campos editables
            document.querySelectorAll('.edit-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const infoItem = e.target.closest('.info-item');
                    // Encontrar el info-value dentro del info-item
                    const valueElement = infoItem.querySelector('.info-value');
                    if (valueElement) {
                         this.makeEditable(valueElement);
                    } else {
                        console.error('Info value element not found for editing.');
                    }
                });
            });

            // Preferencias (adaptado a los nuevos IDs y lógica de visualización)
            ['email-notifications-toggle', 'newsletter-toggle', 'dark-mode-toggle'].forEach(id => {
                const toggleInput = document.getElementById(id);
                if (toggleInput) {
                    toggleInput.addEventListener('change', (e) => {
                        const preferenceKey = id.replace('-toggle', ''); // Obtener la clave de preferencia (email-notifications, newsletter, dark-mode)
                        const isChecked = e.target.checked;

                        // Guardar la preferencia
                        this.updatePreference(preferenceKey, isChecked);
                        
                        // Forzar el cambio visual de la posición del slider
                         const currentToggleSlider = e.target.parentElement.querySelector('.toggle-slider');
                         if (currentToggleSlider) {
                            if (isChecked) {
                                // Recalcular la traslación
                                const sliderWidth = currentToggleSlider.offsetWidth; // Ancho de la palanca
                                const toggleContainerWidth = e.target.parentElement.offsetWidth; // Ancho total del switch (etiqueta)
                                let padding = 4; // Default para 50/60px
                                if (sliderWidth === 16) padding = 3; // Para 40px toggle
                                const translateXValue = toggleContainerWidth - sliderWidth - (padding * 2);
                                currentToggleSlider.style.transform = `translateX(${translateXValue}px)`;
                            } else {
                                currentToggleSlider.style.transform = 'translateX(0)';
                            }
                         }

                         // Si es el toggle de modo oscuro, aplicar el tema inmediatamente
                         if (preferenceKey === 'dark-mode') {
                             if (isChecked) {
                                 document.body.classList.add('dark-mode');
                             } else {
                                 document.body.classList.remove('dark-mode');
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
            const setup2FAButton = document.querySelector('.setup-2fa-button'); // Usar nueva clase
            if (setup2FAButton) {
                setup2FAButton.addEventListener('click', () => {
                    this.setup2FA();
                });
            }

            // Botón Explorar Productos en historial vacío (nueva clase)
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

        // Show the first tab content by default if no active tab is set
        let initialActiveTab = 'info'; // Default tab
        const firstTabButton = document.querySelector('.tab-button');
        if (firstTabButton) {
             initialActiveTab = firstTabButton.dataset.tab || initialActiveTab;
        }

        // Check if a tab is already marked as active in HTML
         const activeTabButton = document.querySelector('.tab-button.active');
         if (activeTabButton) {
             initialActiveTab = activeTabButton.dataset.tab || initialActiveTab;
         } else if (firstTabButton) {
              // If no active class in HTML, add it to the first button
             firstTabButton.classList.add('active');
         }

        this.activeTab = initialActiveTab;
        this.showTab(this.activeTab);

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                if (tab && tab !== this.activeTab) {
                    // Actualizar botones
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');

                    // Actualizar secciones
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
        const infoItem = element.closest('.info-item'); // Obtener el contenedor principal del item
        if (!infoItem) return; // Salir si no encuentra el contenedor

        // Eliminar el botón de edición actual
        const editButton = infoItem.querySelector('.edit-button');
        if (editButton) editButton.style.display = 'none';

        // Crear y añadir el input
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.className = 'edit-input';
        element.textContent = ''; // Limpiar el contenido actual del p.info-value
        element.appendChild(input);

        // Crear y añadir los botones de guardar y cancelar dentro de un contenedor si es necesario, o directamente después del input
         const actionsContainer = document.createElement('div');
         actionsContainer.className = 'edit-actions'; // Nueva clase para contenedor de botones

        const saveButton = document.createElement('button');
        saveButton.innerHTML = '<i class="fas fa-check"></i>';
        saveButton.className = 'save-button';

        const cancelButton = document.createElement('button');
        cancelButton.innerHTML = '<i class="fas fa-times"></i>';
        cancelButton.className = 'cancel-button';

         actionsContainer.appendChild(saveButton);
         actionsContainer.appendChild(cancelButton);
         element.appendChild(actionsContainer); // Añadir el contenedor de acciones después del input

        input.focus();

        saveButton.addEventListener('click', () => {
            const newValue = input.value.trim();
            // Obtener el campo a actualizar desde el atributo data-field del info-item
            const field = infoItem.dataset.field;
            if (field && newValue && newValue !== currentValue) {
                this.updateUserInfo(field, newValue);
                this.restoreElement(element, newValue); // Restaurar con el nuevo valor
            } else {
                 this.restoreElement(element, currentValue); // Restaurar con el valor original si no hay cambio o es vacío
            }
        });

        cancelButton.addEventListener('click', () => {
            this.restoreElement(element, currentValue); // Restaurar con el valor original
        });
    }

    restoreElement(element, value) {
        element.textContent = value; // Restaurar el texto

        // Eliminar el input y los botones
        const input = element.querySelector('.edit-input');
        if(input) input.remove();

        const actionsContainer = element.querySelector('.edit-actions');
        if(actionsContainer) actionsContainer.remove();

        // Mostrar el botón de edición original de nuevo
        const infoItem = element.closest('.info-item');
        const editButton = infoItem.querySelector('.edit-button');
        if (editButton) editButton.style.display = 'block';
    }

    updateUserInfo(field, value) {
        try {
            if (!this.user) return; // Asegurar que el usuario está cargado

            // Validaciones básicas si es necesario (ej: email format)

            this.user[field] = value;
            
            // Guardar en localStorage o sessionStorage (mantener lógica existente)
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

        // Aquí iría la lógica de cambio de contraseña (ej: enviar a un backend)
        console.log('Attempting to change password...');
        // Simulación de éxito:
        this.showNotification('Contraseña actualizada correctamente');
        document.getElementById('password-form')?.reset(); // Resetear el formulario si existe

        // En un caso real, aquí manejarías el envío seguro de contraseñas
    }

    setup2FA() {
        // Aquí iría la lógica de configuración de 2FA
        this.showNotification('Función de 2FA en desarrollo');
        console.log('Configurar 2FA clicked');
    }

    showAvatarUpload() {
        console.log('Edit Avatar clicked');
        // Lógica existente para subir avatar
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

            // Guardar el avatar en el usuario (como Data URL, considerar subir a un servidor en producción)
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
            if (!this.user) return; // Asegurar que el usuario está cargado

            if (!this.user.preferences) {
                this.user.preferences = {};
            }
            this.user.preferences[key] = value;
            
            // Guardar el estado del modo oscuro específicamente en localStorage para sincronización global
            if (key === 'dark-mode') {
                if (value) {
                    localStorage.setItem('darkModeEnabled', 'true');
                } else {
                    localStorage.removeItem('darkModeEnabled'); // Eliminar para que no esté presente si es falso
                }
            }

            // Guardar todas las preferencias del usuario en localStorage o sessionStorage
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
<<<<<<< HEAD
        if (!purchaseHistoryContainer) {
             console.error('Purchase history container not found.');
             return;
        }

        // Clear previous content
        purchaseHistoryContainer.innerHTML = '';

        if (!this.user || !this.user.purchaseHistory || this.user.purchaseHistory.length === 0) {
            purchaseHistoryContainer.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-shopping-bag"></i>
                    <p>No tienes compras registradas</p>
                    <a href="productos.html" class="browse-products-btn">Ir a comprar</a>
                </div>
            `;
            // Ensure the event listener is added to the new button
            const browseProductsBtn = purchaseHistoryContainer.querySelector('.browse-products-btn');
            if (browseProductsBtn) {
                 browseProductsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = browseProductsBtn.href;
                 });
            }

            return;
        }

        // Render purchase cards
        purchaseHistoryContainer.innerHTML = this.user.purchaseHistory.map(purchase => this.createPurchaseCard(purchase)).join('');

         // Re-add event listener for the new browse button if it exists after rendering cards (shouldn't happen with current logic but good practice)
         const browseProductsBtn = document.querySelector('.browse-products-btn'); // Select from the whole document just in case
         if (browseProductsBtn && !browseProductsBtn.dataset.listenerAdded) { // Add flag to prevent multiple listeners
              browseProductsBtn.addEventListener('click', (e) => {
                 e.preventDefault();
                 window.location.href = browseProductsBtn.href;
              });
              browseProductsBtn.dataset.listenerAdded = 'true'; // Mark as added
         }



=======
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
>>>>>>> 1afd1c47128c9ef735e73f2d4326625e5d5a3483
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
<<<<<<< HEAD
                    <span class="purchase-status ${purchase.status.toLowerCase().replace(' ', '-')}">${purchase.status}</span>
=======
                    <span class="purchase-status ${purchase.status.toLowerCase()}">${purchase.status}</span>
>>>>>>> 1afd1c47128c9ef735e73f2d4326625e5d5a3483
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
        notification.className = `notification ${type}`; // Permite 'success', 'error', etc.
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Inicializar el perfil cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Asegurarse de que auth.js haya cargado y getuserData esté disponible
    // Esto asume que auth.js se carga antes en perfil.html
    if (window.getUserData) {
        new UserProfile();
    } else {
        console.error('auth.js or getUserData function not loaded.');
        // O manejar esto de otra manera, quizás esperar un evento o mostrar un mensaje de error al usuario
         document.body.innerHTML = '<p>Error: No se pudieron cargar las funciones de autenticación.</p>';
    }
}); 