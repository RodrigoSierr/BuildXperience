document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el carrito
    const cart = new Cart();

    // Añadir event listeners a los botones de "Añadir al carrito"
    document.querySelectorAll('.product-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const product = {
                    id: productCard.dataset.id,
                    name: productCard.querySelector('.product-name').textContent,
                    price: parseFloat(productCard.querySelector('.product-price').textContent.replace('$', '')),
                    image: productCard.querySelector('.product-image').src
                };
                cart.addItem(product);
            }
        });
    });

    // Filtros y búsqueda
    const filterButtons = document.querySelectorAll('.filter-button');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const productCards = document.querySelectorAll('.product-card');
    const filtersContainer = document.querySelector('.products-filters');
    let lastScrollTop = 0;
    let isScrollingDown = false;

    // Función para filtrar productos
    function filterProducts() {
        const selectedCategory = document.querySelector('.filter-button.active').dataset.category;
        const searchTerm = searchInput.value.toLowerCase();
        const sortValue = sortSelect.value;

        productCards.forEach(card => {
            const category = card.dataset.category;
            const name = card.querySelector('.product-name').textContent.toLowerCase();
            const description = card.querySelector('.product-description').textContent.toLowerCase();
            
            const matchesCategory = selectedCategory === 'todos' || category === selectedCategory;
            const matchesSearch = name.includes(searchTerm) || description.includes(searchTerm);
            
            card.style.display = matchesCategory && matchesSearch ? 'block' : 'none';
        });

        // Ordenar productos
        const visibleCards = Array.from(productCards).filter(card => card.style.display !== 'none');
        const sortedCards = visibleCards.sort((a, b) => {
            const priceA = parseFloat(a.querySelector('.product-price').textContent.replace('$', ''));
            const priceB = parseFloat(b.querySelector('.product-price').textContent.replace('$', ''));
            const nameA = a.querySelector('.product-name').textContent;
            const nameB = b.querySelector('.product-name').textContent;

            switch(sortValue) {
                case 'precio-asc':
                    return priceA - priceB;
                case 'precio-desc':
                    return priceB - priceA;
                case 'nombre-asc':
                    return nameA.localeCompare(nameB);
                case 'nombre-desc':
                    return nameB.localeCompare(nameA);
                default:
                    return 0;
            }
        });

        // Reordenar en el DOM
        const productsGrid = document.querySelector('.products-grid');
        sortedCards.forEach(card => productsGrid.appendChild(card));
    }

    // Event listeners para filtros
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterProducts();
        });
    });

    searchInput.addEventListener('input', filterProducts);
    sortSelect.addEventListener('change', filterProducts);

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