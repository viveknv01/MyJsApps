// Game State Management
let gameState = {
    currentMode: null,
    currentScreen: 'start-screen',
    contacts: [],
    scores: {
        mode1: 0,
        mode2: 0,
        mode3: 0,
        mode4: 0
    },
    bestScores: {
        mode1: 0,
        mode2: 0,
        mode3: 0,
        mode4: 0
    }
};

// Mode 1 (Recall Mode) State
let mode1State = {
    currentQuestion: 0,
    totalQuestions: 10,
    score: 0,
    questions: [],
    currentAnswer: null
};

// Mode 2 (Missing Digits) State
let mode2State = {
    currentRound: 1,
    totalRounds: 5,
    score: 0,
    difficulty: 'medium',
    currentNumber: '',
    missingPositions: [],
    startTime: 0,
    settings: {
        easy: { missing: 3, viewTime: 5 },
        medium: { missing: 5, viewTime: 3 },
        hard: { missing: 7, viewTime: 2 }
    }
};

// Mode 3 (Sequence Recall) State
let mode3State = {
    level: 1,
    score: 0,
    lives: 3,
    currentSequence: [],
    maxLevel: 10,
    baseScore: 100
};

// Mode 4 (Complete Input) State
let mode4State = {
    currentQuestion: 0,
    totalQuestions: 10,
    score: 0,
    correctAnswers: 0,
    questions: [],
    difficulty: 'medium',
    pointsPerQuestion: 25
};

// Initialize Game
document.addEventListener('DOMContentLoaded', function() {
    loadBestScores();
    displayBestScores();
    loadContacts();
    
    // Check for auto-restore after a short delay
    setTimeout(() => {
        checkForAutoRestore();
    }, 1000);
});

// LocalStorage Management
function saveBestScores() {
    localStorage.setItem('memoryGameBestScores', JSON.stringify(gameState.bestScores));
}

function loadBestScores() {
    const saved = localStorage.getItem('memoryGameBestScores');
    if (saved) {
        gameState.bestScores = JSON.parse(saved);
    }
}

function saveContacts() {
    localStorage.setItem('memoryGameContacts', JSON.stringify(gameState.contacts));
}

function loadContacts() {
    const saved = localStorage.getItem('memoryGameContacts');
    if (saved) {
        gameState.contacts = JSON.parse(saved);
        updateManagerContactsDisplay();
        updateSetupContactsDisplay();
    }
}

function displayBestScores() {
    document.getElementById('best-score-1').textContent = gameState.bestScores.mode1;
    document.getElementById('best-score-2').textContent = gameState.bestScores.mode2;
    document.getElementById('best-score-3').textContent = gameState.bestScores.mode3;
    document.getElementById('best-score-4').textContent = gameState.bestScores.mode4;
}

// Screen Navigation
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
    gameState.currentScreen = screenId;
}

function goHome() {
    showScreen('start-screen');
    displayBestScores();
}

function goToMainHome() {
    // Navigate to the main projects page
    window.location.href = '../index.html';
}

// Mode Selection
function selectMode(mode) {
    gameState.currentMode = mode;
    
    switch(mode) {
        case 1:
            showScreen('mode1-setup');
            updateSetupContactsDisplay();
            break;
        case 2:
            if (gameState.contacts.length === 0) {
                alert('You need at least 1 contact to play Missing Digits mode! Please add some contacts first.');
                showContactManager();
                return;
            }
            showScreen('mode2-setup');
            break;
        case 3:
            initMode3();
            showScreen('mode3-game');
            break;
        case 4:
            if (gameState.contacts.length < 3) {
                alert('You need at least 3 contacts to play Complete Input mode! Please add some contacts first.');
                showContactManager();
                return;
            }
            showScreen('mode4-setup');
            updateMode4ContactsDisplay();
            break;
    }
}

// Contact Manager Functions
function showContactManager() {
    showScreen('contact-manager');
    updateManagerContactsDisplay();
}

function addContactFromManager() {
    const nameInput = document.getElementById('manager-contact-name');
    const numberInput = document.getElementById('manager-contact-number');
    
    const name = nameInput.value.trim();
    const number = numberInput.value.trim();
    
    if (name === '' || number === '') {
        alert('Please enter both name and number!');
        return;
    }
    
    if (!/^\d{10}$/.test(number)) {
        alert('Please enter a valid 10-digit mobile number!');
        return;
    }
    
    // Check for duplicates
    if (gameState.contacts.some(contact => contact.name.toLowerCase() === name.toLowerCase())) {
        alert('Contact name already exists!');
        return;
    }
    
    if (gameState.contacts.some(contact => contact.number === number)) {
        alert('This number already exists!');
        return;
    }
    
    gameState.contacts.push({ name, number });
    nameInput.value = '';
    numberInput.value = '';
    
    updateManagerContactsDisplay();
    saveContacts();
}

