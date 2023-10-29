import connection from '../models/connectDatabase.js'
import bcrypt from 'bcrypt';

class HomeController {



    index(req, res) {

        // const query = `SELECT b.id, b.title, b.author, b.price, b.category_id, b.quantity_remaining, b.quantity_sold, b.rating, i.image_url
        // FROM books b
        // JOIN images i ON b.img_main_id = i.image_id
        // WHERE b.isDelete = false and b.category_id = 2`;

        const queryNew = `SELECT b.id, b.title, b.author, b.price, b.category_id, b.quantity_remaining, b.quantity_sold, b.rating, i.image_url
        FROM books b
        JOIN images i ON b.img_main_id = i.image_id
        WHERE b.isDelete = false and b.date IS NOT NULL
        ORDER BY b.date DESC
        LIMIT 10;`;
        connection.query(queryNew, (err, results) => {
            if (err) throw err;
            let list_book_new;
            if (results.length > 0) {
                list_book_new = results;
            }

            const queryRating = `SELECT b.id, b.title, b.author, b.price, b.category_id, b.quantity_remaining, b.quantity_sold, b.rating, i.image_url
            FROM books b
            JOIN images i ON b.img_main_id = i.image_id
            WHERE b.isDelete = false and b.rating > 0
            ORDER BY b.rating  DESC
            LIMIT 10;`;
            connection.query(queryRating, (err, results) => {
                if (err) throw err;

                let list_book_rating;
                if (results.length > 0) {
                    list_book_rating = results;
                }

                res.status(200).json({
                    message: 'hello home page!!',
                    list_book_new,
                    list_book_rating
                })
            });

            // res.status(200).json({
            //     message: 'hello home page!!',
            //     list_book_new: results
            // })
        });

    }

    Adminindex(req, res) {
        // console.log('admin: ', req.userAdmin);
        res.status(200).json({ admin: req.userAdmin })
    }



}

const homeController = new HomeController;

export default homeController;

// export { NewsController };