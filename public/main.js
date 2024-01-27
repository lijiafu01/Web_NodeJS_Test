// public/main.js
var socket = io();

document.getElementById('joinForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Ngăn hành động mặc định của form

    var playerName = document.getElementById('playerName').value;
    // Gửi tên người chơi tới server sử dụng Socket.io
    socket.emit('playerJoin', playerName);

    // Ẩn form sau khi tham gia
    document.getElementById('joinGame').style.display = 'none';
});

socket.on('redirectToGame', () => {
    window.location.href = '/gameplay'; // Chuyển hướng người dùng đến trang gameplay
});