function updateManagerContactsDisplay() {
    const display = document.getElementById('manager-contacts-display');
    const count = document.getElementById('manager-contact-count');
    
    count.textContent = gameState.contacts.length;
    
    display.innerHTML = '';
    if (gameState.contacts.length === 0) {
        display.innerHTML = '<p style="text-align: center; color: #718096; margin: 20px;">No contacts added yet. Add some to start playing!</p>';
        return;
    }
    
    gameState.contacts.forEach((contact, index) => {
        const div = document.createElement('div');
        div.className = 'contact-item';
        div.innerHTML = `
            <span class="name">${contact.name}</span>
            <span class="number">${contact.number}</span>
            <button class="delete-contact" onclick="deleteContactFromManager(${index})">Delete</button>
        `;
        display.appendChild(div);
    });
}

function updateSetupContactsDisplay() {
    const display = document.getElementById('setup-contacts-display');
    const count = document.getElementById('setup-contact-count');
    const startButton = document.getElementById('start-mode1');
    
    count.textContent = gameState.contacts.length;
    
    display.innerHTML = '';
    if (gameState.contacts.length === 0) {
        display.innerHTML = '<p style="text-align: center; color: #718096; margin: 20px;">No contacts available. Please add some contacts first!</p>';
    } else {
        gameState.contacts.forEach((contact) => {
            const div = document.createElement('div');
            div.className = 'contact-item';
            div.innerHTML = `
                <span class="name">${contact.name}</span>
                <span class="number">${contact.number}</span>
            `;
            display.appendChild(div);
        });
    }
    
    startButton.disabled = gameState.contacts.length < 3;
    startButton.textContent = gameState.contacts.length < 3 
        ? `Start Game (Need ${3 - gameState.contacts.length} more contacts)` 
        : 'Start Game';
}

function deleteContactFromManager(index) {
    gameState.contacts.splice(index, 1);
    updateManagerContactsDisplay();
    saveContacts();
}

function copyAllContacts() {
    if (gameState.contacts.length === 0) {
        alert('No contacts to copy!');
        return;
    }
    
    const contactsText = gameState.contacts.map(contact => `${contact.name}: ${contact.number}`).join('\n');
    
    // Auto-backup when copying
    createAutoBackup();
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(contactsText).then(() => {
            alert('All contacts copied to clipboard!\n\n✅ Auto-backup created for safety.');
        }).catch(() => {
            // Fallback for older browsers
            copyToClipboardFallback(contactsText);
        });
    } else {
        copyToClipboardFallback(contactsText);
    }
}

function copyToClipboardFallback(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert('All contacts copied to clipboard!\n\n✅ Auto-backup created for safety.');
    } catch (err) {
        alert('Copy failed. Please copy manually:\n\n' + text);
    }
    
    document.body.removeChild(textArea);
}

