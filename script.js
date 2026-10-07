 // स्टेट वैरिएबल्स
let boardState = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;
let playerAllTimeScore = 0;
let computerAllTimeScore = 0;
const targetScore = 5;
let isSoundOn = true; // साउंड ऑन/ऑफ स्टेट
let audioCtx = null; // ऑडियो कॉन्टेक्स्ट वैरिएबल जिसे बाद में एक्टिव करेंगे

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

// जीतने के पैटर्न (Winning Combinations) - यहाँ गलती सुधारी गई है
const winningConditions = [, [3, 4, 5], [6, 7, 8], // Rows (आड़ी लाइनें), [1, 4, 7], [2, 5, 8], // Columns (खड़ी लाइनें), [2, 4, 6]             // Diagonals (तिरछी लाइनें)
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

// साउंड ऑन/ऑफ करने का बटन लॉजिक
soundToggleBtn.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    if (isSoundOn) {
        soundToggleBtn.textContent = "🔊";
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    } else {
        soundToggleBtn.textContent = "🔇";
    }
});

// === साउंड पैदा करने का फंक्शन ===
function playSound(type) {
    if (!isSoundOn) return;

    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }

    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'clickX') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 नोट
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } 
    else if (type === 'clickO') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 नोट
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } 
    else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    }
    else if (type === 'theme') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    }
}

function handleCellClick(cell) {
    const clickedCellIndex = parseInt(cell.getAttribute('data-index'));
    if (boardState[clickedCellIndex] !== "" || !isGameActive) return;

    makeMove(clickedCellIndex, "X");
    playSound('clickX');

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

    // अगर गेम एक्टिव है और चाल बची है, तभी चाल चलें
    if (chosenMove !== null) {
        makeMove(chosenMove, "O");
        playSound('clickO');
    }
    
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
            boardState[condition[0]] === boardState[condition[1]] && 
            boardState[condition[0]] === boardState[condition[2]]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        isGameActive = false;
        playSound('win');
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

// रिसेट को बिल्कुल साफ़ और फ्रेश बनाने के लिए
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
