const easyBtn = document.getElementById('easy-btn');
const mediumBtn = document.getElementById('medium-btn');
const hardBtn = document.getElementById('hard-btn');

let selectedNumber = null;
let countdown;
let sudokuBoard = [];
let originalBoard = [];
const SIZE = 9; // 9x9 Sudoku board

// Timer function
function startTimer(duration) {
    let timer = duration, minutes, seconds;
    const display = document.getElementById('time-left');

    countdown = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(countdown);
            disableBoard();
            alert('Time is up! Better luck next time!');
        }
    }, 1000);
}

// Function to disable the board when time is up or game is complete
function disableBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.add('disabled'));
}

// Function to store selected number
function selectNumber(number) {
    selectedNumber = number;
}

function initializeGame(level) {
    sudokuBoard = generateSudokuBoard();

    // Deep copy the generated board to store as the original before removing numbers
    originalBoard = sudokuBoard.map(row => row.slice());

    sudokuBoard = removeCells(sudokuBoard, level); // Modify only `sudokuBoard`
    displaySudokuBoard(sudokuBoard);

    let timerDuration;
    switch (level) {
        case 'easy': timerDuration = 5 * 60; break;
        case 'medium': timerDuration = 7 * 60; break;
        case 'hard': timerDuration = 10 * 60; break;
        default: timerDuration = 5 * 60; break;
    }
    startTimer(timerDuration);
    addCellClickListeners();
}

// Function to fill a cell on the board
function fillCell(cell) {
    if (cell.textContent === '' || cell.classList.contains('user-filled')) {
        if (selectedNumber !== null) {
            cell.textContent = selectedNumber;
            cell.classList.add('user-filled');

            const index = Array.from(document.querySelectorAll('.cell')).indexOf(cell);
            const row = Math.floor(index / 9);
            const col = index % 9;
            sudokuBoard[row][col] = parseInt(selectedNumber, 10);

            checkIfBoardIsComplete();
        }
    }
}

// Adding click listeners to each cell for player interactions
function addCellClickListeners() {
    const sudokuCells = document.querySelectorAll('.cell');
    sudokuCells.forEach(cell => cell.addEventListener('click', () => fillCell(cell)));
}

// Check if the board is complete and valid
function checkIfBoardIsComplete() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (sudokuBoard[row][col] === 0) {
                return false;
            }
        }
    }
    if (isBoardValid(sudokuBoard)) {
        clearInterval(countdown);
        alert('Well done! You solved the Sudoku puzzle!');
        disableBoard();
        return true;
    } else {
        alert('The board is filled but incorrect. Keep trying!');
        return false;
    }
}

function removeCells(board, level) {
    let cellsToRemove;

    switch (level) {
        case 'easy': cellsToRemove = 35; break;  
        case 'medium': cellsToRemove = 40; break;
        case 'hard': cellsToRemove = 56; break;
        default: throw new Error('Invalid difficulty level');
    }

    const positions = new Set(); // Ensure unique cell positions only
    while (positions.size < cellsToRemove) {
        const randomRow = Math.floor(Math.random() * SIZE);
        const randomCol = Math.floor(Math.random() * SIZE);
        const pos = `${randomRow}-${randomCol}`;
        if (!positions.has(pos) && board[randomRow][randomCol] !== 0) {
            positions.add(pos);
            board[randomRow][randomCol] = 0; // Remove the number
        }
    }

    return board;
}

function fillBoard(board) {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] === 0) {
                let numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (let num of numbers) {
                    if (isSafe(board, row, col, num)) {
                        board[row][col] = num; // Place the number
                        // console.log(`Placed ${num} at (${row}, ${col})`);
                        console.table(board);
                        
                        if (fillBoard(board)) {
                            return true; 
                        }
                        // console.log(`Backtracking at (${row}, ${col}), removing ${num}`);
                        board[row][col] = 0; // Backtrack if placing `num` leads to an invalid board
                    }
                }
                return false; // No valid number fits in this cell
            }
        }
    }
    return true; // Board filled successfully
  }
  
  
  // Function to check if placing a number in a cell is safe
  function isSafe(board, row, col, num) {
    return !usedInCol(board, col, num) &&
           !usedInRow(board, row, num) &&
           !usedInBox(board, row - row % 3, col - col % 3, num);
  }
  
  // Check if number exists in the current row
  function usedInRow(board, row, num) {
    for (let col = 0; col < SIZE; col++) {
        if (board[row][col] === num) return true;
    }
    return false;
  }
  
  // Check if number exists in the current column
  function usedInCol(board, col, num) {
    for (let row = 0; row < SIZE; row++) {
        if (board[row][col] === num) return true;
    }
    return false;
  }
  
  // Check if number exists in the 3x3 box
  function usedInBox(board, startRow, startCol, num) {
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[row + startRow][col + startCol] === num) return true;
        }
    }
    return false;
  }
  
  // Helper function to shuffle an array for randomness
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  function generateSudokuBoard() {
    let board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    fillBoard(board);
    return board;
  }

// Function to validate the board
function isBoardValid(board) {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] !== 0) {
                let num = board[row][col];
                board[row][col] = 0; // Temporarily remove number
                if (!isSafe(board, row, col, num)) {
                    board[row][col] = num; // Restore number
                    return false;
                }
                board[row][col] = num; // Restore number
            }
        }
    }
    return true;
}

// Event listeners for difficulty buttons
if (easyBtn) easyBtn.addEventListener('click', () => {
  window.location.href = 'easy.html'; // Navigate to easy.html
});
if (mediumBtn) mediumBtn.addEventListener('click', () => {
  window.location.href = 'medium.html'; // Navigate to medium.html
});
if (hardBtn) hardBtn.addEventListener('click', () => {
  window.location.href = 'hard.html'; // Navigate to hard.html
});
