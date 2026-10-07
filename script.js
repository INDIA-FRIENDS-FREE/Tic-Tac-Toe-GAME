 // स्टेट वैरिएबल्स
let boardState = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;
let playerAllTimeScore = 0;
let computerAllTimeScore = 0;
const targetScore = 5;
let isSoundOn = true; // साउंड ऑन/ऑफ स्टेट

// DOM एलिमेंट्स
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('status-message');
const playerScoreText = document.getElementById('player-score');
const computerScoreText = document.getElementById('computer-score');
const resetRoundBtn = document.getElementById('reset-round-btn');
const resetAllBtn = document.getElementById('reset-all-btn');
const themeButtons = document.querySelectorAll('.theme-btn');
const difficultySelect = document.getElementById('difficulty-select');
const soundToggleBtn = document.getElementById('sound-toggle-btn');

// जीतने के पैटर्न
const winningConditions = [, [3, 4, 5], [6, 7, 8], // Rows, [1, 4, 7], [2, 5, 8], // Columns, [2, 4, 6]             // Diagonals
];

// इवेंट लिसनर्स
cells.forEach(cell => {
    cell.addEventListener('click', () => handleCellClick(cell));
});

resetRoundBtn.addEventListener('click', resetRound);
resetAllBtn.addEventListener('click', resetFullMatch);
difficultySelect.addEventListener('change', resetRound);

// थीम चेंज लॉजिक
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const selectedTheme = btn.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', selectedTheme);
        playSound('theme');
    });
});

// === साउंड ऑन/ऑफ करने का बटन लॉजिक ===
soundToggleBtn.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    if (isSoundOn) {
        soundToggleBtn.textContent = "🔊";
    } else {
        soundToggleBtn.textContent = "🔇";
    }
});

// === कोड से रीयल-टाइम साउंड पैदा करने का फंक्शन ===
function playSound(type) {
    if (!isSoundOn) return;

    // ब्राउज़र का ऑडियो कॉन्टेक्स्ट बनाना
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'clickX') {
        // प्लेयर की चाल की आवाज़ (हल्की क्रिस्प बीप)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 नोट
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } 
    else if (type === 'clickO') {
        // कंप्यूटर की चाल की आवाज़ (थोड़ी भारी बीप)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4 नोट
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } 
    else if (type === 'win') {
        // जीतने की आवाज़ (शानदार डबल बीप)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    }
    else if (type === 'theme') {
        // थीम चेंज होने की प्यारी सी साउंड
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
    }
}

function handleCellClick(cell) {
    const clickedCellIndex = parseInt(cell.getAttribute('data-index'));
    if (boardState[clickedCellIndex] !== "" || !isGameActive) return;

    makeMove(clickedCellIndex, "X");
    playSound('clickX'); // प्लेयर साउंड

    if (checkResult("X")) return;

    if (boardState.includes("")) {
        isGameActive = false;
        statusMessage.textContent = "कंप्यूटर सोच रहा है...";
        setTimeout(() => { 
            computerMove(); 
        }, 400);
    }
}

function makeMove(index, playerSign) {
    boardState[index] = playerSign;
    cells[index].textContent = playerSign;
    cells[index].classList.add(playerSign.toLowerCase());
}

function computerMove() {
    const level = difficultySelect.value;
    let chosenMove = null;

    let availableCells = [];
    boardState.forEach((val, idx) => { if (val === "") availableCells.push(idx); });

    if (level === "easy") {
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        chosenMove = availableCells[randomIndex];
    } 
    else if (level === "medium") {
        chosenMove = findSmartMove("O") || findSmartMove("X");
        if (chosenMove === null) {
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            chosenMove = availableCells[randomIndex];
        }
    } 
    else if (level === "hard") {
        chosenMove = getBestMove();
    }

    makeMove(chosenMove, "O");
    playSound('clickO'); // कंप्यूटर साउंड
    isGameActive = true;
    if (checkResult("O")) return;
    statusMessage.textContent = "आपकी चाल (X)";
}

function findSmartMove(playerSign) {
    for (let condition of winningConditions) {
        let count = 0;
        let emptyIdx = null;
        for (let idx of condition) {
            if (boardState[idx] === playerSign) count++;
            else if (boardState[idx] === "") emptyIdx = idx;
        }
        if (count === 2 && emptyIdx !== null) return emptyIdx;
    }
    return null;
}

function getBestMove() {
    let bestScore = -Infinity;
    let move = null;
    for (let i = 0; i < 9; i++) {
        if (boardState[i] === "") {
            boardState[i] = "O";
            let score = minimax(boardState, 0, false);
            boardState[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(state, depth, isMaximizing) {
    let result = checkWinningForMinimax();
    if (result === "O") return 10 - depth;
    if (result === "X") return depth - 10;
    if (!state.includes("")) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (state[i] === "") {
                state[i] = "O";
                let score = minimax(state, depth + 1, false);
                state[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (state[i] === "") {
                state[i] = "X";
                let score = minimax(state, depth + 1, true);
                state[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinningForMinimax() {
    for (let condition of winningConditions) {
        if (boardState[condition[0]] !== "" &&
            boardState[condition[0]] === boardState[condition[1]] &&
            boardState[condition[0]] === boardState[condition[2]]) {
            return boardState[condition[0]];
        }
    }
    return null;
}

function checkResult(playerSign) {
    let roundWon = false;
    for (let condition of winningConditions) {
        if (boardState[condition[0]] === playerSign && 
            boardState[condition[1]] === playerSign && 
            boardState[condition[2]] === playerSign) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        isGameActive = false;
        playSound('win'); // जीत की शानदार साउंड
        if (playerSign === "X") {
            playerAllTimeScore++;
            playerScoreText.textContent = playerAllTimeScore;
            statusMessage.textContent = "🎉 आप यह राउंड जीत गए!";
        } else {
            computerAllTimeScore++;
            computerScoreText.textContent = computerAllTimeScore;
            statusMessage.textContent = "🤖 कंप्यूटर यह राउंड जीत गया!";
        }
        checkSeriesWinner();
        return true;
    }

    if (!boardState.includes("")) {
        statusMessage.textContent = "🤝 मुकाबला ड्रॉ रहा!";
        isGameActive = false;
        return true;
    }
    return false;
}

function checkSeriesWinner() {
    if (playerAllTimeScore === targetScore) {
        statusMessage.textContent = "👑 आप पूरा मैच (5-Score) जीत गए!";
        disableControls();
    } else if (computerAllTimeScore === targetScore) {
        statusMessage.textContent = "💻 कंप्यूटर पूरा मैच (5-Score) जीत गया।";
        disableControls();
    }
}

function disableControls() {
    isGameActive = false;
    resetRoundBtn.style.display = "none";
}

function resetRound() {
    boardState = ["", "", "", "", "", "", "", "", ""];
    isGameActive = true;
    statusMessage.textContent = "आपकी चाल (X)";
    cells.forEach(cell => {
        cell.textContent = "";
        cell.className = "cell";
    });
}

function resetFullMatch() {
    playerAllTimeScore = 0;
    computerAllTimeScore = 0;
    playerScoreText.textContent = "0";
    computerScoreText.textContent = "0";
    resetRoundBtn.style.display = "block";
    resetRound();
}