// Backup and Restore Functions
function createAutoBackup() {
    const backupData = {
        contacts: gameState.contacts,
        bestScores: gameState.bestScores,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    // Store in multiple places for redundancy
    try {
        // Primary backup in localStorage with different key
        localStorage.setItem('memoryGameBackup', JSON.stringify(backupData));
        
        // Secondary backup in sessionStorage
        sessionStorage.setItem('memoryGameBackup', JSON.stringify(backupData));
        
        console.log('Auto-backup created successfully');
    } catch (error) {
        console.error('Backup creation failed:', error);
    }
}

function downloadBackup() {
    const backupData = {
        contacts: gameState.contacts,
        bestScores: gameState.bestScores,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `mobile-memory-game-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Also create auto-backup
    createAutoBackup();
    
    alert('📦 Backup file downloaded!\n\n📋 Keep this file safe to restore your contacts later.');
}

function uploadBackup() {
    document.getElementById('backup-file-input').click();
}

function restoreFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            if (backupData.contacts && Array.isArray(backupData.contacts)) {
                const confirmRestore = confirm(
                    `Found backup with ${backupData.contacts.length} contacts from ${new Date(backupData.timestamp).toLocaleDateString()}.\n\n` +
                    'This will replace your current contacts. Continue?'
                );
                
                if (confirmRestore) {
                    gameState.contacts = backupData.contacts;
                    
                    if (backupData.bestScores) {
                        gameState.bestScores = backupData.bestScores;
                        saveBestScores();
                        displayBestScores();
                    }
                    
                    saveContacts();
                    updateManagerContactsDisplay();
                    
                    alert(`✅ Successfully restored ${backupData.contacts.length} contacts!`);
                }
            } else {
                alert('❌ Invalid backup file format!');
            }
        } catch (error) {
            alert('❌ Error reading backup file!');
        }
    };
    
    reader.readAsText(file);
    
    // Clear the input so the same file can be selected again
    event.target.value = '';
}

function showLastBackup() {
    const backupInfo = document.getElementById('backup-info');
    
    try {
        const backup = localStorage.getItem('memoryGameBackup');
        
        if (backup) {
            const backupData = JSON.parse(backup);
            const backupDate = new Date(backupData.timestamp);
            
            backupInfo.innerHTML = `
                <strong>📦 Last Auto-Backup Info:</strong><br>
                📅 Date: ${backupDate.toLocaleDateString()} at ${backupDate.toLocaleTimeString()}<br>
                📱 Contacts: ${backupData.contacts.length}<br>
                🏆 Best Scores: Mode1:${backupData.bestScores?.mode1 || 0}, Mode2:${backupData.bestScores?.mode2 || 0}, Mode3:${backupData.bestScores?.mode3 || 0}, Mode4:${backupData.bestScores?.mode4 || 0}
            `;
            backupInfo.className = 'backup-info show';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                backupInfo.className = 'backup-info';
            }, 5000);
        } else {
            backupInfo.innerHTML = '📦 No auto-backup found. Copy contacts to create one!';
            backupInfo.className = 'backup-info show';
            
            setTimeout(() => {
                backupInfo.className = 'backup-info';
            }, 3000);
        }
    } catch (error) {
        backupInfo.innerHTML = '❌ Error reading backup info.';
        backupInfo.className = 'backup-info show';
        
        setTimeout(() => {
            backupInfo.className = 'backup-info';
        }, 3000);
    }
}

function checkForAutoRestore() {
    // Check if main localStorage is empty but backup exists
    const mainContacts = localStorage.getItem('memoryGameContacts');
    const backup = localStorage.getItem('memoryGameBackup');
    
    if ((!mainContacts || JSON.parse(mainContacts).length === 0) && backup) {
        try {
            const backupData = JSON.parse(backup);
            
            if (backupData.contacts && backupData.contacts.length > 0) {
                const restoreBackup = confirm(
                    `🔄 Detected an auto-backup with ${backupData.contacts.length} contacts from ${new Date(backupData.timestamp).toLocaleDateString()}.\n\n` +
                    'Would you like to restore your contacts?'
                );
                
                if (restoreBackup) {
                    gameState.contacts = backupData.contacts;
                    
                    if (backupData.bestScores) {
                        gameState.bestScores = backupData.bestScores;
                        saveBestScores();
                        displayBestScores();
                    }
                    
                    saveContacts();
                    updateManagerContactsDisplay();
                    
                    alert(`✅ Restored ${backupData.contacts.length} contacts from auto-backup!`);
                }
            }
        } catch (error) {
            console.error('Auto-restore failed:', error);
        }
    }
}

function pasteContacts() {
    const pastedText = prompt('Paste your contacts here (Supports multiple formats):\n\n' +
        '• Name: Number\n' +
        '• Name - Number\n' +
        '• Name | Number\n' +
        '• Name,Number\n' +
        '• Number (will generate name)\n' +
        '• Just paste and let us detect the format!');
    
    if (!pastedText) return;
    
    const lines = pastedText.split('\n');
    let addedCount = 0;
    let errorCount = 0;
    let autoNameCounter = 1;
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') return;
        
        let name = '';
        let number = '';
        
        // Try different parsing patterns
        let match;
        
        // Pattern 1: Name: Number or Name - Number or Name | Number
        match = trimmedLine.match(/^(.+?)[:|\-|\|]\s*(\d+)$/);
        if (match) {
            name = match[1].trim();
            number = match[2].trim();
        }
        
        // Pattern 2: Name, Number
        if (!match) {
            match = trimmedLine.match(/^(.+?),\s*(\d+)$/);
            if (match) {
                name = match[1].trim();
                number = match[2].trim();
            }
        }
        
        // Pattern 3: Just a 10-digit number (generate name)
        if (!match) {
            match = trimmedLine.match(/^(\d{10})$/);
            if (match) {
                number = match[1];
                name = `Contact ${autoNameCounter}`;
                autoNameCounter++;
            }
        }
        
        // Pattern 4: Number followed by name
        if (!match) {
            match = trimmedLine.match(/^(\d{10})\s+(.+)$/);
            if (match) {
                number = match[1];
                name = match[2].trim();
            }
        }
        
        // Validate and add
        if (name && /^\d{10}$/.test(number)) {
            // Check for duplicates
            const nameExists = gameState.contacts.some(contact => contact.name.toLowerCase() === name.toLowerCase());
            const numberExists = gameState.contacts.some(contact => contact.number === number);
            
            if (!nameExists && !numberExists) {
                gameState.contacts.push({ name, number });
                addedCount++;
            } else {
                errorCount++;
            }
        } else {
            errorCount++;
        }
    });
    
    if (addedCount > 0) {
        updateManagerContactsDisplay();
        saveContacts();
        createAutoBackup(); // Create backup after adding contacts
        
        alert(`✅ Successfully added ${addedCount} contacts!${errorCount > 0 ? `\n⚠️ ${errorCount} entries had errors or were duplicates` : ''}\n\n📦 Auto-backup created.`);
    } else {
        alert('❌ No valid contacts found.\n\nSupported formats:\n• Name: Number\n• Name - Number\n• Name | Number\n• Name,Number\n• 1234567890 (auto-generates name)\n\nNumbers must be exactly 10 digits.');
    }
}

function generateRandomContacts() {
    const sampleNames = [
        'Alice', 'Bob', 'Charlie', 'Diana', 'Eva', 'Frank', 'Grace', 'Henry',
        'Ivy', 'Jack', 'Kelly', 'Leo', 'Maya', 'Nick', 'Olivia', 'Paul',
        'Quinn', 'Rachel', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xander'
    ];
    
    const count = parseInt(prompt('How many random contacts to add? (1-10)') || '5');
    
    if (isNaN(count) || count < 1 || count > 10) {
        alert('Please enter a number between 1 and 10.');
        return;
    }
    
    let addedCount = 0;
    
    for (let i = 0; i < count && addedCount < count; i++) {
        const name = sampleNames[Math.floor(Math.random() * sampleNames.length)] + Math.floor(Math.random() * 100);
        const number = generateRandomNumber().toString();
        
        // Check if name already exists
        if (!gameState.contacts.some(contact => contact.name === name)) {
            gameState.contacts.push({ name, number });
            addedCount++;
        }
    }
    
    updateManagerContactsDisplay();
    saveContacts();
    alert(`Added ${addedCount} random contacts!`);
}

// === MODE 1: RECALL MODE ===

function addContact() {
    const nameInput = document.getElementById('contact-name');
    const numberInput = document.getElementById('contact-number');
    
    const name = nameInput.value.trim();
    const number = numberInput.value.trim();
    
    if (name === '' || number === '') {
        alert('Please enter both name and number!');
        return;
    }
    
    if (!/^\d{10}$/.test(number)) {
        alert('Please enter a valid 10-digit mobile number!');
        return;
    }
    
    // Check for duplicates
    if (gameState.contacts.some(contact => contact.name.toLowerCase() === name.toLowerCase())) {
        alert('Contact name already exists!');
        return;
    }
    
    if (gameState.contacts.some(contact => contact.number === number)) {
        alert('This number already exists!');
        return;
    }
    
    gameState.contacts.push({ name, number });
    nameInput.value = '';
    numberInput.value = '';
    
    updateContactsDisplay();
    saveContacts();
}

function updateContactsDisplay() {
    updateSetupContactsDisplay();
}

function deleteContact(index) {
    gameState.contacts.splice(index, 1);
    updateContactsDisplay();
    saveContacts();
}

function startMode1() {
    if (gameState.contacts.length < 3) {
        alert('You need at least 3 contacts to play!');
        return;
    }
    
    // Reset game state
    mode1State.currentQuestion = 0;
    mode1State.score = 0;
    mode1State.questions = generateMode1Questions();
    
    showScreen('mode1-game');
    displayMode1Question();
}

function generateMode1Questions() {
    const questions = [];
    const contacts = [...gameState.contacts];
    
    for (let i = 0; i < mode1State.totalQuestions; i++) {
        const correctContact = contacts[Math.floor(Math.random() * contacts.length)];
        const wrongContacts = contacts.filter(c => c !== correctContact);
        
        // Create wrong options from existing contacts
        const options = [correctContact];
        
        // Add 3 wrong options from existing contacts
        const shuffledWrong = [...wrongContacts].sort(() => Math.random() - 0.5);
        for (let j = 0; j < 3 && j < shuffledWrong.length; j++) {
            options.push(shuffledWrong[j]);
        }
        
        // If we don't have enough contacts, create variations of existing numbers
        while (options.length < 4) {
            const baseContact = contacts[Math.floor(Math.random() * contacts.length)];
            const fakeNumber = generateVariationNumber(baseContact.number);
            options.push({
                name: 'Variation',
                number: fakeNumber
            });
        }
        
        // Shuffle options
        for (let k = options.length - 1; k > 0; k--) {
            const j = Math.floor(Math.random() * (k + 1));
            [options[k], options[j]] = [options[j], options[k]];
        }
        
        questions.push({
            contact: correctContact,
            options: options,
            correctAnswer: correctContact.number
        });
    }
    
    return questions;
}

function generateVariationNumber(originalNumber) {
    // Create a variation by changing 2-3 digits
    let variation = originalNumber;
    const positions = [];
    
    // Select random positions to change
    while (positions.length < 3) {
        const pos = Math.floor(Math.random() * 10);
        if (!positions.includes(pos)) {
            positions.push(pos);
        }
    }
    
    // Change digits at selected positions
    let variationArray = variation.split('');
    positions.forEach(pos => {
        let newDigit;
        do {
            newDigit = Math.floor(Math.random() * 10).toString();
        } while (newDigit === variationArray[pos]);
        variationArray[pos] = newDigit;
    });
    
    return variationArray.join('');
}

function generateRandomNumber() {
    return Math.floor(Math.random() * 9000000000) + 1000000000;
}

function displayMode1Question() {
    const question = mode1State.questions[mode1State.currentQuestion];
    
    document.getElementById('mode1-score').textContent = mode1State.score;
    document.getElementById('current-question').textContent = mode1State.currentQuestion + 1;
    document.getElementById('total-questions').textContent = mode1State.totalQuestions;
    document.getElementById('question-text').textContent = `What is ${question.contact.name}'s number?`;
    
    const optionsContainer = document.getElementById('answer-options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const div = document.createElement('div');
        div.className = 'answer-option';
        div.textContent = option.number;
        div.onclick = () => selectAnswer(option.number, div);
        optionsContainer.appendChild(div);
    });
    
    // Hide feedback and buttons
    document.getElementById('mode1-feedback').textContent = '';
    document.getElementById('next-question').style.display = 'none';
    document.getElementById('finish-mode1').style.display = 'none';
}

function selectAnswer(selectedNumber, element) {
    const question = mode1State.questions[mode1State.currentQuestion];
    const isCorrect = selectedNumber === question.correctAnswer;
    
    // Remove previous selections
    document.querySelectorAll('.answer-option').forEach(option => {
        option.classList.remove('selected');
        option.onclick = null; // Disable further clicks
    });
    
    // Mark correct and incorrect answers
    document.querySelectorAll('.answer-option').forEach(option => {
        if (option.textContent === question.correctAnswer) {
            option.classList.add('correct');
        } else if (option === element && !isCorrect) {
            option.classList.add('incorrect');
        }
    });
    
    // Update score and feedback
    if (isCorrect) {
        mode1State.score += 10;
        document.getElementById('mode1-feedback').textContent = '✅ Correct!';
        document.getElementById('mode1-feedback').className = 'feedback correct';
    } else {
        document.getElementById('mode1-feedback').textContent = '❌ Incorrect!';
        document.getElementById('mode1-feedback').className = 'feedback incorrect';
    }
    
    document.getElementById('mode1-score').textContent = mode1State.score;
    
    // Show next button or finish button
    if (mode1State.currentQuestion < mode1State.totalQuestions - 1) {
        document.getElementById('next-question').style.display = 'block';
    } else {
        document.getElementById('finish-mode1').style.display = 'block';
    }
}

function nextQuestion() {
    mode1State.currentQuestion++;
    displayMode1Question();
}

function finishMode1() {
    // Update best score if needed
    if (mode1State.score > gameState.bestScores.mode1) {
        gameState.bestScores.mode1 = mode1State.score;
        saveBestScores();
    }
    
    showResults(1, mode1State.score, {
        correct: Math.floor(mode1State.score / 10),
        total: mode1State.totalQuestions,
        accuracy: Math.round((mode1State.score / (mode1State.totalQuestions * 10)) * 100)
    });
}

// === MODE 2: MISSING DIGITS ===

function startMode2(difficulty) {
    if (gameState.contacts.length === 0) {
        alert('You need at least 1 contact to play Missing Digits mode! Please add some contacts first.');
        showContactManager();
        return;
    }
    
    mode2State.difficulty = difficulty;
    mode2State.currentRound = 1;
    mode2State.score = 0;
    
    showScreen('mode2-game');
    startMode2Round();
}

function startMode2Round() {
    // Use a random contact number instead of generating random
    const randomContact = gameState.contacts[Math.floor(Math.random() * gameState.contacts.length)];
    mode2State.currentNumber = randomContact.number;
    mode2State.startTime = Date.now();
    
    const settings = mode2State.settings[mode2State.difficulty];
    
    // Show the number to memorize
    document.getElementById('number-to-memorize').textContent = mode2State.currentNumber;
    document.getElementById('mode2-score').textContent = mode2State.score;
    document.getElementById('mode2-round').textContent = mode2State.currentRound;
    document.getElementById('mode2-timer').textContent = '0';
    
    // Show memorization phase
    document.querySelector('.memorize-container').style.display = 'block';
    document.getElementById('input-container').style.display = 'none';
    document.getElementById('mode2-feedback').textContent = '';
    document.getElementById('next-round-mode2').style.display = 'none';
    document.getElementById('finish-mode2').style.display = 'none';
    
    // Start countdown
    let countdown = settings.viewTime;
    const countdownElement = document.getElementById('memorize-countdown');
    countdownElement.textContent = countdown;
    
    const countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            startInputPhase();
        }
    }, 1000);
}

