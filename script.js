let players = [];
let scores = {};
let currentPlayerIndex = -1;
const WINNING_SCORE = 2;
let timerInterval;
let tickInterval; 
let isTimerRunning = false;

// VARIABLES AUDIO
console.warn("⚠️ ATTENTION: N'oubliez pas de vérifier les chemins des fichiers audio !");

const successSound = new Audio('success.mp3'); 
successSound.volume = 0.6;

const backgroundMusic = new Audio('bg-music.mp3');
backgroundMusic.loop = true; 
backgroundMusic.volume = 0.2; 

const diceRollSound = new Audio('dice.mp3'); 
diceRollSound.volume = 0.8;

const timerAlertSound = new Audio('clock.mp3'); 
timerAlertSound.volume = 0.7;

const timerEndSound = new Audio('beep.mp3');
timerEndSound.volume = 0.8;

const winSound = new Audio('victory.mp3'); 
winSound.volume = 0.9;
// ------------------------------------------------------------------------

function startGame() {
    const playersInput = document.getElementById('players-input').value.trim();
    players = playersInput.split('\n').map(name => name.trim()).filter(name => name.length > 0);

    if (players.length < 2 || players.length > 4) {
        alert("Please enter between 2 and 4 player names to start the game.");
        return;
    }

    scores = {};
    players.forEach(player => {
        scores[player] = 0;
    });

    const winnerIndex = Math.floor(Math.random() * players.length);
    const winnerName = players[winnerIndex];

    document.getElementById('terminal-selection-container').style.display = 'flex';
    document.getElementById('setup-section').classList.add('spinning');

    // Démarrage de la musique par l'interaction utilisateur
    backgroundMusic.play().catch(e => console.error("Could not play background music:", e));
    
    startTerminalSelection(winnerIndex, winnerName);

    // Délai total pour l'animation du terminal
    setTimeout(() => {
        document.getElementById('setup-section').classList.remove('spinning');
        
        currentPlayerIndex = winnerIndex;
        
        document.getElementById('setup-section').style.display = 'none';
        document.getElementById('game-section').style.display = 'block';
        
        updateTurnDisplay();
        updateScoresList();
        
        document.getElementById('countdown').textContent = '--';
        document.getElementById('countdown').style.color = '#FFFFFF';
        document.getElementById('timer-progress').style.width = '100%';
        document.getElementById('timer-progress').style.transition = 'none';

        alert(`The first hacker is: ${players[currentPlayerIndex]}!`);
    }, 3800); 
}

function startTerminalSelection(winnerIndex, winnerName) {
    const outputElement = document.getElementById('terminal-output');
    outputElement.textContent = '';
    outputElement.style.color = '#F18418';
    
    let cycleCount = 0;
    const totalCycles = 40;
    
    // Étape 1: Affichage rapide de noms aléatoires
    const fastCycleInterval = setInterval(() => {
        if (cycleCount < totalCycles) {
            const randomPlayer = players[Math.floor(Math.random() * players.length)].toUpperCase();
            outputElement.textContent = `>>> SCANNING NETWORK... TARGET: [${randomPlayer}]`;
            
            cycleCount++;
        } else {
            clearInterval(fastCycleInterval);
            outputElement.textContent = `>>> TARGET IDENTIFIED: `;
            
            // Étape 2: Taper le nom du gagnant
            let charIndex = 0;
            const typingInterval = setInterval(() => {
                if (charIndex < winnerName.length) {
                    outputElement.textContent += winnerName[charIndex].toUpperCase();
                    
                    charIndex++;
                } else {
                    clearInterval(typingInterval);
                    
                    // Délai avant le son de succès
                    setTimeout(() => {
                        // Étape 3: Effet final de "déverrouillage" et son de succès
                        outputElement.textContent += ' [SUCCESS]';
                        outputElement.style.color = '#90EE90';
                        
                        if (successSound) {
                            successSound.play().catch(e => console.error('Audio playback failed (success):', e));
                        }
                    }, 300);
                }
            }, 100); 
        }
    }, 50);
}


function restartGame() {
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
    if (confirm("Are you sure you want to restart the current game?")) {
        window.location.reload();
    }
}

function stopTimerAndSounds() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (tickInterval) {
        clearInterval(tickInterval);
        tickInterval = null;
    }
    isTimerRunning = false;
    // Arrête le son du tic-tac
    timerAlertSound.pause();
    timerAlertSound.currentTime = 0;
}

