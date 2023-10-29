import connection from '../models/connectDatabase.js'
import bcrypt from 'bcrypt';

class UserController {



    login(req, res) {



        const { username, password } = req.body;
        // Truy vấn cơ sở dữ liệu để lấy thông tin người dùng
        const query = `SELECT * FROM users WHERE username = ?`;
        connection.query(query, [username], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            // Kiểm tra kết quả truy vấn 
            if (results.length === 0) {
                return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
            }

            const user = results[0];
            // So sánh mật khẩu đã mã hóa từ cơ sở dữ liệu với mật khẩu người dùng gửi lên
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Lỗi so sánh mật khẩu:', err);
                    return res.status(500).json({ message: 'Lỗi máy chủ' });
                }

                if (!isMatch) {
                    return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
                }

                // Xác thực thành công, trả về thông tin người dùng
                req.session.username = user.username;
                req.session.user_id = user.id;

                delete user.password; // Xóa mật khẩu khỏi đối tượng người dùng trước khi trả về
                // res.cookie('sessionId', req.session);
                return res.status(200).json({ message: 'Đăng nhập thành công', isLogin: true, user });
            });
        });
        // Truy vấn cơ sở dữ liệu để xác thực thông tin đăng nhập



        // res.status(200).json({
        //     message: 'Đăng nhập thành công',
        //     isLogin: true
        // });

    }

    adminLogin(req, res) {
        const { username, password } = req.body;
        // Truy vấn cơ sở dữ liệu để lấy thông tin người dùng
        const query = `SELECT * FROM users WHERE username = ? and role = true`;
        connection.query(query, [username], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            // Kiểm tra kết quả truy vấn 
            if (results.length === 0) {
                return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
            }

            const user = results[0];
            // So sánh mật khẩu đã mã hóa từ cơ sở dữ liệu với mật khẩu người dùng gửi lên
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Lỗi so sánh mật khẩu:', err);
                    return res.status(500).json({ message: 'Lỗi máy chủ' });
                }

                if (!isMatch) {
                    return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
                }

                // Xác thực thành công, trả về thông tin người dùng
                req.session.username = user.username;
                req.session.user_id = user.id;

                delete user.password; // Xóa mật khẩu khỏi đối tượng người dùng trước khi trả về
                // res.cookie('sessionId', req.session);
                return res.status(200).json({ message: 'Đăng nhập thành công', isAdmin: true, user });
            });
        });
    }

    register(req, res) {
        // console.log('ok');

        var infoUserRegister = req.body;
        infoUserRegister.gender = infoUserRegister.gender == 'male' ? 1 : 0;

        connection.query('SELECT * FROM users WHERE username = ?', [infoUserRegister.username], (error, results) => {
            if (error) {
                console.error('Error executing MySQL query:', error);
                return res.status(500).json({ error: 'Internal Server Error' });

                // Xử lý lỗi
            } else if (results.length > 0) {
                // Tên người dùng đã tồn tại
                // return res.status(400).json({ error: 'Username already exists' });
                res.status(400).json({ error: 'Username already exists', isExists: true });

            } else {
                // Tên người dùng không tồn tại
                // Mã hóa mật khẩu
                bcrypt.hash(infoUserRegister.password, 10, async (error, hashedPassword) => {
                    if (error) {
                        console.error('Lỗi mã hóa mật khẩu:', error);
                        return res.status(500).json({ error: 'Đã xảy ra lỗi trong quá trình đăng ký.' });
                    } else {
                        const sql_register = 'INSERT INTO `users`(`username`, `password`, `phone_number`, `full_name`, `address`, `gender`) ' + `VALUES ('${infoUserRegister.username}','${hashedPassword}','${infoUserRegister.phone_number}','${infoUserRegister.full_name}','${infoUserRegister.address}',${infoUserRegister.gender})`;
                        await connection.promise().query(sql_register);
                        console.log('đã lưu');

                        const query = `SELECT * FROM users WHERE username = ?`;
                        connection.query(query, [infoUserRegister.username], (error, results) => {
                            if (error) {
                                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                                return res.status(500).json({ message: 'Lỗi máy chủ' });
                            }
                            console.log('kq: ', results[0]);
                            const user = results[0];
                            req.session.username = user.username;
                            req.session.user_id = user.id;


                            res.status(200).json({
                                message: 'Đăng ký thành công',
                                user
                            })
                        });
                    }
                });



            }
        });


    }

    islogin(req, res) {
        // console.log('connect is login!!');
        // console.log('is login: ', req.session);

        if (req.session.username) {
            var userinfo;

            const query = 'SELECT * FROM `users` WHERE username = ?'

            connection.query(query, [req.session.username], (error, results) => {
                if (error) {
                    console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                    return res.status(500).json({ message: 'Lỗi máy chủ' });
                }

                console.log(req.session.username);

                // Kết quả truy vấn sẽ được lưu trong biến `results`
                // console.log(results);
                userinfo = results[0];
                // console.log(userinfo);

                // Tiếp tục xử lý dữ liệu tại đây
                return res.status(200).json({
                    isLogin: true,
                    userinfo: userinfo
                })
            });

        } else {
            return res.status(200).json({
                isLogin: false
            })
        }


    }

    sigout(req, res) {
        req.session.destroy();

        res.status(200).json({
            success: true
        })
    }

    getInfo(req, res) {

        var userinfo;

        const query = 'SELECT * FROM `users` WHERE username = ?'

        connection.query(query, [req.session.username], (err, results) => {
            if (err) throw err;

            // Kết quả truy vấn sẽ được lưu trong biến `results`
            // console.log(results);
            userinfo = results[0];

            // Tiếp tục xử lý dữ liệu tại đây
            res.status(200).json({
                message: 'hello user info page!!',
                userinfo: userinfo
            })
        });

    }

    updateInfo(req, res) {
        console.log('abcxyz');
        console.log(req.body);
        const newInfoUser = req.body;
        const updateQuery = 'UPDATE `users` SET `phone_number`= ?,`full_name`= ?,`address`= ?,`gender`= ? WHERE username = ?'
        connection.query(updateQuery, [newInfoUser.phone_number, newInfoUser.full_name, newInfoUser.address, newInfoUser.gender, newInfoUser.username], (err, result) => {
            if (err) {
                console.error('Lỗi truy vấn:', err);
                return;
            }
            console.log('Truy vấn thành công!');
            res.status(200).json({
                message: 'update page',
                isUpdate: true
            })
        });

    }

    updatePassword(req, res) {
        console.log('abcxyz');
        const password_old = req.body.password_old
        const password_new = req.body.password_new
        const query = `SELECT * FROM users WHERE username = ?`;
        connection.query(query, [req.session.username], (error, results) => {
            if (error) {
                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }

            // Kiểm tra kết quả truy vấn
            if (results.length === 0) {
                return res.status(401).json({ message: 'Lỗi đăng nhập' });
            }

            const user = results[0];
            // So sánh mật khẩu đã mã hóa từ cơ sở dữ liệu với mật khẩu người dùng gửi lên
            bcrypt.compare(password_old, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Lỗi so sánh mật khẩu:', err);
                    return res.status(500).json({ message: 'Lỗi máy chủ' });
                }

                if (!isMatch) {
                    return res.status(401).json({ message: 'Mật khẩu không đúng', falsePassword: true });
                }

                // const updateQuery = 'UPDATE `users` SET `password`= ? WHERE username = ?'
                bcrypt.hash(password_new, 10, async (error, hashedPassword) => {
                    if (error) {
                        console.error('Lỗi mã hóa mật khẩu:', error);
                        return res.status(500).json({ error: 'Đã xảy ra lỗi trong quá trình đăng ký.' });
                    } else {
                        // const sql_register = 'INSERT INTO `users`(`username`, `password`, `phone_number`, `full_name`, `address`, `gender`) ' + `VALUES ('${infoUserRegister.username}','${hashedPassword}','${infoUserRegister.phone_number}','${infoUserRegister.full_name}','${infoUserRegister.address}',${infoUserRegister.gender})`;
                        const updateQuery = 'UPDATE `users` SET `password`= ? WHERE username = ?'

                        connection.query(updateQuery, [hashedPassword, req.session.username], (error, results) => {
                            if (error) {
                                console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
                                return res.status(500).json({ message: 'Lỗi máy chủ' });
                            }

                            res.status(200).json({
                                message: 'Đổi mật khẩu thành công',
                                isUpdate: true
                            })
                        });
                    }
                });

                // return res.status(200).json({ message: 'Đăng nhập thành công', isLogin: true, user });
            });
        });

    }




}

const userController = new UserController;

export default userController;

// export { NewsController };