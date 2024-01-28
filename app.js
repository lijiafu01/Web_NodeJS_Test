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

app.get('/', (req, res) => {
  console.log('Một người chơi đã truy cập trang chủ.');
  res.render('index');
});

app.get('/gameplay', (req, res) => {
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
  });

  

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

  socket.on('disconnect', () => {
    console.log(`Người chơi có ID ${socket.id} đã ngắt kết nối.`);
    delete players[socket.id];
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

