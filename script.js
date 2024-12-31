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
const easyModeBtn = document.getElementById('easy-mode');
const hardModeBtn = document.getElementById('hard-mode');

let guessSequence = [];
let attempts = 0;
let maxAttempts = 5;
let currentMode = 'easy';
let rows = [];
let isRepeatedColors = true; // Default mode
let targetColors = generateTargetColors();
let invalidColors = new Set(); // Tracks invalid colors
let initialDistance; // Distancia inicial entre el contenedor y el teclado
let attemptsMade = 0; // Número de intentos realizados
// Timer variables
let timerInterval;
let timerStarted = false;
let secondsElapsed = 0;

function switchMode(mode) {
  if (mode === currentMode) return; // Si ya está activo, no hacer nada

  // Actualizar el modo actual
  currentMode = mode;
  maxAttempts = mode === 'easy' ? 5 : 7;

  // Actualizar botones en la barra de navegación
  document.getElementById('easy-mode').classList.toggle('active', mode === 'easy');
  document.getElementById('hard-mode').classList.toggle('active', mode === 'hard');

  restartGame(); // Reiniciar el juego con el nuevo modo
}



// Evento para detectar la tecla "Enter"
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleEnter();
  }
});

// Función para manejar la acción de "Enter"
function handleEnter() {
  if (guessSequence.length === maxAttempts) {
    checkGuess(); // Llamar a la función de validación si hay un guess completo
  } else {
    // Si el intento está incompleto, agregar un efecto visual
    const currentRow = rows[rows.length - 1].row;
    console.log(currentRow);
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
    const currentRow = rows[rows.length - 1].row; // Fila activa
    const indexToRemove = guessSequence.length - 1; // Índice del recuadro a borrar

    // Eliminar el último color de la secuencia
    guessSequence.pop();

    // Resetear el estado visual del recuadro correspondiente
    const box = currentRow[indexToRemove];
    box.style.backgroundColor = 'gray'; // Fondo predeterminado
    box.removeAttribute('data-color'); // Eliminar color asignado
    box.removeAttribute('data-animated'); // Permitir nueva animación

    updateBoxes(); // Actualizar los cuadros restantes
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

// Lógica para Easy Mode
easyModeBtn.addEventListener('click', () => {
  if (currentMode !== 'easy') {
    currentMode = 'easy';
    maxAttempts = 5; // Ajustar el límite de intentos
    toggleModeButtons(easyModeBtn, hardModeBtn); // Actualizar visualmente
    restartGame(); // Reiniciar el juego
  }
});

// Lógica para Hard Mode
hardModeBtn.addEventListener('click', () => {
  if (currentMode !== 'hard') {
    currentMode = 'hard';
    maxAttempts = 7; // Ajustar el límite de intentos
    toggleModeButtons(hardModeBtn, easyModeBtn); // Actualizar visualmente
    restartGame(); // Reiniciar el juego
  }
});

function toggleModeButtons(activeBtn, inactiveBtn) {
  activeBtn.classList.add('active');
  inactiveBtn.classList.remove('active');
}

// Generate target colors
function generateTargetColors() {
  // Definir el número de colores en función de maxAttempts
  const numColors = maxAttempts; // Usar maxAttempts dinámicamente (5 para Easy, 7 para Hard)

  // Generar colores según el modo
  const colors = isRepeatedColors
    ? Array.from({ length: numColors }, () => pastelColorValues[Math.floor(Math.random() * pastelColorValues.length)])
    : [...pastelColorValues].sort(() => Math.random() - 0.5).slice(0, numColors);

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
  clearInterval(timerInterval);
  timerStarted = false;
  secondsElapsed = 0;
  document.getElementById('timer').textContent = '0:00';

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

  // Crear los cuadros de la fila
  const newBoxes = Array.from({ length: maxAttempts }).map(() => {
    const box = document.createElement('div');
    box.classList.add('color-box');
    box.style.backgroundColor = 'lightgray'; // Fondo inicial
    row.appendChild(box);
    return box;
  });

  // Crear cuadros vacíos para los hints
  const newHints = Array.from({ length: maxAttempts }).map(() => {
    const hintBox = document.createElement('div');
    hintBox.classList.add('hint-box');
    hintBox.style.backgroundColor = 'lightgray'; // Fondo inicial
    hintRow.appendChild(hintBox);
    return hintBox;
  });

  rows.push({ row: newBoxes, hintRow: newHints });

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
  // Obtener la fila actual
  const currentRow = rows[rows.length - 1].row;

  currentRow.forEach((box, index) => {
    const newColor = guessSequence[index]; // Obtener el nuevo color para este índice

    // Si hay un nuevo color y es diferente al actual
    if (newColor && box.getAttribute('data-color') !== newColor) {
      box.style.backgroundColor = newColor; // Actualizar color
      box.setAttribute('data-color', newColor); // Marcar el color asignado
      console.log(newColor);
      // Reiniciar y ejecutar animación
      box.classList.remove('grow'); // Eliminar animación previa (si existe)
      void box.offsetWidth; // Forzar reflujo (necesario para reiniciar la animación)
      box.classList.add('grow'); // Añadir animación
      
    } 
    
    // Si no hay color en esta posición
    else if (!newColor) {
      box.style.backgroundColor = 'lightgray'; // Fondo predeterminado
      box.removeAttribute('data-color'); // Eliminar color asignado
      box.classList.remove('grow'); // Asegurarse de que no quede una animación previa
    }
  });
}

// Check the player's guess
function checkGuess() {
  if (!timerStarted) startTimer();

  const currentRow = rows[rows.length - 1].row;
  const currentHintRow = rows[rows.length - 1].hintRow;
  currentHintRow.innerHTML = '';
  const hints = generateHints();

  if (!timerStarted) startTimer(); // Iniciar el temporizador si no se ha iniciado

  // Oscurecer botones inválidos
  guessSequence.forEach(color => {
    if (!targetColors.includes(color)) markButtonAsInvalid(color);
  });

  currentHintRow.forEach((hintBox, index) => {
    setTimeout(() => {
      hintBox.style.backgroundColor = hints[index]; // Aplicar el color de la pista
      hintBox.classList.add('appear'); // Añadir animación de aparición
    }, index * 100); // Retardo entre cada actualización
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
  const hints = new Array(targetColors.length).fill('black');
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
  clearInterval(timerInterval); // Detener el temporizador

  const successPopup = document.getElementById('success-popup');
  const winningColorsContainer = successPopup.querySelector('.winning-colors');

  // Limpiar el contenedor de colores y el contenido del pop-up
  winningColorsContainer.innerHTML = '';
  successPopup.querySelectorAll('p.time-display').forEach(el => el.remove());

  // Agregar los colores ganadores
  targetColors.forEach(color => {
    const colorBox = document.createElement('div');
    colorBox.classList.add('color-box');
    colorBox.style.backgroundColor = color;
    winningColorsContainer.appendChild(colorBox);
  });

  // Mostrar el tiempo solo una vez
  const timeDisplay = document.createElement('p');
  timeDisplay.classList.add('time-display');
  timeDisplay.textContent = `Time: ${(millisecondsElapsed / 1000).toFixed(2)} seconds`;
  successPopup.appendChild(timeDisplay);

  successPopup.style.display = 'block';
}

function showPopup() {
  clearInterval(timerInterval); // Detener el temporizador

  const popup = document.getElementById('popup');
  const popupContent = popup.querySelector('#popup-content');

  // Limpiar el contenedor de colores y el contenido del pop-up
  popupContent.innerHTML = '';
  popup.querySelectorAll('p.time-display').forEach(el => el.remove());

  // Agregar los colores correctos
  targetColors.forEach(color => {
    const colorBox = document.createElement('div');
    colorBox.classList.add('color-box');
    colorBox.style.backgroundColor = color;
    popupContent.appendChild(colorBox);
  });

  // Mostrar el tiempo solo una vez
  const timeDisplay = document.createElement('p');
  timeDisplay.classList.add('time-display');
  timeDisplay.textContent = `Time: ${(millisecondsElapsed / 1000).toFixed(2)} seconds`;
  popup.appendChild(timeDisplay);

  popup.style.display = 'block';
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
    if (guessSequence.length < maxAttempts) {
      guessSequence.push(button.getAttribute('data-color'));
      updateBoxes();
    }
  });
});



enterButton.addEventListener('click', () => {
  if (guessSequence.length < maxAttempts) {
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

let millisecondsElapsed = 0; // Contador de milisegundos

function startTimer() {
  if (timerStarted) return; // Evitar múltiples inicios
  timerStarted = true;
  const timerElement = document.getElementById('timer');
  
  timerInterval = setInterval(() => {
    millisecondsElapsed += 100; // Incrementar cada 100ms
    const totalSeconds = millisecondsElapsed / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = millisecondsElapsed % 1000;
    timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${Math.floor(milliseconds / 100)}`;
  }, 100); // Actualización cada 100ms
}


// Adjust the position of the keyboard when the page loads
window.addEventListener('load', adjustKeyboardPosition);

// Adjust the position of the keyboard if the window size changes, with debounce
window.addEventListener('resize', debounce(adjustKeyboardPosition, 100));

// Initialize the game
createNewRow();
buttons.forEach(resetButton);
