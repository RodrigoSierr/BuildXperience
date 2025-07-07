document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('addReviewForm');
    const editForm = document.getElementById('editReviewForm');
    const reviewsTable = document.getElementById('reviewsTable').querySelector('tbody');
    const editSection = document.getElementById('editSection');
    const cancelEdit = document.getElementById('cancelEdit');

    function fetchReviews() {
        fetch('get_reviews.php')
            .then(res => res.json())
            .then(data => {
                reviewsTable.innerHTML = '';
                data.forEach(review => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${review.id}</td>
                        <td>${review.user_id}</td>
                        <td>${review.product_id}</td>
                        <td>${review.rating}</td>
                        <td>${review.comment || ''}</td>
                        <td>${review.approved ? 'Sí' : 'No'}</td>
                        <td>
                            <button class="editBtn" data-id="${review.id}">Editar</button>
                            <button class="deleteBtn" data-id="${review.id}">Eliminar</button>
                        </td>
                    `;
                    reviewsTable.appendChild(row);
                });
            });
    }

    addForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(addForm);
        fetch('add_review.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(() => {
            addForm.reset();
            fetchReviews();
        });
    });

    reviewsTable.addEventListener('click', function(e) {
        if (e.target.classList.contains('editBtn')) {
            const id = e.target.dataset.id;
            fetch('get_reviews.php?id=' + id)
                .then(res => res.json())
                .then(review => {
                    editSection.style.display = 'block';
                    document.getElementById('editId').value = review.id;
                    document.getElementById('editUserId').value = review.user_id;
                    document.getElementById('editProductId').value = review.product_id;
                    document.getElementById('editRating').value = review.rating;
                    document.getElementById('editComment').value = review.comment || '';
                    document.getElementById('editApproved').value = review.approved ? '1' : '0';
                });
        } else if (e.target.classList.contains('deleteBtn')) {
            const id = e.target.dataset.id;
            if (confirm('¿Seguro que deseas eliminar esta reseña?')) {
                fetch('delete_review.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'id=' + id
                })
                .then(res => res.text())
                .then(() => fetchReviews());
            }
        }
    });

    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(editForm);
        fetch('edit_review.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(() => {
            editSection.style.display = 'none';
            fetchReviews();
        });
    });

    cancelEdit.addEventListener('click', function() {
        editSection.style.display = 'none';
    });

    fetchReviews();
}); 