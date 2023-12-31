const mongoose = require('mongoose');
const app = require('./src/app');
require('dotenv').config();

// node 的同步错误处理
process.on('uncaughtException', (err) => {
  console.log('服务器发生了错误 💥');
  console.log('err', err);
  process.exit(1);
});

const DB_URL = process.env.DATABASE_URL.replace(
  '<password>',
  process.env.PASSWORD,
);

//连接数据库
mongoose
  .connect(DB_URL)
  .then(() => {
    console.log('数据库已连接');
  })
  .catch((err) => {
    console.log('数据库连接失败', err);
  });

const port = process.env.ENV_PORT || 3000;
const server = app.listen(port, 'localhost', (err) => {
  if (err) {
    console.log('服务启动失败');
    return;
  }
  console.log('服务启动成功');
});

// node 的异步错误处理
process.on('unhandledRejection', (reason) => {
  console.log('服务器发生了一些意外的错误 💥');
  console.log('err', reason);
  // 关闭 exprsss 服务器
  server.close(() => {
    // 0 正常退出进程 1 异常退出进程
    process.exit(1);
  });
});
