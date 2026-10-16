window.addEventListener('DOMContentLoaded', () => {
    // स्क्रीन एलिमेंट्स
    const setupScreen = document.getElementById('setupScreen');
    const gameScreen = document.getElementById('gameScreen');
    const playerNameInput = document.getElementById('playerNameInput');
    const matchTitle = document.getElementById('matchTitle');
    const statusText = document.getElementById('statusText');
    const cells = document.querySelectorAll('.cell');
    
    // बटन्स
    const btnVsComputer = document.getElementById('btnVsComputer');
    const btnVsFriend = document.getElementById('btnVsFriend');
    const resetBtn = document.getElementById('resetBtn');
    const menuBtn = document.getElementById('menuBtn');
    
    // ऑडियो
    const clickSound = document.getElementById('clickSound');
    const winSound = document.getElementById('winSound');

    // गेम स्टेट वेरिएबल्स
    let nickname = "Player";
    let gameMode = "computer"; // computer या friend
    let currentPlayer = "X";
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let gameActive = true;

    // जीतने वाले कॉम्बिनेशंस
    const winningConditions = [, [3, 4, 5], [6, 7, 8], // लेटी हुई लाइन्स (Rows), [1, 4, 7], [2, 5, 8], // खड़ी लाइन्स (Columns), [2, 4, 6]             // टेढ़ी लाइन्स (Diagonals)
    ];

    // गेम शुरू करने का फंक्शन
    function startMatch(mode) {
        const enteredName = playerNameInput.value.trim();
        nickname = enteredName !== "" ? enteredName : "Player";
        gameMode = mode;

        setupScreen.style.display = "none";
        gameScreen.style.display = "block";

        if (gameMode === "computer") {
            matchTitle.innerText = `${nickname} 🆚 Computer`;
        } else {
            matchTitle.innerText = `${nickname} 🆚 Friend`;
        }

        restartGame();
    }

    // सेल पर क्लिक हैंडलर
    function handleCellClick(e) {
        const clickedCell = e.target;
        const index = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[index] !== "" || !gameActive) return;

        playMove(index, currentPlayer);

        if (gameActive && gameMode === "computer" && currentPlayer === "O") {
            // कंप्यूटर की बारी (AI Move)
            gameActive = false; // प्लेयर को रोकने के लिए थोड़ी देर लॉक करें
            setTimeout(() => {
                makeComputerMove();
            }, 600);
        }
    }

    // चाल चलने का कॉमन फंक्शन
    function playMove(index, player) {
        try {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => {});
        } catch (err) {}

        gameState[index] = player;
        cells[index].innerText = player;
        cells[index].classList.add(player === "X" ? "x-glow" : "o-glow");

        checkResult();
    }

    // कंप्यूटर (AI) की चाल का लॉजिक
    function makeComputerMove() {
        gameActive = true; // लॉक खोलें
        if (!gameActive) return;

        // 1. खाली जगहों को ढूंढें
        let emptyIndexes = [];
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === "") emptyIndexes.push(i);
        }

        if (emptyIndexes.length === 0) return;

        // 2. साधारण AI: किसी भी एक खाली जगह पर रैंडम चाल चलना
        const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
        playMove(randomIndex, "O");
    }

    // जीत या ड्रा चेक करना
    function checkResult() {
        let roundWon = false;

        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            let a = gameState[winCondition[0]];
            let b = gameState[winCondition[1]];
            let c = gameState[winCondition[2]];

            if (a === "" || b === "" || c === "") continue;
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            try {
                winSound.currentTime = 0;
                winSound.play().catch(() => {});
            } catch (err) {}

            if (gameMode === "computer") {
                statusText.innerHTML = currentPlayer === "X" 
                    ? `🎉 बधाई हो ${nickname} भाई! आप जीत गए! 🏆` 
                    : `🤖 Computer जीत गया! कोई बात नहीं दोबारा ट्राई करें।`;
            } else {
                statusText.innerHTML = `🎉 Player ${currentPlayer} मैच जीत गया! 🏆`;
            }
            gameActive = false;
            return;
        }

        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            statusText.innerText = "🤝 मैच टाई हो गया! (Draw)";
            gameActive = false;
            return;
        }

        // प्लेयर बदलें
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        
        if (gameMode === "computer") {
            statusText.innerText = currentPlayer === "X" ? `आपकी बारी (${nickname})` : `Computer सोच रहा है... 🤖`;
        } else {
            statusText.innerText = `Turn: Player ${currentPlayer}`;
        }
    }

    // मैच रीस्टार्ट करना
    function restartGame() {
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        gameActive = true;
        statusText.innerText = gameMode === "computer" ? `आपकी बारी (${nickname})` : `Turn: Player X`;
        cells.forEach(cell => {
            cell.innerText = "";
            cell.className = "cell";
        });
    }

    // वापस मुख्य मेन्यू पर जाना
    function goToMenu() {
        gameScreen.style.display = "none";
        setupScreen.style.display = "block";
    }

    // इवेंट लिस्टनर्स जोड़ना
    btnVsComputer.addEventListener('click', () => startMatch("computer"));
    btnVsFriend.addEventListener('click', () => startMatch("friend"));
    resetBtn.addEventListener('click', restartGame);
    menuBtn.addEventListener('click', goToMenu);
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
});
