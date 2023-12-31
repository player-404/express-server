const mongoose = require('mongoose');

const { Schema } = mongoose;

// schema 定义文档数据的类型
const tourSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, '名字不能为空'],
    },
    // 评分
    rating: {
      type: Number,
      required: [true, '评分不能为空'],
    },
    // 评分数量
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    // 评分平均数
    ratingAverage: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, '价格不能为空'],
    },
    groupSize: {
      type: Number,
      min: [1, '人数不能小于1'],
      default: 4,
    },
    disCount: {
      type: Number,
      default: 0,
    },
    createAt: {
      type: Date,
      default: Date.now(),
    },
    imgCover: {
      type: String,
      required: [true, '请上传封面'],
    },
    imgs: [String],
    description: {
      type: String,
      // 字符的方法，清除空白字符串
      trim: true,
      required: [true, '请输入旅游的介绍'],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, '请输入旅游简介'],
    },
    duration: {
      type: Number,
      required: [true, '请输入旅游天数'],
    },
    hookStr: {
      type: String,
    },
    select: {
      type: Boolean,
      default: false,
    },
  },
  {
    // 虚拟属性 不实际存储在数据库中，知识返数据时显示
    virtuals: {
      week: {
        get() {
          return this.duration / 7;
        },
      },
    },
    toJSON: {
      virtuals: true,
    },
  },
);

// 中间键, save 为文档中间键, pre hook 回调会在文档执行 save 方法前执行
tourSchema.pre('save', (next) => {
  // this 指向 文档
  // this.hookStr = '这是中间键添加的数据';
  // 让代码向下执行
  next();
});

// 查询中间键
tourSchema.pre(/^find/, function (next) {
  this.find({ select: { $ne: true } });
  next();
});

// Model用来创建或读取文档，model的实例就是文档
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
