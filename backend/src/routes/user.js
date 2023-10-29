import { Router } from 'express';
const router = Router();
import userController from '../controllers/userController.js';
// import {initPassportLocal, Dadangnhap} from '../config/passport.js';

// import { newsController } from '../app/controllers/NewsControllers';



router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/updateinfo', userController.updateInfo);
router.post('/updatepassword', userController.updatePassword);


router.get('/islogin', userController.islogin)
router.get('/sigout', userController.sigout);
router.get('/getinfo', userController.getInfo);


//admin

router.post('/admin-login', userController.adminLogin);




// console.log(typeof(newsController.index));// module.exports = router;

export default router;