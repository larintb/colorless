// Colors for hints
const hints = {
  red: "It's the color of an apple.",
  blue: "It's the color of the sky.",
  green: "It's the color of grass.",
  yellow: "It's the color of the sun.",
  black: "It's the color of the night."
};

const gameContainer = document.querySelector('.game-container');
const hint = document.getElementById('hint');
const result = document.getElementById('result');
const buttons = document.querySelectorAll('.color-button');
const backspaceButton = document.getElementById('backspace-button');
const enterButton = document.getElementById('enter-button');
const restartButton = document.getElementById('restart-button');
const popup = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');
const closePopupButton = document.getElementById('close-popup');
const successPopup = document.getElementById('success-popup');
const successPopupContent = document.getElementById('success-popup-content');
const closeSuccessPopupButton = document.getElementById('close-success-popup');
const repeatedColorsBtn = document.getElementById('repeated-colors');
const uniqueColorsBtn = document.getElementById('unique-colors');

let guessSequence = [];
let attempts = 0;
const maxAttempts = 7;
const rows = [];
let isRepeatedColors = true; // Default mode
let targetColors = generateTargetColors();
let invalidColors = new Set(); // Set to track invalid colors

console.log('Target colors to guess:', targetColors);

// Toggle game modes
repeatedColorsBtn.addEventListener('click', () => {
  isRepeatedColors = true;
  repeatedColorsBtn.classList.add('active');
  uniqueColorsBtn.classList.remove('active');
  restartGame();
});

uniqueColorsBtn.addEventListener('click', () => {
  isRepeatedColors = false;
  uniqueColorsBtn.classList.add('active');
  repeatedColorsBtn.classList.remove('active');
  restartGame();
});

// Generate target colors
function generateTargetColors() {
  const colors = ['red', 'blue', 'green', 'yellow', 'black', 'purple', 'orange', 'pink', 'brown', 'gray'];

  if (isRepeatedColors) {
    return Array.from({ length: 5 }, () => colors[Math.floor(Math.random() * colors.length)]);
  } else {
    const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
    return shuffledColors.slice(0, 5);
  }
}

// Restart the game
function restartGame() {
  guessSequence = [];
  invalidColors.clear(); // Limpiar colores inválidos
  buttons.forEach(button => {
    const color = button.getAttribute('data-color');
    button.style.backgroundColor = color;
    button.style.color = '';
    button.disabled = false;
  });

  gameContainer.innerHTML = '';
  rows.length = 0;
  targetColors = generateTargetColors();
  console.log('New target colors:', targetColors);

  createNewRow();
  hint.textContent = '';
  result.textContent = 'Game restarted. Try again!';
  attempts = 0;
}

// Create a new row of boxes
function createNewRow() {
  const row = document.createElement('div');
  row.classList.add('color-row');
  gameContainer.appendChild(row);

  const hintRow = document.createElement('div');
  hintRow.classList.add('hint-row');
  gameContainer.appendChild(hintRow);

  const newBoxes = [];
  for (let i = 0; i < 5; i++) {
    const box = document.createElement('div');
    box.classList.add('color-box');
    box.style.backgroundColor = 'lightgray';
    box.setAttribute('data-color', targetColors[i]);
    row.appendChild(box);
    newBoxes.push(box);
  }

  rows.push({ row: newBoxes, hintRow: hintRow });
}

// Update the current row with guessed colors
function updateBoxes() {
  const currentRow = rows[rows.length - 1].row;
  currentRow.forEach((box, index) => {
    if (guessSequence[index]) {
      box.style.backgroundColor = guessSequence[index];
    } else {
      box.style.backgroundColor = 'lightgray';
    }
  });
}

// Check the player's guess
function checkGuess() {
  const currentRow = rows[rows.length - 1].row;
  const currentHintRow = rows[rows.length - 1].hintRow;
  currentHintRow.innerHTML = '';

  const hints = new Array(5).fill('black');
  const usedTargetIndices = new Set();
  const usedGuessIndices = new Set();

  // Exact matches (green)
  for (let i = 0; i < targetColors.length; i++) {
    if (guessSequence[i] === targetColors[i]) {
      hints[i] = 'green';
      usedTargetIndices.add(i);
      usedGuessIndices.add(i);
    }
  }

  // Partial matches (orange)
  for (let i = 0; i < guessSequence.length; i++) {
    if (usedGuessIndices.has(i)) continue;
    for (let j = 0; j < targetColors.length; j++) {
      if (usedTargetIndices.has(j)) continue;
      if (guessSequence[i] === targetColors[j]) {
        hints[i] = 'orange';
        usedTargetIndices.add(j);
        usedGuessIndices.add(i);
        break;
      }
    }
  }

  // Identify invalid colors
  guessSequence.forEach(color => {
    if (!targetColors.includes(color)) {
      invalidColors.add(color);
    }
  });

  // Darken invalid color buttons
  invalidColors.forEach(color => {
    const button = document.querySelector(`.color-button[data-color="${color}"]`);
    if (button) {
      button.style.backgroundColor = '#2b2b2b'; // Dark color
      button.style.color = '#ffffff'; // White text for better visibility
      button.disabled = true; // Disable the button
    }
  });

  // Create hint boxes
  hints.forEach(hintColor => {
    const hintBox = document.createElement('div');
    hintBox.classList.add('hint-box');
    hintBox.style.backgroundColor = hintColor;
    currentHintRow.appendChild(hintBox);
  });

  if (hints.every(hint => hint === 'green')) {
    showSuccessPopup();
  } else {
    attempts++;
    if (attempts >= maxAttempts) {
      showPopup();
    } else {
      guessSequence = [];
      createNewRow();
    }
  }
}

// Show success popup
function showSuccessPopup() {
  const winningColors = successPopup.querySelector('.winning-colors');
  winningColors.innerHTML = '';

  targetColors.forEach(color => {
    const colorBox = document.createElement('div');
    colorBox.classList.add('color-box');
    colorBox.style.backgroundColor = color;
    winningColors.appendChild(colorBox);
  });

  successPopup.style.display = 'block';
}

// Show failure popup
function showPopup() {
  popupContent.innerHTML = '';

  targetColors.forEach(color => {
    const colorBox = document.createElement('div');
    colorBox.classList.add('color-box');
    colorBox.style.backgroundColor = color;
    popupContent.appendChild(colorBox);
  });

  popup.style.display = 'block';
}

// Event listeners
buttons.forEach(button => {
  button.addEventListener('click', () => {
    if (guessSequence.length < 5) {
      guessSequence.push(button.getAttribute('data-color'));
      updateBoxes();
    }
  });
});

backspaceButton.addEventListener('click', () => {
  guessSequence.pop();
  updateBoxes();
  result.textContent = 'Guess removed. Try again!';
});

enterButton.addEventListener('click', checkGuess);

restartButton.addEventListener('click', restartGame);

closePopupButton.addEventListener('click', () => {
  popup.style.display = 'none';
});

closeSuccessPopupButton.addEventListener('click', () => {
  successPopup.style.display = 'none';
});

// Initialize the first row
createNewRow();

// Configure the keyboard colors
buttons.forEach(button => {
  const color = button.getAttribute('data-color');
  button.style.backgroundColor = color;
});
