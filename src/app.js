const express = require('express');

const app = express();
const morgan = require('morgan');
// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
const { tourRouter } = require('./router/tourRouter');
const userRouter = require('./router/userRouter');
const { AppError } = require('./utils/errorHandle');
const errorHandle = require('./controllers/errorController');

app.use(express.json());
app.use(morgan('dev'));
// 安全： 设置 http 响应头
app.use(helmet());
// 安全：设置访问速率
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
  messgae: '访问受限，请稍后重试！！',
});

app.use('/tour', limiter, tourRouter);
app.use('/user', limiter, userRouter);

//404处理
app.use('*', (req, res, next) => {
  next(new AppError(404, '找不到页面'));
});
// 路由错误处理
app.use(errorHandle);

module.exports = app;
