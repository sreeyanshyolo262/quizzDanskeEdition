// Host Dashboard JavaScript
const socket = io();

// DOM Elements
const createSection = document.getElementById('create-section');
const setupSection = document.getElementById('setup-section');
const playingSection = document.getElementById('playing-section');
const answerSection = document.getElementById('answer-section');
const finishedSection = document.getElementById('finished-section');

const createGameBtn = document.getElementById('create-game-btn');
const gameCodeDisplay = document.getElementById('game-code');
const questionInput = document.getElementById('question-input');
const answerInput = document.getElementById('answer-input');
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const textQuestionForm = document.getElementById('text-question-form');
const imageQuestionForm = document.getElementById('image-question-form');
const addQuestionBtn = document.getElementById('add-question-btn');
const addSampleBtn = document.getElementById('add-sample-btn');
const startGameBtn = document.getElementById('start-game-btn');
const questionsDisplay = document.getElementById('questions-display');
const questionCountDisplay = document.getElementById('question-count');
const playersListDisplay = document.getElementById('players-list');
const playerCountDisplay = document.getElementById('player-count');

const currentQuestionDisplay = document.getElementById('current-question');
const currentQuestionNum = document.getElementById('current-question-num');
const totalQuestionsDisplay = document.getElementById('total-questions');
const chatMessages = document.getElementById('chat-messages');
const answeredCountDisplay = document.getElementById('answered-count');
const totalPlayersDisplay = document.getElementById('total-players');
const revealAnswerBtn = document.getElementById('reveal-answer-btn');
const nextQuestionBtn = document.getElementById('next-question-btn');

const correctAnswerDisplay = document.getElementById('correct-answer');
const leaderboardDisplay = document.getElementById('leaderboard');
const continueBtn = document.getElementById('continue-btn');

const finalLeaderboardDisplay = document.getElementById('final-leaderboard');

// Game state
let gameState = {
    questions: [],
    players: [],
    currentQuestionIndex: 0,
    gameCode: '',
    answeredPlayers: new Set()
};

// Event Listeners
createGameBtn.addEventListener('click', createGame);
addQuestionBtn.addEventListener('click', addQuestion);
addSampleBtn.addEventListener('click', addSampleQuestions);
startGameBtn.addEventListener('click', startGame);
revealAnswerBtn.addEventListener('click', revealAnswer);
nextQuestionBtn.addEventListener('click', nextQuestion);
continueBtn.addEventListener('click', nextQuestion);

// Enter key listeners
questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        answerInput.focus();
    }
});

answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addQuestion();
    }
});

// Socket event listeners
socket.on('game-created', (data) => {
    gameState.gameCode = data.gameCode;
    gameCodeDisplay.textContent = data.gameCode;
    createSection.classList.add('hidden');
    setupSection.classList.remove('hidden');
    showNotification('Game created successfully! Share the code with players.', 'success');
});

socket.on('player-joined', (data) => {
    gameState.players = data.players;
    updatePlayersDisplay(data.players, data.playerCount);
    showNotification(`${data.nickname} joined the game!`, 'info');
});

socket.on('player-left', (data) => {
    gameState.players = data.players;
    updatePlayersDisplay(data.players, data.playerCount);
});

socket.on('question-added', (data) => {
    if (data.success) {
        questionCountDisplay.textContent = data.questionCount;
        updateStartButton();
        showNotification('Question added successfully!', 'success');
    }
});

socket.on('chat-message', (data) => {
    addChatMessage(data.nickname, data.message, data.timestamp, data.isCorrect);
});

// Socket listener for player answers
socket.on('player-answered', (data) => {
    // Update answer count
    updateAnswerCount();
});

socket.on('new-question', () => {
    // Reset answer count for new question
    gameState.answeredPlayers = new Set();
    updateAnswerCount();
});

// Functions
function createGame() {
    createGameBtn.disabled = true;
    createGameBtn.innerHTML = '<span class="btn-icon">⏳</span> Creating...';
    socket.emit('create-game');
}

function addQuestion() {
    const questionType = document.querySelector('input[name="questionType"]:checked').value;
    const answer = answerInput.value.trim();
    
    if (!answer) {
        showNotification('Please enter an answer!', 'error');
        return;
    }
    
    if (questionType === 'text') {
        const question = questionInput.value.trim();
        if (!question) {
            showNotification('Please enter a question!', 'error');
            return;
        }
        
        addTextQuestion(question, answer);
    } else {
        const imageFile = imageInput.files[0];
        if (!imageFile) {
            showNotification('Please select an image!', 'error');
            return;
        }
        
        addImageQuestion(imageFile, answer);
    }
}

