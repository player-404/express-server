const router = require('express').Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { project } = require('../middleware/authMiddle');

router.route('/').post(userController.signUp);

router.route('/signIn').post(authController.signInAccount);
// 忘记密码
router.route('/forgetPassword').post(authController.forgetPassword);
// 重置密码
router.route('/resetPassword/:token').patch(authController.resetPassword);
// 密码修改
router.patch('/changePassword', project, authController.changePassword);
//用户数据更新
router.patch('/updateUser', project, userController.updateUser);

module.exports = router;
