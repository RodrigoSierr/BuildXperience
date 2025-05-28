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

    // --- Implementación de Schema.org (JSON-LD) para SEO ---
    function addSchemaMarkup() {
        const products = [];
        document.querySelectorAll('.product-card').forEach(card => {
            const productName = card.querySelector('.product-name')?.textContent.trim();
            const productDescription = card.querySelector('.product-description')?.textContent.trim();
            const productPrice = card.querySelector('.product-price')?.textContent.replace('$', '').trim();
            const productImage = card.querySelector('.product-image img')?.src;
            const productId = card.dataset.id;
            const productCategory = card.dataset.category;
            
            // Extraer rating y número de reseñas (si existen)
            let ratingValue = null;
            let reviewCount = null;
            const ratingElement = card.querySelector('.product-rating');
            if (ratingElement) {
                const fullStars = ratingElement.querySelectorAll('.fas.fa-star').length;
                const halfStars = ratingElement.querySelectorAll('.fas.fa-star-half-alt').length;
                ratingValue = fullStars + (halfStars * 0.5);
                
                const reviewCountText = ratingElement.textContent.match(/\((\d+)\)/);
                if (reviewCountText && reviewCountText[1]) {
                    reviewCount = parseInt(reviewCountText[1]);
                }
            }

            if (productName && productPrice && productImage && productId) {
                const productSchema = {
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "productID": productId,
                    "name": productName,
                    "image": productImage,
                    "description": productDescription || productName,
                    "sku": productId, // Usar ID como SKU por simplicidad
                    "brand": {
                        "@type": "Brand",
                        "name": "BuildXperience"
                    },
                    "offers": {
                        "@type": "Offer",
                        "url": window.location.href, // URL de la página actual
                        "priceCurrency": "USD", // Asume USD, cambia si es necesario
                        "price": parseFloat(productPrice),
                        "availability": "https://schema.org/InStock", // Asume en stock
                        "seller": {
                            "@type": "Organization",
                            "name": "BuildXperience"
                        }
                    }
                };

                // Añadir rating si está disponible
                if (ratingValue !== null && reviewCount !== null) {
                    productSchema.aggregateRating = {
                        "@type": "AggregateRating",
                        "ratingValue": ratingValue.toString(),
                        "reviewCount": reviewCount.toString()
                    };
                }

                products.push(productSchema);
            }
        });

        if (products.length > 0) {
            const schemaScript = document.createElement('script');
            schemaScript.type = 'application/ld+json';
            schemaScript.textContent = JSON.stringify(products.length === 1 ? products[0] : products);
            document.head.appendChild(schemaScript);
        }
    }

    // Llamar a la función para añadir el marcado Schema.org al cargar la página
    addSchemaMarkup();

    // --- Integración con DBpedia ---
    // Mapeo simple de nombre de producto a URI de DBpedia (ampliado con algunos ejemplos)
    // **Nota:** Este mapeo es limitado. Una implementación completa requeriría un mapeo más robusto
    // o una estrategia de búsqueda en DBpedia.
    const dbpediaUris = {
        "NVIDIA RTX 4090": "http://dbpedia.org/resource/GeForce_40_series",
        "Intel Core i9-14900K": "http://dbpedia.org/resource/Intel_Core_i9", // URI para la serie i9
        // "Corsair Dominator Platinum RGB": "http://dbpedia.org/resource/Corsair_Gaming", // URI para la marca Corsair
        // Puedes añadir más mapeos aquí manualmente si conoces las URIs correctas
    };

    // Función para consultar DBpedia para un producto
    async function fetchDbpediaInfo(productName) {
        const dbpediaUri = dbpediaUris[productName];

        if (!dbpediaUri) {
            console.log(`DBpedia Info: No se encontró URI de DBpedia para "${productName}".`);
            return null;
        }

        // Consulta SPARQL para obtener el abstract en español
        const query = `
            SELECT ?abstract WHERE {
                <${dbpediaUri}> <http://dbpedia.org/ontology/abstract> ?abstract .
                FILTER (lang(?abstract) = 'es')
            }
            LIMIT 1
        `;

        const endpointUrl = 'https://dbpedia.org/sparql';
        const fullUrl = endpointUrl + '?query=' + encodeURIComponent(query) + '&format=json';

        console.log(`DBpedia Info: Consultando DBpedia para "${productName}"...`);

        try {
            const response = await fetch(fullUrl, {
                headers: {
                    'Accept': 'application/sparql-results+json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.results.bindings.length > 0) {
                const abstract = data.results.bindings[0].abstract.value;
                console.log(`DBpedia Info: Información encontrada para "${productName}": ${abstract.substring(0, 200)}...`); // Log resumen
                return abstract;
            } else {
                console.log(`DBpedia Info: No se encontró abstract en español para "${productName}" en DBpedia.`);
                return null;
            }

        } catch (error) {
            console.error('DBpedia Info: Error al consultar DBpedia:', error);
            return null;
        }
    }

    // --- Ejecutar consulta DBpedia para todos los productos al cargar la página ---
    function fetchDbpediaForAllProducts() {
        document.querySelectorAll('.product-card').forEach(card => {
            const productName = card.querySelector('.product-name')?.textContent.trim();
            // Usar el ID del producto para referenciar la tarjeta
            const productId = card.dataset.id;
            const dbpediaInfoDiv = card.querySelector('.dbpedia-info');

            if (productName && dbpediaInfoDiv) {
                // Llamar a la función de consulta para cada nombre de producto
                fetchDbpediaInfo(productName).then(info => {
                    // Aquí usamos la 'info' para actualizar la interfaz de usuario
                    if (info) {
                        // Insertar solo la información en el div, sin la etiqueta
                        dbpediaInfoDiv.innerHTML = info;
                        // Opcional: añadir alguna clase para estilizar el div
                        // dbpediaInfoDiv.classList.add('has-dbpedia-info');
                    } else {
                         // Opcional: mostrar un mensaje si no se encontró información
                        // dbpediaInfoDiv.innerHTML = '<small>No DBpedia info found.</small>';
                    }
                }).catch(error => {
                    // Manejar errores si es necesario
                    console.error(`DBpedia Info: Error fetching info for ${productName}:`, error);
                });
            } else if (!dbpediaInfoDiv) {
                 console.warn(`DBpedia Info: .dbpedia-info div not found for product ${productName || productId}.`);
            }
        });
    }

    // Llamar a la función para consultar DBpedia para todos los productos al cargar la página
    fetchDbpediaForAllProducts();
}); 