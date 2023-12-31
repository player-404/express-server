const { AppError } = require('../utils/errorHandle');

const sendDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    msg: err.msg,
  });
};

const sendPrd = (err, res) => {
  // 存在未手动抛出的错误说明代码执行过程中发生了其他错误
  if (!err.operateCapture) {
    console.log('💥 发生了意外的错误！！');
    res.status(500).json({
      status: '错误',
      msg: '发生了意外的错误！',
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      msg: err.msg,
    });
  }
};
//错误字段错误处理
const handleCastError = (error) =>
  new AppError(401, `${error.path}为非法字段，请检查！`);
// 字段验证错误处理
const handleValidationError = (error) => {
  const keys = Object.keys(error.errors).join(',');
  return new AppError(401, `${keys}验证失败`);
};
//重复字段错误处理
const handleDuplicateError = (error) => {
  const keys = Object.keys(error.keyValue).join(' ');
  return new AppError(401, `${keys}不唯一`);
};
// token过期错误处理
const handleTokenExpiredError = () =>
  new AppError(401, '用户登录已过期，请重新登录');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || '发生错误';
  err.msg = err.message || '操作失败';
  // 开发环境下的数据返回
  if (process.env.NODE_ENV === 'development') {
    sendDev(err, res);
  }
  // 生产环境下的数据返回
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    // 处理非法字段错误
    if (err.name === 'CastError') {
      error = handleCastError(error);
    }
    // 处理字段验证失败错误
    if (err.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    // 处理重复字段错误
    if (err.code === 11000) {
      error = handleDuplicateError(error);
    }

    if (err.name === 'TokenExpiredError') {
      error = handleTokenExpiredError(error);
    }
    sendPrd(error, res);
  }
};
