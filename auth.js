<<<<<<< HEAD
// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario de inicio de sesión
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const userMenu = document.getElementById('userMenu');
    const accountButton = document.getElementById('accountButton');
    const accountDropdown = document.getElementById('accountDropdown');
    const logoutButton = document.getElementById('logoutButton');

    // Función para mostrar/ocultar contraseña
    if (togglePassword) {
        togglePassword.addEventListener('click', function(e) {
            e.preventDefault(); // Evita que el botón cause submit
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // Verificar estado de la sesión al cargar (DESACTIVADO PARA PRUEBAS, permite cualquier usuario)
    // const userData = getUserData();
    // updateUserInterface(userData);

    // Redirección si el usuario ya está autenticado en login.html (DESACTIVADO PARA PRUEBAS)
    // if (window.location.pathname.includes('login.html') && userData) {
    //     window.location.replace('perfil.html');
    //     return;
    // }

    // Redirección si no hay usuario autenticado en perfil.html (DESACTIVADO PARA PRUEBAS)
    // if (window.location.pathname.includes('perfil.html') && !userData) {
    //     window.location.replace('login.html');
    //     return;
    // }

    // Configuración del menú de cuenta
    if (accountButton && accountDropdown) {
        accountButton.addEventListener('click', function(e) {
            e.preventDefault();
            accountDropdown.classList.toggle('show');
        });
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!accountButton.contains(e.target) && !accountDropdown.contains(e.target)) {
                accountDropdown.classList.remove('show');
            }
        });
    }

    // Manejo de clics en enlaces del menú
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (!userData) {
                window.location.href = 'login.html';
            } else {
                window.location.href = this.getAttribute('href');
            }
        });
    });

    // Manejo del cierre de sesión
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Manejo del formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btnText = loginButton.querySelector('.login-btn-text');
            const btnLoader = loginButton.querySelector('.login-btn-loader');
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
            handleLogin(this);
        });
    }

    // Delegar el evento para mostrar/ocultar contraseña usando event delegation
    if (loginForm) {
        loginForm.addEventListener('click', function(e) {
            if (e.target.classList.contains('toggle-password') || e.target.closest('.toggle-password')) {
                e.preventDefault();
                const btn = e.target.closest('.toggle-password');
                const pwdInput = loginForm.querySelector('#password');
                const icon = btn.querySelector('i');
                const type = pwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
                pwdInput.setAttribute('type', type);
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }
});

// Función para obtener datos del usuario
function getUserData() {
    try {
        const userStr = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        if (!userStr) return null;
        const userData = JSON.parse(userStr);
        // Permitir cualquier usuario, incluso invitado o id 0
        return userData;
    } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
    }
}

// Nuevo login usando fetch a login.php
function handleLogin(form) {
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const messageDiv = document.getElementById('login-message');
    messageDiv.textContent = '';
    messageDiv.className = '';
    if (!email || !password) {
        messageDiv.textContent = 'Por favor, completa todos los campos.';
        messageDiv.className = 'error';
        shakeForm(form);
        resetLoginButton();
        return;
    }
    fetch('login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(res => {
        if (res.success && res.user) {
            messageDiv.textContent = '¡Bienvenido! Redirigiendo...';
            messageDiv.className = 'success';
            setTimeout(() => {
                const userData = {
                    id: res.user.id,
                    email: res.user.email,
                    username: res.user.username,
                    timestamp: new Date().getTime()
                };
                sessionStorage.setItem('userData', JSON.stringify(userData));
                const guestCart = localStorage.getItem('cart_guest');
                if (guestCart) {
                    localStorage.setItem(`cart_${userData.email}`, guestCart);
                    localStorage.removeItem('cart_guest');
                }
                const redirect = localStorage.getItem('redirectAfterLogin');
                if (redirect) {
                    localStorage.removeItem('redirectAfterLogin');
                    window.location.replace(redirect);
                } else {
                    window.location.replace('index.html');
                }
            }, 800);
        } else if (res.register_required) {
            localStorage.setItem('registerEmail', email);
            window.location.replace('register.html');
        } else {
            messageDiv.textContent = res.message || 'Credenciales incorrectas.';
            messageDiv.className = 'error';
            shakeForm(form);
            resetLoginButton();
        }
    })
    .catch(() => {
        messageDiv.textContent = 'Error de conexión con el servidor.';
        messageDiv.className = 'error';
        shakeForm(form);
        resetLoginButton();
    });
}

