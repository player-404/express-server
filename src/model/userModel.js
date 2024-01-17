const mongoose = require('mongoose');
const crypto = require('crypto');
require('jsonwebtoken');

const { Schema } = mongoose;
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  name: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    validate: {
      validator: (email) => {
        const reg =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return reg.test(email);
      },
      message: '邮箱格式错误',
    },
    unique: true,
  },
  password: {
    type: String,
    validate: {
      validator: (password) => {
        const reg =
          /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]/;
        return reg.test(password);
      },
      message: '密码至少包含大小写字母，数字，特殊字符中的三项',
    },
    required: [true, '请输入密码'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (password) {
        return password === this.password;
      },
      message: '两次密码输入不一致，请确认',
    },
    required: [true, '请输入确认密码'],
  },
  photo: {
    type: String,
  },
  phone: {
    type: Number,
    unique: true,
    required: [true, '手机号码不能为空'],
  },
  // 密码修改日期
  passwordChangeAt: {
    type: Date,
  },
  // 权限
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // 密码重置token
  resetPassToken: {
    type: String,
  },
  // 重置 token 过期时间
  resetTokenExpire: {
    type: Number,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  // token 唯一标识
  tokenId: {
    type: String,
  },
});
// 查询中间键(过滤active为false的字段)
userSchema.pre(/^find/i, function (next) {
  this.find({ active: true });
  next();
});

// 密码加密
userSchema.pre('save', async function (next) {
  // 密码修改后，密码加密
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// 自动存储修改密码时间
userSchema.pre('save', function (next) {
  // 新建文档或者密码没有修改则不存储密码修改时间
  if (!this.isModified('password') || this.isNew) return next();
  // 存储密码修改时间
  this.passwordChangeAt = Date.now() + 1000; // 生成token的时间可能会慢一点，因此修改密码的时间也要调慢一点 ?
  next();
});

//登录密码验证 (methods 向实例中添加方法)
userSchema.methods.verifyPassword = async (originPass, iptPass) =>
  await bcrypt.compare(iptPass, originPass);

// 判断密码是否修改，修改后手动废除旧的未过期的token
userSchema.methods.verifyToken = function (tokenIat) {
  // 未修改密码
  if (!this.passwordChangeAt) return false;
  // token 创建日期为秒
  const passwordChangeTime = new Date(this.passwordChangeAt).getTime() / 1000;
  // token 签发时间比密码修改时间早，则该token过期
  return tokenIat < passwordChangeTime;
};

// 生成密码重置链接与过期时间并保存到数据库中
userSchema.methods.createResetToken = function () {
  // 生成随机十六进制字符串
  const data = crypto.randomBytes(32).toString('hex');
  // 加密随机字符串并返回
  this.resetPassToken = crypto.createHash('sha256').update(data).digest('hex');
  // 重置token过期时间设置未十分钟
  this.resetTokenExpire = Date.now() + 10 * 60 * 1000;

  // console.log('原始token', data);
  // console.log('加密token', this.resetPassToken);
  return data;
};

// eslint-disable-next-line new-cap
const User = mongoose.model('User', userSchema);

module.exports = User;
