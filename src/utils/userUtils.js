// eslint-disable-next-line import/no-extraneous-dependencies
const JWT = require('jsonwebtoken');
const crypto = require('node:crypto');
const User = require('../model/userModel');
// 创建 JWT
const createJWT = async (userId) => {
  const jwtId = crypto.randomBytes(32).toString('hex');
  const token = JWT.sign({ id: userId }, process.env.SERCET, {
    expiresIn: '1h',
    jwtid: jwtId,
  });
  await User.findByIdAndUpdate(userId, { tokenId: jwtId });
  console.log('token', token);
  return token;
};

// 创建 cookie
const createCookie = (res, token) => {
  const cookieOption = {
    httpOnly: true,
    expires: new Date(Date.now() + 1 * 60 * 60),
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
};

// 清除 cookie
const deleteCookie = (res) => {
  res.cookie('jwt', 'out', { maxAge: 1000 });
};
module.exports = {
  createJWT,
  createCookie,
  deleteCookie,
};
