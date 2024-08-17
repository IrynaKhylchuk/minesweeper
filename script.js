//#region Index Elements
const Colors = ['#bdbdbd', '#2020df', '#208020', '#df2020', '#202080', '#802020', '#006666', '#090909', '#6f6f6f']
const Icons = {
    Mine: '💣',
    Flag: '🚩'
}
const Levels = {
    Beginner: 'lvlBeginner',
    Intermediate: 'lvlIntermediate',
    Expert: 'lvlExpert'
}

// Icon

const iconSpan = document.getElementById('iconSpan')

// Window Controls
const programWindow = document.getElementById('programWindow')

// Game Controls
const gameField = document.getElementById('gameField')
const minesCounter = document.getElementById('minesCounter')
const cellsCounter = document.getElementById('cellsCounter')
const smile = document.getElementById('smileBtn')

let mines = 0
let map = []
let currentLevel = Levels.Beginner

//#endregion

//#region Handlers

document.querySelector('.iconMinesweeper').addEventListener('click', () => {
    iconSpan.style.background = 'blue'
})

document.querySelector('.iconMinesweeper').addEventListener('dblclick', () => {
    programWindow.style.display = 'block'
    document.body.className = 'windowShow'
})

document.getElementById('btnMinWindow').addEventListener('click', () => {
    programWindow.style.display = 'none'
    document.body.className = 'windowHide'
    iconSpan.style.background = 'transparent'
})

document.getElementById('btnCloseWindow').addEventListener('click', () => {
    programWindow.style.display = 'none'
    document.body.className = 'windowClose'
    iconSpan.style.background = 'transparent'
})

document.querySelector('.gameList').addEventListener('click', (event) => {
    switch(event.target.id) {
        case Levels.Beginner:
        case Levels.Intermediate:
        case Levels.Expert:
            currentLevel = event.target.id
            startGame(currentLevel)
            break;
        case 'newGame': 
            startGame(currentLevel)
            break;
        case 'worldChamps':
        case 'personalBest':
            const goodJob =  document.getElementById('goodJob')
            goodJob.style.display = 'block'

            const btnMinWindowNaruto = document.getElementById('btnMinWindowNaruto')
            btnMinWindowNaruto.addEventListener('click', () => { goodJob.style.display = 'none' })

            const btnCloseWindowNaruto = document.getElementById('btnCloseWindowNaruto')
            btnCloseWindowNaruto.addEventListener('click', () => { goodJob.style.display = 'none' })
            break;
        case 'exit':
            programWindow.style.display = 'none'
            document.body.className = 'windowClose'
            break;
    }
})

gameField.addEventListener('click', (event) => {
    if (event.target.className !== 'gameBtn') {
        return
    }

    startTimer()
    const position = getButtonPosition(event.target)
    checkCells(position.row, position.col, map, event.target)
})

smile.addEventListener('click', () => startGame(currentLevel))

window.addEventListener('contextmenu', (event) => {
    event.preventDefault()

    const button = event.target

    if (button.classList.contains('gameBtn') && !button.disabled) {
        if (button.textContent !== '' && button.textContent !== Icons.Flag) {
            return
        } else if (button.textContent === Icons.Flag) {
            button.textContent = ''
            minesCounter.textContent = ++mines
        } else {
            button.textContent = Icons.Flag
            minesCounter.textContent = --mines
        }
    }
})

//#endregion

//#region Timer

let timer = document.getElementById('timer'),
    seconds = 0, isRunning = false, interval

function startTimer() {
  if (!isRunning) {
    isRunning = true
    interval = setInterval(() => { timer.textContent = ++seconds }, 1000)
  }
  return interval
}

function stopTimer() {
  if (isRunning) {
    isRunning = false
    clearInterval(interval)
  }
}

function resetTimer() {
    clearInterval(startTimer())
    seconds = 0
    timer.textContent = 0
    isRunning = false
}

//#endregion

//#region Create Game Field

function createRowsColumns(rows, columns) {
    let rowsArray = new Array(rows)
    
    for (let i = 0; i < rows; i++) {
        rowsArray[i] = new Array(columns)
        rowsArray[i].fill(0)
    }
    
    return rowsArray
}

function createGameField(level) {
    gameField.style.display = 'grid'

    let rows, cols, numberOfCells

    switch(level) {
        case Levels.Beginner:
            rows = cols = 9
            mines = 10
            numberOfCells = rows * cols
            gameField.textContent = ''
            gameField.classList = 'gameLvlBegginer'
            break;
        case Levels.Intermediate:
            rows = cols = 16
            mines = 40
            numberOfCells = rows * cols
            gameField.textContent = ''
            gameField.classList = 'gameLvlIntermediate'
            break;
        case Levels.Expert:
            rows = 16
            cols = 30
            mines = 99
            numberOfCells = rows * cols
            gameField.textContent = ''
            gameField.classList = 'gameLvlExpert'
            break
        default: return
    }
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const button = document.createElement('button')
            button.classList.add('gameBtn')
            button.id = `${i}-${j}`
            
            gameField.appendChild(button)
        }
    }

    return {
        rows, cols, numberOfCells
    }
}

