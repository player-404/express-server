const { promisify } = require('node:util');
const jwt = require('jsonwebtoken');
const { catchAsyncError } = require('../utils/errorHandle');
const { AppError } = require('../utils/errorHandle');
const User = require('../model/userModel');

//路由保护，阻止未登录的用户（登录状态验证）
exports.project = catchAsyncError(async (req, res, next) => {
  // 1. 获取token
  const token =
    req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return next(new AppError(401, '请先登录'));

  // 2. 验证token
  const payload = await promisify(jwt.verify)(token, process.env.SERCET);

  // 3.获取用户id 查询该用户是否存在
  const user = await User.findById(payload.id);
  if (!user) return next(new AppError(404, '非法凭证，请登录！'));

  // 4.判断token是否过期，过期标准是密码是否更改
  const tokenStatus = user.verifyToken(payload.iat);
  if (tokenStatus) return next(new AppError(401, '用户身份已过期，请重新登录'));

  next();
});