function startInputPhase() {
    const settings = mode2State.settings[mode2State.difficulty];
    
    // Hide memorization phase
    document.querySelector('.memorize-container').style.display = 'none';
    document.getElementById('input-container').style.display = 'block';
    
    // Generate missing positions
    mode2State.missingPositions = [];
    while (mode2State.missingPositions.length < settings.missing) {
        const pos = Math.floor(Math.random() * 10);
        if (!mode2State.missingPositions.includes(pos)) {
            mode2State.missingPositions.push(pos);
        }
    }
    mode2State.missingPositions.sort((a, b) => a - b);
    
    // Create display with blanks
    let displayNumber = mode2State.currentNumber;
    let blankNumber = '';
    for (let i = 0; i < displayNumber.length; i++) {
        if (mode2State.missingPositions.includes(i)) {
            blankNumber += '_';
        } else {
            blankNumber += displayNumber[i];
        }
    }
    
    document.getElementById('number-with-blanks').textContent = blankNumber;
    
    // Create input fields
    const inputsContainer = document.getElementById('digit-inputs');
    inputsContainer.innerHTML = '';
    
    mode2State.missingPositions.forEach((pos, index) => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'digit-input';
        input.maxLength = 1;
        input.pattern = '[0-9]';
        input.placeholder = '?';
        input.setAttribute('data-position', pos);
        
        // Auto-focus next input
        input.addEventListener('input', (e) => {
            if (e.target.value && index < mode2State.missingPositions.length - 1) {
                inputsContainer.children[index + 1].focus();
            }
        });
        
        inputsContainer.appendChild(input);
    });
    
    // Focus first input
    if (inputsContainer.children.length > 0) {
        inputsContainer.children[0].focus();
    }
    
    // Start timer
    startMode2Timer();
}

