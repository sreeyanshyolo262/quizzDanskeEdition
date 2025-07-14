# 🧩Quiz Web App 

A real-time multiplayer visual quiz game inspired by Scribbl.io! Host uploads images as questions, and players guess continuously in a shared chat until they get it right.

## 🎯 Overview
<img width="1603" height="997" alt="Screenshot 2025-07-14 121132" src="https://github.com/user-attachments/assets/1f41aaf2-3722-4b68-aeee-d0c55da9a85a" />

This web application brings the excitement of Scribbl.io-style guessing games to your browser. Hosts can upload images or create emoji puzzles, while players join using unique codes and guess continuously in a shared public chat. Points are awarded based on accuracy and speed - first to guess correctly gets the most points!

## ✨ Key Features

### 🖼️ **Scribbl.io-Style Gameplay**
- **Image Upload**: Hosts can upload images as visual questions
- **Continuous Guessing**: Players can keep guessing until they get it right
- **Live Chat**: All guesses appear in real-time shared chat
- **Instant Feedback**: Correct answers are highlighted with ✅
- **Speed Scoring**: First correct answers get bonus points

### 🧑‍💼 Host Features
- **Dual Question Types**: Upload images OR create text/emoji questions
- **Image Preview**: See uploaded images before adding to game
- **Real-time Monitoring**: Watch all player guesses in live chat
- **Answer Highlighting**: Correct answers are visually highlighted
- **Flexible Control**: Reveal answers and progress at your pace

### 🎮 Player Features  
- **Scribbl.io Layout**: Game area with image display + chat sidebar
- **Multiple Attempts**: Keep guessing until you get it right
- **Visual Feedback**: Your own messages highlighted in chat
- **Instant Results**: Know immediately if your answer is correct
- **Responsive Design**: Works perfectly on all devices

## ✨ Features

### 🧑‍💼 Host Features
- **Create Games**: Generate unique 6-character game codes
- **Question Management**: Add emoji and rebus puzzles with answers
- **Game Control**: Start games, reveal answers, and manage timer
- **Real-time Monitoring**: See live player answers and chat
- **Leaderboard Management**: View and control scoring system

### 🎮 Player Features
- **Easy Join**: Enter nickname and game code to join
- **Live Gameplay**: See questions and timer in real-time
- **Interactive Chat**: Type answers in shared public chat
- **Instant Feedback**: See leaderboard updates after each round
- **Responsive Design**: Works on desktop and mobile devices

### 🎪 Game Features
- **Real-time Communication**: Powered by Socket.io WebSockets
- **Smart Scoring**: Points based on accuracy and speed
- **Live Chat**: All players see each other's answers
- **Timer System**: Configurable countdown for each question
- **Leaderboard**: Live ranking with podium positions
- **Emoji Puzzles**: Support for various emoji and text-based puzzles

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd quizzz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Production Deployment
```bash
npm start
```

## 🎮 How to Play

### For Hosts:
1. **Create Game**: Click "Host a Game" and get your unique game code
2. **Add Questions**: 
   - Choose "Text/Emoji Question" for traditional puzzles (🐝 + 🍂)
   - Choose "Image Question" to upload pictures for visual guessing
3. **Wait for Players**: Share the game code with participants
4. **Start Game**: Begin the quiz when ready
5. **Monitor Chat**: Watch all player guesses in real-time
6. **Control Flow**: Reveal answers and move to next questions

### For Players:
1. **Join Game**: Enter the 6-character game code and your nickname
2. **Wait in Lobby**: See other players joining
3. **View & Guess**: See the image/question and type guesses in chat
4. **Keep Trying**: Continue guessing until you get it right!
5. **Earn Points**: First correct answer gets the most points
6. **Check Leaderboard**: See your ranking after each round

## 🧩 Example Puzzles

| Puzzle | Answer |
|--------|--------|
| 🐝 + 🍂 | believe |
| 🌟 + 🐟 | starfish |
| 👁️ + ❤️ + 🫵 | I love you |
| miss<br/>-----<br/>stood | misunderstood |

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, Multer (file uploads)
- **Real-time**: Socket.io for WebSocket communication
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **File Storage**: Local file system for uploaded images
- **Styling**: Custom CSS with Scribbl.io-inspired layout
- **Package Management**: npm

## 📁 Project Structure

```
quizzz/
├── server.js              # Main server with Socket.io logic
├── package.json           # Dependencies and scripts
├── public/                # Static frontend files
│   ├── index.html         # Landing page
│   ├── host.html          # Host dashboard
│   ├── player.html        # Player interface
│   ├── css/
│   │   └── styles.css     # Comprehensive styling
│   └── js/
│       ├── host.js        # Host-side JavaScript
│       └── player.js      # Player-side JavaScript
└── .github/
    └── copilot-instructions.md
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)

### Game Settings (in server.js)
- `timerDuration`: Question timer in seconds (default: 30)
- `maxPlayers`: Maximum players per game
- `pointsSystem`: Scoring algorithm

## 🌐 API & Socket Events

### Host Events
- `create-game` - Creates new game room
- `add-question` - Adds question to game
- `start-game` - Begins the quiz
- `reveal-answer` - Shows correct answer
- `next-question` - Moves to next question

### Player Events
- `join-game` - Joins game with code and nickname
- `submit-answer` - Submits answer to current question

### Shared Events
- `timer-update` - Real-time timer updates
- `chat-message` - Live chat messages
- `leaderboard-update` - Score updates

## 🎨 Design Features

- **Modern UI**: Clean, gradient-based design
- **Responsive**: Works on all screen sizes
- **Animations**: Smooth transitions and feedback
- **Accessibility**: Clear contrast and readable fonts
- **Mobile-First**: Touch-friendly interface

## 🔒 Security Features

- **Input Validation**: Sanitized user inputs
- **Game Isolation**: Separate game rooms
- **Connection Management**: Proper disconnect handling
- **Rate Limiting**: Prevents spam and abuse

## 🚧 Future Enhancements

- [ ] Image upload for custom rebus puzzles
- [ ] Sound effects and background music
- [ ] Player avatars and profiles
- [ ] Game history and statistics
- [ ] Private rooms and passwords
- [ ] Question categories and difficulty levels
- [ ] Multiplayer tournaments
- [ ] Voice chat integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🎉 Credits

Perfect for office teams, remote meetings, and fun breaks! Inspired by popular quiz platforms like Kahoot and multiplayer games like Scribbl.io.

---

**Made with ❤️ for bringing teams together through fun and games!**
