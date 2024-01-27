// Nhập khẩu Express
const express = require('express');

// Tạo một ứng dụng Express mới
const app = express();

// Xác định cổng mà server sẽ lắng nghe
const port = 3000;

// Xác lập một route cơ bản
app.get('/', (req, res) => {
  res.send('Xin chào từ Node.js hahahaha !');
});

// Bắt đầu lắng nghe trên cổng đã xác định
app.listen(port, () => {
  console.log(`Ứng dụng đang chạy trên cổng ${port}`);
});