function startMode2Timer() {
    const timerElement = document.getElementById('mode2-timer');
    const startTime = Date.now();
    
    const timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timerElement.textContent = elapsed;
        mode2State.currentTime = elapsed;
    }, 1000);
    
    mode2State.timerInterval = timerInterval;
}

function submitMode2Answer() {
    clearInterval(mode2State.timerInterval);
    
    const inputs = document.querySelectorAll('.digit-input');
    let userAnswer = mode2State.currentNumber;
    let isCorrect = true;
    
    inputs.forEach(input => {
        const position = parseInt(input.getAttribute('data-position'));
        const userDigit = input.value;
        const correctDigit = mode2State.currentNumber[position];
        
        if (userDigit !== correctDigit) {
            isCorrect = false;
        }
    });
    
    // Calculate score based on accuracy and time
    let roundScore = 0;
    if (isCorrect) {
        const timeBonus = Math.max(0, 50 - mode2State.currentTime);
        const difficultyMultiplier = mode2State.difficulty === 'easy' ? 1 : 
                                   mode2State.difficulty === 'medium' ? 2 : 3;
        roundScore = (100 + timeBonus) * difficultyMultiplier;
        mode2State.score += roundScore;
    }
    
    // Show feedback
    const feedback = document.getElementById('mode2-feedback');
    if (isCorrect) {
        feedback.textContent = `✅ Correct! +${roundScore} points`;
        feedback.className = 'feedback correct';
    } else {
        feedback.textContent = '❌ Incorrect!';
        feedback.className = 'feedback incorrect';
    }
    
    document.getElementById('mode2-score').textContent = mode2State.score;
    
    // Show next round or finish button
    if (mode2State.currentRound < mode2State.totalRounds) {
        document.getElementById('next-round-mode2').style.display = 'block';
    } else {
        document.getElementById('finish-mode2').style.display = 'block';
    }
}

