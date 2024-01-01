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

  // 将 user 数据赋值给 req
  req.user = user;

  next();
});

// 用户权限
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles：需求权限  req.user.role 用户实际权限
    // req.user.role 在路由保护中间键中赋值，判断用户权限的前提是用户需要登录

    // 用户权限不在需求权限中：权限不足
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, '权限不足，不能操作'));
    }

    next();
  };
