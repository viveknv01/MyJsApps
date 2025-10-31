// Game State Management
class OTPMemoryGame {
  constructor() {
    this.otp = '';
    this.attempts = 0;
    this.maxAttempts = 3;
    this.maxInputTime = 25000; // 25 seconds
    this.score = 0;
    this.streak = 0;
    this.level = 1;
    this.isGameActive = false;
    this.timer = null;
    this.inputTimer = null;
    this.soundEnabled = true;
    
    this.initializeGame();
    this.setupEventListeners();
    this.loadGameData();
  }

  initializeGame() {
    this.updateDisplay();
    this.updateStats();
    this.setDifficultyLevel();
  }

  setupEventListeners() {
    // Range slider for digits
    const otpLengthSlider = document.getElementById('otpLength');
    const digitsDisplay = document.getElementById('digitsDisplay');
    
    otpLengthSlider.addEventListener('input', (e) => {
      digitsDisplay.textContent = e.target.value;
      this.setDifficultyLevel();
    });

    // Sound toggle
    document.getElementById('soundToggle').addEventListener('change', (e) => {
      this.soundEnabled = e.target.checked;
    });

    // Submit button
    document.getElementById('submitBtn').addEventListener('click', () => {
      this.checkAnswer();
    });

    // Input field
    const otpInput = document.getElementById('otpInput');
    otpInput.addEventListener('input', (e) => {
      // Only allow numbers
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      
      // Enable submit button if input is not empty
      document.getElementById('submitBtn').disabled = e.target.value.length === 0;
    });

    otpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !document.getElementById('submitBtn').disabled) {
        this.checkAnswer();
      }
    });

    // Difficulty badges
    document.querySelectorAll('.badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        this.selectDifficulty(e.currentTarget.dataset.level);
      });
    });
  }

  generateOTP(length = 6) {
    this.otp = '';
    for (let i = 0; i < length; i++) {
      this.otp += Math.floor(Math.random() * 10);
    }
    return this.otp;
  }

  startGame() {
    if (this.isGameActive) return;

    const otpLength = parseInt(document.getElementById('otpLength').value);
    const displayTime = parseInt(document.getElementById('displayTime').value);
    
    this.generateOTP(otpLength);
    this.attempts = 0;
    this.isGameActive = true;

    // UI Updates
    const display = document.getElementById('otpDisplay');
    const input = document.getElementById('otpInput');
    const message = document.getElementById('message');
    const startBtn = document.getElementById('startBtn');
    const timerText = document.getElementById('timerText');

    // Reset UI
    input.value = '';
    input.disabled = true;
    message.innerHTML = '';
    message.className = 'message-area';
    startBtn.disabled = true;
    document.getElementById('submitBtn').disabled = true;

    // Show OTP with animation
    display.className = 'otp-display showing';
    display.innerHTML = this.formatOTPDisplay(this.otp);
    timerText.textContent = `Memorize: ${displayTime/1000}s`;

    this.playSound('start');

    // Countdown for memorization
    let countdown = displayTime / 1000;
    const countdownTimer = setInterval(() => {
      countdown--;
      timerText.textContent = `Memorize: ${countdown}s`;
      
      if (countdown <= 0) {
        clearInterval(countdownTimer);
        this.hideOTPAndStartInput();
      }
    }, 1000);
  }

  hideOTPAndStartInput() {
    const display = document.getElementById('otpDisplay');
    const input = document.getElementById('otpInput');
    const timerText = document.getElementById('timerText');
    const timerFill = document.querySelector('.timer-fill');

    // Hide OTP
    display.className = 'otp-display hidden';
    display.innerHTML = '?'.repeat(this.otp.length);

    // Enable input
    input.disabled = false;
    input.focus();
    input.setAttribute('maxlength', this.otp.length);

    // Start input timer
    const startTime = Date.now();
    timerText.textContent = 'Enter the numbers!';

    this.inputTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = this.maxInputTime - elapsed;
      const percentage = (remaining / this.maxInputTime) * 100;

      timerFill.style.width = `${Math.max(0, percentage)}%`;
      
      if (remaining <= 5000 && remaining > 0) {
        timerText.textContent = `Hurry! ${Math.ceil(remaining/1000)}s`;
        timerText.style.color = '#fa709a';
      } else if (remaining > 5000) {
        timerText.textContent = `${Math.ceil(remaining/1000)}s remaining`;
        timerText.style.color = 'rgba(255, 255, 255, 0.9)';
      }

      if (remaining <= 0 || this.attempts >= this.maxAttempts) {
        this.endGame(false, 'Time\'s up! ⏰');
      }
    }, 100);
  }

  checkAnswer() {
    const input = document.getElementById('otpInput');
    const userInput = input.value.trim();

    if (!userInput) return;

    this.attempts++;

    if (userInput === this.otp) {
      this.endGame(true);
    } else {
      if (this.attempts < this.maxAttempts) {
        this.showMessage(`Wrong! ${this.maxAttempts - this.attempts} attempts left`, 'warning');
        this.playSound('wrong');
        input.value = '';
        input.focus();
      } else {
        this.endGame(false, 'No more attempts! 😔');
      }
    }
  }

  endGame(success, customMessage = '') {
    this.isGameActive = false;
    clearInterval(this.inputTimer);

    const input = document.getElementById('otpInput');
    const startBtn = document.getElementById('startBtn');
    const submitBtn = document.getElementById('submitBtn');

    input.disabled = true;
    startBtn.disabled = false;
    submitBtn.disabled = true;

    if (success) {
      this.handleSuccess();
    } else {
      this.handleFailure(customMessage);
    }

    this.updateStats();
    this.saveGameData();
  }

  handleSuccess() {
    const points = this.calculatePoints();
    this.score += points;
    this.streak++;
    
    // Level up logic
    if (this.streak > 0 && this.streak % 3 === 0) {
      this.level++;
      this.showMessage(`🎉 Level Up! You're now Level ${this.level}!`, 'success');
    }

    this.playSound('success');
    this.showSuccessModal(points);
  }

  handleFailure(message) {
    this.streak = 0;
    this.playSound('fail');
    this.showFailModal(message);
  }

  calculatePoints() {
    const otpLength = parseInt(document.getElementById('otpLength').value);
    const displayTime = parseInt(document.getElementById('displayTime').value);
    
    let basePoints = otpLength * 10; // 10 points per digit
    let timeBonus = Math.max(0, (5000 - displayTime) / 100); // Bonus for shorter display time
    let attemptBonus = (this.maxAttempts - this.attempts + 1) * 20; // Bonus for fewer attempts
    let levelBonus = this.level * 5; // Level multiplier

    return Math.round(basePoints + timeBonus + attemptBonus + levelBonus);
  }

  showSuccessModal(points) {
    document.getElementById('pointsEarned').textContent = `+${points}`;
    document.getElementById('successModal').style.display = 'block';
  }

  showFailModal(message) {
    document.getElementById('failMessage').textContent = message;
    document.getElementById('correctAnswer').textContent = this.otp;
    document.getElementById('failModal').style.display = 'block';
  }

  closeModal() {
    document.getElementById('successModal').style.display = 'none';
    document.getElementById('failModal').style.display = 'none';
  }

  showMessage(text, type = '') {
    const message = document.getElementById('message');
    message.innerHTML = text;
    message.className = `message-area ${type}`;

    if (type) {
      setTimeout(() => {
        message.className = 'message-area';
      }, 3000);
    }
  }

  formatOTPDisplay(otp) {
    return otp.split('').join(' ');
  }

  setDifficultyLevel() {
    const otpLength = parseInt(document.getElementById('otpLength').value);
    const badges = document.querySelectorAll('.badge');
    
    badges.forEach(badge => badge.classList.remove('active'));

    if (otpLength <= 4) {
      document.querySelector('[data-level="easy"]').classList.add('active');
    } else if (otpLength <= 6) {
      document.querySelector('[data-level="medium"]').classList.add('active');
    } else if (otpLength <= 9) {
      document.querySelector('[data-level="hard"]').classList.add('active');
    } else {
      document.querySelector('[data-level="expert"]').classList.add('active');
    }
  }

  selectDifficulty(level) {
    const otpLengthSlider = document.getElementById('otpLength');
    const digitsDisplay = document.getElementById('digitsDisplay');
    
    const settings = {
      easy: { digits: 4, time: 5000 },
      medium: { digits: 6, time: 3000 },
      hard: { digits: 8, time: 3000 },
      expert: { digits: 10, time: 2000 }
    };

    if (settings[level]) {
      otpLengthSlider.value = settings[level].digits;
      digitsDisplay.textContent = settings[level].digits;
      document.getElementById('displayTime').value = settings[level].time;
      this.setDifficultyLevel();
    }
  }

  updateStats() {
    document.getElementById('score').textContent = this.score.toLocaleString();
    document.getElementById('streak').textContent = this.streak;
    document.getElementById('level').textContent = this.level;
  }

  updateDisplay() {
    const display = document.getElementById('otpDisplay');
    display.innerHTML = `
      <div class="otp-placeholder">
        <i class="fas fa-play"></i>
        <span>Click Start to Begin</span>
      </div>
    `;
  }

  resetGame() {
    this.score = 0;
    this.streak = 0;
    this.level = 1;
    this.attempts = 0;
    this.isGameActive = false;

    clearInterval(this.timer);
    clearInterval(this.inputTimer);

    // Reset UI
    document.getElementById('otpInput').value = '';
    document.getElementById('otpInput').disabled = true;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('message').innerHTML = '';
    document.getElementById('message').className = 'message-area';
    document.querySelector('.timer-fill').style.width = '100%';
    document.getElementById('timerText').textContent = 'Ready';

    this.updateDisplay();
    this.updateStats();
    this.saveGameData();
  }

  goHome() {
    window.location.href = '../index.html';
  }

  playSound(type) {
    if (!this.soundEnabled) return;

    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const frequencies = {
      start: [440, 554.37], // A4, C#5
      success: [523.25, 659.25, 783.99], // C5, E5, G5
      wrong: [220, 196], // A3, G3
      fail: [146.83, 130.81] // D3, C3
    };

    const freq = frequencies[type] || [440];
    
    freq.forEach((frequency, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type === 'success' ? 'sine' : 'square';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }, index * 100);
    });
  }

  saveGameData() {
    const gameData = {
      score: this.score,
      streak: this.streak,
      level: this.level,
      soundEnabled: this.soundEnabled
    };
    localStorage.setItem('otpMemoryGame', JSON.stringify(gameData));
  }

  loadGameData() {
    const savedData = localStorage.getItem('otpMemoryGame');
    if (savedData) {
      const gameData = JSON.parse(savedData);
      this.score = gameData.score || 0;
      this.streak = gameData.streak || 0;
      this.level = gameData.level || 1;
      this.soundEnabled = gameData.soundEnabled !== undefined ? gameData.soundEnabled : true;
      
      document.getElementById('soundToggle').checked = this.soundEnabled;
      this.updateStats();
    }
  }
}

