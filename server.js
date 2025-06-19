const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Game state storage
const games = new Map();
const playerSockets = new Map();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/host', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'host.html'));
});

app.get('/player', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'player.html'));
});

// Image upload route
app.post('/upload-image', upload.single('questionImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }
    
    res.json({ 
        success: true, 
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`
    });
});

// Game class to manage game state
class Game {
    constructor(hostSocketId) {
        this.id = this.generateGameCode();
        this.hostSocketId = hostSocketId;
        this.players = new Map();
        this.questions = [];
        this.currentQuestionIndex = -1;
        this.gameState = 'lobby'; // lobby, playing, finished
        this.timer = null;
        this.timerDuration = 30; // seconds
        this.timeLeft = 0;
        this.answers = new Map(); // playerId -> answer
        this.leaderboard = new Map(); // playerId -> score
        this.questionStartTime = null;
    }

    generateGameCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    addPlayer(socketId, nickname) {
        const playerId = uuidv4();
        this.players.set(playerId, {
            id: playerId,
            socketId,
            nickname,
            score: 0,
            hasAnswered: false
        });
        this.leaderboard.set(playerId, 0);
        return playerId;
    }

    removePlayer(socketId) {
        for (const [playerId, player] of this.players.entries()) {
            if (player.socketId === socketId) {
                this.players.delete(playerId);
                this.leaderboard.delete(playerId);
                return playerId;
            }
        }
        return null;
    }    addQuestion(question) {
        this.questions.push({
            ...question,
            id: uuidv4()
        });
    }

    // Add sample questions for testing
    addSampleQuestions() {
        const sampleQuestions = [
            { question: "🐝 + 🍂", answer: "believe", type: "text" },
            { question: "🌟 + 🐟", answer: "starfish", type: "text" },
            { question: "👁️ + ❤️ + 🫵", answer: "i love you", type: "text" },
            { question: "🐍 + 👁️", answer: "python", type: "text" },
            { question: "🍎 + 🥧", answer: "apple pie", type: "text" }
        ];
        
        sampleQuestions.forEach(q => this.addQuestion(q));
        return sampleQuestions.length;
    }

    startGame() {
        this.gameState = 'playing';
        this.currentQuestionIndex = 0;
        this.startQuestion();
    }    startQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endGame();
            return;
        }

        this.answers.clear();
        this.questionStartTime = Date.now();
        
        // Reset hasAnswered for all players
        for (const player of this.players.values()) {
            player.hasAnswered = false;
        }

        // No timer - host controls when to move on
    }submitAnswer(playerId, answer) {
        if (this.gameState !== 'playing') {
            return false;
        }

        const player = this.players.get(playerId);
        if (!player) return false;

        // Check if answer is correct
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const correctAnswer = currentQuestion.answer.toLowerCase();
        const playerAnswer = answer.trim().toLowerCase();
        
        if (playerAnswer === correctAnswer) {
            // Player got it right!
            if (!this.answers.has(playerId)) {
                // Calculate points based on how many people have already guessed correctly
                const correctAnswersCount = Array.from(this.answers.values()).filter(a => a.correct).length;
                const basePoints = 150;
                const positionPenalty = correctAnswersCount * 25; // Each subsequent correct answer gets 25 points less
                const points = Math.max(25, basePoints - positionPenalty); // Minimum 25 points
                
                const currentScore = this.leaderboard.get(playerId) || 0;
                this.leaderboard.set(playerId, currentScore + points);
                player.score = currentScore + points;
                
                this.answers.set(playerId, {
                    answer: playerAnswer,
                    timestamp: Date.now(),
                    correct: true,
                    points: points
                });
                
                return { correct: true, points: points, position: correctAnswersCount + 1 };
            }
        }
        
        return { correct: false };
    }    endQuestion() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        // Scoring is now handled when answers are submitted, not at end
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            this.startQuestion();
        } else {
            this.endGame();
        }
    }

    endGame() {
        this.gameState = 'finished';
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    getCurrentQuestion() {
        if (this.currentQuestionIndex >= 0 && this.currentQuestionIndex < this.questions.length) {
            return this.questions[this.currentQuestionIndex];
        }
        return null;
    }

    getLeaderboard() {
        const sorted = Array.from(this.players.values())
            .sort((a, b) => b.score - a.score)
            .map(player => ({
                nickname: player.nickname,
                score: player.score
            }));
        return sorted;
    }
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Host creates a new game
    socket.on('create-game', () => {
        const game = new Game(socket.id);
        games.set(game.id, game);
        socket.join(game.id);
        
        socket.emit('game-created', {
            gameCode: game.id,
            message: 'Game created successfully!'
        });
        
        console.log(`Game ${game.id} created by host ${socket.id}`);
    });

    // Host adds a question
    socket.on('add-question', (data) => {
        const game = findGameByHost(socket.id);
        if (game && data.question && data.answer) {
            game.addQuestion({
                question: data.question,
                answer: data.answer,
                type: data.type || 'text'
            });
            
            socket.emit('question-added', {
                success: true,
                questionCount: game.questions.length
            });
        }
    });

    // Host adds sample questions for testing
    socket.on('add-sample-questions', () => {
        const game = findGameByHost(socket.id);
        if (game) {
            const count = game.addSampleQuestions();
            socket.emit('sample-questions-added', {
                success: true,
                questionCount: game.questions.length,
                added: count
            });
        }
    });

    // Host starts the game
    socket.on('start-game', () => {
        const game = findGameByHost(socket.id);
        if (game && game.questions.length > 0) {
            game.startGame();
            
            // Notify all players in the game room
            io.to(game.id).emit('game-started');            // Send the first question
            const question = game.getCurrentQuestion();
            if (question) {
                io.to(game.id).emit('new-question', {
                    questionNumber: game.currentQuestionIndex + 1,
                    totalQuestions: game.questions.length,
                    question: question.question,
                    type: question.type
                });
            }
        }
    });

    // Host reveals answer and moves to next question
    socket.on('reveal-answer', () => {
        const game = findGameByHost(socket.id);
        if (game) {
            game.endQuestion();
            const currentQuestion = game.getCurrentQuestion();
            
            io.to(game.id).emit('answer-revealed', {
                correctAnswer: currentQuestion.answer,
                leaderboard: game.getLeaderboard()
            });
        }
    });

    // Host moves to next question
    socket.on('next-question', () => {
        const game = findGameByHost(socket.id);
        if (game) {
            game.nextQuestion();
              if (game.gameState === 'playing') {
                const question = game.getCurrentQuestion();                io.to(game.id).emit('new-question', {
                    questionNumber: game.currentQuestionIndex + 1,
                    totalQuestions: game.questions.length,
                    question: question.question,
                    type: question.type
                });
            } else {
                io.to(game.id).emit('game-ended', {
                    finalLeaderboard: game.getLeaderboard()
                });
            }
        }
    });

    // Player joins a game
    socket.on('join-game', (data) => {
        const { gameCode, nickname } = data;
        const game = games.get(gameCode.toUpperCase());
        
        if (!game) {
            socket.emit('join-error', { message: 'Game not found!' });
            return;
        }
        
        if (game.gameState !== 'lobby') {
            socket.emit('join-error', { message: 'Game has already started!' });
            return;
        }
        
        const playerId = game.addPlayer(socket.id, nickname);
        playerSockets.set(socket.id, { gameCode: game.id, playerId });
        socket.join(game.id);
        
        socket.emit('joined-game', {
            success: true,
            gameCode: game.id,
            playerId: playerId
        });
        
        // Notify host and all players about new player
        io.to(game.id).emit('player-joined', {
            nickname: nickname,
            playerCount: game.players.size,
            players: Array.from(game.players.values()).map(p => ({ nickname: p.nickname }))
        });
        
        console.log(`Player ${nickname} joined game ${game.id}`);
    });    // Player submits an answer
    socket.on('submit-answer', (data) => {
        const playerInfo = playerSockets.get(socket.id);
        if (!playerInfo) return;
        
        const game = games.get(playerInfo.gameCode);
        if (!game) return;
        
        const result = game.submitAnswer(playerInfo.playerId, data.answer);
        const player = game.players.get(playerInfo.playerId);
        
        if (result.correct) {
            // Player got it right!
            socket.emit('answer-submitted', { 
                correct: true, 
                points: result.points,
                position: result.position
            });
            
            // Broadcast that someone guessed correctly (without revealing the answer)
            io.to(game.id).emit('chat-message', {
                nickname: player.nickname,
                message: `guessed the word!`,
                timestamp: Date.now(),
                isCorrect: true,
                isSystemMessage: true
            });
            
            // Send updated leaderboard to everyone
            io.to(game.id).emit('leaderboard-update', {
                leaderboard: game.getLeaderboard()
            });
            
        } else {
            // Incorrect answer - allow continued guessing
            socket.emit('answer-submitted', { correct: false });
            
            // Broadcast the incorrect answer to chat
            io.to(game.id).emit('chat-message', {
                nickname: player.nickname,
                message: data.answer,
                timestamp: Date.now(),
                isCorrect: false
            });
        }
    });

    // Show answered status in host interface
    socket.on('answer-submitted', (data) => {
        const playerInfo = playerSockets.get(socket.id);
        if (!playerInfo) return;
        
        const game = games.get(playerInfo.gameCode);
        if (!game) return;
        
        const player = game.players.get(playerInfo.playerId);
        if (player) {
            // Notify host about player answering
            io.to(game.hostSocketId).emit('player-answered', {
                nickname: player.nickname,
                playerId: playerInfo.playerId
            });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Check if this was a host
        const hostGame = findGameByHost(socket.id);
        if (hostGame) {
            // Notify all players that host disconnected
            io.to(hostGame.id).emit('host-disconnected');
            games.delete(hostGame.id);
            console.log(`Game ${hostGame.id} ended - host disconnected`);
        }
        
        // Check if this was a player
        const playerInfo = playerSockets.get(socket.id);
        if (playerInfo) {
            const game = games.get(playerInfo.gameCode);
            if (game) {
                const removedPlayerId = game.removePlayer(socket.id);
                if (removedPlayerId) {
                    io.to(game.id).emit('player-left', {
                        playerCount: game.players.size,
                        players: Array.from(game.players.values()).map(p => ({ nickname: p.nickname }))
                    });
                }
            }
            playerSockets.delete(socket.id);
        }
    });
});

// Helper function to find game by host socket ID
function findGameByHost(hostSocketId) {
    for (const game of games.values()) {
        if (game.hostSocketId === hostSocketId) {
            return game;
        }
    }
    return null;
}

const PORT = process.env.PORT || 3000;

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

server.listen(PORT, () => {
    console.log(`🧩 Sumana's Quiz Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to start playing!`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.log(`💡 Try using a different port: PORT=3001 npm run dev`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});