function createMap(minesCount, rows, columns) {
    let map = createRowsColumns(rows, columns)
    
    addMines(map, minesCount)
    addNumbers(map)

    return map
}

function addMines(map, minesCount) {
    for (let i = 0; i < minesCount;) {
        const randomRow = Math.floor(Math.random() * map.length)
        const randomColumn = Math.floor(Math.random() * map[0].length)
        if (map[randomRow][randomColumn] !== Icons.Mine) {
            map[randomRow][randomColumn] = Icons.Mine
            i++
        }
    }
}

function getMinesCount(row, col, map) {
    let area = getSurroundingArea(row, col, map)
    let mines = 0
    
    for (let i = area.rowFrom; i <= area.rowTo; i++) {
        for (let j = area.colFrom; j <= area.colTo; j++) {
            if (map[i][j] === Icons.Mine) {
                ++mines
            }
        }
    }
    
    return mines
}

function addNumbers(map) {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            if (map[i][j] === Icons.Mine) { continue }

            map[i][j] = getMinesCount(i, j, map)
        }
    }
}

//#endregion

//#region Open Area

function getSurroundingArea(row, col, map) {
    return {
        rowFrom: row-1 < 0 ? 0 : row-1,
        rowTo: row+1 > map.length-1 ? map.length-1 : row+1,
        colFrom: col-1 < 0 ? 0 : col-1,
        colTo: col+1 > map[0].length-1 ? map[0].length-1 : col+1
    }
}

function openArea(row, col, map) {
    const area = getSurroundingArea(row, col, map)
    let cell = document.getElementById(`${row}-${col}`)
    
    if (cell.textContent !== '') {
        if (cell.textContent === Icons.Flag) {
            cell.textContent = map[row][col]
            cell.classList.add('clickedBtn')
            minesCounter.textContent = ++mines
        }
        return
    }
    
    const cellValue = map[row][col]
    cell.textContent = cellValue
    cell.style.color = Colors[cellValue]
    cell.classList.add('clickedBtn')
    
    for (let i = area.rowFrom; i <= area.rowTo; i++) {
        for (let j = area.colFrom; j <= area.colTo; j++) {
            if (map[i][j] === 0) {
                openArea(i, j, map)
            } else {
                const cellValue = map[i][j]
                const cell = document.getElementById(`${i}-${j}`)
                cell.textContent = cellValue
                cell.style.color = Colors[cellValue]                
                cell.classList.add('clickedBtn')
            }
        }
    }
}
//#endregion

// Check Cells

function checkCells(row, col, map, button) {
    let cellValue = map[row][col]

    if (button.textContent !== Icons.Flag) {
        button.classList.add('clickedBtn')
    }
    
    if (cellValue === Icons.Mine) {
        stopTimer()
        endGame(false)

        smile.className = 'smileLose'
    } else if (cellValue !== 0) {
        button.textContent = cellValue
        button.style.color = Colors[cellValue]
    } else {
        openArea(row, col, map)
    }
    cellsCounter.textContent = buttons.length - Array.from(document.querySelectorAll('.clickedBtn')).length

    if (allCellsGuessed()) {
        endGame(true)
    }
}

//#region Start/End/Restart Game

function startGame(level) {
    resetTimer()

    smile.className = 'smileDefault'

    const gameField = createGameField(level)
    map = createMap(mines, gameField.rows, gameField.cols)

    minesCounter.textContent = mines
    cellsCounter.textContent = gameField.numberOfCells
}

let buttons = document.getElementsByClassName('gameBtn')

function allCellsGuessed() {
    for (const button of buttons) {
        const position = getButtonPosition(button)
        const cellValue = map[position.row][position.col]

        if (cellValue !== Icons.Mine && Number(button.textContent) !== cellValue) {
            return false
        }
    }

    return true
}

function revealMap(success) {
    for (const button of buttons) {
        button.disabled = true

        const position = getButtonPosition(button)
        const cellValue = map[position.row][position.col]

        if (button.textContent === Icons.Flag) { continue }

        if (cellValue === Icons.Mine) {
            button.textContent = Icons.Mine
        } else if (success) {
            button.textContent = cellValue
        }
    }
}

function getButtonPosition(button) {
    const parts = button.id.split('-')
    let row = Number(parts[0])
    let col = Number(parts[1])

    return {
        row, col
    }
}

function endGame(success) {
    smile.className = 'smileWin'

    revealMap(success)
    stopTimer()
    minesCounter.textContent = 0
}

//#endregion

startGame(currentLevel)