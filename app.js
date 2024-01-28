//app.js
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.json());
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;

let currentNumber = 0;
let players = {};
let gameStarted = false;

app.get('/', (req, res) => {
  console.log('Một người chơi đã truy cập trang chủ.');
  res.render('index');
});

app.get('/gameplay', (req, res) => {
  if (gameStarted) {
    // Chuyển hướng người chơi trở lại trang index và thông báo
    return res.render('index', { message: "游戲已開始,不可進去" });
    }
    console.log('Một người chơi đã truy cập trang gameplay.');
  
    
    let playerName = req.query.playerName; 
  
    let numbers = [];
    for (let i = 1; i <= 100; i++) {
      numbers.push(i);
    }
    shuffleArray(numbers);
   
    res.render('gameplay', { players: Object.values(players), numbers: numbers });
  });

  app.post('/verify-number', function(req, res) {
    let { number, playerID } = req.body;
    console.log(`POST request: Người chơi ${playerID} chọn số ${number}`);
    
    if (number === currentNumber + 1) {
      if (players[playerID]) {
        players[playerID].score += 1;
        // Khi một số được xác nhận là đúng
        io.emit('numberChosen', { number: number });

        console.log(`Score updated: Người chơi ${playerID}, Score: ${players[playerID].score}`);
      } else {
        console.log(`Player not found: Người chơi ${playerID}`);
      }
      currentNumber = number;
      io.emit('updateGameState', { players: players, currentNumber: currentNumber });
      res.json({ success: true, players: players });
    } else {
      console.log(`Invalid number chosen by player ${playerID}`);
      res.json({ success: false });
    }
    if(currentNumber === 100) {
      let highestScoringPlayer = null;
      let highestScore = -1;
  
      // Duyệt qua các người chơi để tìm người có điểm cao nhất
      Object.keys(players).forEach(playerID => {
          if(players[playerID].score > highestScore) {
              highestScore = players[playerID].score;
              highestScoringPlayer = players[playerID];
          }
      });
  
      // Nếu tìm thấy người chơi có điểm cao nhất, gửi thông tin đến tất cả client
      if(highestScoringPlayer !== null) {
          io.emit('endGame', highestScoringPlayer);
      }
      redirectToIndexAfterSeconds();
      
  }
  
  });

  function redirectToIndexAfterSeconds() {
    setTimeout(() => {
        io.emit('redirect', '/'); // Gửi sự kiện 'redirect' tới tất cả clients
    }, 10000); // 5000 milliseconds = 5 seconds
}

io.on('connection', (socket) => {
  console.log(`Người chơi có ID ${socket.id} đã kết nối.`);

  socket.on('newPlayer', (playerName) => {
    let playerID = socket.id;
    players[playerID] = { name: playerName, score: 0 };
    console.log(`Người chơi mới ${playerName} đã tham gia với ID ${playerID}`);
    socket.emit('playerID', playerID);
    console.log(`Người chơi có ID ${playerID} đã lưu để chuyển đến client `);
    io.emit('updateGameState', { players: players, currentNumber: currentNumber });
  });
  socket.on('gameStarted', (isStart) => {
    gameStarted = true;
    io.emit('offStartBtn');
    startCountdown();
  });

  socket.on('disconnect', () => {
    console.log(`Người chơi có ID ${socket.id} đã ngắt kết nối.`);
    delete players[socket.id];

    if (Object.keys(players).length === 0) {
        gameStarted = false; // Nếu không còn người chơi, đặt trạng thái trò chơi thành false
        currentNumber = 0;
    }

    io.emit('updateGameState', { players: players, currentNumber: currentNumber });
});

});

http.listen(PORT, () => {
  console.log(`Máy chủ đang chạy trên cổng ${PORT}`);
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
let timeLeft = 10;
let timerId;

function startCountdown() {
    timeLeft = 10; // Đặt lại thời gian nếu cần
    timerId = setInterval(() => {
        if (timeLeft > 0) {
            console.log(timeLeft);
            io.emit('timeUpdate', timeLeft);
            timeLeft--;
        } else {
            clearInterval(timerId);
            io.emit('startGame');
            // Kích hoạt bất kỳ logic khởi động trò chơi nào ở đây
        }
    }, 1000);
}
