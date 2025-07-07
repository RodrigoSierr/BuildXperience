document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('addFavoriteForm');
    const favoritesTable = document.getElementById('favoritesTable').querySelector('tbody');

    function fetchFavorites() {
        fetch('get_favorites.php')
            .then(res => res.json())
            .then(data => {
                favoritesTable.innerHTML = '';
                data.forEach(fav => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${fav.id}</td>
                        <td>${fav.user_id}</td>
                        <td>${fav.product_id}</td>
                        <td>
                            <button class="deleteBtn" data-id="${fav.id}">Eliminar</button>
                        </td>
                    `;
                    favoritesTable.appendChild(row);
                });
            });
    }

    addForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(addForm);
        fetch('add_favorite.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(() => {
            addForm.reset();
            fetchFavorites();
        });
    });

    favoritesTable.addEventListener('click', function(e) {
        if (e.target.classList.contains('deleteBtn')) {
            const id = e.target.dataset.id;
            if (confirm('¿Seguro que deseas eliminar este favorito?')) {
                fetch('delete_favorite.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'id=' + id
                })
                .then(res => res.text())
                .then(() => fetchFavorites());
            }
        }
    });

    fetchFavorites();
}); 