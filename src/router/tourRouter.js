const express = require('express');

const router = express.Router();
const tourController = require('../controllers/tourController');
const tourMiddle = require('../middleware/tourMiddle');
const { project, restrictTo } = require('../middleware/authMiddle');

// 获取价格top5
router
  .route('/topFivePrice')
  .get(tourMiddle.getTopFivePrice, tourController.getAllTour);

// 数据的分类获取
router.route('/getTourStats').get(tourController.getTourStats);

// post 创建新的数据, get 获取全部数据
router
  .route('/')
  .post(project, restrictTo('admin'), tourController.createTour)
  .get(project, tourController.getAllTour);

// get 获取指定数据; patch 更新指定数据; delete 删除指定数据
router
  .route('/:id')
  .get(project, tourController.getTour)
  .patch(project, tourController.updateTour)
  .delete(project, tourController.deleteTour);

module.exports = {
  tourRouter: router,
};
