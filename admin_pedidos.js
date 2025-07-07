document.addEventListener('DOMContentLoaded', function() {
    const addForm = document.getElementById('addOrderForm');
    const editForm = document.getElementById('editOrderForm');
    const ordersTable = document.getElementById('ordersTable').querySelector('tbody');
    const editSection = document.getElementById('editSection');
    const exportBtn = document.getElementById('exportBtn');
    const cancelEdit = document.getElementById('cancelEdit');

    function fetchOrders() {
        fetch('get_orders.php')
            .then(res => res.json())
            .then(data => {
                ordersTable.innerHTML = '';
                data.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${order.id}</td>
                        <td>${order.user_id}</td>
                        <td>${order.total_amount}</td>
                        <td>${order.status}</td>
                        <td>${order.shipping_address || ''}</td>
                        <td>${order.billing_address || ''}</td>
                        <td>${order.shipping_method || ''}</td>
                        <td>${order.tracking_number || ''}</td>
                        <td>${order.order_date || ''}</td>
                        <td>${order.expected_delivery_date || ''}</td>
                        <td>${order.notes || ''}</td>
                        <td>${order.payment_method || ''}</td>
                        <td>
                            <button class="editBtn" data-id="${order.id}">Editar</button>
                            <button class="deleteBtn" data-id="${order.id}">Eliminar</button>
                        </td>
                    `;
                    ordersTable.appendChild(row);
                });
            });
    }

    addForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(addForm);
        fetch('add_order.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(() => {
            addForm.reset();
            fetchOrders();
        });
    });

    ordersTable.addEventListener('click', function(e) {
        if (e.target.classList.contains('editBtn')) {
            const id = e.target.dataset.id;
            fetch('get_orders.php?id=' + id)
                .then(res => res.json())
                .then(order => {
                    editSection.style.display = 'block';
                    document.getElementById('editId').value = order.id;
                    document.getElementById('editUserId').value = order.user_id;
                    document.getElementById('editTotalAmount').value = order.total_amount;
                    document.getElementById('editStatus').value = order.status;
                    document.getElementById('editShippingAddress').value = order.shipping_address || '';
                    document.getElementById('editBillingAddress').value = order.billing_address || '';
                    document.getElementById('editShippingMethod').value = order.shipping_method || '';
                    document.getElementById('editTrackingNumber').value = order.tracking_number || '';
                    document.getElementById('editExpectedDeliveryDate').value = order.expected_delivery_date || '';
                    document.getElementById('editNotes').value = order.notes || '';
                    document.getElementById('editPaymentMethod').value = order.payment_method || 'tarjeta';
                });
        } else if (e.target.classList.contains('deleteBtn')) {
            const id = e.target.dataset.id;
            if (confirm('¿Seguro que deseas eliminar este pedido?')) {
                fetch('delete_order.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'id=' + id
                })
                .then(res => res.text())
                .then(() => fetchOrders());
            }
        }
    });

    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(editForm);
        fetch('edit_order.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(() => {
            editSection.style.display = 'none';
            fetchOrders();
        });
    });

    cancelEdit.addEventListener('click', function() {
        editSection.style.display = 'none';
    });

    exportBtn.addEventListener('click', function() {
        window.location.href = 'export_orders.php';
    });

    fetchOrders();
}); 