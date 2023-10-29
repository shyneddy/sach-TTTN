import { Router } from 'express';
const router = Router();
import homeController from '../controllers/homeController.js';
import { isAdmin } from '../middleware/auth.js';
// import {initPassportLocal, Dadangnhap} from '../config/passport.js';

// import { newsController } from '../app/controllers/NewsControllers';



router.get('/index', homeController.index);

//Home Admin
router.get('/admin-index', isAdmin, homeController.Adminindex);



// console.log(typeof(newsController.index));// module.exports = router;

export default router;