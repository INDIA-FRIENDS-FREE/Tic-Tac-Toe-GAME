 window.addEventListener('DOMContentLoaded', () => {
    const setupScreen = document.getElementById('setupScreen');
    const gameScreen = document.getElementById('gameScreen');
    const playerNameInput = document.getElementById('playerNameInput');
    const matchTitle = document.getElementById('matchTitle');
    const statusText = document.getElementById('statusText');
    const cells = document.querySelectorAll('.cell');
    
    const btnVsComputer = document.getElementById('btnVsComputer');
    const btnVsFriend = document.getElementById('btnVsFriend');
    const resetBtn = document.getElementById('resetBtn');
    const menuBtn = document.getElementById('menuBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    const clickSound = document.getElementById('clickSound');
    const winSound = document.getElementById('winSound');

    let nickname = "Player";
    let gameMode = "computer"; 
    let currentPlayer = "X";
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let gameActive = true;

    // फिक्स की हुई 100% सही विनिंग कंडीशन्स
    const winningConditions = [, [3, 4, 5], [6, 7, 8], // Rows, [1, 4, 7], [2, 5, 8], // Columns, [2, 4, 6]             // Diagonals
    ];

    // थीम बदलने का लॉजिक
    const themes = ["theme-default", "theme-purple", "theme-dark"];
    let currentThemeIndex = 0;
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.remove(themes[currentThemeIndex]);
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        document.body.classList.add(themes[currentThemeIndex]);
    });

    function startMatch(mode) {
        const enteredName = playerNameInput.value.trim();
        nickname = enteredName !== "" ? enteredName : "Player";
        gameMode = mode;

        setupScreen.style.display = "none";
        gameScreen.style.display = "block";

        if (gameMode === "computer") {
            matchTitle.innerText = `${nickname} VS Computer`;
        } else {
            matchTitle.innerText = `${nickname} VS Friend`;
        }
        restartGame();
    }

    function handleCellClick(e) {
        const clickedCell = e.target;
        const index = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[index] !== "" || !gameActive) return;

        playMove(index, currentPlayer);

        if (gameActive && gameMode === "computer" && currentPlayer === "O") {
            gameActive = false; 
            setTimeout(() => {
                makeComputerMove();
            }, 500);
        }
    }

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

    function makeComputerMove() {
        if (!gameScreen.style.display === "block") return;
        
        let emptyIndexes = [];
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === "") emptyIndexes.push(i);
        }

        if (emptyIndexes.length === 0) {
            gameActive = true;
            return;
        }

        const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
        gameActive = true; 
        playMove(randomIndex, "O");
    }

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
                    ? `🎉 Congratulations ${nickname}! You Won! 🏆` 
                    : `🤖 Computer Won! Better luck next time.`;
            } else {
                statusText.innerHTML = `🎉 Player ${currentPlayer} Won the Match! 🏆`;
            }
            gameActive = false;
            return;
        }

        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            statusText.innerText = "🤝 Match Tied! (Draw)";
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        
        if (gameMode === "computer") {
            statusText.innerText = currentPlayer === "X" ? `Your Turn (${nickname})` : `Computer is thinking... 🤖`;
        } else {
            statusText.innerText = `Turn: Player ${currentPlayer}`;
        }
    }

    function restartGame() {
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        gameActive = true;
        statusText.innerText = gameMode === "computer" ? `Your Turn (${nickname})` : `Turn: Player X`;
        cells.forEach(cell => {
            cell.innerText = "";
            cell.className = "cell";
        });
    }

    function goToMenu() {
        gameScreen.style.display = "none";
        setupScreen.style.display = "block";
    }

    btnVsComputer.addEventListener('click', () => startMatch("computer"));
    btnVsFriend.addEventListener('click', () => startMatch("friend"));
    resetBtn.addEventListener('click', restartGame);
    menuBtn.addEventListener('click', goToMenu);
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
});
