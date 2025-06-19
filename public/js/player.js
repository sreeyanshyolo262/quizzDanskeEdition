// Player Interface JavaScript
const socket = io();

// DOM Elements
const joinSection = document.getElementById('join-section');
const lobbySection = document.getElementById('lobby-section');
const playingSection = document.getElementById('playing-section');
const answerRevealedSection = document.getElementById('answer-revealed-section');
const finishedSection = document.getElementById('finished-section-player');
const disconnectedSection = document.getElementById('disconnected-section');

const gameCodeInput = document.getElementById('game-code-input');
const nicknameInput = document.getElementById('nickname-input');
const joinGameBtn = document.getElementById('join-game-btn');
const joinError = document.getElementById('join-error');

const joinedGameCodeDisplay = document.getElementById('joined-game-code');
const playerNicknameDisplay = document.getElementById('player-nickname');
const lobbyPlayersListDisplay = document.getElementById('lobby-players-list');
const lobbyPlayerCountDisplay = document.getElementById('lobby-player-count');

const questionNumberDisplay = document.getElementById('question-number');
const totalQuestionsPlayerDisplay = document.getElementById('total-questions-player');
const currentQuestionPlayerDisplay = document.getElementById('current-question-player');
const answerInputPlayer = document.getElementById('answer-input-player');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const answerStatus = document.getElementById('answer-status');
const chatMessagesPlayer = document.getElementById('chat-messages-player');

const correctAnswerPlayerDisplay = document.getElementById('correct-answer-player');
const leaderboardPlayerDisplay = document.getElementById('leaderboard-player');

const finalLeaderboardPlayerDisplay = document.getElementById('final-leaderboard-player');

// Game state
let playerState = {
    gameCode: '',
    nickname: '',
    playerId: '',
    hasAnsweredCorrectly: false
};

// Event Listeners
joinGameBtn.addEventListener('click', joinGame);
submitAnswerBtn.addEventListener('click', submitAnswer);

// Enter key listeners
gameCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        nicknameInput.focus();
    }
});

nicknameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinGame();
    }
});

answerInputPlayer.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitAnswer();
    }
});

// Auto-uppercase game code input
gameCodeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
});

// Socket event listeners
socket.on('joined-game', (data) => {
    if (data.success) {
        playerState.gameCode = data.gameCode;
        playerState.playerId = data.playerId;
        
        joinedGameCodeDisplay.textContent = data.gameCode;
        playerNicknameDisplay.textContent = playerState.nickname;
        
        joinSection.classList.add('hidden');
        lobbySection.classList.remove('hidden');
        
        showNotification('Successfully joined the game!', 'success');
    }
});

socket.on('join-error', (data) => {
    joinError.textContent = data.message;
    joinError.classList.remove('hidden');
    joinGameBtn.disabled = false;
    joinGameBtn.innerHTML = '<span class="btn-icon">🚀</span> Join Game';
});

socket.on('player-joined', (data) => {
    updateLobbyPlayersDisplay(data.players, data.playerCount);
});

socket.on('player-left', (data) => {
    updateLobbyPlayersDisplay(data.players, data.playerCount);
});

socket.on('game-started', () => {
    lobbySection.classList.add('hidden');
    playingSection.classList.remove('hidden');
    showNotification('Game started! Good luck!', 'success');
});

socket.on('new-question', (data) => {
    // Reset for new question
    playerState.hasAnsweredCorrectly = false;
    answerInputPlayer.value = '';
    answerInputPlayer.disabled = false;
    submitAnswerBtn.disabled = false;
    submitAnswerBtn.innerHTML = '<span class="btn-icon">📝</span>';
    answerStatus.classList.add('hidden');
    chatMessagesPlayer.innerHTML = '';
      // Update displays
    questionNumberDisplay.textContent = data.questionNumber;
    totalQuestionsPlayerDisplay.textContent = data.totalQuestions;
    
    // Handle both text and image questions
    if (data.type === 'image') {
        currentQuestionPlayerDisplay.innerHTML = `<img src="${data.question}" alt="Question image">`;
    } else {
        currentQuestionPlayerDisplay.textContent = data.question;
    }
    
    // Show playing section if not already visible
    answerRevealedSection.classList.add('hidden');
    playingSection.classList.remove('hidden');
    
    // Focus on answer input
    answerInputPlayer.focus();
});

socket.on('chat-message', (data) => {
    addChatMessage(data.nickname, data.message, data.timestamp, data.isCorrect);
});

socket.on('answer-submitted', (data) => {
    if (data.correct) {
        playerState.hasAnsweredCorrectly = true;
        answerInputPlayer.disabled = true;
        submitAnswerBtn.disabled = true;
        submitAnswerBtn.innerHTML = '<span class="btn-icon">✅</span>';
        
        const positionText = data.position === 1 ? '1st' : 
                           data.position === 2 ? '2nd' : 
                           data.position === 3 ? '3rd' : 
                           `${data.position}th`;
        
        answerStatus.textContent = `🎉 Correct! You were ${positionText} to guess it and earned ${data.points} points!`;
        answerStatus.className = 'answer-status submitted correct';
        answerStatus.classList.remove('hidden');
        
        showNotification(`Correct! +${data.points} points!`, 'success');
    } else {
        // Allow continued guessing
        answerInputPlayer.value = '';
        answerInputPlayer.focus();
    }
});