function nextRoundMode2() {
    mode2State.currentRound++;
    startMode2Round();
}

function finishMode2() {
    // Update best score if needed
    if (mode2State.score > gameState.bestScores.mode2) {
        gameState.bestScores.mode2 = mode2State.score;
        saveBestScores();
    }
    
    showResults(2, mode2State.score, {
        rounds: mode2State.totalRounds,
        difficulty: mode2State.difficulty,
        averageScore: Math.round(mode2State.score / mode2State.totalRounds)
    });
}

// === MODE 3: SEQUENCE RECALL ===

function initMode3() {
    mode3State.level = 1;
    mode3State.score = 0;
    mode3State.lives = 3;
    mode3State.currentSequence = [];
    
    startMode3Level();
}

function startMode3Level() {
    // Generate sequence for this level (level + 2 numbers)
    const sequenceLength = mode3State.level + 2;
    mode3State.currentSequence = [];
    
    for (let i = 0; i < sequenceLength; i++) {
        // Use contact numbers when available, otherwise generate random
        if (gameState.contacts.length > 0 && Math.random() < 0.7) {
            // 70% chance to use a contact number if contacts exist
            const randomContact = gameState.contacts[Math.floor(Math.random() * gameState.contacts.length)];
            mode3State.currentSequence.push(randomContact.number);
        } else {
            // Use random number
            mode3State.currentSequence.push(generateRandomNumber().toString());
        }
    }
    
    // Update UI
    document.getElementById('mode3-score').textContent = mode3State.score;
    document.getElementById('mode3-level').textContent = mode3State.level;
    document.getElementById('mode3-lives').textContent = mode3State.lives;
    document.getElementById('mode3-instruction').textContent = `Memorize this sequence (${sequenceLength} numbers):`;
    
    // Hide input section
    document.getElementById('sequence-input').style.display = 'none';
    document.getElementById('mode3-feedback').textContent = '';
    document.getElementById('next-level').style.display = 'none';
    document.getElementById('finish-mode3').style.display = 'none';
    
    // Show sequence
    displaySequence();
}

function displaySequence() {
    const display = document.getElementById('sequence-display');
    display.innerHTML = '';
    
    let index = 0;
    const showNext = () => {
        if (index < mode3State.currentSequence.length) {
            const div = document.createElement('div');
            div.className = 'sequence-number';
            div.textContent = mode3State.currentSequence[index];
            display.appendChild(div);
            index++;
            
            setTimeout(showNext, 1500); // Show each number for 1.5 seconds
        } else {
            // All numbers shown, start countdown before input phase
            setTimeout(() => {
                startSequenceCountdown();
            }, 1000);
        }
    };
    
    showNext();
}

function startSequenceCountdown() {
    const countdownElement = document.getElementById('sequence-countdown');
    let countdown = 3;
    countdownElement.textContent = countdown;
    countdownElement.style.display = 'block';
    
    const countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            countdownElement.style.display = 'none';
            startSequenceInput();
        }
    }, 1000);
}

function startSequenceInput() {
    // Hide sequence display
    document.getElementById('sequence-display').style.display = 'none';
    
    // Show input section
    document.getElementById('sequence-input').style.display = 'block';
    
    // Create input fields
    const inputsContainer = document.getElementById('sequence-inputs');
    inputsContainer.innerHTML = '';
    
    mode3State.currentSequence.forEach((number, index) => {
        const input = document.createElement('input');
        input.type = 'tel';
        input.className = 'sequence-input-field';
        input.placeholder = `Number ${index + 1}`;
        input.maxLength = 10;
        input.setAttribute('data-index', index);
        
        // Auto-focus next input
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 10 && index < mode3State.currentSequence.length - 1) {
                inputsContainer.children[index + 1].focus();
            }
        });
        
        inputsContainer.appendChild(input);
    });
    
    // Focus first input
    if (inputsContainer.children.length > 0) {
        inputsContainer.children[0].focus();
    }
}

