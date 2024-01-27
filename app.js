// Nhập khẩu Express
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));


// Tạo một ứng dụng Express mới


// Xác định cổng mà server sẽ lắng nghe
const port = 3000;


app.get('/', function(req, res) {
  res.render('home');
});


// Bắt đầu lắng nghe trên cổng đã xác định
app.listen(port, () => {
  console.log(`Ứng dụng đang chạy trên cổng ${port}`);
});
