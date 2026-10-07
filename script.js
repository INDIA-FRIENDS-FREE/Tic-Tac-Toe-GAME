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

// जीतने के पैटर्न
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// सेल और इवेंट लिसनर्स
cells.forEach(cell => {
    cell.addEventListener('click', () => handleCellClick(cell));
});

resetRoundBtn.addEventListener('click', resetRound);
resetAllBtn.addEventListener('click', resetFullMatch);

// === थीम चेंज करने का नया लॉजिक ===
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const selectedTheme = btn.getAttribute('data-theme');
        // HTML टैग पर थीम सेट करना
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
        setTimeout(() => { computerMove(); }, 500);
    }
}

function makeMove(index, playerSign) {
    boardState[index] = playerSign;
    cells[index].textContent = playerSign;
    cells[index].classList.add(playerSign.toLowerCase());
}

function computerMove() {
    let availableCells = [];
    boardState.forEach((val, idx) => { if (val === "") availableCells.push(idx); });

    let chosenMove = findSmartMove("O") || findSmartMove("X");
    
    if (chosenMove === null) {
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        chosenMove = availableCells[randomIndex];
    }

    makeMove(chosenMove, "O");
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