function submitSequence() {
    const inputs = document.querySelectorAll('.sequence-input-field');
    let correctCount = 0;
    
    inputs.forEach((input, index) => {
        const userNumber = input.value.trim();
        const correctNumber = mode3State.currentSequence[index];
        
        if (userNumber === correctNumber) {
            correctCount++;
            input.style.backgroundColor = '#c6f6d5';
        } else {
            input.style.backgroundColor = '#fed7d7';
        }
    });
    
    const isSuccess = correctCount === mode3State.currentSequence.length;
    const feedback = document.getElementById('mode3-feedback');
    
    if (isSuccess) {
        // Calculate score with level multiplier
        const levelScore = mode3State.baseScore * mode3State.level;
        mode3State.score += levelScore;
        
        feedback.textContent = `✅ Perfect! +${levelScore} points`;
        feedback.className = 'feedback correct';
        
        document.getElementById('mode3-score').textContent = mode3State.score;
        
        if (mode3State.level < mode3State.maxLevel) {
            mode3State.level++;
            document.getElementById('next-level').style.display = 'block';
        } else {
            // Max level reached
            document.getElementById('finish-mode3').style.display = 'block';
        }
    } else {
        mode3State.lives--;
        
        feedback.textContent = `❌ ${correctCount}/${mode3State.currentSequence.length} correct. Lives remaining: ${mode3State.lives}`;
        feedback.className = 'feedback incorrect';
        
        document.getElementById('mode3-lives').textContent = mode3State.lives;
        
        if (mode3State.lives > 0) {
            // Try again with same level
            setTimeout(() => {
                startMode3Level();
            }, 2000);
        } else {
            // Game over
            document.getElementById('finish-mode3').style.display = 'block';
        }
    }
}

function nextLevel() {
    // Reset sequence display
    document.getElementById('sequence-display').style.display = 'block';
    startMode3Level();
}

function finishMode3() {
    // Update best score if needed
    if (mode3State.score > gameState.bestScores.mode3) {
        gameState.bestScores.mode3 = mode3State.score;
        saveBestScores();
    }
    
    showResults(3, mode3State.score, {
        level: mode3State.level,
        maxLevel: mode3State.maxLevel,
        livesUsed: 3 - mode3State.lives
    });
}

// === MODE 4: COMPLETE INPUT ===

function updateMode4ContactsDisplay() {
    const display = document.getElementById('mode4-contacts-display');
    const count = document.getElementById('mode4-contact-count');
    
    count.textContent = gameState.contacts.length;
    
    display.innerHTML = '';
    if (gameState.contacts.length === 0) {
        display.innerHTML = '<p style="text-align: center; color: #718096; margin: 20px;">No contacts available. Please add some contacts first!</p>';
    } else {
        gameState.contacts.forEach((contact) => {
            const div = document.createElement('div');
            div.className = 'contact-item';
            div.innerHTML = `
                <span class="name">${contact.name}</span>
                <span class="number">${contact.number}</span>
            `;
            display.appendChild(div);
        });
    }
}

function startMode4(difficulty) {
    if (gameState.contacts.length < 3) {
        alert('You need at least 3 contacts to play!');
        return;
    }
    
    // Set difficulty parameters
    const difficultySettings = {
        easy: { questions: 5, points: 20 },
        medium: { questions: 10, points: 25 },
        hard: { questions: 15, points: 30 }
    };
    
    const settings = difficultySettings[difficulty];
    
    // Reset game state
    mode4State.currentQuestion = 0;
    mode4State.totalQuestions = settings.questions;
    mode4State.pointsPerQuestion = settings.points;
    mode4State.score = 0;
    mode4State.correctAnswers = 0;
    mode4State.difficulty = difficulty;
    mode4State.questions = generateMode4Questions();
    
    showScreen('mode4-game');
    displayMode4Question();
}

function generateMode4Questions() {
    const questions = [];
    const contacts = [...gameState.contacts];
    
    for (let i = 0; i < mode4State.totalQuestions; i++) {
        const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
        
        questions.push({
            contact: randomContact,
            correctAnswer: randomContact.number
        });
    }
    
    return questions;
}

