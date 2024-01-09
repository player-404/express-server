const router = require('express').Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.route('/').post(userController.signUp);

router.route('/signIn').post(authController.signInAccount);
// 忘记密码
router.route('/forgetPassword').post(authController.forgetPassword);
// 重置密码
router.route('/resetPassword/:token').patch(authController.resetPassword);

module.exports = router;
