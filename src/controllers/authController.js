const crypto = require('crypto');
const { catchAsyncError } = require('../utils/errorHandle');
const User = require('../model/userModel');
const { AppError } = require('../utils/errorHandle');
const { createJWT } = require('../utils/userUtils');
const { sendMail } = require('../utils/emal');
const { createCookie, deleteCookie } = require('../utils/userUtils');

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
  const token = await createJWT(user._id);

  // 创建 cookie
  createCookie(res, token);
  res.status(200).json({
    status: 'success',
    msg: '登录成功',
    token,
  });
});

// 忘记密码(发送密码重置邮件)
const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  // 检查用户是否输入邮箱
  if (!email) return next(new AppError(404, '请输入邮箱！'));
  // 查询用户
  const user = await User.findOne({ email });
  // 邮箱是否存在
  if (!user) return next(new AppError(404, '邮箱不存在！'));
  //  创建 reset token
  const token = await user.createResetToken();

  // 保存数据(关闭检查)
  await user.save({ validateBeforeSave: false });
  // 发送重置邮件
  try {
    await sendMail({
      to: '1315363446@qq.com',
      subject: '重置密码',
      text: `点击链接重置密码: http://${req.host}/resetPassword/${token}`, // 端口？
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

// 忘记密码(重置密码)
const resetPassword = catchAsyncError(async (req, res, next) => {
  // 获得原始密码重置 token
  const { token } = req.params;
  if (!token) return new AppError(400, '链接错误');
  // 加密 原始token 因为数据库中存储的是加密的token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  // 查询用户
  const user = await User.findOne({
    resetPassToken: hashedToken,
    resetTokenExpire: { $gte: Date.now() },
  });
  // token错误
  if (!user) {
    return next(new AppError(400, '重置密码链接错误或过期'));
  }
  //重置密码
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetPassToken = undefined;
  user.resetTokenExpire = undefined;

  // 保存数据
  await user.save();
  // 返回数据
  res.status(200).json({
    msg: '密码重置成功',
  });
});

// 密码修改
const changePassword = catchAsyncError(async (req, res, next) => {
  // 1.验证当前密码
  const user = await User.findById(req.user.id).select('+password');
  const { currentPassword } = req.body;
  const verifyStatus = await user.verifyPassword(
    user.password,
    currentPassword,
  );
  if (!verifyStatus) return next(new AppError(400, '密码验证失败'));
  // 2. 验证输入的密码
  const { password, passwordConfirm } = req.body;
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  deleteCookie(res);
  res.status(200).json({
    msg: '密码修改成功',
  });
});

// 退出登录
const loginOut = catchAsyncError(async (req, res, next) => {
  // 清除 用户数据中 token Id 字段
  await User.findByIdAndUpdate(req.user.id, {
    tokenId: '',
  });
  // 清除cookie
  deleteCookie(res);
  // 返回状态
  res.status(200).json({
    msg: '退出登录成功',
  });
});

module.exports = {
  signInAccount,
  forgetPassword,
  resetPassword,
  changePassword,
  loginOut,
};
