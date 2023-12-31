const Tour = require('../model/tourModel');
const { TourFeatureApi } = require('../utils/tourUtils');
const { catchAsyncError } = require('../utils/errorHandle');
const { AppError } = require('../utils/errorHandle');

// 创建数据
const createTour = catchAsyncError(async (req, res) => {
  const tour = await Tour.create(req.body);
  res.status(200).json({
    msg: '数据创建成功',
    data: tour,
  });
});

// 获取指定数据
const getTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findById(id);
    res.status(200).json({
      msg: 'sucess',
      data: tour,
    });
  } catch (err) {
    console.log('数据请求失败', err);
    res.status(401).json({
      msg: '数据获取失败',
    });
  }
};

// 获取全部数据(或指定条件下的全部数据)
/* 
  实现了查询的两个功能：
  1.数据的条件查询
  2.返回数据的排序
*/
const getAllTour = async (req, res) => {
  try {
    const query = Tour.find();
    const tourQuery = new TourFeatureApi(query, req.query)
      .filter()
      .sort()
      .select()
      .limit();

    //此时才返回文档实例
    const tour = await tourQuery.query;
    if (tour.length === 0) {
      res.status(200).json({
        msg: '当前页面没有数据',
      });
    }

    res.status(200).json({
      msg: 'success',
      data: tour,
    });
  } catch (err) {
    res.status(400).json({
      msg: '数据获取失败',
    });
  }
};

// 更新指定数据
const updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    // options: new 为true 返回修改后的文档，而不是原始文档
    const tour = await Tour.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({
      msg: '数据修改成功',
      data: tour,
    });
  } catch (err) {
    console.log(err);
    res.status(401).json({
      msg: '数据修改失败',
    });
  }
};
// 删除指定数据
const deleteTour = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findByIdAndDelete(id);
  // 没有返回数据则说明要删除的数据不存在
  if (!tour) {
    return next(new AppError(401, '删除失败'));
  }
  res.status(201).json({
    msg: '数据删除成功',
    data: null,
  });
});

// 聚合操作
const getTourStats = async (req, res, next) => {
  const stats = await Tour.aggregate([
    // 匹配条件的聚合操作
    {
      $match: {
        price: { $gt: 1000 },
      },
    },
    // 选择显示数据的字段
    {
      $project: {
        _id: 0,
      },
    },
    // 分组
    {
      $group: {
        _id: {
          groupSize: '$groupSize',
        },
        count: {
          // 返回文档数量
          $count: {},
        },
      },
    },
  ]);
  res.status(200).json({
    msg: 'success',
    data: stats,
  });
};

module.exports = {
  createTour,
  getTour,
  getAllTour,
  updateTour,
  deleteTour,
  getTourStats,
};
