// Lista de colores pastel
const pastelColors = {
  pastelRed: '#FF474C',
  pastelBlue: '#77cbda',
  pastelGreen: '#80ef80',
  pastelYellow: '#ffed29',
  black: '#252525',
  pastelPurple: '#6a5acd',
  pastelOrange: '#ff5c00',
  pastelPink: '#ff8da1',
  pastelBrown: '#895129',
  pastelGray: '#67809b'
};

// Convertimos los valores a una lista para su uso
const pastelColorValues = Object.values(pastelColors);

// DOM elements
const gameContainer = document.querySelector('.game-container');
const buttons = document.querySelectorAll('.color-button');
const backspaceButton = document.getElementById('backspace-button');
const enterButton = document.getElementById('enter-button');
const restartButton = document.getElementById('restart-button');
const popup = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');
const closePopupButton = document.getElementById('close-popup');
const successPopup = document.getElementById('success-popup');
const closeSuccessPopupButton = document.getElementById('close-success-popup');
const repeatedColorsBtn = document.getElementById('repeated-colors');
const uniqueColorsBtn = document.getElementById('unique-colors');
const keyboard = document.getElementById('keyboard');

let guessSequence = [];
let attempts = 0;
const maxAttempts = 5;
let rows = [];
let isRepeatedColors = true; // Default mode
let targetColors = generateTargetColors();
let invalidColors = new Set(); // Tracks invalid colors
let initialDistance; // Distancia inicial entre el contenedor y el teclado
let attemptsMade = 0; // Número de intentos realizados

// Evento para detectar la tecla "Enter"
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleEnter();
  }
});

// Función para manejar la acción de "Enter"
function handleEnter() {
  if (guessSequence.length === 5) {
    checkGuess(); // Llamar a la función de validación si hay un guess completo
  } else {
    // Si el intento está incompleto, agregar un efecto visual
    const currentRow = rows[rows.length - 1].row;
    currentRow.forEach(box => {
      box.classList.add('shake'); // Aplicar la animación de "shake"
    });

    setTimeout(() => {
      currentRow.forEach(box => box.classList.remove('shake')); // Remover la animación después
    }, 500); // Duración de la animación
  }
}

// Actualizar el botón "Enter" para reutilizar la lógica
enterButton.addEventListener('click', handleEnter);


//theme
// Seleccionar el botón de alternar y el body
const toggleThemeButton = document.getElementById('toggle-theme');
const themeIcon = document.getElementById('theme-icon');
themeIcon.src = "images/moon.png";
const body = document.body;
body.classList.add('theme-light'); // Modo claro por defecto

// Configurar el tema inicial
let isDarkMode = false; // Por defecto, modo claro

// Alternar entre temas
toggleThemeButton.addEventListener('click', () => {
  isDarkMode = !isDarkMode; // Alternar el estado

  // Cambiar las clases del body
  if (isDarkMode) {
    body.classList.remove('theme-light');
    body.classList.add('theme-dark');
    themeIcon.src = 'images/sun.png'; // Cambiar a ícono de sol
  } else {
    body.classList.remove('theme-dark');
    body.classList.add('theme-light');
    themeIcon.src = 'images/moon.png'; // Cambiar a ícono de luna
  }
});

// Evento para detectar la tecla "Backspace"
document.addEventListener('keydown', (event) => {
  if (event.key === 'Backspace') {
    handleBackspace();
  }
});

// Función para manejar la acción de "Backspace"
function handleBackspace() {
  if (guessSequence.length > 0) {
    guessSequence.pop(); // Eliminar el último color de la secuencia
    updateBoxes(); // Actualizar los cuadros de la fila activa
  }
}

// Actualizar el botón "Backspace" para reutilizar la lógica
backspaceButton.addEventListener('click', handleBackspace);

// Toggle game modes
repeatedColorsBtn.addEventListener('click', () => {
  if (!isRepeatedColors) {
    isRepeatedColors = true;
    toggleModeButtons(repeatedColorsBtn, uniqueColorsBtn);
    restartGame();
  }
});

uniqueColorsBtn.addEventListener('click', () => {
  if (isRepeatedColors) {
    isRepeatedColors = false;
    toggleModeButtons(uniqueColorsBtn, repeatedColorsBtn);
    restartGame();
  }
});

function toggleModeButtons(activeBtn, inactiveBtn) {
  activeBtn.classList.add('active');
  inactiveBtn.classList.remove('active');
}

// Generate target colors
function generateTargetColors() {
  const colors = isRepeatedColors
    ? Array.from({ length: 5 }, () => pastelColorValues[Math.floor(Math.random() * pastelColorValues.length)])
    : [...pastelColorValues].sort(() => Math.random() - 0.5).slice(0, 5);

  const colorKeys = colors.map(value => Object.keys(pastelColors).find(key => pastelColors[key] === value));
  console.log(colorKeys);
  return colors;
}

