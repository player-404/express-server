// eslint-disable-next-line import/no-extraneous-dependencies
const User = require('../model/userModel');
const { catchAsyncError } = require('../utils/errorHandle');
const userUtils = require('../utils/userUtils');

// 用户注册
const signUp = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    phone: req.body.phone,
  });
  const jwt = userUtils.createJWT(newUser._id);
  res.status(200).json({
    msg: '用户创建成功',
    status: 'success',
    data: newUser,
    jwt,
  });
});

module.exports = {
  signUp,
};
