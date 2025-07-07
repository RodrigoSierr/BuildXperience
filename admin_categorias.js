document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('addCategoryForm');
    const editForm = document.getElementById('editCategoryForm');
    const categoriesTable = document.getElementById('categoriesTable').querySelector('tbody');
    const editSection = document.getElementById('editSection');
    const cancelEdit = document.getElementById('cancelEdit');

    function fetchCategories() {
        fetch('get_categories.php')
            .then(res => res.json())
            .then(data => {
                categoriesTable.innerHTML = '';
                data.forEach(cat => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${cat.id}</td>
                        <td>${cat.name}</td>
                        <td>${cat.description || ''}</td>
                        <td>${cat.parent_id || ''}</td>
                        <td>${cat.slug || ''}</td>
                        <td>
                            <button class="editBtn" data-id="${cat.id}">Editar</button>
                            <button class="deleteBtn" data-id="${cat.id}">Eliminar</button>
                        </td>
                    `;
                    categoriesTable.appendChild(row);
                });
            });
    }

    addForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(addForm);
        fetch('add_category.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(() => {
            addForm.reset();
            fetchCategories();
        });
    });

    categoriesTable.addEventListener('click', function(e) {
        if (e.target.classList.contains('editBtn')) {
            const id = e.target.dataset.id;
            fetch('get_categories.php?id=' + id)
                .then(res => res.json())
                .then(cat => {
                    editSection.style.display = 'block';
                    document.getElementById('editId').value = cat.id;
                    document.getElementById('editName').value = cat.name;
                    document.getElementById('editDescription').value = cat.description || '';
                    document.getElementById('editParentId').value = cat.parent_id || '';
                    document.getElementById('editSlug').value = cat.slug || '';
                });
        } else if (e.target.classList.contains('deleteBtn')) {
            const id = e.target.dataset.id;
            if (confirm('¿Seguro que deseas eliminar esta categoría?')) {
                fetch('delete_category.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'id=' + id
                })
                .then(res => res.text())
                .then(() => fetchCategories());
            }
        }
    });

    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(editForm);
        fetch('edit_category.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(() => {
            editSection.style.display = 'none';
            fetchCategories();
        });
    });

    cancelEdit.addEventListener('click', function() {
        editSection.style.display = 'none';
    });

    fetchCategories();
}); 