function markButtonAsInvalid(color) {
  const button = document.querySelector(`.color-button[data-color="${color}"]`);
  if (button) {
    button.style.backgroundColor = '#A6A6A6'; // Color gris oscuro para marcar como inválido
    button.style.color = '#ffffff'; // Cambiar el color del texto a blanco para contraste
    button.disabled = true; // Deshabilitar el botón
  }
}

// Restart the game
function restartGame() {
  guessSequence = [];
  invalidColors.clear();
  buttons.forEach(resetButton);
  rows = [];
  gameContainer.innerHTML = '';
  targetColors = generateTargetColors();
  createNewRow();
  attempts = 0;
  attemptsMade = 0;
  enableAllButtons();

}

let scrollTimeout; // Variable para manejar el temporizador

function checkScrollRequirement() {
  const scrollContainer = document.querySelector('.scroll-container');
  const totalRows = rows.length; // Número total de filas

  // Si hay suficientes filas para requerir scroll
  if (totalRows >= 1) {
    // Detectar uso de la rueda del mouse
    scrollContainer.addEventListener('wheel', () => {
      scrollContainer.classList.add('scroll-enabled'); // Mostrar la barra de desplazamiento

      // Reinicia el temporizador cada vez que se usa la rueda
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollContainer.classList.remove('scroll-enabled'); // Ocultar la barra
      }, 2000); // Ocultar después de 2 segundos (ajustar tiempo si es necesario)
    });

    // Opcional: desplazarse automáticamente al final del contenido
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  } else {
    // Quitar scroll si no hay suficientes filas
    scrollContainer.classList.remove('scroll-enabled');
  }
}

// Llamar a la función al cargar o actualizar las filas
checkScrollRequirement();



function disableAllButtons() {
  buttons.forEach(button => button.disabled = true); // Deshabilitar botones del teclado
  backspaceButton.disabled = true; // Deshabilitar botón de backspace
  enterButton.disabled = true; // Deshabilitar botón de enter
}

function enableAllButtons() {
  buttons.forEach(button => button.disabled = false); // Habilitar botones del teclado
  backspaceButton.disabled = false; // Habilitar botón de backspace
  enterButton.disabled = false; // Habilitar botón de enter
}

// Reset a button to its default state
function resetButton(button) {
  const colorName = Object.keys(pastelColors)[Array.from(buttons).indexOf(button)];
  const colorValue = pastelColors[colorName];
  button.style.backgroundColor = colorValue;
  button.setAttribute('data-color', colorValue);
  button.style.color = '';
  button.disabled = false;
}

// Create a new row of boxes
// Función para crear una nueva fila de contenedores (guess y hint)
function createNewRow() {
  const row = document.createElement('div');
  row.classList.add('color-row', 'slide-up'); // Agregar clase de animación
  gameContainer.appendChild(row);

  const hintRow = document.createElement('div');
  hintRow.classList.add('hint-row', 'slide-up'); // Agregar clase de animación
  gameContainer.appendChild(hintRow);

  const newBoxes = targetColors.map(color => {
    const box = document.createElement('div');
    box.classList.add('color-box');
    box.style.backgroundColor = 'gray';
    box.setAttribute('data-color', color);
    row.appendChild(box);
    return box;
  });

  rows.push({ row: newBoxes, hintRow });

  // Verificar si se requiere scroll después de crear la fila
  checkScrollRequirement();

  

  // Remover la clase de animación después de que se ejecute
  setTimeout(() => {
    row.classList.remove('slide-up');
    hintRow.classList.remove('slide-up');
  }, 500); // Duración de la animación
}


// Update the current row with guessed colors
function updateBoxes() {
  const currentRow = rows[rows.length - 1].row;
  currentRow.forEach((box, index) => {
    const currentColor = box.style.backgroundColor;
    const newColor = guessSequence[index];

    if (newColor && currentColor !== newColor) {
      box.classList.remove('appear'); // Reiniciar cualquier animación previa
      void box.offsetWidth; // Forzar reflujo
      box.style.backgroundColor = newColor;
      box.classList.add('appear');
    } else if (!newColor) {
      box.style.backgroundColor = 'gray';
    }
  });
}

