const board = document.getElementById('game-board');
const message = document.getElementById('message');
const timerDisplay = document.getElementById('timer');
const bestTimeDisplay = document.getElementById('best-time');
const thwipSound = document.getElementById('thwip-sound');

let size = 3;
let tiles = [];
let moves = 0;
let seconds = 0;
let timerInterval = null;
let timerStarted = false;
let isMuted = false;

function formatTime(sec) {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateBestTimeDisplay() {
    const best = localStorage.getItem(`spidey-best-${size}`);
    bestTimeDisplay.textContent = best ? formatTime(parseInt(best)) : "--:--";
}

function toggleMute() {
    isMuted = !isMuted;
    const muteBtn = document.getElementById('mute-btn');
    muteBtn.textContent = isMuted ? "🔇 SOUND: OFF" : "🔊 SOUND: ON";
    muteBtn.classList.toggle('is-muted');
}

function startTimer() {
    if (!timerStarted) {
        timerStarted = true;
        timerInterval = setInterval(() => {
            seconds++;
            timerDisplay.textContent = formatTime(seconds);
        }, 1000);
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    timerStarted = false;
}

function changeLevel(newSize) {
    size = newSize;
    shuffleGame();
}

function drawBoard() {
    board.innerHTML = '';
    let tileSize = size === 3 ? '100px' : size === 4 ? '80px' : '65px';
    let fontSize = size === 5 ? '1.5rem' : '2.5rem';

    board.style.gridTemplateColumns = `repeat(${size}, ${tileSize})`;

    tiles.forEach((tile, index) => {
        const tileDiv = document.createElement('div');
        tileDiv.classList.add('tile');
        tileDiv.style.width = tileSize;
        tileDiv.style.height = tileSize;
        tileDiv.style.fontSize = fontSize;
        
        if (tile === null) {
            tileDiv.classList.add('empty');
        } else {
            tileDiv.textContent = tile;
            if (tile === index + 1) {
                const tick = document.createElement('div');
                tick.classList.add('tick');
                tick.innerHTML = '✓';
                tileDiv.appendChild(tick);
                tileDiv.style.borderColor = "var(--success-green)";
            }
            tileDiv.addEventListener('click', () => moveTile(index));
        }
        board.appendChild(tileDiv);
    });
}

function moveTile(index) {
    const emptyIndex = tiles.indexOf(null);
    const row = Math.floor(index / size);
    const col = index % size;
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    if (Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1) {
        if (!isMuted) {
            thwipSound.currentTime = 0;
            thwipSound.play();
        }
        if (!timerStarted) startTimer();
        [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
        moves++;
        drawBoard();
        checkWin();
    }
}

function shuffleGame() {
    stopTimer();
    seconds = 0;
    moves = 0;
    timerDisplay.textContent = "00:00";
    message.textContent = "";
    updateBestTimeDisplay();
    
    const total = size * size;
    tiles = Array.from({length: total - 1}, (_, i) => i + 1);
    tiles.push(null);
    
    // Shuffle logic to ensure solvability
    for (let i = 0; i < size * 100; i++) {
        const emptyIndex = tiles.indexOf(null);
        const neighbors = [];
        if (emptyIndex % size > 0) neighbors.push(emptyIndex - 1);
        if (emptyIndex % size < size - 1) neighbors.push(emptyIndex + 1);
        if (emptyIndex >= size) neighbors.push(emptyIndex - size);
        if (emptyIndex < total - size) neighbors.push(emptyIndex + size);
        const move = neighbors[Math.floor(Math.random() * neighbors.length)];
        [tiles[emptyIndex], tiles[move]] = [tiles[move], tiles[emptyIndex]];
    }
    drawBoard();
}

function checkWin() {
    const total = size * size;
    const isWin = tiles.every((t, i) => (i === total - 1 ? t === null : t === i + 1));
    
    if (isWin && moves > 0) {
        stopTimer();
        message.innerHTML = `THWIP! MISSION COMPLETE!`;
        const currentBest = localStorage.getItem(`spidey-best-${size}`);
        if (!currentBest || seconds < parseInt(currentBest)) {
            localStorage.setItem(`spidey-best-${size}`, seconds);
            message.innerHTML += `<br><span style="color:white; font-size:1rem">NEW PERSONAL BEST!</span>`;
            updateBestTimeDisplay();
        }
    }
}

shuffleGame();