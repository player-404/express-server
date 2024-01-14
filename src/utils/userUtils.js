// eslint-disable-next-line import/no-extraneous-dependencies
const JWT = require('jsonwebtoken');

// 创建 JWT
const createJWT = (userId) =>
  JWT.sign({ id: userId }, process.env.SERCET, { expiresIn: '1h' });

// 创建 cookie
const createCookie = (res, token) => {
  const cookieOption = {
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
};

module.exports = {
  createJWT,
  createCookie,
};