// Check the player's guess
function checkGuess() {
  const currentRow = rows[rows.length - 1].row;
  const currentHintRow = rows[rows.length - 1].hintRow;
  currentHintRow.innerHTML = '';

  const hints = generateHints();

  // Oscurecer botones inválidos
  guessSequence.forEach(color => {
    if (!targetColors.includes(color)) markButtonAsInvalid(color);
  });

  // Mostrar pistas con animación
  hints.forEach((hintColor, index) => {
    setTimeout(() => {
      const hintBox = document.createElement('div');
      hintBox.classList.add('hint-box', 'appear');
      hintBox.style.backgroundColor = hintColor;
      currentHintRow.appendChild(hintBox);

      setTimeout(() => hintBox.classList.remove('appear'), 500);
    }, index * 100);
  });

  if (hints.every(hint => hint === 'green')) {
    showSuccessPopup();
  } else if (++attempts >= maxAttempts) {
    showPopup();
  } else {
    guessSequence = [];
    createNewRow();
  }
}

function generateHints() {
  const hints = new Array(5).fill('black');
  const usedTargetIndices = new Set();
  const usedGuessIndices = new Set();

  guessSequence.forEach((color, i) => {
    if (color === targetColors[i]) {
      hints[i] = 'green';
      usedTargetIndices.add(i);
      usedGuessIndices.add(i);
    }
  });

  guessSequence.forEach((color, i) => {
    if (usedGuessIndices.has(i)) return;
    targetColors.forEach((targetColor, j) => {
      if (!usedTargetIndices.has(j) && color === targetColor) {
        hints[i] = 'orange';
        usedTargetIndices.add(j);
        usedGuessIndices.add(i);
      }
    });
  });

  return hints;
}

// Show success popup
// Mostrar el pop-up de éxito con animación
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

  // Deshabilitar todos los botones excepto el de reinicio
  disableAllButtons();
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
  popup.classList.add('bounce-in'); // Agregar la animación

  // Remover la clase después de la animación para que sea reutilizable
  setTimeout(() => {
    popup.classList.remove('bounce-in');
  }, 600); // Duración de la animación
  disableAllButtons();
}

// Function to handle shaking effect
function shakeRow() {
  const currentRow = rows[rows.length - 1].row;
  const rowContainer = currentRow[0].parentElement; // Get the row's parent container

  rowContainer.style.transition = 'transform 0.2s ease';
  rowContainer.style.transform = 'translateX(-10px)';

  setTimeout(() => {
    rowContainer.style.transform = 'translateX(10px)';
  }, 200);

  setTimeout(() => {
    rowContainer.style.transform = 'translateX(0)';
  }, 400);
}

// Keyboard color input
buttons.forEach(button => {
  button.addEventListener('click', () => {
    if (guessSequence.length < 5) {
      guessSequence.push(button.getAttribute('data-color'));
      updateBoxes();
    }
  });
});



enterButton.addEventListener('click', () => {
  if (guessSequence.length < 5) {
    shakeRow(); // shaking if guess is incomplete
  } else {
    checkGuess();
  }
});

restartButton.addEventListener('click', restartGame);

closePopupButton.addEventListener('click', () => {
  popup.style.display = 'none';
});

closeSuccessPopupButton.addEventListener('click', () => {
  successPopup.style.display = 'none';
});

function adjustScrollHeight() {
  const scrollContainer = document.querySelector('.scroll-container');
  const viewportHeight = window.innerHeight;
  scrollContainer.style.maxHeight = `${viewportHeight * 0.5 - 120}px`;
}

window.addEventListener('resize', adjustScrollHeight);
adjustScrollHeight();


function adjustKeyboardPosition() {
  const gameContainer = document.querySelector('.game-container');
  const keyboard = document.getElementById('keyboard');

  // Calcular la altura del contenedor
  const containerHeight = gameContainer.offsetHeight;

  // Si no se ha inicializado la distancia, establecerla
  if (!initialDistance) {
    initialDistance = containerHeight * 7; // Distancia inicial: 7 veces la altura del contenedor
  }

  // Calcular la nueva posición en función de los intentos realizados
  const totalAttempts = maxAttempts; // Total de intentos permitidos
  const distanceReduction = (initialDistance / totalAttempts) * attemptsMade; // Reducción proporcional
  const newMarginTop = initialDistance - distanceReduction;

  // Aplicar la nueva posición al teclado
  keyboard.style.marginTop = `${newMarginTop}px`;
}

function reduceKeyboardDistance() {
  // Incrementar el número de intentos realizados
  attemptsMade++;

  // Ajustar la posición del teclado después del intento
  adjustKeyboardPosition();
}

// Ajustar la posición del teclado al cargar la página
window.addEventListener('load', adjustKeyboardPosition);

// Ajustar la posición del teclado si cambia el tamaño de la ventana
window.addEventListener('resize', adjustKeyboardPosition);

// Debounce function to limit the rate at which a function can fire
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Adjust the position of the keyboard when the page loads
window.addEventListener('load', adjustKeyboardPosition);

// Adjust the position of the keyboard if the window size changes, with debounce
window.addEventListener('resize', debounce(adjustKeyboardPosition, 100));

// Initialize the game
createNewRow();
buttons.forEach(resetButton);
