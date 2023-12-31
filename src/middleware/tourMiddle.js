// 以中间键的方式获取对应的数据
const getTopFivePrice = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price';
  next();
};

module.exports = {
  getTopFivePrice,
};
