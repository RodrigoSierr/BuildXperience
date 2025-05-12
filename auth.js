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