// Función para cerrar sesión
function logout() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
        const userCart = localStorage.getItem(`cart_${userData.email}`);
        
        // Guardar el carrito del usuario como carrito de invitado
        if (userCart) {
            localStorage.setItem('cart_guest', userCart);
            localStorage.removeItem(`cart_${userData.email}`);
        }

        // Limpiar datos de sesión
        localStorage.removeItem('userData');
        sessionStorage.removeItem('userData');
        window.location.replace('index.html');
    } catch (e) {
        console.error('Error during logout:', e);
    }
}

// Función para actualizar la interfaz según el estado de autenticación
function updateUserInterface(userData) {
    const userEmail = document.querySelector('.user-email');
    const accountDropdown = document.getElementById('accountDropdown');

    if (userData && userEmail) {
        userEmail.textContent = `¡Hola, ${userData.username}!`;
        if (accountDropdown) accountDropdown.style.display = 'block';
    } else {
        if (accountDropdown) accountDropdown.style.display = 'none';
    }
}

// Configuración de botones de inicio de sesión social
const socialButtons = document.querySelectorAll('.social-button');
socialButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
        console.log(`Iniciando sesión con ${provider}...`);
        
        // Aquí iría la lógica de autenticación social
        alert(`Inicio de sesión con ${provider} en desarrollo`);
    });
});

// Función universal para verificar sesión y redirigir si no está logueado
function checkAuth(redirectIfNotLogged = false) {
    const userData = getUserData();
    if (!userData && redirectIfNotLogged) {
        window.location.replace('login.html');
        return false;
    }
    return !!userData;
}

// Función universal para actualizar la UI del usuario en el header
function updateUserUI() {
    const userData = getUserData();
    const userEmail = document.querySelector('.user-email');
    const accountDropdown = document.getElementById('accountDropdown');
    if (userData && userEmail) {
        userEmail.textContent = `¡Hola, ${userData.username || userData.email}!`;
        if (accountDropdown) accountDropdown.style.display = 'block';
    } else {
        if (accountDropdown) accountDropdown.style.display = 'none';
    }
}

// Llamar a la sincronización global en cada página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateUserUI();
    });
} else {
    updateUserUI();
}

// Exportar funciones para uso global (si se usa módulos)
window.checkAuth = checkAuth;
window.updateUserUI = updateUserUI;

// Animación shake para el formulario
function shakeForm(form) {
    form.classList.remove('shake');
    void form.offsetWidth; // Trigger reflow
    form.classList.add('shake');
}

