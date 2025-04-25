document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-button');
    const productCards = document.querySelectorAll('.product-card');
    const filtersContainer = document.querySelector('.products-filters');
    let lastScrollTop = 0;
    let isScrollingDown = false;

    // Función para filtrar productos
    function filterProducts(category) {
        productCards.forEach(card => {
            if (category === 'todos') {
                // Mostrar con animación
                card.style.display = 'flex';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 50);
            } else {
                if (card.dataset.category === category) {
                    // Mostrar con animación
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    // Ocultar con animación
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            }
        });
    }

    // Event listeners para los botones de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover clase active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar clase active al botón clickeado
            this.classList.add('active');

            // Obtener la categoría del botón
            const category = this.dataset.category;
            filterProducts(category);
        });
    });

    // Control de visibilidad de las categorías basado en el scroll
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        isScrollingDown = scrollTop > lastScrollTop;
        lastScrollTop = scrollTop;

        if (scrollTop > 100) { // Solo activar después de cierto scroll
            if (isScrollingDown) {
                filtersContainer.classList.add('hidden');
                filtersContainer.classList.remove('visible');
            } else {
                filtersContainer.classList.remove('hidden');
                filtersContainer.classList.add('visible');
            }
        } else {
            filtersContainer.classList.remove('hidden');
            filtersContainer.classList.add('visible');
        }
    });

    // Inicializar contador de carrito
    let cartCount = 0;
    const buyButtons = document.querySelectorAll('.buy-button');

    // Event listeners para los botones de compra
    buyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            cartCount++;
            
            // Mostrar notificación
            const notification = document.createElement('div');
            notification.className = 'cart-notification';
            notification.textContent = 'Producto añadido al carrito';
            document.body.appendChild(notification);

            // Animar y remover notificación
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 2000);
        });
    });
}); 