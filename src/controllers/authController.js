const { catchAsyncError } = require('../utils/errorHandle');
const User = require('../model/userModel');
const { AppError } = require('../utils/errorHandle');
const { createJWT } = require('../utils/userUtils');

// 用户登录
const signInAccount = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError(404, '请检查你的数据！'));
  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new AppError(404, '账号不存在！'));
  // 密码验证状态
  const verifyStatus = await user.verifyPassword(user.password, password);
  if (!verifyStatus) return next(new AppError(500, '密码错误！！'));
  // 创建 token
  const token = createJWT(user._id);

  res.status(200).json({
    status: 'success',
    msg: '登录成功',
    token,
  });
});

// 忘记密码
exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  // 检查用户是否输入邮箱
  if (!email) return next(new AppError(404, '请输入邮箱！'));
  // 查询用户
  const user = await User.findOne({ email });
  // 邮箱是否存在
  if (!user) return next(new AppError(404, '邮箱不存在！'));
  //  创建 reset token
  const restToken = user.createRestToken();
  // 保存数据时关闭检查
  User.save({ validateBeforeSave: false });
  // 发送重置邮件
});

module.exports = {
  signInAccount,
};
