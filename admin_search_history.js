document.addEventListener('DOMContentLoaded', function() {
    const searchHistoryTable = document.getElementById('searchHistoryTable').querySelector('tbody');

    function fetchHistory() {
        fetch('get_search_history.php')
            .then(res => res.json())
            .then(data => {
                searchHistoryTable.innerHTML = '';
                data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.id}</td>
                        <td>${item.user_id}</td>
                        <td>${item.search_term}</td>
                        <td>${item.search_at}</td>
                        <td>
                            <button class="deleteBtn" data-id="${item.id}">Eliminar</button>
                        </td>
                    `;
                    searchHistoryTable.appendChild(row);
                });
            });
    }

    searchHistoryTable.addEventListener('click', function(e) {
        if (e.target.classList.contains('deleteBtn')) {
            const id = e.target.dataset.id;
            if (confirm('¿Seguro que deseas eliminar este registro?')) {
                fetch('delete_search_history.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'id=' + id
                })
                .then(res => res.text())
                .then(() => fetchHistory());
            }
        }
    });

    fetchHistory();
}); 