function displayMode4Question() {
    const question = mode4State.questions[mode4State.currentQuestion];
    
    // Update UI elements
    document.getElementById('mode4-score').textContent = mode4State.score;
    document.getElementById('mode4-current-question').textContent = mode4State.currentQuestion + 1;
    document.getElementById('mode4-total-questions').textContent = mode4State.totalQuestions;
    document.getElementById('mode4-accuracy').textContent = Math.round((mode4State.correctAnswers / Math.max(1, mode4State.currentQuestion)) * 100) + '%';
    document.getElementById('mode4-question-text').textContent = `What is ${question.contact.name}'s number?`;
    
    // Reset input and feedback
    const input = document.getElementById('mode4-number-input');
    input.value = '';
    input.focus();
    
    document.getElementById('mode4-feedback').textContent = '';
    document.getElementById('mode4-correct-answer').style.display = 'none';
    document.getElementById('mode4-next-question').style.display = 'none';
    document.getElementById('mode4-finish-game').style.display = 'none';
    document.getElementById('mode4-submit-btn').disabled = false;
    
    // Enable enter key submission
    input.onkeypress = function(e) {
        if (e.key === 'Enter' && input.value.length === 10) {
            submitMode4Answer();
        }
    };
    
    // Enable/disable submit button based on input
    input.oninput = function() {
        const submitBtn = document.getElementById('mode4-submit-btn');
        submitBtn.disabled = input.value.length !== 10;
    };
}

function submitMode4Answer() {
    const input = document.getElementById('mode4-number-input');
    const userAnswer = input.value.trim();
    const question = mode4State.questions[mode4State.currentQuestion];
    const isCorrect = userAnswer === question.correctAnswer;
    
    // Disable input and submit button
    input.disabled = true;
    document.getElementById('mode4-submit-btn').disabled = true;
    
    // Update score and accuracy
    if (isCorrect) {
        mode4State.score += mode4State.pointsPerQuestion;
        mode4State.correctAnswers++;
        
        document.getElementById('mode4-feedback').textContent = `✅ Correct! +${mode4State.pointsPerQuestion} points`;
        document.getElementById('mode4-feedback').className = 'feedback correct';
    } else {
        document.getElementById('mode4-feedback').textContent = '❌ Incorrect!';
        document.getElementById('mode4-feedback').className = 'feedback incorrect';
        
        // Show correct answer
        document.getElementById('mode4-correct-number').textContent = question.correctAnswer;
        document.getElementById('mode4-correct-answer').style.display = 'block';
    }
    
    // Update display
    document.getElementById('mode4-score').textContent = mode4State.score;
    document.getElementById('mode4-accuracy').textContent = Math.round((mode4State.correctAnswers / (mode4State.currentQuestion + 1)) * 100) + '%';
    
    // Show next button or finish button
    if (mode4State.currentQuestion < mode4State.totalQuestions - 1) {
        document.getElementById('mode4-next-question').style.display = 'block';
    } else {
        document.getElementById('mode4-finish-game').style.display = 'block';
    }
}

function nextMode4Question() {
    mode4State.currentQuestion++;
    
    // Re-enable input
    document.getElementById('mode4-number-input').disabled = false;
    
    displayMode4Question();
}

function finishMode4() {
    // Update best score if needed
    if (mode4State.score > gameState.bestScores.mode4) {
        gameState.bestScores.mode4 = mode4State.score;
        saveBestScores();
    }
    
    const accuracy = Math.round((mode4State.correctAnswers / mode4State.totalQuestions) * 100);
    
    showResults(4, mode4State.score, {
        correct: mode4State.correctAnswers,
        total: mode4State.totalQuestions,
        accuracy: accuracy,
        difficulty: mode4State.difficulty,
        pointsPerQuestion: mode4State.pointsPerQuestion
    });
}

// Results Screen
function showResults(mode, score, details) {
    document.getElementById('final-score').textContent = score;
    
    const detailsContainer = document.getElementById('results-details');
    detailsContainer.innerHTML = '';
    
    if (mode === 1) {
        detailsContainer.innerHTML = `
            <h4>Recall Mode Results</h4>
            <p>Correct Answers: ${details.correct} / ${details.total}</p>
            <p>Accuracy: ${details.accuracy}%</p>
        `;
    } else if (mode === 2) {
        detailsContainer.innerHTML = `
            <h4>Missing Digits Results</h4>
            <p>Difficulty: ${details.difficulty.charAt(0).toUpperCase() + details.difficulty.slice(1)}</p>
            <p>Rounds Completed: ${details.rounds}</p>
            <p>Average Score per Round: ${details.averageScore}</p>
        `;
    } else if (mode === 3) {
        detailsContainer.innerHTML = `
            <h4>Sequence Recall Results</h4>
            <p>Level Reached: ${details.level} / ${details.maxLevel}</p>
            <p>Lives Used: ${details.livesUsed} / 3</p>
        `;
    } else if (mode === 4) {
        detailsContainer.innerHTML = `
            <h4>Complete Input Results</h4>
            <p>Difficulty: ${details.difficulty.charAt(0).toUpperCase() + details.difficulty.slice(1)}</p>
            <p>Correct Answers: ${details.correct} / ${details.total}</p>
            <p>Accuracy: ${details.accuracy}%</p>
            <p>Points per Question: ${details.pointsPerQuestion}</p>
        `;
    }
    
    showScreen('results-screen');
}

function playAgain() {
    selectMode(gameState.currentMode);
}

// Keyboard Support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        // Handle Enter key for different screens
        if (gameState.currentScreen === 'mode1-setup') {
            if (document.getElementById('contact-name').value || document.getElementById('contact-number').value) {
                addContact();
            }
        }
    }
});

// Allow only numbers in number inputs
document.addEventListener('input', function(e) {
    if (e.target.type === 'tel' || e.target.classList.contains('digit-input')) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    }
});