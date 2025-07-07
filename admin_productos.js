document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('addProductForm');
    const editForm = document.getElementById('editProductForm');
    const productsTable = document.getElementById('productsTable').querySelector('tbody');
    const editSection = document.getElementById('editSection');
    const exportBtn = document.getElementById('exportBtn');
    const cancelEdit = document.getElementById('cancelEdit');

    function fetchProducts() {
        fetch('get_products.php')
            .then(res => res.json())
            .then(data => {
                productsTable.innerHTML = '';
                data.forEach(product => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>${product.description}</td>
                        <td>${product.price}</td>
                        <td>${product.stock}</td>
                        <td>${product.sku}</td>
                        <td>${product.category_id}</td>
                        <td>
                            <button class="editBtn" data-id="${product.id}">Editar</button>
                            <button class="deleteBtn" data-id="${product.id}">Eliminar</button>
                        </td>
                    `;
                    productsTable.appendChild(row);
                });
            });
    }

    addForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(addForm);
        fetch('add_product.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(() => {
            addForm.reset();
            fetchProducts();
        });
    });

    productsTable.addEventListener('click', function(e) {
        if (e.target.classList.contains('editBtn')) {
            const id = e.target.dataset.id;
            fetch('get_products.php?id=' + id)
                .then(res => res.json())
                .then(product => {
                    editSection.style.display = 'block';
                    document.getElementById('editId').value = product.id;
                    document.getElementById('editName').value = product.name;
                    document.getElementById('editDescription').value = product.description;
                    document.getElementById('editPrice').value = product.price;
                    document.getElementById('editStock').value = product.stock;
                    document.getElementById('editSku').value = product.sku;
                    document.getElementById('editCategoryId').value = product.category_id;
                });
        } else if (e.target.classList.contains('deleteBtn')) {
            const id = e.target.dataset.id;
            if (confirm('¿Seguro que deseas eliminar este producto?')) {
                fetch('delete_product.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'id=' + id
                })
                .then(res => res.text())
                .then(() => fetchProducts());
            }
        }
    });

    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(editForm);
        fetch('edit_product.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(() => {
            editSection.style.display = 'none';
            fetchProducts();
        });
    });

    cancelEdit.addEventListener('click', function() {
        editSection.style.display = 'none';
    });

    exportBtn.addEventListener('click', function() {
        window.location.href = 'export_products.php';
    });

    fetchProducts();
}); 