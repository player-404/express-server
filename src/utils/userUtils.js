// eslint-disable-next-line import/no-extraneous-dependencies
const JWT = require('jsonwebtoken');

// 创建 JWT
const createJWT = (userId) =>
  JWT.sign({ id: userId }, process.env.SERCET, { expiresIn: '1h' });

module.exports = {
  createJWT,
};
