# BuildXperience

## Configuración con XAMPP

1. Asegúrate de tener XAMPP instalado en tu computadora
2. Inicia los servicios de Apache y MySQL en XAMPP Control Panel
3. Copia todo el contenido de este proyecto a la carpeta `htdocs` de XAMPP
4. Abre tu navegador y ve a:
   - `http://localhost/BuildXperience/config/database.php` para configurar la base de datos
   - `http://localhost/BuildXperience` para ver la aplicación

## Estructura de la Base de Datos

La aplicación utiliza MySQL con las siguientes tablas:
- `users`: Almacena información de los usuarios
- `products`: Almacena información de los productos
- `cart_items`: Maneja el carrito de compras
- `orders`: Almacena los pedidos realizados
- `order_items`: Detalles de cada pedido
- `categories`: Jerarquía de categorías de productos

## Tecnologías

- Frontend: HTML, CSS, JavaScript
- Backend: PHP
- Base de datos: MySQL (XAMPP)