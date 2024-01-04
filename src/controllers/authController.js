const { catchAsyncError } = require('../utils/errorHandle');
const User = require('../model/userModel');
const { AppError } = require('../utils/errorHandle');
const { createJWT } = require('../utils/userUtils');
const { sendMail } = require('../utils/emal');

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
const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  // 检查用户是否输入邮箱
  if (!email) return next(new AppError(404, '请输入邮箱！'));
  // 查询用户
  const user = await User.findOne({ email });
  // 邮箱是否存在
  if (!user) return next(new AppError(404, '邮箱不存在！'));
  //  创建 reset token
  user.createResetToken();
  // 保存数据(关闭检查)
  await user.save({ validateBeforeSave: false });
  // 发送重置邮件
  try {
    await sendMail({
      to: '1315363446@qq.com',
      subject: '重置密码',
      text: `点击链接重置密码: http://${req.host}${req.originalUrl}/${user.resetPassToken}`,
    });
    res.status(200).json({
      msg: '邮件发送成功',
    });
  } catch (err) {
    console.log('err', err);
    res.status(500).json({
      msg: '邮件发送失败',
      err,
    });
  }
});

module.exports = {
  signInAccount,
  forgetPassword,
};
