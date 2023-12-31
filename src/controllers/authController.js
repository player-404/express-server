const { catchAsyncError } = require('../utils/errorHandle');
const User = require('../model/userModel');
const { AppError } = require('../utils/errorHandle');
const { createJWT } = require('../utils/userUtils');

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

module.exports = {
  signInAccount,
};
