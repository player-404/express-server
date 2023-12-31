const express = require('express');

const app = express();
const morgan = require('morgan');
const { tourRouter } = require('./router/tourRouter');
const userRouter = require('./router/userRouter');
const { AppError } = require('./utils/errorHandle');
const errorHandle = require('./controllers/errorController');

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
