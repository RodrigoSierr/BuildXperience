<<<<<<< HEAD
// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM para el menú móvil
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    let resizeTimeout;

    // Función para manejar el toggle del menú
    const toggleMenu = () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        body.classList.toggle('menu-open');
    };

    // Toggle del menú móvil al hacer clic en el botón
    mobileMenuToggle.addEventListener('click', toggleMenu, { passive: true });

    // Cerrar menú al hacer clic en un enlace (solo en móvil)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                body.classList.remove('menu-open');
            }
        }, { passive: true });
    });

    // Cerrar menú al cambiar el tamaño de la ventana a desktop (con debounce)
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                body.classList.remove('menu-open');
            }
        }, 150);
    }, { passive: true });

    // Prevenir scroll cuando el menú está abierto (optimizado)
    const preventScroll = (e) => {
        if (body.classList.contains('menu-open')) {
            e.preventDefault();
        }
    };

    // Agregar listener para prevenir scroll (con passive: false solo cuando es necesario)
    document.addEventListener('scroll', preventScroll, { passive: false });
=======
// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM para el menú móvil
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    let resizeTimeout;

    // Función para manejar el toggle del menú
    const toggleMenu = () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        body.classList.toggle('menu-open');
    };

    // Toggle del menú móvil al hacer clic en el botón
    mobileMenuToggle.addEventListener('click', toggleMenu, { passive: true });

    // Cerrar menú al hacer clic en un enlace (solo en móvil)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                body.classList.remove('menu-open');
            }
        }, { passive: true });
    });

    // Cerrar menú al cambiar el tamaño de la ventana a desktop (con debounce)
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                body.classList.remove('menu-open');
            }
        }, 150);
    }, { passive: true });

    // Prevenir scroll cuando el menú está abierto (optimizado)
    const preventScroll = (e) => {
        if (body.classList.contains('menu-open')) {
            e.preventDefault();
        }
    };

    // Agregar listener para prevenir scroll (con passive: false solo cuando es necesario)
    document.addEventListener('scroll', preventScroll, { passive: false });
>>>>>>> 1afd1c47128c9ef735e73f2d4326625e5d5a3483
}); 