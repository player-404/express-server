const express = require('express');

const app = express();
const morgan = require('morgan');
// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
// eslint-disable-next-line import/no-extraneous-dependencies
const sanitizeHtml = require('sanitize-html');
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoSanitize = require('express-mongo-sanitize');
const { tourRouter } = require('./router/tourRouter');
const userRouter = require('./router/userRouter');
const { AppError } = require('./utils/errorHandle');
const errorHandle = require('./controllers/errorController');

app.use(express.json());
//安全: 防止xss攻击
app.use((req, res, next) => {
  const clean = sanitizeHtml(JSON.stringify(req.body), {
    allowedTags: [],
    nonBooleanAttributes: [],
  });
  req.body = JSON.parse(clean);
  next();
});
//安全: 防sql注入
app.use(mongoSanitize());
// 安全： 设置 http 响应头
app.use(helmet());
// 安全：设置访问速率
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
  messgae: '访问受限，请稍后重试！！',
});
app.use(morgan('dev'));
app.use('/api', limiter);
app.use('/api/tour', tourRouter);
app.use('/api/user', userRouter);

//404处理
app.use('*', (req, res, next) => {
  next(new AppError(404, '找不到页面'));
});
// 路由错误处理
app.use(errorHandle);

module.exports = app;
