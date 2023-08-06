'use strict'
//Make the aliens rows look different from each other
//make a button that gets the user to choose which alien image he wants - same as theme but render the gBoard - it just changes the ALIEN = '👽' / '👾'

const BOARD_SIZE = 14;
const ALIENS_ROW_LENGTH = 8
var gAlienRowCount = 3

const HERO = '🤖';
const ALIEN = '👽';
const NEW_ALIEN = '👾'
const LASER = '🡹';
const SUPER_LASER = '⚡'
const SPACE_CANDY = '🍬'
const SHIELD = '🛡️'
const ROCK = '🗿'
const BUNKER = '🏟️'
const SKY = 'SKY'
const FLOOR = 'FLOOR'
const EMPTY_CELL = ''
const VICTORY = 'VICTORY'
const LOSE = 'LOSE'

const FLOOR_IMG = '<img src="imgs/floor.jpg" />'

var score = 0

var gBoard;
var gGame = {
    isOn: false,
    aliensCount: 0

}
var gAddCandyInterval

// Called when game loads
function onInit(alienRowCount) {
    console.log('GAME STARTED')
    gHeroAndgGameReset()
    gIsAlienFreeze = false
    gBoard = createBoard(alienRowCount)
    renderBoard(gBoard)
    score = 0
    resetHtmlStuff()
    
}

function preventSpacebarScroll() {
    window.addEventListener('keydown', function (e) {
        // Check if the pressed key is the spacebar (keyCode 32)
        if (e.keyCode === 32) {
            e.preventDefault(); // Prevent the default scrolling behavior
        }
    });
}

// Call the function to attach the event listener
preventSpacebarScroll()

function onStart() {
    var elStartGameBtn = document.querySelector('.start-game-btn')
    // Disable spacebar triggering button
    elStartGameBtn.addEventListener("keydown", (event) => {
        if (event.keyCode === 32) {
            event.preventDefault();
        }
    })


    if (elStartGameBtn.innerText === 'START GAME') {
        console.log('start')
        gGame.isOn = true
        moveAliens()
        gThrowRockInterval = setInterval(throwRock, 7000)
        gAddCandyInterval = setInterval(addSpaceCandies, 10000)
        changeToRestartGameText()
    } else if (elStartGameBtn.innerText === 'RESTART GAME') {
        console.log('restart')
        onRestart(gAlienRowCount)

    }

}

function clearAllIntervals() {
    clearInterval(gLaserInterval)
    clearInterval(gIntervalAliens)
    clearInterval(gAddCandyInterval)
    clearInterval(gRockInterval)
    clearInterval(gThrowRockInterval)
}

function gHeroAndgGameReset() {
    gGame.aliensCount = 0
    gHero.pos = { i: 12, j: 5 }
    gHero.blowUpMode = false
    gHero.superMode = false
    gHero.superAttackCount = 0
    gHero.lives = 3
    gHero.shieldOn = false
    gHero.shields = 3
}

function onRestart(alienRowCount) {
    clearAllIntervals()
    onInit(alienRowCount)
    gGame.isOn = false
    var elGameOverModal = document.querySelector('.game-over-modal')
    elGameOverModal.style.display = 'none'
    var elStartGameBtn = document.querySelector('.start-game-btn')
    elStartGameBtn.innerText = 'Start Game'

}


// Create and returns the board with aliens on top, ground at bottom
function createBoard(alienRowCount) {
    // console.log('alienRowCount', alienRowCount)
    var board = []
    for (var i = 0; i < BOARD_SIZE; i++) {
        board.push([])
        for (var j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = createCell()
            if (i === BOARD_SIZE - 1) {
                board[i][j].type = FLOOR
            }
        }
    }
    createAliens(board, alienRowCount)
    createHero(board)
    createBunkers(board)
    console.log('gGame.aliensCount', gGame.aliensCount)
    console.log('board', board)
    return board

}
// Render the board as a <table> to the page
function renderBoard(board) {

    var strHTML = '<tbody>'

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j].gameObject
            if (!cell) {
                cell = EMPTY_CELL
            }

            var className = `cell cell-${i}-${j}`

            if (board[i][j].type === FLOOR) className += ' floor'




            strHTML += `<td class="${className}">${cell}</td>`

        }
        strHTML += '</tr>'
    }

    strHTML += '</tbody>'

    const elTable = document.querySelector('table')
    elTable.innerHTML = strHTML


}

function updateScoreText() {
    var elScoreValue = document.querySelector('.score-value')
    elScoreValue.innerText = score
}