// Initialize the game
let game;

// Global functions for HTML event handlers
function startGame() {
  if (!game) {
    game = new OTPMemoryGame();
  }
  game.startGame();
}

function resetGame() {
  if (game) {
    game.resetGame();
  }
}

function goHome() {
  if (game) {
    game.goHome();
  } else {
    window.location.href = '../index.html';
  }
}

function closeModal() {
  if (game) {
    game.closeModal();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  game = new OTPMemoryGame();
});

// Handle page visibility for timer management
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game && game.isGameActive) {
    // Pause timers when page is hidden
    clearInterval(game.inputTimer);
  }
});

// Add some fun keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) return; // Ignore if modifier keys are pressed
  
  switch(e.key) {
    case ' ': // Spacebar to start game
      e.preventDefault();
      if (!game.isGameActive) {
        startGame();
      }
      break;
    case 'r':
    case 'R': // R to reset
      if (!game.isGameActive) {
        resetGame();
      }
      break;
    case 'h':
    case 'H': // H for home
      if (!game.isGameActive) {
        goHome();
      }
      break;
    case 'Escape': // Escape to close modals
      closeModal();
      break;
  }
});

// Add mobile touch feedback
document.addEventListener('touchstart', (e) => {
  if (e.target.matches('button, .badge, .stat-item')) {
    e.target.style.transform = 'scale(0.95)';
  }
});

document.addEventListener('touchend', (e) => {
  if (e.target.matches('button, .badge, .stat-item')) {
    setTimeout(() => {
      e.target.style.transform = '';
    }, 150);
  }
});
