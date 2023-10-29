import connection from '../models/connectDatabase.js'

function isLogin(req, res, next) {
    if (!req.session.user_id) {
        console.log('chua đăng nhập');
        return res.status(401).json({ message: 'Chưa đăng nhập', isLogin: false });
    }

    next();

}

function isAdmin(req, res, next) {
    if (!req.session.user_id) {
        console.log('chua đăng nhập');
        return res.status(401).json({ message: 'Chưa đăng nhập', isAdmin: false });
    }

    const query = 'SELECT `full_name`, `role` FROM `users` WHERE id = ? and role = true'
    connection.query(query, [req.session.user_id], (error, results) => {
        if (error) {
            console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
            return res.status(500).json({ message: 'Lỗi máy chủ' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Không phải admin', isAdmin: false });
        }

        let user = results[0];
        req.userAdmin = user;

        next();
    });


}

export { isLogin, isAdmin };