const express = require('express');

const app = express();
const morgan = require('morgan');
// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');

const { tourRouter } = require('./router/tourRouter');
const userRouter = require('./router/userRouter');
const { AppError } = require('./utils/errorHandle');
const errorHandle = require('./controllers/errorController');
// 安全：设置访问速率
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 100,
    messgae: '访问受限，请稍后重试！！',
  }),
);
app.use(express.json());
app.use(morgan('dev'));
app.use('/tour', tourRouter);
app.use('/user', userRouter);

//404处理
app.use('*', (req, res, next) => {
  next(new AppError(404, '找不到页面'));
});
// 路由错误处理
app.use(errorHandle);

module.exports = app;
