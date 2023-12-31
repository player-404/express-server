const catchAsyncError = (fn) => (req, res, next) => {
  // catch(next) 是 ctach(err =>{next(err)}) 的简写
  fn(req, res, next).catch(next);
};

class AppError extends Error {
  constructor(statusCode, message) {
    super(Error);
    this.statusCode = statusCode;
    this.message = message;
    this.status = `${statusCode}`.startsWith('4') ? '请求失败' : '发生错误';
    // 是否手动抛出的错误，如果未赋值未true，那么该错误未捕获到，可能是代码错误或其他未捕获到的错误
    this.operateCapture = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  catchAsyncError,
  AppError,
};
