document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('addUserForm');
    const editForm = document.getElementById('editUserForm');
    const usersTable = document.getElementById('usersTable').querySelector('tbody');
    const editSection = document.getElementById('editSection');
    const exportBtn = document.getElementById('exportBtn');
    const cancelEdit = document.getElementById('cancelEdit');

    function fetchUsers() {
        fetch('get_users.php')
            .then(res => res.json())
            .then(data => {
                usersTable.innerHTML = '';
                data.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.first_name || ''}</td>
                        <td>${user.last_name || ''}</td>
                        <td>${user.phone || ''}</td>
                        <td>${user.address || ''}</td>
                        <td>${user.role}</td>
                        <td>
                            <button class="editBtn" data-id="${user.id}">Editar</button>
                            <button class="deleteBtn" data-id="${user.id}">Eliminar</button>
                        </td>
                    `;
                    usersTable.appendChild(row);
                });
            });
    }

    addForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(addForm);
        fetch('add_user.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(() => {
            addForm.reset();
            fetchUsers();
        });
    });

    usersTable.addEventListener('click', function(e) {
        if (e.target.classList.contains('editBtn')) {
            const id = e.target.dataset.id;
            fetch('get_users.php?id=' + id)
                .then(res => res.json())
                .then(user => {
                    editSection.style.display = 'block';
                    document.getElementById('editId').value = user.id;
                    document.getElementById('editUsername').value = user.username;
                    document.getElementById('editEmail').value = user.email;
                    document.getElementById('editPassword').value = '';
                    document.getElementById('editFirstName').value = user.first_name || '';
                    document.getElementById('editLastName').value = user.last_name || '';
                    document.getElementById('editPhone').value = user.phone || '';
                    document.getElementById('editAddress').value = user.address || '';
                    document.getElementById('editRole').value = user.role;
                });
        } else if (e.target.classList.contains('deleteBtn')) {
            const id = e.target.dataset.id;
            if (confirm('¿Seguro que deseas eliminar este usuario?')) {
                fetch('delete_user.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'id=' + id
                })
                .then(res => res.text())
                .then(() => fetchUsers());
            }
        }
    });

    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(editForm);
        fetch('edit_user.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(() => {
            editSection.style.display = 'none';
            fetchUsers();
        });
    });

    cancelEdit.addEventListener('click', function() {
        editSection.style.display = 'none';
    });

    exportBtn.addEventListener('click', function() {
        window.location.href = 'export_users.php';
    });

    fetchUsers();
}); 