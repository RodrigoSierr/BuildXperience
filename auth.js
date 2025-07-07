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
        const userStr = localStorage.getItem('userData');
        if (!userStr) return null;
        const userData = JSON.parse(userStr);
        return userData;
    } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
    }
}

function handleLogin(form) {
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const messageDiv = document.getElementById('login-message');
    const loginButton = document.getElementById('loginButton');
    const btnText = loginButton.querySelector('.login-btn-text');
    const btnLoader = loginButton.querySelector('.login-btn-loader');
    messageDiv.textContent = '';
    messageDiv.className = '';
    if (!email || !password) {
        messageDiv.textContent = 'Por favor, completa todos los campos.';
        messageDiv.className = 'error';
        shakeForm(form);
        resetLoginButton();
        return;
    }
    loginButton.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    fetch('login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            if (data.user.status && data.user.status !== 'active') {
                messageDiv.textContent = 'Tu cuenta está inactiva. Contacta al soporte.';
                messageDiv.className = 'error';
                shakeForm(form);
                resetLoginButton();
                return;
            }
            // Asegurar que el usuario tenga un timestamp
            data.user.timestamp = Date.now();
            localStorage.setItem('userData', JSON.stringify(data.user));
            messageDiv.textContent = '¡Bienvenido! Redirigiendo...';
            messageDiv.className = 'success';
            setTimeout(() => {
                window.location.replace('index.html');
            }, 800);
        } else {
            messageDiv.textContent = data.message || 'Credenciales incorrectas.';
            messageDiv.className = 'error';
            shakeForm(form);
            resetLoginButton();
        }
    })
    .catch(err => {
        messageDiv.textContent = 'Error de conexión. Intenta de nuevo.';
        messageDiv.className = 'error';
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
        loginButton.disabled = false;
    }
} 