function addTextQuestion(question, answer) {
    socket.emit('add-question', {
        question: question,
        answer: answer,
        type: 'text'
    });
    
    // Add to local display
    gameState.questions.push({ question, answer, type: 'text' });
    updateQuestionsDisplay();
    
    // Clear inputs
    questionInput.value = '';
    answerInput.value = '';
    questionInput.focus();
}

async function addImageQuestion(imageFile, answer) {
    const formData = new FormData();
    formData.append('questionImage', imageFile);
    
    try {
        addQuestionBtn.disabled = true;
        addQuestionBtn.innerHTML = '<span class="btn-icon">⏳</span> Uploading...';
        
        const response = await fetch('/upload-image', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            socket.emit('add-question', {
                question: result.path,
                answer: answer,
                type: 'image',
                filename: result.filename
            });
            
            // Add to local display
            gameState.questions.push({ 
                question: result.path, 
                answer, 
                type: 'image',
                filename: result.filename 
            });
            updateQuestionsDisplay();
            
            // Clear inputs
            imageInput.value = '';
            imagePreview.classList.add('hidden');
            answerInput.value = '';
            
            showNotification('Image question added successfully!', 'success');
        } else {
            showNotification('Failed to upload image: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('Error uploading image: ' + error.message, 'error');
    } finally {
        addQuestionBtn.disabled = false;
        addQuestionBtn.innerHTML = '<span class="btn-icon">➕</span> Add Question';
    }
}

function updateQuestionsDisplay() {
    questionsDisplay.innerHTML = '';
    gameState.questions.forEach((q, index) => {
        const li = document.createElement('li');
        if (q.type === 'image') {
            li.innerHTML = `<strong>Q${index + 1}:</strong> 🖼️ Image Question <em>(Answer: ${q.answer})</em>`;
        } else {
            li.innerHTML = `<strong>Q${index + 1}:</strong> ${q.question} <em>(Answer: ${q.answer})</em>`;
        }
        questionsDisplay.appendChild(li);
    });
}

function updateStartButton() {
    const questionCount = parseInt(questionCountDisplay.textContent);
    if (questionCount > 0) {
        startGameBtn.disabled = false;
        startGameBtn.querySelector('span').textContent = '🚀';
        document.querySelector('.requirement').textContent = 'Ready to start!';
    }
}

function updatePlayersDisplay(players, count) {
    playerCountDisplay.textContent = count;
    
    if (count === 0) {
        playersListDisplay.innerHTML = '<p class="no-players">No players yet. Share the game code!</p>';
    } else {
        playersListDisplay.innerHTML = '';
        players.forEach(player => {
            const div = document.createElement('div');
            div.className = 'player-item';
            div.innerHTML = `
                <span class="player-emoji">👤</span>
                <span class="player-name">${player.nickname}</span>
            `;
            playersListDisplay.appendChild(div);
        });
    }
}

function startGame() {
    if (gameState.questions.length === 0) {
        showNotification('Add at least one question to start!', 'error');
        return;
    }
    
    startGameBtn.disabled = true;
    startGameBtn.innerHTML = '<span class="btn-icon">⏳</span> Starting...';
    
    socket.emit('start-game');
    
    // Switch to playing view
    setupSection.classList.add('hidden');
    playingSection.classList.remove('hidden');
    
    // Display first question
    gameState.currentQuestionIndex = 0;
    displayCurrentQuestion();
    
    showNotification('Game started! Good luck!', 'success');
}

function displayCurrentQuestion() {
    const question = gameState.questions[gameState.currentQuestionIndex];
    
    if (question.type === 'image') {
        currentQuestionDisplay.innerHTML = `<img src="${question.question}" alt="Question image" style="max-width: 100%; max-height: 300px; border-radius: 10px;">`;
    } else {
        currentQuestionDisplay.textContent = question.question;
    }
    
    currentQuestionNum.textContent = gameState.currentQuestionIndex + 1;
    totalQuestionsDisplay.textContent = gameState.questions.length;
    
    // Clear chat and reset answer tracking
    chatMessages.innerHTML = '';
    gameState.answeredPlayers.clear();
    updateAnswerCount();
    
    // Reset buttons
    revealAnswerBtn.classList.remove('hidden');
    nextQuestionBtn.classList.add('hidden');
}

function updateAnswerCount() {
    const answered = gameState.answeredPlayers.size;
    const total = gameState.players.length;
    
    if (answeredCountDisplay && totalPlayersDisplay) {
        answeredCountDisplay.textContent = answered;
        totalPlayersDisplay.textContent = total;
    }
}

function addChatMessage(nickname, message, timestamp, isCorrect = false) {
    // Track answered players
    gameState.answeredPlayers.add(nickname);
    updateAnswerCount();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    
    // Highlight correct answers
    if (isCorrect) {
        messageDiv.classList.add('correct');
    }
    
    const time = new Date(timestamp).toLocaleTimeString();
    const correctIcon = isCorrect ? ' ✅' : '';
    messageDiv.innerHTML = `
        <span class="nickname">${nickname}:</span>
        <span class="message">${message}${correctIcon}</span>
        <span class="timestamp">${time}</span>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function revealAnswer() {
    socket.emit('reveal-answer');
    
    // Switch to answer view
    playingSection.classList.add('hidden');
    answerSection.classList.remove('hidden');
    
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    correctAnswerDisplay.textContent = currentQuestion.answer;
}

function nextQuestion() {
    answerSection.classList.add('hidden');
    
    if (gameState.currentQuestionIndex + 1 < gameState.questions.length) {
        // More questions available
        socket.emit('next-question');
        playingSection.classList.remove('hidden');
        gameState.currentQuestionIndex++;
        displayCurrentQuestion();
    } else {
        // Game finished
        socket.emit('next-question'); // This will end the game
        finishedSection.classList.remove('hidden');
    }
}

// Socket listeners for game flow
socket.on('answer-revealed', (data) => {
    updateLeaderboard(data.leaderboard);
});

socket.on('game-ended', (data) => {
    finishedSection.classList.remove('hidden');
    answerSection.classList.add('hidden');
    playingSection.classList.add('hidden');
    updateFinalLeaderboard(data.finalLeaderboard);
});

function updateLeaderboard(leaderboard) {
    leaderboardDisplay.innerHTML = '';
    
    if (leaderboard.length === 0) {
        leaderboardDisplay.innerHTML = '<p class="no-players">No scores yet</p>';
        return;
    }
    
    leaderboard.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'leaderboard-item';
        
        if (index === 0) div.classList.add('first');
        else if (index === 1) div.classList.add('second');
        else if (index === 2) div.classList.add('third');
        
        const rank = index + 1;
        let rankEmoji = '🏅';
        if (rank === 1) rankEmoji = '🥇';
        else if (rank === 2) rankEmoji = '🥈';
        else if (rank === 3) rankEmoji = '🥉';
        
        div.innerHTML = `
            <span class="player-rank">${rankEmoji} ${rank}</span>
            <span class="player-name">${player.nickname}</span>
            <span class="player-score">${player.score} pts</span>
        `;
        
        leaderboardDisplay.appendChild(div);
    });
}

function updateFinalLeaderboard(leaderboard) {
    finalLeaderboardDisplay.innerHTML = '';
    
    if (leaderboard.length === 0) {
        finalLeaderboardDisplay.innerHTML = '<p class="no-players">No players finished</p>';
        return;
    }
    
    leaderboard.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'leaderboard-item';
        
        if (index === 0) div.classList.add('first');
        else if (index === 1) div.classList.add('second');
        else if (index === 2) div.classList.add('third');
        
        const rank = index + 1;
        let rankEmoji = '🏅';
        if (rank === 1) rankEmoji = '🥇';
        else if (rank === 2) rankEmoji = '🥈';
        else if (rank === 3) rankEmoji = '🥉';
        
        div.innerHTML = `
            <span class="player-rank">${rankEmoji} ${rank}</span>
            <span class="player-name">${player.nickname}</span>
            <span class="player-score">${player.score} pts</span>
        `;
        
        finalLeaderboardDisplay.appendChild(div);
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#48bb78',
        error: '#f56565',
        info: '#4299e1',
        warning: '#ed8936'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function addSampleQuestions() {
    const sampleQuestions = [
        { question: "🐝 + 🍂", answer: "believe" },
        { question: "🌟 + 🐟", answer: "starfish" },
        { question: "👁️ + ❤️ + 🫵", answer: "i love you" },
        { question: "🐍 + 👁️", answer: "python" },
        { question: "🍎 + 🥧", answer: "apple pie" }
    ];
    
    sampleQuestions.forEach((q, index) => {
        setTimeout(() => {
            socket.emit('add-question', {
                question: q.question,
                answer: q.answer,
                type: 'text'
            });
            
            // Add to local display
            gameState.questions.push(q);
            updateQuestionsDisplay();
        }, index * 100); // Small delay to avoid overwhelming the server
    });
    
    showNotification(`Added ${sampleQuestions.length} sample questions!`, 'success');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);

// Question type selector handling
document.querySelectorAll('input[name="questionType"]').forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'text') {
            textQuestionForm.classList.remove('hidden');
            imageQuestionForm.classList.add('hidden');
        } else {
            textQuestionForm.classList.add('hidden');
            imageQuestionForm.classList.remove('hidden');
        }
    });
});

// Image upload preview
imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Question image preview">`;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.classList.add('hidden');
    }
});
