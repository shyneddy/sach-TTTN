import { Router } from 'express';
const router = Router();
import productController from '../controllers/productController.js';
import { isLogin, isAdmin } from '../middleware/auth.js';
import path from 'path'
import multer from 'multer';
// import cloudinary from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';

import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: 'dccufaric',
    api_key: '765784527863929',
    api_secret: '-4BVBunPltEYrGclnrpjmWqhF70'
});

const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['jpg', 'jpeg', 'png'],
    transformation: [{ height: 600, width: 600, crop: "limit" }],
    params: {
        folder: 'sach_online'
    }
});
const uploadCloud = multer({ storage });


router.get('/detail', productController.getDetail);
router.post('/search-items', productController.searchItems);
router.post('/category', productController.searchByCategory);
router.post('/rating', isLogin, productController.Rating);
router.post('/favorite', isLogin, productController.Favorite);
router.get('/user-favorite', isLogin, productController.getUserFavorite);
router.get('/user-rating', isLogin, productController.getUserRating);


//admin
router.get('/admin-fullproduct', isAdmin, productController.getProductAll);
router.get('/admin-fullcategory', isAdmin, productController.getCategoryAll);
// router.post('/admin-addproduct', upload.single("selectedFileAvatar"), upload.single("selectedFileImg"), productController.addProduct);
router.post('/admin-addproduct', isAdmin, uploadCloud.fields([{ name: 'selectedFileAvatar', maxCount: 1 }, { name: 'selectedFileImg', maxCount: 8 }]), productController.addProduct);
router.post('/admin-removeproduct', isAdmin, productController.removeProduct);
router.post('/admin-updateproduct', isAdmin, uploadCloud.fields([{ name: 'selectedFileAvatar', maxCount: 1 }, { name: 'selectedFileImg', maxCount: 8 }]), productController.updateProduct);




export default router;