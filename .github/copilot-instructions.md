<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Sumana's Quiz Multiplayer Web App - Copilot Instructions

This is a real-time multiplayer emoji quiz game built with Node.js, Express, Socket.io, and vanilla JavaScript.

## Project Structure
- `server.js` - Main server file with Socket.io event handling and game logic
- `public/` - Static files served to clients
  - `index.html` - Landing page
  - `host.html` - Host dashboard interface
  - `player.html` - Player game interface
  - `css/styles.css` - Comprehensive CSS styling
  - `js/host.js` - Host-side JavaScript
  - `js/player.js` - Player-side JavaScript

## Key Features
- Real-time multiplayer game rooms with unique codes
- Host can create emoji/rebus questions and control game flow
- Players join with nicknames and see live questions
- Shared public chat where all answers are visible
- Timer-based rounds with speed-based scoring
- Live leaderboards with points calculation
- Responsive design for all screen sizes

## Technology Stack
- Backend: Node.js, Express, Socket.io
- Frontend: Vanilla HTML/CSS/JavaScript
- Real-time: WebSockets via Socket.io
- Styling: Custom CSS with gradients and animations

## Code Style Guidelines
- Use modern ES6+ JavaScript features
- Follow semantic HTML structure
- Use CSS Grid and Flexbox for layouts
- Implement responsive design principles
- Handle Socket.io events with proper error handling
- Use consistent naming conventions
- Add proper error messages and user feedback

## Socket.io Events
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

## Game Flow
1. Host creates game and gets unique code
2. Host adds emoji/rebus questions
3. Players join using game code
4. Host starts game
5. Questions displayed with timer
6. Players type answers in shared chat
7. Host reveals correct answer
8. Leaderboard updates with scores
9. Continue to next question or end game

When working on this project, prioritize:
- Real-time functionality and Socket.io integration
- User experience and interface responsiveness
- Error handling and edge cases
- Cross-browser compatibility
- Mobile-friendly design
