document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario de inicio de sesión
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const userMenu = document.getElementById('userMenu');

    // Mostrar/ocultar contraseña
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // Manejo del formulario de inicio de sesión
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            const username = document.getElementById('username').value;

            // Simulación de inicio de sesión
            simulateLogin(email, password, remember, username);
        });
    }

    // Botones de inicio de sesión social
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

    // Manejo del botón de cerrar sesión
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Verificar estado de la sesión al cargar
    checkLoginStatus();
});

// Función para simular el inicio de sesión
function simulateLogin(email, password, remember, username) {
    // Mostrar un loader o spinner
    const authButton = document.querySelector('.auth-button');
    const originalText = authButton.textContent;
    authButton.disabled = true;
    authButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';

    // Simular una llamada a la API
    setTimeout(() => {
        if (email && password && username) {
            // Guardar los datos de la sesión
            const userData = {
                email: email,
                username: username,
                timestamp: new Date().getTime()
            };

            if (remember) {
                localStorage.setItem('userData', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('userData', JSON.stringify(userData));
            }

            // Redirigir al usuario
            window.location.href = 'index.html';
        } else {
            alert('Por favor, complete todos los campos');
            authButton.disabled = false;
            authButton.textContent = originalText;
        }
    }, 1500);
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
    window.location.reload();
}

// Verificar si el usuario ya está logueado
function checkLoginStatus() {
    const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || 'null');
    const loginButton = document.getElementById('loginButton');
    const userMenu = document.getElementById('userMenu');

    if (userData && userData.timestamp) {
        // Verificar si la sesión ha expirado (24 horas)
        const now = new Date().getTime();
        const hoursSinceLogin = (now - userData.timestamp) / (1000 * 60 * 60);

        if (hoursSinceLogin > 24) {
            // La sesión ha expirado
            logout();
            return;
        }

        // Actualizar la interfaz para usuario logueado
        if (loginButton && userMenu) {
            loginButton.style.display = 'none';
            userMenu.style.display = 'block';
            const userEmail = userMenu.querySelector('.user-email');
            if (userEmail) {
                userEmail.textContent = `¡Hola, ${userData.username}!`;
            }
        }

        // Redirigir si está en la página de login
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
    } else {
        // Actualizar la interfaz para usuario no logueado
        if (loginButton && userMenu) {
            loginButton.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }
} 