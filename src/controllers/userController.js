// eslint-disable-next-line import/no-extraneous-dependencies
const User = require('../model/userModel');
const { catchAsyncError, AppError } = require('../utils/errorHandle');
const { createCookie, createJWT } = require('../utils/userUtils');

// 用户注册
const signUp = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    phone: req.body.phone,
  });
  // 创建 token
  const jwt = createJWT(newUser._id);

  // 创建 cookie
  createCookie(res, jwt);

  res.status(200).json({
    msg: '用户创建成功',
    status: 'success',
    data: newUser,
    jwt,
  });
});

// 更新用户数据
//过滤字段
const filterBody = (current, ...allow) => {
  const newObj = {};
  Object.keys(current).forEach((key) => {
    if (allow.includes(key)) {
      newObj[key] = current[key];
    }
  });
  return newObj;
};

const updateUser = catchAsyncError(async (req, res, next) => {
  // 1.过滤字段 重要字段不能随意更改
  if (JSON.stringify(req.body) === '{}')
    return next(new AppError(400, '数据未更改！'));
  const updateData = filterBody(req.body, 'name');
  // 2.更新数据
  const user = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
  });
  // 创建cookie

  res.status(200).json({
    msg: '数据更改成功',
    data: {
      user,
    },
  });
});

// 删除用户
const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError(400, '该用户不存在'));
  user.active = false;
  user.save({ validateBeforeSave: false });
  res.status(201).json({
    msg: '删除成功',
  });
});

// 获取所有用户数据
const getAllUser = catchAsyncError(async (req, res, next) => {
  const allUser = await User.find();
  res.status(200).json({
    msg: '数据获取成功',
    data: {
      users: allUser,
    },
  });
});

// 获取指定用户数据
const getUser = catchAsyncError(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId).select('-role -phone -email');
  if (!user) return next(new AppError(404, '用户数据不存在'));
  res.status(200).json({
    msg: '数据获取成功',
    data: {
      user,
    },
  });
});

module.exports = {
  signUp,
  updateUser,
  deleteUser,
  getAllUser,
  getUser,
};
