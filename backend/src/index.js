import express from 'express';
import { route } from './routes/index.js';
import cors from 'cors';
import bodyParser from 'body-parser'
import session from 'express-session';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const app = express()
// app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.static('uploads'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(session({
    secret: 'Sh1nEddy',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Nếu bạn sử dụng HTTPS, nếu không, hãy để secure là false
}));

const upload = multer({ dest: 'uploads/' })

// app.post('/product/admin-addproduct', upload.single("selectedFileAvatar"), function (req, res, next) {
//     // Xử lý tệp tin đã tải lên
//     // req.file chứa thông tin về tệp tin đã tải lên
//     console.log(req.body);
//     res.status(200).json({ message: 'ok' })
//     // req.body chứa thông tin về các trường dữ liệu khác (nếu có)
// });


route(app);

app.listen(3001, function () {
    console.log('Server Started...')
})