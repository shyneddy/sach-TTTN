import connection from '../models/connectDatabase.js'
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: 'dccufaric',
    api_key: '765784527863929',
    api_secret: '-4BVBunPltEYrGclnrpjmWqhF70'
});

class ProductController {



    getDetail(req, res) {

        // console.log(req.query);
        const book_id = req.query.book_id;
        var detail_book = {};



        const query = 'SELECT * FROM `books` WHERE id = ?'

        connection.query(query, [book_id], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'Không có sản phẩm' });
            }

            // Kết quả truy vấn sẽ được lưu trong biến `results`
            // console.log(results);
            detail_book = results[0];

            if (req.session.user_id) {
                const favorite_query = 'SELECT * FROM `favorites` WHERE user_id = ? and book_id = ?'

                connection.query(favorite_query, [req.session.user_id, book_id], (error, results) => {
                    if (error) {
                        console.error('Lỗi truy vấn:', error);
                        return;
                    }

                    // if (results.length === 0) {
                    //     return res.status(401).json({ message: 'Không có sản phẩm' });
                    // }

                    if (results.length > 0) {
                        // console.log(results);
                        detail_book.favorite = true;
                    }

                });
            }


            const query = 'SELECT `name` FROM `categories` WHERE id = ?'

            connection.query(query, [detail_book.category_id], (error, results) => {
                if (error) {
                    console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                    return res.status(500).json({ message: 'Lỗi máy chủ' });
                }

                // Kết quả truy vấn sẽ được lưu trong biến `results`
                // console.log(results);

                if (results.length === 0) {
                    return res.status(401).json({ message: 'Không có sản phẩm' });
                }

                detail_book.category_name = results[0].name;

                const query = 'SELECT * FROM `images` WHERE product_id = ?'

                connection.query(query, [detail_book.id], (error, results) => {
                    if (error) {
                        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                        return res.status(500).json({ message: 'Lỗi máy chủ' });
                    }

                    // Kết quả truy vấn sẽ được lưu trong biến `results`
                    // console.log(results);
                    detail_book.img = results
                    // detail_book.img.push(results);

                    for (var i = 1; i < detail_book.img.length; i++) {
                        if (detail_book.img[i].image_id == detail_book.img_main_id) {
                            var temp = detail_book.img[i];
                            detail_book.img[i] = detail_book.img[0];
                            detail_book.img[0] = temp;
                        }
                    }

                    const query = 'SELECT COUNT(*) AS count_rating FROM rating WHERE book_id = ?';
                    connection.query(query, [book_id], (error, results) => {
                        if (error) {
                            console.error('Lỗi truy vấn:', error);
                            return;
                        }
                        detail_book.user_rating = results[0].count_rating;

                        // return res.status(200).json({ mesage: 'rating' })
                        // Tiếp tục xử lý dữ liệu tại đây

                        if (req.session.user_id) {

                            const query = 'SELECT `stars` FROM `rating` WHERE user_id = ? and book_id = ?';
                            connection.query(query, [req.session.user_id, book_id], (error, results) => {
                                if (error) {
                                    console.error('Lỗi truy vấn:', error);
                                    return;
                                }
                                if (results.length > 0) {
                                    const my_rating = results[0].stars;
                                    // console.log(my_rating);
                                    detail_book.isRating = true;
                                    detail_book.my_rating = my_rating;
                                    res.status(200).json({
                                        message: 'hello home page!!',
                                        book_detail: detail_book
                                    })

                                } else {
                                    detail_book.isRating = false;
                                    res.status(200).json({
                                        message: 'hello home page!!',
                                        book_detail: detail_book
                                    })
                                }



                            });
                        } else {

                            res.status(200).json({
                                message: 'hello home page!!',
                                book_detail: detail_book
                            })
                        }



                    });



                });


            });

        });


    }

    async searchItems(req, res) {
        console.log('đã vào search');
        const key = req.body.key;
        // console.log('key: ', key);
        var list = [];
        var result = [];


        const query = `SELECT b.id, b.title, b.author, b.price, b.category_id, b.quantity_remaining, b.quantity_sold, b.rating, i.image_url
        FROM books b
        JOIN images i ON b.img_main_id = i.image_id
        WHERE b.isDelete = false`

        connection.query(query, (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            list = results
            // console.log(list);

            for (var i = 0; i < list.length; i++) {
                // console.log(longestCommonSubsequence(key.split(''), iterator.author.split('')));
                if (longestCommonSubsequence(removeVietnameseTones(key).toLowerCase().split(''), removeVietnameseTones(list[i].author).toLowerCase().split('')) >= shorterLength(key, list[i].author) * 0.9) {
                    result.push(list[i]);
                    list.splice(i, 1);
                    i--;
                    // continue;

                }

            }

            for (var i = 0; i < list.length; i++) {
                // console.log(longestCommonSubsequence(key.split(''), iterator.author.split('')));

                if (longestCommonSubsequence(removeVietnameseTones(key).toLowerCase().split(''), removeVietnameseTones(list[i].title).toLowerCase().split('')) >= shorterLength(key, list[i].title) * 0.9) {
                    result.push(list[i]);
                    list.splice(i, 1);
                    i--;
                    // continue;

                }
            }



            res.status(200).json({
                message: 'search',
                searchItems: result
            })

        });

        function shorterLength(str1, str2) {
            return str1.length < str2.length ? str1.length : str2.length;
        }

        function longestCommonSubsequence(a, b) {
            const matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));
            for (let i = 1; i < a.length + 1; i++) {
                for (let j = 1; j < b.length + 1; j++) {
                    if (a[i - 1] === b[j - 1]) {
                        matrix[i][j] = 1 + matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
                    }
                }
            }
            return matrix[a.length][b.length];
        }

        function removeVietnameseTones(str) {
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
            str = str.replace(/đ/g, "d");
            str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
            str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
            str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
            str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
            str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
            str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
            str = str.replace(/Đ/g, "D");

            return str;
        }

        // console.log(removeVietnameseTones(req.body.fullname).toLowerCase())
        // console.log(key)

        // for (const iterator of list) {
        //     if(longest_Common_Subsequence(key, iterator.fullname) >= key.length*0.8){
        //         result.push(iterator);
        //     }
        // }






    }

    searchByCategory(req, res) {
        const key = req.body.key;
        // console.log('key: ', key);
        const priceFrom = req.body.priceFrom;
        const priceTo = req.body.priceTo;
        const filter = req.body.filter;
        // const priceDec = req.body.priceDec;
        var list = [];
        var arr_id = [];
        var id;
        var list_items = [];

        function getAllCategoryId(id, arr_id, list) {

            for (var i = 0; i < list.length; i++) {
                if (list[i].parent_id == id) {
                    console.log(list[i].id);
                    arr_id.push(list[i].id);
                    var _id = list[i].id;
                    list.splice(i, 1);
                    getAllCategoryId(_id, arr_id, list)
                    i--;
                }
            }

        }




        const query = 'SELECT * FROM `categories`'

        connection.query(query, [key], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }
            list = results;

            ////////////////////
            if (results.length === 0) {
                return res.status(401).json({ message: 'Không có danh mục' });
            }


            const query = 'SELECT * FROM `categories` WHERE name = ?'

            connection.query(query, [key], (error, results) => {
                if (error) {
                    console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                    return res.status(500).json({ message: 'Lỗi máy chủ' });
                }
                // list = results[0];

                if (results.length === 0) {
                    return res.status(401).json({ message: 'Không có danh mục' });
                }
                id = results[0].id;
                arr_id.push(id)
                // console.log(id, list);

                getAllCategoryId(id, arr_id, list);
                // console.log(arr_id);

                var completedQueries = 0;

                for (var i = 0; i < arr_id.length; i++) {
                    (function (i) {
                        const query = `SELECT b.id, b.title, b.author, b.price, b.category_id, b.quantity_remaining, b.quantity_sold, b.rating, i.image_url
                        FROM books b
                        JOIN images i ON b.img_main_id = i.image_id WHERE b.category_id = ? and b.price >= ? and b.price <= ? and b.isDelete = false`
                        connection.query(query, [arr_id[i], priceFrom ? priceFrom : 0, priceTo ? priceTo : 9999999999], (error, results) => {
                            // console.log(priceFrom);
                            if (error) {
                                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                                return res.status(500).json({ message: 'Lỗi máy chủ' });
                            }
                            // console.log(i);
                            if (results.length > 0) {
                                // console.log(results);
                                list_items.push(...results);

                            }

                            completedQueries++;

                            if (completedQueries === arr_id.length) {
                                return sendResponse();
                            }
                        });
                    })(i);
                }

                // console.log(list_items);

                function sendResponse() {
                    // console.log(list_items);
                    if (filter && filter == 'priceInc') {
                        for (var i = 0; i < list_items.length - 1; i++) {
                            console.log('inc');

                            for (var j = i + 1; j < list_items.length; j++) {
                                if (Number(list_items[i].price) > Number(list_items[j].price)) {
                                    var temp = list_items[i];
                                    list_items[i] = list_items[j];
                                    list_items[j] = temp;
                                }
                            }
                        }
                    }

                    if (filter && filter == 'priceDec') {
                        console.log('dec');

                        for (var i = 0; i < list_items.length - 1; i++) {
                            for (var j = i + 1; j < list_items.length; j++) {
                                if (Number(list_items[i].price) < Number(list_items[j].price)) {
                                    var temp = list_items[i];
                                    list_items[i] = list_items[j];
                                    list_items[j] = temp;
                                }
                            }
                        }
                    }

                    return res.status(200).json({
                        message: 'list item category',
                        listItems: list_items
                    });
                }



            });


        });



    }


    Rating(req, res) {
        // console.log(req.body);
        // console.log(req.session.user_id);
        const book_id = req.body.book_id;
        const rating = req.body.rating;
        const user_id = req.session.user_id;

        const query = 'SELECT * FROM `rating` WHERE user_id = ? and book_id = ?'
        connection.query(query, [user_id, book_id], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            if (results.length === 0) {

                const query = 'INSERT INTO `rating`(`book_id`, `user_id`, `stars`) VALUES (?,?,?)'
                connection.query(query, [book_id, user_id, rating], (error, results) => {
                    if (error) {
                        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                        return res.status(500).json({ message: 'Lỗi máy chủ' });
                    }

                    const query = 'SELECT AVG(stars) AS avgStart FROM rating WHERE book_id = ?';

                    connection.query(query, [book_id], (error, results) => {
                        if (error) {
                            console.error('Lỗi truy vấn:', error);
                            return;
                        }

                        const star = results[0].avgStart;

                        const query = 'UPDATE `books` SET `rating`= ? WHERE id = ?'

                        connection.query(query, [Number(star).toFixed(), book_id], (error, results) => {
                            if (error) {
                                console.error('Lỗi truy vấn:', error);
                                return;
                            }

                            return res.status(200).json({ mesage: 'rating' })

                        });

                    });

                });
            } else {

                const query = 'UPDATE `rating` SET `stars`= ? WHERE user_id = ? and book_id = ?'
                connection.query(query, [rating, user_id, book_id], (error, results) => {
                    if (error) {
                        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                        return res.status(500).json({ message: 'Lỗi máy chủ' });
                    }

                    const query = 'SELECT AVG(stars) AS avgStart FROM rating WHERE book_id = ?';

                    connection.query(query, [book_id], (error, results) => {
                        if (error) {
                            console.error('Lỗi truy vấn:', error);
                            return;
                        }

                        const star = results[0].avgStart;
                        console.log(star);

                        const query = 'UPDATE `books` SET `rating`= ? WHERE id = ?'

                        connection.query(query, [Number(star).toFixed(), book_id], (error, results) => {
                            if (error) {
                                console.error('Lỗi truy vấn:', error);
                                return;
                            }

                            return res.status(200).json({ mesage: 'rating' })

                        });

                    });


                });
            }


        });



    }


    Favorite(req, res) {

        const book_id = req.body.book_id;

        const query = 'SELECT * FROM `favorites` WHERE user_id = ? and book_id = ?'
        connection.query(query, [req.session.user_id, book_id], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn:', error);
                return;
            }

            if (results.length === 0) {
                const query = 'INSERT INTO `favorites`(`user_id`, `book_id`) VALUES (?, ?)'
                connection.query(query, [req.session.user_id, book_id], (error, results) => {
                    if (error) {
                        console.error('Lỗi truy vấn:', error);
                        return;
                    }

                    return res.status(200).json({ message: 'favorites', isFavorites: true })


                });
            } else {

                const query = 'DELETE FROM `favorites` WHERE user_id = ? and book_id = ?'
                connection.query(query, [req.session.user_id, book_id], (error, results) => {
                    if (error) {
                        console.error('Lỗi truy vấn:', error);
                        return;
                    }

                });

                return res.status(200).json({ message: 'favorites', isFavorites: false })



            }


        });
    }

    getUserFavorite(req, res) {
        const user_id = req.session.user_id;
        const query = `SELECT b.id, b.title, b.author, b.price, b.category_id, b.quantity_remaining, b.quantity_sold, b.rating, i.image_url
        FROM books b
        JOIN favorites f ON b.id = f.book_id 
        JOIN images i ON b.img_main_id = i.image_id
        WHERE f.user_id = ?`
        connection.query(query, [user_id], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }
            const list_User_Favorite = results
            // console.log(list_User_Order);
            res.status(200).json({
                message: 'get user order',
                list_User_Favorite
            })
        });
    }

    getUserRating(req, res) {
        const user_id = req.session.user_id;
        const query = `SELECT b.id, b.title, b.author, b.price, b.category_id, b.quantity_remaining, b.quantity_sold, r.stars, b.rating, i.image_url
        FROM books b
        JOIN images i ON b.img_main_id = i.image_id
        JOIN rating r ON r.book_id = b.id 
        WHERE r.user_id = ?`;

        connection.query(query, [user_id], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            let list_User_Rating = results

            res.status(200).json({
                message: 'user rating!!',
                list_User_Rating
            })
        });
    }

    getProductAll(req, res) {
        const query = `SELECT b.id, b.title, b.author, b.price, b.category_id, b.quantity_remaining, b.isDelete, i.image_url, c.name
        FROM books b
        JOIN images i ON b.img_main_id = i.image_id 
        JOIN categories c ON b.category_id = c.id `
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            let fullListProduct = results

            res.status(200).json({
                message: 'admin get list product!!',
                fullListProduct
            })
        });
    }

    getCategoryAll(req, res) {
        const query = 'SELECT * FROM `categories` WHERE 1'
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            let fullListCategory = results

            res.status(200).json({
                message: 'admin get list category!!',
                fullListCategory
            })
        });
    }

    addProduct(req, res) {
        console.log('ok');
        // // console.log(req.files['selectedFileAvatar'][0]);
        // console.log(req.file);
        // console.log(req.files['selectedFileImg']);
        // console.log(req.body);
        const listImg = req.files['selectedFileImg'];
        const avatar = req.files['selectedFileAvatar'][0];


        const { title, price, author, category, quantity, description } = req.body;

        const query = 'INSERT INTO `books`(`title`, `author`, `price`, `description`, `date`, `category_id`, `quantity_remaining`) VALUES (?,?,?,?,NOW(),?,?)'
        connection.query(query, [title, author, price, description, Number(category), Number(quantity)], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            let book_id = results.insertId;

            const query = 'INSERT INTO `images`(`product_id`, `image_url`, `key`) VALUES (?,?,?)';
            connection.query(query, [book_id, avatar.path, avatar.filename], (error, results) => {
                if (error) {
                    console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                    return res.status(500).json({ message: 'Lỗi máy chủ' });
                }
                let main_img_id = results.insertId;
                const query = 'UPDATE `books` SET `img_main_id`= ? WHERE id = ?';
                connection.query(query, [main_img_id, book_id], (error, results) => {
                    if (error) {
                        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                        return res.status(500).json({ message: 'Lỗi máy chủ' });
                    }


                });


            });


            var completedQueries = 0;

            for (var i = 0; i < listImg.length; i++) {
                (function (i) {
                    const query = 'INSERT INTO `images`(`product_id`, `image_url`, `key`) VALUES (?,?,?)'
                    connection.query(query, [book_id, listImg[i].path, listImg[i].filename], (error, results) => {
                        if (error) {
                            console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                            return res.status(500).json({ message: 'Lỗi máy chủ' });
                        }

                        completedQueries++;

                        if (completedQueries === listImg.length) {
                            return sendResponse();
                        }
                    });
                })(i);
            }

            // console.log(list_items);

            function sendResponse() {

                res.status(200).json({
                    message: 'Thêm sản phẩm thành công',
                    isAddProduct: true
                })
            }

        });

    }

    removeProduct(req, res) {
        const { book_id, isDelete } = req.body;
        // const cloudinaryDeleteImg = async (fileToDelete) => {
        //     return new Promise((resolve) => {

        //         cloudinary.uploader.destroy(fileToDelete, (error, result) => {
        //             console.log('result :: ', result);
        //             resolve({
        //                 url: result.secure_url,
        //                 asset_id: result.asset_id,
        //                 public_id: result.public_id,
        //             }, {
        //                 resource_type: "auto",
        //             })
        //         })
        //     })
        // }

        // const query = 'SELECT `image_id`, `key` FROM `images` WHERE product_id = ?'
        // connection.query(query, [book_id], (error, results) => {
        //     if (error) {
        //         console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
        //         return res.status(500).json({ message: 'Lỗi máy chủ' });
        //     }

        //     let list_img = results;
        //     for (var i = 0; i < list_img.length; i++) {
        //         if (list_img[i].key) {
        //             cloudinaryDeleteImg(list_img[i].key)
        //         }
        //     }

        //     const query = 'DELETE FROM `images` WHERE product_id = ?'
        //     connection.query(query, [book_id], (error, results) => {
        //         if (error) {
        //             console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
        //             return res.status(500).json({ message: 'Lỗi máy chủ' });
        //         }

        //         const query = 'DELETE FROM `favorites` WHERE book_id = ?'
        //         connection.query(query, [book_id], (error, results) => {
        //             if (error) {
        //                 console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
        //                 return res.status(500).json({ message: 'Lỗi máy chủ' });
        //             }
        //             const query = 'DELETE FROM `rating` WHERE book_id = ?'
        //             connection.query(query, [book_id], (error, results) => {
        //                 if (error) {
        //                     console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
        //                     return res.status(500).json({ message: 'Lỗi máy chủ' });
        //                 }
        //                 const query = 'DELETE FROM `books` WHERE id = ?'
        //                 connection.query(query, [book_id], (error, results) => {
        //                     if (error) {
        //                         console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
        //                         return res.status(500).json({ message: 'Lỗi máy chủ' });
        //                     }

        //                     res.status(200).json({
        //                         isDelete: true
        //                     })

        //                 });

        //             });

        //         });


        //     });

        // });





        // cloudinaryDeleteImg('sach_online/i1hhdsnbostqifdnbuci')

        const query = 'UPDATE `books` SET `isDelete`= ? WHERE id = ?'
        connection.query(query, [Number(req.body.isDelete) === 1 ? false : true, book_id], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            const query = 'DELETE FROM order_items WHERE book_id = ? AND order_id IN (SELECT id FROM `orders` WHERE `status` IS NULL);'
            connection.query(query, [book_id], (error, results) => {
                if (error) {
                    console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                    return res.status(500).json({ message: 'Lỗi máy chủ' });
                }

                res.status(200).json({
                    isSuccess: true
                })

            });

        });

    }

    async updateProduct(req, res) {
        const { id, title, price, author, category, quantity_remaining, description } = req.body
        const listImg = JSON.parse(req.body.img);
        const listImgNew = req.files['selectedFileImg'] ? req.files['selectedFileImg'] : null;
        const avatar = req.files['selectedFileAvatar'] && req.files['selectedFileAvatar'][0] ? req.files['selectedFileAvatar'][0] : null;

        const cloudinaryDeleteImg = async (fileToDelete) => {
            return new Promise((resolve) => {

                cloudinary.uploader.destroy(fileToDelete, (error, result) => {
                    console.log('result :: ', result);
                    resolve({
                        url: result.secure_url,
                        asset_id: result.asset_id,
                        public_id: result.public_id,
                    }, {
                        resource_type: "auto",
                    })
                })
            })
        }



        const query = `SELECT i.image_id, i.image_url, i.key
        FROM books b
        JOIN images i ON b.img_main_id <> i.image_id and i.product_id = b.id
        WHERE b.id = ?`
        connection.query(query, [id], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            if (results.length > 0) {
                let arr_img = results;
                for (var i = 0; i < arr_img.length; i++) {
                    var bool = false;
                    for (var j = 0; j < listImg.length; j++) {
                        if (arr_img[i].image_id == listImg[j].image_id) {
                            bool = true;
                        }
                    }
                    if (!bool) {
                        if (arr_img[i].key) {
                            cloudinaryDeleteImg(arr_img[i].key)
                        }
                        const query = 'DELETE FROM `images` WHERE image_id = ?'
                        connection.query(query, [arr_img[i].image_id], (error, results) => {
                            if (error) {
                                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                                return res.status(500).json({ message: 'Lỗi máy chủ' });
                            }
                        });
                        arr_img.splice(i, 1);
                        i--;
                    }
                }
            }

            if (avatar) {
                const query = `SELECT i.image_id, i.image_url, i.key
                FROM books b
                JOIN images i ON b.img_main_id = i.image_id
                WHERE b.id = ?`
                connection.query(query, [id], (error, results) => {
                    if (error) {
                        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                        return res.status(500).json({ message: 'Lỗi máy chủ' });
                    }

                    if (results.length > 0) {
                        let main_img = results[0];
                        if (main_img.key) {
                            cloudinaryDeleteImg(main_img.key)
                        }

                        const query = 'UPDATE `images` SET `image_url`= ?,`key`= ? WHERE product_id = ? and image_id IN (SELECT img_main_id FROM `books` WHERE id = ?);'
                        connection.query(query, [avatar.path, avatar.filename, id, id], (error, results) => {
                            if (error) {
                                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                                return res.status(500).json({ message: 'Lỗi máy chủ' });
                            }

                        });
                    }


                });

            }

            if (listImgNew) {
                for (var i = 0; i < listImgNew.length; i++) {
                    (function (i) {
                        const query = 'INSERT INTO `images`(`product_id`, `image_url`, `key`) VALUES (?,?,?)'
                        connection.query(query, [id, listImgNew[i].path, listImgNew[i].filename], (error, results) => {
                            if (error) {
                                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                                return res.status(500).json({ message: 'Lỗi máy chủ' });
                            }

                        });
                    })(i);
                }
            }

            const queryadd = 'UPDATE `books` SET `title`= ?,`author`= ?,`price`= ?,`description`= ?,`category_id`= ?,`quantity_remaining`= ? WHERE id = ?'
            connection.query(queryadd, [title, author, Number(price), description, Number(category), Number(quantity_remaining), Number(id)], (error, results) => {
                if (error) {
                    console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                    return res.status(500).json({ message: 'Lỗi máy chủ' });
                }

                res.status(200).json({
                    isSuccess: true,
                    message: 'ok'
                })

            });

        });


    }


}

const productController = new ProductController;

export default productController;

// export { NewsController };