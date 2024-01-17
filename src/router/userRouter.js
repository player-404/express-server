const router = require('express').Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { project, restrictTo } = require('../middleware/authMiddle');

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
// 删除用户
router.delete('/deleteUser', project, userController.deleteUser);
// 获取所有用户数据
router.get(
  '/getAllUser',
  project,
  restrictTo('admin'),
  userController.getAllUser,
);
// 获取指定用户数据
router.get('/getUser/:id', userController.getUser);
// 退出登录
router.post('/loginOut', project, authController.loginOut);
module.exports = router;
