//app.js
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
app.set('view engine', 'ejs');
app.set('views', './views'); // Đặt thư mục cho các file EJS

const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // Thư mục cho các file tĩnh như HTML, CSS, JS

// Cấu hình route mặc định
app.get('/', (req, res) => {
  res.render('index'); // Render file index.ejs
});
app.get('/gameplay', (req, res) => {
  res.render('gameplay', { players: Object.values(players) });
});


// Xử lý kết nối WebSocket
io.on('connection', (socket) => {
    console.log('Một người chơi đã kết nối');

    socket.on('disconnect', () => {
        console.log('Một người chơi đã ngắt kết nối');
    });

    // Các sự kiện khác...
});

let players = {}; // Một đối tượng để lưu trữ thông tin người chơi

io.on('connection', (socket) => {
      socket.on('playerJoin', (playerName) => {
        console.log(playerName + ' đã tham gia trò chơi');
        players[socket.id] = { name: playerName, score: 0 };
        socket.emit('redirectToGame');
    });

    socket.on('disconnect', () => {
        delete players[socket.id]; // Xóa thông tin người chơi khi họ ngắt kết nối
    });
});




http.listen(PORT, () => {
    console.log(`Máy chủ đang chạy trên cổng ${PORT}`);
});
