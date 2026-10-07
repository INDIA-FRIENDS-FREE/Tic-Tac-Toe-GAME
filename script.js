 // स्टेट वैरिएबल्स
let boardState = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;
let playerAllTimeScore = 0;
let computerAllTimeScore = 0;
const targetScore = 5;

// DOM एलिमेंट्स
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('status-message');
const playerScoreText = document.getElementById('player-score');
const computerScoreText = document.getElementById('computer-score');
const resetRoundBtn = document.getElementById('reset-round-btn');
const resetAllBtn = document.getElementById('reset-all-btn');
const themeButtons = document.querySelectorAll('.theme-btn');
const difficultySelect = document.getElementById('difficulty-select');

// जीतने के पैटर्न
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// इवेंट लिसनर्स
cells.forEach(cell => {
    cell.addEventListener('click', () => handleCellClick(cell));
});

resetRoundBtn.addEventListener('click', resetRound);
resetAllBtn.addEventListener('click', resetFullMatch);

// लेवल बदलने पर राउंड रीसेट करें ताकि चीटिंग न हो
difficultySelect.addEventListener('change', resetRound);

// थीम चेंज लॉजिक
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const selectedTheme = btn.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', selectedTheme);
    });
});

function handleCellClick(cell) {
    const clickedCellIndex = parseInt(cell.getAttribute('data-index'));
    if (boardState[clickedCellIndex] !== "" || !isGameActive) return;

    makeMove(clickedCellIndex, "X");
    if (checkResult("X")) return;

    if (boardState.includes("")) {
        isGameActive = false;
        statusMessage.textContent = "कंप्यूटर सोच रहा है...";
        setTimeout(() => { computerMove(); }, 400);
    }
}

function makeMove(index, playerSign) {
    boardState[index] = playerSign;
    cells[index].textContent = playerSign;
    cells[index].classList.add(playerSign.toLowerCase());
}

// === लेवल्स के हिसाब से कंप्यूटर की चाल का दिमाग ===
function computerMove() {
    const level = difficultySelect.value;
    let chosenMove = null;

    let availableCells = [];
    boardState.forEach((val, idx) => { if (val === "") availableCells.push(idx); });

    if (level === "easy") {
        // सरल मोड: 100% रैंडम चाल
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        chosenMove = availableCells[randomIndex];
    } 
    else if (level === "medium") {
        // मध्यम मोड: जीतने की कोशिश करो या प्लेयर को ब्लॉक करो, नहीं तो रैंडम चाल
        chosenMove = findSmartMove("O") || findSmartMove("X");
        if (chosenMove === null) {
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            chosenMove = availableCells[randomIndex];
        }
    } 
    else if (level === "hard") {
        // कठिन मोड: Minimax एल्गोरिदम (कंप्यूटर कभी नहीं हारेगा!)
        chosenMove = getBestMove();
    }

    makeMove(chosenMove, "O");
    isGameActive = true;
    if (checkResult("O")) return;
    statusMessage.textContent = "आपकी चाल (X)";
}

// मध्यम मोड के लिए हेल्पर
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

// कठिन मोड (Minimax) का दिमाग
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

// परिणाम चेक करना
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
