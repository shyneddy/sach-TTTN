import { Router } from 'express';
const router = Router();
import orderController from '../controllers/orderController.js';
import { isLogin, isAdmin } from '../middleware/auth.js';
// import {initPassportLocal, Dadangnhap} from '../config/passport.js';

// import { newsController } from '../app/controllers/NewsControllers';



router.post('/add-item', isLogin, orderController.addItem);
router.get('/get-items', isLogin, orderController.getOrder);

router.get('/get-user-order', isLogin, orderController.getUserOrder);

router.get('/confirm', isLogin, orderController.confirm);
router.post('/confirm', isLogin, orderController.PostConfirm);

router.post('/update-item', isLogin, orderController.updateItem);
router.post('/delete-item', isLogin, orderController.deleteItem);

router.get('/get-totle-price', isLogin, orderController.getPriceOrder);

//admin
router.get('/admin-fullorder', isAdmin, orderController.getOrderAll);
router.post('/admin-editorder', isAdmin, orderController.editOrderAll);




// console.log(typeof(newsController.index));// module.exports = router;

export default router;