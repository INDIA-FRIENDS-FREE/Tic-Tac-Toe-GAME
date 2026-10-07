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

// जीतने के पैटर्न (Winning Combinations)
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// सेल पर क्लिक इवेंट जोड़ना (बग-फ्री तरीका)
cells.forEach(cell => {
    cell.addEventListener('click', () => handleCellClick(cell));
});

resetRoundBtn.addEventListener('click', resetRound);
resetAllBtn.addEventListener('click', resetFullMatch);

// जब प्लेयर सेल पर क्लिक करे
function handleCellClick(cell) {
    const clickedCellIndex = parseInt(cell.getAttribute('data-index'));

    // अगर सेल पहले से भरी है या गेम खत्म हो चुका है, तो कुछ न करें
    if (boardState[clickedCellIndex] !== "" || !isGameActive) {
        return;
    }

    // प्लेयर की चाल (X)
    makeMove(clickedCellIndex, "X");

    // प्लेयर की चाल के बाद चेक करें
    if (checkResult("X")) return;

    // अगर बोर्ड खाली है तो कंप्यूटर (O) की चाल
    if (boardState.includes("")) {
        isGameActive = false; // कंप्यूटर के सोचने तक प्लेयर को ब्लॉक करें
        statusMessage.textContent = "कंप्यूटर सोच रहा है...";
        
        setTimeout(() => {
            computerMove();
        }, 500); // 0.5 सेकंड का डिले ताकि गेम नेचुरल लगे
    }
}

// चाल चलने का फंक्शन
function makeMove(index, playerSign) {
    boardState[index] = playerSign;
    cells[index].textContent = playerSign;
    cells[index].classList.add(playerSign.toLowerCase());
}

// कंप्यूटर (AI) की चाल का लॉजिक
function computerMove() {
    let availableCells = [];
    boardState.forEach((val, idx) => {
        if (val === "") availableCells.push(idx);
    });

    // 1. जीतने की कोशिश या ब्लॉक करने का बेसिक दिमाग
    let chosenMove = null;
    
    // क्या कंप्यूटर (O) एक चाल से जीत सकता है?
    chosenMove = findSmartMove("O");
    
    // अगर नहीं, तो क्या प्लेयर (X) जीतने वाला है? उसे ब्लॉक करो
    if (chosenMove === null) {
        chosenMove = findSmartMove("X");
    }
    
    // अगर दोनों स्थिति नहीं है, तो रैंडम चाल चलो
    if (chosenMove === null) {
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        chosenMove = availableCells[randomIndex];
    }

    makeMove(chosenMove, "O");
    isGameActive = true;

    // कंप्यूटर की चाल के बाद चेक करें
    if (checkResult("O")) return;

    statusMessage.textContent = "आपकी चाल (X)";
}

// स्मार्ट चाल ढूँढने का हेल्पर फंक्शन
function findSmartMove(playerSign) {
    for (let condition of winningConditions) {
        let count = 0;
        let emptyIdx = null;
        for (let idx of condition) {
            if (boardState[idx] === playerSign) count++;
            else if (boardState[idx] === "") emptyIdx = idx;
        }
        if (count === 2 && emptyIdx !== null) {
            return emptyIdx;
        }
    }
    return null;
}

// रिजल्ट चेक करना (जीत, हार या ड्रॉ)
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

    // ड्रॉ चेक करना
    if (!boardState.includes("")) {
        statusMessage.textContent = "🤝 मुकाबला ड्रॉ रहा!";
        isGameActive = false;
        return true;
    }

    return false;
}

// चेक करें कि क्या कोई 5 स्कोर तक पहुँच गया
function checkSeriesWinner() {
    if (playerAllTimeScore === targetScore) {
        statusMessage.textContent = "👑 बधाई हो! आप पूरा मैच (5-Score) जीत गए!";
        disableControls();
    } else if (computerAllTimeScore === targetScore) {
        statusMessage.textContent = "💻 ओहो! कंप्यूटर पूरा मैच (5-Score) जीत गया।";
        disableControls();
    }
}

// मैच खत्म होने पर गेम पूरी तरह रोकना
function disableControls() {
    isGameActive = false;
    resetRoundBtn.style.display = "none"; // राउंड बटन छुपाएं
}

// सिर्फ बोर्ड साफ करने के लिए (राउंड रीसेट)
function resetRound() {
    boardState = ["", "", "", "", "", "", "", "", ""];
    isGameActive = true;
    statusMessage.textContent = "आपकी चाल (X)";
    cells.forEach(cell => {
        cell.textContent = "";
        cell.className = "cell";
    });
}

// स्कोर सहित सब कुछ शून्य करने के लिए (पूरा मैच रीसेट)
function resetFullMatch() {
    playerAllTimeScore = 0;
    computerAllTimeScore = 0;
    playerScoreText.textContent = "0";
    computerScoreText.textContent = "0";
    resetRoundBtn.style.display = "block"; // बटन वापस दिखाएं
    resetRound();
}
