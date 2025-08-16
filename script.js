// Game state
let board = Array(9).fill('');
let currentPlayer = 'X';
let gameMode = 'player'; // 'player' or 'computer'
let gameActive = true;
let scores = { X: 0, O: 0, draw: 0 };

// Winning combinations
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
];

// Theme management
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (body.getAttribute('data-theme') === 'light') {
        body.removeAttribute('data-theme');
        themeToggle.innerHTML = '🌙 Dark';
    } else {
        body.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '☀️ Light';
    }
}

// Game mode management
function setGameMode(mode) {
    gameMode = mode;
    resetGame();
    
    // Update active button
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // Update score labels
    const scoreLabels = document.querySelectorAll('.score-label');
    if (mode === 'computer') {
        scoreLabels[0].textContent = 'Player (X)';
        scoreLabels[2].textContent = 'Computer (O)';
    } else {
        scoreLabels[0].textContent = 'Player X';
        scoreLabels[2].textContent = 'Player O';
    }
}

// Make a move
function makeMove(index) {
    if (!gameActive || board[index] !== '') return;

    board[index] = currentPlayer;
    updateCell(index, currentPlayer);
    
    if (checkWinner()) {
        endGame(currentPlayer);
    } else if (board.every(cell => cell !== '')) {
        endGame('draw');
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateGameInfo();
        
        // Computer move
        if (gameMode === 'computer' && currentPlayer === 'O' && gameActive) {
            setTimeout(computerMove, 500);
        }
    }
}

// Computer AI (using minimax algorithm)
function computerMove() {
    const bestMove = getBestMove();
    makeMove(bestMove);
}

function getBestMove() {
    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    const winner = checkWinnerForMinimax();
    if (winner === 'O') return 1;
    if (winner === 'X') return -1;
    if (board.every(cell => cell !== '')) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinnerForMinimax() {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

// Update cell display
function updateCell(index, player) {
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
    cell.classList.add('disabled');
}

// Check for winner
function checkWinner() {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            highlightWinningCells(combination);
            return true;
        }
    }
    return false;
}

// Highlight winning cells
function highlightWinningCells(combination) {
    combination.forEach(index => {
        document.querySelector(`[data-index="${index}"]`).classList.add('winning');
    });
}

// Update game info
function updateGameInfo() {
    const gameInfo = document.getElementById('gameInfo');
    if (gameActive) {
        if (gameMode === 'computer' && currentPlayer === 'O') {
            gameInfo.innerHTML = '<span class="current-player">Computer is thinking...</span>';
        } else {
            const playerName = gameMode === 'computer' && currentPlayer === 'O' ? 'Computer' : `Player ${currentPlayer}`;
            gameInfo.innerHTML = `<span class="current-player">${playerName}'s turn</span>`;
        }
    }
}

// End game
function endGame(winner) {
    gameActive = false;
    updateScore(winner);
    showResult(winner);
    
    // Disable all cells
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.add('disabled');
    });
}

// Update score
function updateScore(winner) {
    if (winner === 'draw') {
        scores.draw++;
    } else {
        scores[winner]++;
    }
    
    document.getElementById('scoreX').textContent = scores.X;
    document.getElementById('scoreO').textContent = scores.O;
    document.getElementById('scoreDraw').textContent = scores.draw;
}

// Show result modal
function showResult(winner) {
    const resultModal = document.getElementById('gameResult');
    const resultText = document.getElementById('resultText');
    
    if (winner === 'draw') {
        resultText.innerHTML = '<span class="draw">It\'s a Draw! 🤝</span>';
    } else {
        const playerName = gameMode === 'computer' && winner === 'O' ? 'Computer' : `Player ${winner}`;
        const winnerClass = winner === 'X' ? 'winner-x' : 'winner-o';
        const emoji = winner === 'X' ? '🎉' : '🤖';
        resultText.innerHTML = `<span class="${winnerClass}">${playerName} Wins! ${emoji}</span>`;
    }
    
    resultModal.classList.add('show');
}

// Close result modal
function closeResult() {
    document.getElementById('gameResult').classList.remove('show');
    resetGame();
}

// Reset game
function resetGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    
    // Clear board
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });
    
    updateGameInfo();
}

// Reset score
function resetScore() {
    scores = { X: 0, O: 0, draw: 0 };
    document.getElementById('scoreX').textContent = '0';
    document.getElementById('scoreO').textContent = '0';
    document.getElementById('scoreDraw').textContent = '0';
}

// Initialize game
updateGameInfo();

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        makeMove(index);
    }
    if (e.key === 'r' || e.key === 'R') {
        resetGame();
    }
    if (e.key === 't' || e.key === 'T') {
        toggleTheme();
    }
});
