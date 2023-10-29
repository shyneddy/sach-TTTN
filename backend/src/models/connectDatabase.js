import mysql from 'mysql2';

// Tạo kết nối cơ sở dữ liệu
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Mật khẩu mặc định của XAMPP là rỗng
    database: 'sach_online_tttn', // Thay thế "ten_cua_co_so_du_lieu" bằng tên cơ sở dữ liệu của bạn
});

export default connection;
