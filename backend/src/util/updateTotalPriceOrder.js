

function updateOrderPrice(mysql, id) {
    const query_update = `UPDATE orders
        SET total_amount = (
        SELECT SUM(quantity * price)
        FROM order_items
        WHERE order_items.order_id = orders.id
        GROUP BY order_items.order_id
        )
        WHERE id = ? and status iS NULL;`

    mysql.query(query_update, [id], (error, results) => {
        if (error) {
            console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
            // return res.status(500).json({ message: 'Lỗi máy chủ' });
        }

    });
}

export { updateOrderPrice };