function startTimer(duration) {
    // Stoppe l'ancien timer et le son
    stopTimerAndSounds();
    
    let timeRemaining = duration;
    const countdownElement = document.getElementById('countdown');
    const progressBar = document.getElementById('timer-progress');
    const timerDisplay = document.getElementById('timer-display');
    const actionButtons = document.querySelectorAll('#game-section .actions-group:not(.difficulty-buttons) button, #end-turn-btn, #restart-btn');

    isTimerRunning = true;
    
    actionButtons.forEach(btn => btn.classList.add('timer-running'));

    // Initialisation de la barre de progression
    progressBar.style.transition = `width ${duration}s linear, background-color 0.5s`;
    progressBar.style.width = '100%';
    timerDisplay.classList.remove('low-time-progress');
    progressBar.style.backgroundColor = '#90EE90';

    countdownElement.textContent = timeRemaining;
    countdownElement.style.color = '#FFFFFF';

    // Démarrage de l'animation CSS de progression
    setTimeout(() => {
        progressBar.style.width = '0%';
    }, 50);

    // Intervalle pour le son du tic-tac (joue et rembobine chaque seconde)
    tickInterval = setInterval(() => {
        if (timerAlertSound) {
            timerAlertSound.currentTime = 0;
            timerAlertSound.play().catch(e => console.error('Audio playback failed (tick):', e));
        }
    }, 1000);

    // Intervalle pour la logique du timer
    timerInterval = setInterval(() => {
        timeRemaining--;
        countdownElement.textContent = timeRemaining;
        
        if (timeRemaining <= duration / 3 && timeRemaining > 0) {
            timerDisplay.classList.add('low-time-progress');
        }

        if (timeRemaining <= 0) {
            // Arrête les deux intervalles et le son
            stopTimerAndSounds();
            
            if (timerEndSound) {
                timerEndSound.play().catch(e => console.error('Audio playback failed (timer end):', e));
            }

            countdownElement.textContent = 'TIME UP!';
            countdownElement.style.color = '#FF6961';
            
            actionButtons.forEach(btn => btn.classList.remove('timer-running'));

            alert("TIME UP! Your turn is over.");
        }
    }, 1000);
}


function rollDice() {
    if (players.length === 0) {
        alert("Please start the game first.");
        return;
    }

    if (diceRollSound) {
        diceRollSound.currentTime = 0;
        diceRollSound.play().catch(e => console.error('Audio playback failed (dice):', e));
    }
    
    const diceAnimationContainer = document.getElementById('dice-animation-container');
    const diceResultElement = document.getElementById('dice-result');

    diceResultElement.style.display = 'none';
    diceAnimationContainer.style.display = 'inline-block';

    diceAnimationContainer.classList.add('rolling');

    Array.from(diceAnimationContainer.children).forEach(face => face.style.opacity = '0');

    setTimeout(() => {
        const diceResult = Math.floor(Math.random() * 6) + 1;
        
        diceAnimationContainer.classList.remove('rolling');
        diceAnimationContainer.style.display = 'none';
        
        diceResultElement.textContent = diceResult;
        diceResultElement.style.display = 'inline-block';

        const finalFace = diceAnimationContainer.querySelector(`.dice-face[data-face="${diceResult}"]`);
        if (finalFace) {
            finalFace.style.opacity = '1';
            diceAnimationContainer.style.display = 'inline-block';
            finalFace.style.position = 'relative';
            finalFace.style.transform = 'none';
            finalFace.style.transition = 'none';
        }
        
        console.log(`${players[currentPlayerIndex]} rolled a ${diceResult}.`);

        setTimeout(() => {
             if (finalFace) {
                finalFace.style.opacity = '0';
                diceAnimationContainer.style.display = 'none';
                finalFace.style.position = 'absolute';
             }
        }, 1000);
        
    }, 1500);
}

function addScore() {
    if (players.length === 0) {
        alert("Please start the game first.");
        return;
    }

    const currentPlayer = players[currentPlayerIndex];
    scores[currentPlayer] += 1;
    updateScoresList();

    console.log(`${currentPlayer} scored +1 point. New score: ${scores[currentPlayer]}`);

    checkForWin();
}

function nextTurn() {
    if (players.length === 0) {
        alert("Please start the game first.");
        return;
    }

    stopTimerAndSounds();
    
    document.getElementById('countdown').textContent = '--';
    document.getElementById('countdown').style.color = '#FFFFFF';
    
    document.getElementById('timer-display').classList.remove('low-time-progress');
    document.getElementById('timer-progress').style.transition = 'none';
    document.getElementById('timer-progress').style.width = '100%';

    document.querySelectorAll('#game-section .actions-group:not(.difficulty-buttons) button, #end-turn-btn, #restart-btn').forEach(btn => btn.classList.remove('timer-running'));


    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    
    document.getElementById('dice-animation-container').style.display = 'none';
    document.getElementById('dice-result').textContent = '?';
    document.getElementById('dice-result').style.display = 'inline-block';

    updateTurnDisplay();
    updateScoresList();
}

function updateTurnDisplay() {
    const currentPlayer = players[currentPlayerIndex];
    document.getElementById('current-player').textContent = currentPlayer;
}

function updateScoresList() {
    const scoresList = document.getElementById('scores-list');
    scoresList.innerHTML = '';

    players.forEach(player => {
        const li = document.createElement('li');
        if (player === players[currentPlayerIndex] && document.getElementById('game-section').style.display !== 'none') {
            li.classList.add('current-player-score');
        }
        li.textContent = `${player}: ${scores[player]}`;
        scoresList.appendChild(li);
    });
}

function checkForWin() {
    const currentPlayer = players[currentPlayerIndex];

    if (scores[currentPlayer] >= WINNING_SCORE) {
        stopTimerAndSounds();
        
        if (winSound) {
            winSound.play().catch(e => console.error('Audio playback failed (win):', e));
        }

        document.getElementById('timer-display').classList.remove('low-time-progress');
        document.getElementById('timer-progress').style.transition = 'none';
        document.getElementById('timer-progress').style.width = '100%';
        
        if (backgroundMusic) {
            backgroundMusic.pause();
        }

        document.getElementById('game-section').style.display = 'none';
        document.getElementById('winner-message').textContent = `${currentPlayer} wins the game with a score of ${scores[currentPlayer]}!`;
        document.getElementById('win-message').style.display = 'block';

        console.log(`Game over! ${currentPlayer} is the winner.`);
    }
}