socket.on('answer-revealed', (data) => {
    playingSection.classList.add('hidden');
    answerRevealedSection.classList.remove('hidden');
    
    correctAnswerPlayerDisplay.textContent = data.correctAnswer;
    updateLeaderboard(data.leaderboard);
});

socket.on('game-ended', (data) => {
    answerRevealedSection.classList.add('hidden');
    playingSection.classList.add('hidden');
    finishedSection.classList.remove('hidden');
    
    updateFinalLeaderboard(data.finalLeaderboard);
    showNotification('Game completed! Thanks for playing!', 'success');
});

socket.on('host-disconnected', () => {
    // Hide all sections and show disconnected
    joinSection.classList.add('hidden');
    lobbySection.classList.add('hidden');
    playingSection.classList.add('hidden');
    answerRevealedSection.classList.add('hidden');
    finishedSection.classList.add('hidden');
    disconnectedSection.classList.remove('hidden');
    
    showNotification('Host disconnected. Game ended.', 'error');
});

socket.on('leaderboard-update', (data) => {
    // Update leaderboard in real-time when someone gets a correct answer
    if (answerRevealedSection.classList.contains('hidden')) {
        // We're still in the playing phase, just update scores silently
        console.log('Leaderboard updated:', data.leaderboard);
    }
});

// Functions
function joinGame() {
    const gameCode = gameCodeInput.value.trim().toUpperCase();
    const nickname = nicknameInput.value.trim();
    
    // Hide previous errors
    joinError.classList.add('hidden');
    
    if (!gameCode || gameCode.length !== 6) {
        joinError.textContent = 'Please enter a valid 6-character game code!';
        joinError.classList.remove('hidden');
        return;
    }
    
    if (!nickname || nickname.length < 2) {
        joinError.textContent = 'Please enter a nickname (at least 2 characters)!';
        joinError.classList.remove('hidden');
        return;
    }
    
    if (nickname.length > 20) {
        joinError.textContent = 'Nickname must be 20 characters or less!';
        joinError.classList.remove('hidden');
        return;
    }
    
    playerState.nickname = nickname;
    
    joinGameBtn.disabled = true;
    joinGameBtn.innerHTML = '<span class="btn-icon">⏳</span> Joining...';
    
    socket.emit('join-game', {
        gameCode: gameCode,
        nickname: nickname
    });
}

function submitAnswer() {
    const answer = answerInputPlayer.value.trim();
    
    if (!answer) {
        showNotification('Please enter an answer!', 'error');
        return;
    }
    
    if (playerState.hasAnsweredCorrectly) {
        showNotification('You already got it right!', 'warning');
        return;
    }
    
    socket.emit('submit-answer', {
        answer: answer
    });
}

function updateLobbyPlayersDisplay(players, count) {
    lobbyPlayerCountDisplay.textContent = count;
    
    if (count === 0) {
        lobbyPlayersListDisplay.innerHTML = '<p class="no-players">No players yet</p>';
    } else {
        lobbyPlayersListDisplay.innerHTML = '';
        players.forEach(player => {
            const div = document.createElement('div');
            div.className = 'player-item';
            div.innerHTML = `
                <span class="player-emoji">👤</span>
                <span class="player-name">${player.nickname}</span>
            `;
            lobbyPlayersListDisplay.appendChild(div);
        });
    }
}

function addChatMessage(nickname, message, timestamp, isCorrect = false, isSystemMessage = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    
    // Handle system messages (correct guesses)
    if (isSystemMessage && isCorrect) {
        messageDiv.classList.add('correct', 'system');
        messageDiv.innerHTML = `
            <span class="system-message">🎉 <strong>${nickname}</strong> ${message}</span>
            <span class="timestamp">${new Date(timestamp).toLocaleTimeString()}</span>
        `;
    } else {
        // Regular chat messages
        // Highlight own messages
        if (nickname === playerState.nickname) {
            messageDiv.classList.add('own');
        }
        
        const time = new Date(timestamp).toLocaleTimeString();
        messageDiv.innerHTML = `
            <span class="nickname">${nickname}:</span>
            <span class="message">${message}</span>
            <span class="timestamp">${time}</span>
        `;
    }
    
    chatMessagesPlayer.appendChild(messageDiv);
    chatMessagesPlayer.scrollTop = chatMessagesPlayer.scrollHeight;
}

function updateLeaderboard(leaderboard) {
    leaderboardPlayerDisplay.innerHTML = '';
    
    if (leaderboard.length === 0) {
        leaderboardPlayerDisplay.innerHTML = '<p class="no-players">No scores yet</p>';
        return;
    }
    
    leaderboard.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'leaderboard-item';
        
        // Highlight current player
        if (player.nickname === playerState.nickname) {
            div.style.backgroundColor = '#e6fffa';
            div.style.border = '2px solid #4fd1c7';
        }
        
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
        
        leaderboardPlayerDisplay.appendChild(div);
    });
}

function updateFinalLeaderboard(leaderboard) {
    finalLeaderboardPlayerDisplay.innerHTML = '';
    
    if (leaderboard.length === 0) {
        finalLeaderboardPlayerDisplay.innerHTML = '<p class="no-players">No players finished</p>';
        return;
    }
    
    leaderboard.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'leaderboard-item';
        
        // Highlight current player
        if (player.nickname === playerState.nickname) {
            div.style.backgroundColor = '#e6fffa';
            div.style.border = '2px solid #4fd1c7';
        }
        
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
        
        finalLeaderboardPlayerDisplay.appendChild(div);
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
        max-width: 300px;
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
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
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
