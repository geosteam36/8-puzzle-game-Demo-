const board = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer');
const bestTimeDisplay = document.getElementById('best-time');
const overlay = document.getElementById('web-overlay');
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
    const btn = document.getElementById('mute-btn');
    btn.textContent = isMuted ? "🔇 SOUND: OFF" : "🔊 SOUND: ON";
    btn.classList.toggle('is-muted');
}

function changeLevel(newSize) {
    size = newSize;
    shuffleGame();
}

function drawBoard() {
    const currentTiles = board.querySelectorAll('.tile');
    currentTiles.forEach(t => t.remove());

    // Adjusted sizes for laptop screens
    let tileSize = size === 3 ? '85px' : size === 4 ? '65px' : '50px';
    board.style.gridTemplateColumns = `repeat(${size}, ${tileSize})`;

    tiles.forEach((tile, index) => {
        const tileDiv = document.createElement('div');
        tileDiv.classList.add('tile');
        tileDiv.style.width = tileDiv.style.height = tileSize;
        tileDiv.style.fontSize = size > 3 ? '1.2rem' : '1.8rem';
        
        if (tile === null) {
            tileDiv.classList.add('empty');
        } else {
            tileDiv.textContent = tile;
            if (tile === index + 1) {
                const tick = document.createElement('div');
                tick.classList.add('tick');
                tick.innerHTML = '✓';
                tileDiv.appendChild(tick);
            }
            tileDiv.addEventListener('click', () => moveTile(index));
        }
        board.appendChild(tileDiv);
    });
}

function moveTile(index) {
    const emptyIndex = tiles.indexOf(null);
    const row = Math.floor(index / size), col = index % size;
    const eRow = Math.floor(emptyIndex / size), eCol = emptyIndex % size;

    if (Math.abs(row - eRow) + Math.abs(col - eCol) === 1) {
        if (!isMuted) { thwipSound.currentTime = 0; thwipSound.play(); }
        if (!timerStarted) {
            timerStarted = true;
            timerInterval = setInterval(() => { seconds++; timerDisplay.textContent = formatTime(seconds); }, 1000);
        }
        [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
        moves++;
        drawBoard();
        checkWin();
    }
}

function shuffleGame() {
    clearInterval(timerInterval);
    timerStarted = false;
    seconds = moves = 0;
    timerDisplay.textContent = "00:00";
    overlay.style.display = 'none';
    updateBestTimeDisplay();
    
    const total = size * size;
    tiles = Array.from({length: total - 1}, (_, i) => i + 1);
    tiles.push(null);
    
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
    const isWin = tiles.every((t, i) => (i === tiles.length - 1 ? t === null : t === i + 1));
    if (isWin && moves > 0) {
        clearInterval(timerInterval);
        overlay.style.display = 'flex';
        const best = localStorage.getItem(`spidey-best-${size}`);
        if (!best || seconds < parseInt(best)) {
            localStorage.setItem(`spidey-best-${size}`, seconds);
            updateBestTimeDisplay();
        }
    }
}

shuffleGame();