// Resetear el botón de login
function resetLoginButton() {
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        const btnText = loginButton.querySelector('.login-btn-text');
        const btnLoader = loginButton.querySelector('.login-btn-loader');
        btnText.style.display = '';
        btnLoader.style.display = 'none';
    }
} 
=======
// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario de inicio de sesión
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const userMenu = document.getElementById('userMenu');
    const accountButton = document.getElementById('accountButton');
    const accountDropdown = document.getElementById('accountDropdown');
    const logoutButton = document.getElementById('logoutButton');

    // Función para mostrar/ocultar contraseña
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // Verificar estado de la sesión al cargar
    const userData = getUserData();
    updateUserInterface(userData);

    // Redirección si el usuario ya está autenticado en login.html
    if (window.location.pathname.includes('login.html') && userData) {
        window.location.replace('perfil.html');
        return;
    }

    // Redirección si no hay usuario autenticado en perfil.html
    if (window.location.pathname.includes('perfil.html') && !userData) {
        window.location.replace('login.html');
        return;
    }

    // Configuración del menú de cuenta
    if (accountButton && accountDropdown) {
        accountButton.addEventListener('click', function(e) {
            e.preventDefault();
            accountDropdown.classList.toggle('show');
        });
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!accountButton.contains(e.target) && !accountDropdown.contains(e.target)) {
                accountDropdown.classList.remove('show');
            }
        });
    }

    // Manejo de clics en enlaces del menú
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (!userData) {
                window.location.href = 'login.html';
            } else {
                window.location.href = this.getAttribute('href');
            }
        });
    });

    // Manejo del cierre de sesión
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Manejo del formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(this);
        });
    }
});

// Función para obtener datos del usuario
function getUserData() {
    try {
        const userStr = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        if (!userStr) return null;

        const userData = JSON.parse(userStr);
        if (!userData || !userData.timestamp) return null;

        const now = new Date().getTime();
        const hoursSinceLogin = (now - userData.timestamp) / (1000 * 60 * 60);
        
        if (hoursSinceLogin > 24) {
            logout();
            return null;
        }

        return userData;
    } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
    }
}

// Función para manejar el inicio de sesión
function handleLogin(form) {
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const remember = form.querySelector('#remember').checked;
    const username = form.querySelector('#username').value;

    if (email && password && username) {
        const userData = {
            email: email,
            username: username,
            timestamp: new Date().getTime()
        };

        try {
            // Guardar el carrito del invitado si existe
            const guestCart = localStorage.getItem('cart_guest');
            
            // Limpiar cualquier dato anterior
            localStorage.removeItem('userData');
            sessionStorage.removeItem('userData');

            // Guardar nuevos datos según la preferencia de "recordarme"
            if (remember) {
                localStorage.setItem('userData', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('userData', JSON.stringify(userData));
            }

            // Transferir carrito de invitado al usuario si existe
            if (guestCart) {
                localStorage.setItem(`cart_${email}`, guestCart);
                localStorage.removeItem('cart_guest');
            }

            // Redirigir al perfil
            window.location.replace('perfil.html');
        } catch (e) {
            console.error('Error saving user data:', e);
            alert('Error al guardar los datos de sesión');
        }
    } else {
        alert('Por favor, complete todos los campos');
    }
}

// Función para cerrar sesión
function logout() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
        const userCart = localStorage.getItem(`cart_${userData.email}`);
        
        // Guardar el carrito del usuario como carrito de invitado
        if (userCart) {
            localStorage.setItem('cart_guest', userCart);
            localStorage.removeItem(`cart_${userData.email}`);
        }

        // Limpiar datos de sesión
        localStorage.removeItem('userData');
        sessionStorage.removeItem('userData');
        window.location.replace('index.html');
    } catch (e) {
        console.error('Error during logout:', e);
    }
}

// Función para actualizar la interfaz según el estado de autenticación
function updateUserInterface(userData) {
    const userEmail = document.querySelector('.user-email');
    const accountDropdown = document.getElementById('accountDropdown');

    if (userData && userEmail) {
        userEmail.textContent = `¡Hola, ${userData.username}!`;
        if (accountDropdown) accountDropdown.style.display = 'block';
    } else {
        if (accountDropdown) accountDropdown.style.display = 'none';
    }
}

// Configuración de botones de inicio de sesión social
const socialButtons = document.querySelectorAll('.social-button');
socialButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
        console.log(`Iniciando sesión con ${provider}...`);
        
        // Aquí iría la lógica de autenticación social
        alert(`Inicio de sesión con ${provider} en desarrollo`);
    });
}); 
>>>>>>> f5ce1d610eeb4717afaf52d3a7d31dd99ff04d39
