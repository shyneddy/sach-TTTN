import connection from '../models/connectDatabase.js'
import bcrypt from 'bcrypt';
import { updateOrderPrice } from '../util/updateTotalPriceOrder.js';

class OrderController {



    addItem(req, res) {
        // console.log(req.body);
        const item = req.body;
        var total_price;

        const query = `SELECT * FROM orders WHERE user_id = ? and status IS NULL`;
        connection.query(query, [req.session.user_id], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            if (results.length === 0) {
                const query_insert = 'INSERT INTO `orders`(`user_id`) VALUES (?)';
                connection.query(query_insert, [req.session.user_id], (error, results) => {
                    if (error) {
                        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                        return res.status(500).json({ message: 'Lỗi máy chủ' });
                    }

                    const order_id = results.insertId;


                    // console.log('results Insert: ', results.insertId);
                    const query_insert_item = 'INSERT INTO `order_items`(`order_id`, `book_id`, `quantity`, `price`) VALUES (?,?,?,?)';

                    connection.query(query_insert_item, [results.insertId, item.id, item.quantity, Number(item.price)], (error, results) => {
                        if (error) {
                            console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                            return res.status(500).json({ message: 'Lỗi máy chủ' });
                        }

                        updateOrderPrice(connection, order_id)


                        return res.status(200).json({
                            message: 'thêm sản phẩm vào giỏ hàng',
                            addOrder: true
                        })

                    });

                });

            } else {

                var order = results[0]
                const query_oder_item = 'SELECT * FROM `order_items` WHERE order_id = ? and book_id = ?';

                connection.query(query_oder_item, [order.id, item.id], (error, results) => {
                    if (error) {
                        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                        return res.status(500).json({ message: 'Lỗi máy chủ' });
                    }

                    if (results.length === 0) {
                        const query_insert_item = 'INSERT INTO `order_items`(`order_id`, `book_id`, `quantity`, `price`) VALUES (?,?,?,?)';

                        connection.query(query_insert_item, [order.id, item.id, item.quantity, Number(item.price)], (error, results) => {
                            if (error) {
                                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                                return res.status(500).json({ message: 'Lỗi máy chủ' });
                            }

                            updateOrderPrice(connection, order.id)


                            return res.status(200).json({
                                message: 'thêm sản phẩm vào giỏ hàng',
                                addOrder: true
                            })

                        });
                    } else {
                        const query_update_order_item = 'UPDATE `order_items` SET `quantity`= `quantity` + ? WHERE id= ?';

                        connection.query(query_update_order_item, [item.quantity, results[0].id], (error, results) => {
                            if (error) {
                                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                                return res.status(500).json({ message: 'Lỗi máy chủ' });
                            }

                            updateOrderPrice(connection, order.id)


                            return res.status(200).json({
                                message: 'thêm sản phẩm vào giỏ hàng',
                                addOrder: true
                            })

                        });
                    }



                    // return res.status(200).json({
                    //     message: 'thêm sản phẩm vào giỏ hàng',
                    //     addOrder: true
                    // })

                });


            }



        });





    }

    getOrder(req, res) {
        console.log('get Item');
        const query = `SELECT oi.id, oi.order_id, oi.book_id, oi.quantity, oi.price
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = ? and status IS NULL`;

        connection.query(query, [req.session.user_id], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }
            var list_item = results;
            // console.log('list_item: ', list_item);
            var completedQueries = 0;
            for (var i = 0; i < list_item.length; i++) {

                (function (i) {
                    const query = `
                    SELECT b.title, b.author, b.price, b.category_id, i.image_url
                    FROM books AS b
                    JOIN images AS i ON b.img_main_id = i.image_id
                    WHERE b.id = ?
                    `

                    connection.query(query, [list_item[i].book_id], (error, results) => {
                        if (error) {
                            console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                            return res.status(500).json({ message: 'Lỗi máy chủ' });
                        }
                        // console.log(i);
                        // console.log(list_item[0]);
                        list_item[i].book = results[0];
                        completedQueries++;

                        if (completedQueries === list_item.length) {
                            return sendResponse();
                        }
                    });
                })(i);
            }

            function sendResponse() {
                return res.status(200).json({
                    message: 'page Order',
                    list_item: list_item
                });
            }

        });
    }

    updateItem(req, res) {
        // console.log(req.body);
        const id_order_item = req.body.id;
        const quantity = req.body.quantity;


        const query = 'SELECT * FROM `order_items` WHERE id = ?'
        connection.query(query, [id_order_item], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'OrderItem không tồn tại' });
            }

            const parent_id = results[0].order_id;
            const query_update_order_item = 'UPDATE `order_items` SET `quantity`= ? WHERE id= ?';

            connection.query(query_update_order_item, [quantity, id_order_item], (error, results) => {
                if (error) {
                    console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                    return res.status(500).json({ message: 'Lỗi máy chủ' });
                }

                // console.log(parent_id);
                updateOrderPrice(connection, parent_id)


                return res.status(200).json({
                    message: 'Thay đổi sản phẩm thành công',
                    updateOrder: true
                })

            });

        });

    }

    deleteItem(req, res) {
        const id = req.body.id;
        var order_id;
        const query = 'SELECT `id`, `order_id` FROM `order_items` WHERE id = ?'
        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'OrderItem không tồn tại' });
            } else {
                order_id = results[0].order_id;
                const query = 'DELETE FROM `order_items` WHERE id = ?'
                connection.query(query, [id], (error, results) => {
                    if (error) {
                        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                        return res.status(500).json({ message: 'Lỗi máy chủ' });
                    }

                    updateOrderPrice(connection, order_id)

                    return res.status(200).json({
                        message: 'Đã xóa Order Item',
                        isDelete: true
                    })

                });
            }

        });

    }

    getPriceOrder(req, res) {
        const id = req.query.id;
        const query = 'SELECT `total_amount` FROM `orders` WHERE id = ?'
        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'Order không tồn tại' });
            }

            res.status(200).json({
                message: 'Total Price',
                totalPrice: results[0]
            })
        });
    }

    confirm(req, res) {
        var user;
        const query = 'SELECT `id`, `phone_number`, `full_name`, `address`, `gender` FROM `users` WHERE id = ?'
        connection.query(query, [req.session.user_id], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            user = results[0];

            const query_getOrder = 'SELECT `id` FROM `orders` WHERE user_id = ? and status IS NULL';

            connection.query(query_getOrder, [user.id], (error, results) => {
                if (error) {
                    console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                    return res.status(500).json({ message: 'Lỗi máy chủ' });
                }

                // console.log(results[0].id);

                const query_get_listOrder = `SELECT oi.id, oi.order_id, oi.book_id, oi.quantity, oi.price, b.title, i.image_url
                    FROM order_items oi
                    JOIN books b ON oi.book_id = b.id
                    JOIN images AS i ON b.img_main_id = i.image_id
                    WHERE oi.order_id = ?`
                connection.query(query_get_listOrder, [results[0].id], (error, results) => {
                    if (error) {
                        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                        return res.status(500).json({ message: 'Lỗi máy chủ' });
                    }


                    res.status(200).json({
                        message: 'Confirm Order',
                        user: user,
                        list_order: results
                    })


                });

            });


            // res.status(200).json({
            //     message: 'Total Price',
            //     user: results[0]
            // })

        });
    }

    PostConfirm(req, res) {
        const full_name = req.body.full_name ? req.body.full_name : null;
        const phone_number = req.body.phone_number ? req.body.phone_number : null;
        const address = req.body.address ? req.body.address : null;
        const user_id = req.session.user_id;
        const query = 'SELECT * FROM `orders` WHERE user_id = ? and status IS NULL';
        connection.query(query, [user_id], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            const order_id = results[0].id;

            const query = 'UPDATE `orders` SET `order_date`= NOW(),`status`= ?,`name_des`= ?,`address_des`= ?,`phone_des`= ? WHERE id = ?'
            connection.query(query, ['Đang chờ xử lý', full_name, address, phone_number, order_id], (error, results) => {
                if (error) {
                    console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                    return res.status(500).json({ message: 'Lỗi máy chủ' });
                }

                res.status(200).json({
                    message: 'confirm post'
                })
            });

        });

    }

    getUserOrder(req, res) {
        const user_id = req.session.user_id;
        // const query = 'SELECT * FROM `orders` WHERE user_id = ? and status IS NOT NULL'
        // connection.query(query, [user_id], (error, results) => {
        //     if (error) {
        //         console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
        //         return res.status(500).json({ message: 'Lỗi máy chủ' });
        //     }
        //     const list_User_Order = results
        //     res.status(200).json({
        //         message: 'get user order',
        //         list_User_Order
        //     })
        // });

        const query = 'SELECT * FROM `orders` WHERE user_id = ? and status IS NOT NULL'
        connection.query(query, [user_id], (err, results) => {
            if (err) throw err;

            let list_User_Order = results

            var completedQueries = 0;
            for (var i = 0; i < list_User_Order.length; i++) {

                (function (i) {
                    const query = `SELECT oi.id, oi.order_id, oi.book_id, oi.quantity, oi.price, b.title, b.author, b.price, b.category_id, i.image_url
                    FROM order_items oi
                    JOIN orders o ON oi.order_id = o.id
                    JOIN books b ON oi.book_id = b.id
                    JOIN images i ON i.image_id = b.img_main_id
                    WHERE o.id = ? and o.status IS NOT NULL`

                    connection.query(query, [list_User_Order[i].id], (error, results) => {
                        if (error) {
                            console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                            return res.status(500).json({ message: 'Lỗi máy chủ' });
                        }

                        if (results.length > 0) {
                            // console.log('vao trong: ', results);
                            list_User_Order[i].detail = results
                        }

                        completedQueries++;

                        if (completedQueries === list_User_Order.length) {
                            return sendResponse();
                        }
                    });
                })(i);
            }

            function sendResponse() {

                return res.status(200).json({
                    message: 'get list User Order!!',
                    list_User_Order
                })
            }
        });

    }

    getOrderAll(req, res) {
        const query = 'SELECT * FROM `orders` WHERE status IS NOT NULL'
        connection.query(query, (err, results) => {
            if (err) throw err;

            let fullListOrder = results

            var completedQueries = 0;
            for (var i = 0; i < fullListOrder.length; i++) {

                (function (i) {
                    const query = `SELECT oi.id, oi.order_id, oi.book_id, oi.quantity, oi.price, b.title, b.author, b.price, b.category_id, i.image_url
                    FROM order_items oi
                    JOIN orders o ON oi.order_id = o.id
                    JOIN books b ON oi.book_id = b.id
                    JOIN images i ON i.image_id = b.img_main_id
                    WHERE o.id = ? and o.status IS NOT NULL`

                    connection.query(query, [fullListOrder[i].id], (error, results) => {
                        if (error) {
                            console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                            return res.status(500).json({ message: 'Lỗi máy chủ' });
                        }

                        if (results.length > 0) {
                            // console.log('vao trong: ', results);
                            fullListOrder[i].detail = results
                        }

                        completedQueries++;

                        if (completedQueries === fullListOrder.length) {
                            return sendResponse();
                        }
                    });
                })(i);
            }

            function sendResponse() {

                return res.status(200).json({
                    message: 'admin get list Order!!',
                    fullListOrder
                })
            }



        });
    }

    editOrderAll(req, res) {
        const { id, status } = req.body;
        console.log(status);
        const query = 'UPDATE `orders` SET `status`= ? WHERE id = ?'
        connection.query(query, [status, Number(id)], (err, results) => {
            if (err) throw err;

            res.status(200).json({
                message: 'Cập nhật đơn hàng thành công',
                isSuccess: true

            })
        });

    }


}

const orderController = new OrderController;

export default orderController;

// export { NewsController };