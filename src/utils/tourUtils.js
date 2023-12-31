class TourFeatureApi {
  constructor(query, queryParams) {
    this.query = query;
    this.queryParams = queryParams;
  }

  // 1. 条件数据查询
  filter() {
    // 需要过滤的字段
    const skipQuery = ['page', 'sort', 'filter', 'limit', 'select'];
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let querys = { ...this.queryParams };
    // 过滤(删除)指定的字段
    skipQuery.forEach((key) => {
      delete querys[key];
    });
    let queryString = JSON.stringify(querys);
    // 在mongoose中的计算运算符 $lt:小于，$lte: 小于等于, $gt: 大于, $gte: 大于等于
    // 添加 $ 字符
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`,
    );
    //将字符串解析为对象
    querys = JSON.parse(queryString);
    //1.至此实现了数据的条件查询功能, 查询符合条件的所有数据 （注意此时返回的是 query，不是document）
    this.query = this.query.find(querys);
    return this;
  }

  // 2.数据排序
  sort() {
    // 2.实现数据的排序功能
    if (this.queryParams.sort) {
      // -代表降序排序，+ 代表升序排序, 添加两个条件，使用空格隔开，当第一个条件相同时再议第二个条件排序
      const sortStr = this.queryParams.sort.split(',').join(' ');
      this.query = this.query.sort(sortStr);
    } else {
      // 当没有指定 sort时，使用默认的排序
      this.query = this.query.sort('-createAt');
    }
    return this;
  }

  // 3.数据筛选
  select() {
    // 3.实现指定字段的数据返回
    if (this.queryParams.select) {
      const selectStr = this.queryParams.select.split(',').join(' ');
      this.query = this.query.select(selectStr);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // 4.分页
  limit() {
    const limit = this.queryParams.limit * 1 || 3;
    const page = this.queryParams.page * 1 || 1;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = {
  TourFeatureApi,
};
