
import { Router } from 'express';
const router = Router();
import categoryController from '../controllers/categoryController.js';
// import {initPassportLocal, Dadangnhap} from '../config/passport.js';

// import { newsController } from '../app/controllers/NewsControllers';



router.get('/get-category', categoryController.getCategory);


router.post('/admin-addcategory', categoryController.addCategory);
router.post('/admin-editcategory', categoryController.editCategory);
router.post('/admin-removecategory', categoryController.removeCategory);


// console.log(typeof(newsController.index));// module.exports = router;

export default router;