// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM para el menú móvil
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    // Toggle del menú móvil al hacer clic en el botón
    mobileMenuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        this.classList.toggle('active');
        body.classList.toggle('menu-open');
    });

    // Cerrar menú al hacer clic en un enlace (solo en móvil)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    });

    // Cerrar menú al cambiar el tamaño de la ventana a desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            body.classList.remove('menu-open');
        }
    });

    // Prevenir scroll cuando el menú está abierto
    function preventScroll(e) {
        if (body.classList.contains('menu-open')) {
            e.preventDefault();
        }
    }

    // Agregar listener para prevenir scroll
    document.addEventListener('scroll', preventScroll, { passive: false });
}); 