function gameOverChanges(result) {
    gGame.isOn = false
    clearAllIntervals()
    var elGameOverModal = document.querySelector('.game-over-modal')
    if (result === LOSE) {
        elGameOverModal.style.display = 'block'
    } else if (result === VICTORY) {
        elGameOverModal.innerText = 'YOU WON 🥳'
        elGameOverModal.style.display = 'block'
    }
    clearInterval(gIntervalAliens)
    changeToRestartGameText()


}

function resetGameOverModalText() {
    var elGameOverModal = document.querySelector('.game-over-modal')
    elGameOverModal.innerText = 'GAME OVER 😭'

}

function changeToRestartGameText() {
    var elStartGameBtn = document.querySelector('.start-game-btn')
    elStartGameBtn.innerText = 'Restart Game'
}

function resetHtmlStuff() {
    var elSuperModeVal = document.querySelector('.super-mode-value')
    elSuperModeVal.innerText = '⚡⚡⚡'
    var elLivesValue = document.querySelector('.lives-value')
    elLivesValue.innerText = '❤️❤️❤️'
    var elShieldsValue = document.querySelector('.shields-value')
    elShieldsValue.innerText = '🛡️🛡️🛡️'
    resetGameOverModalText()
    updateScoreText()
}


//maybe I can make these 3 functions in to 1 - come back to it later
function updateSuperModeText() {
    var elSuperModeVal = document.querySelector('.super-mode-value')
    if (gHero.superAttackCount === 1) {
        elSuperModeVal.innerText = '⚡⚡❌'
    } else if (gHero.superAttackCount === 2) {
        elSuperModeVal.innerText = '⚡❌❌'
    } else if (gHero.superAttackCount === 3) {
        elSuperModeVal.innerText = '❌❌❌'
    }
}
function updateLivesText() {
    var elLivesValue = document.querySelector('.lives-value')
    if (gHero.lives === 2) {
        elLivesValue.innerText = '❤️❤️🤍'
    } else if (gHero.lives === 1) {
        elLivesValue.innerText = '❤️🤍🤍'
    } else if (gHero.lives === 0) {
        gameOverChanges(LOSE)
        elLivesValue.innerText = '🤍🤍🤍'
    }
}

function updateShieldsText() {
    var elShieldsValue = document.querySelector('.shields-value')
    if (gHero.shields === 2) {
        elShieldsValue.innerText = '🛡️🛡️❌'
    } else if (gHero.shields === 1) {
        elShieldsValue.innerText = '🛡️❌❌'
    } else if (gHero.shields === 0) {
        elShieldsValue.innerText = '❌❌❌'
    }
}

function addSpaceCandies() {
    if (!checkIfRowHasAlien(gBoard[0]) && gGame.isOn) {
        var candyPos = getRandomEmptyPosition(SPACE_CANDY)
        // console.log('CandyPos', candyPos)
        updateCell(candyPos, SPACE_CANDY)
        setTimeout(() => {
            updateCell(candyPos)
        }, 5000);

    }

}

function getRandomEmptyPosition(item) {
    var allCells = []
    var allAliensPos = getAllAliensPos(gBoard) //we adapt fromJ and toJ compare to where the aliens are so it looks like they drop the rock
    var i
    var fromJ
    var toJ
    if (item === SPACE_CANDY) {
        i = 0
        fromJ = 0
        toJ = gBoard.length
    } else if (item === ROCK) {
        i = gAliensBottomRowIdx
        fromJ = allAliensPos.shift().j
        toJ = allAliensPos.pop().j
    }
    for (var j = fromJ; j < toJ; j++) {
        var pos = { i: i, j: j }
        allCells.push(pos)
    }
    var randomPos = allCells[getRandomInt(0, allCells.length)]
    return randomPos
}

function changeTheme() {
    var elBody = document.querySelector('body')
    var elInstructionsUl = document.querySelector('ul')
    var elInstructionsTitle = document.querySelector('h3')
    var currentBackground = elBody.style.backgroundImage;
    if (currentBackground.includes("stars.png")) {
        elBody.style.backgroundImage = "url('imgs/sky.jpg')"
        elInstructionsUl.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'
        elInstructionsTitle.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'
    }
    else {
        elBody.style.backgroundImage = "url('imgs/stars.png')";
        elInstructionsUl.style.backgroundColor = 'black'
        elInstructionsTitle.style.backgroundColor = 'black'
    }

}

function createBunkers(board) {
    board[10][3].gameObject = BUNKER
    board[10][10].gameObject = BUNKER
    // for(var j = 0; j<board.length; j++){ // to check if the rocks destroy the bunkers
    //     board[10][j].gameObject = BUNKER
    // }
}