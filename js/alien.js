'use strict'
//TRY TO MAKE THE CODE SHORTER WITH FUNCTIONS LIKE - MoveBoard(direction)...
//MAKE MOVE LEFT AND MOVE RIGHT INTO ONE FUNCTION THAT GETS A DIRECTION AS A PARAMETER
//CAN COMBINE BLINKROCK AND BLINKLASER? || SHOOT AND THROWROCK?
//when alien hit bunker both are destroyed?
const ALIEN_SPEED = 500
const ROCK_SPEED = 600

var gIntervalAliens
var gAliensTopRowIdx
var gAliensBottomRowIdx
var gIsAlienFreeze = false;

var gRockInterval
var gThrowRockInterval
var gRockPos = { i: null, j: null }

function createAliens(board, alienRowCount) {
    console.log('alienRowCount', alienRowCount)
    gAlienRowCount = alienRowCount
    gAliensTopRowIdx = 0
    gAliensBottomRowIdx = gAlienRowCount - 1
    for (var i = gAliensTopRowIdx; i < gAlienRowCount; i++) {
        for (var j = board.length - 1; j > board.length - 1 - ALIENS_ROW_LENGTH; j--) {
            board[i][j] = createCell(ALIEN)
            gGame.aliensCount++
        }
    }
}

function shiftBoardRight(board, fromI, toI) {
    if (gIsAlienFreeze) return
    if (!checkAliensReachedRightWall(board)) {//בדיקה אם הגיע לקיר?
        for (var i = fromI; i <= toI; i++) {
            for (var j = board[0].length - 1; j >= 0; j--) {
                var currentPos = { i: i, j: j }
                if (j === 0) updateCell(currentPos) //טור ראשון
                else {
                    var lastCellGameObj = board[i][j - 1].gameObject
                    if (lastCellGameObj === LASER) handleAlienHit(currentPos)
                    if (lastCellGameObj === ALIEN) updateCell(currentPos, ALIEN)
                    else if (lastCellGameObj === null) updateCell(currentPos)
                }
            }
        }
    } else {
        clearInterval(gIntervalAliens)
        shiftBoardDown(board, gAliensTopRowIdx, gAliensBottomRowIdx)
        // console.log('cleared')
    }

}

function shiftBoardLeft(board, fromI, toI) {
    if (gIsAlienFreeze) return
    if (!checkAliensReachedLeftWall(board)) {//בדיקה אם הגיע לקיר?
        for (var i = fromI; i <= toI; i++) {
            for (var j = 0; j < board[0].length; j++) {
                var currentPos = { i: i, j: j }
                if (j === board[0].length - 1) updateCell(currentPos)//טור אחרון
                else {
                    var nextCellgameObj = board[i][j + 1].gameObject //בודק כל פעם טור ליד ולפיו שם מה שצריך - בעצם הזזה אחת שמאלה
                    if (nextCellgameObj === LASER) handleAlienHit(currentPos)//אם יריתי על חייזר ובדיוק הלוח זז
                    else if (nextCellgameObj === ALIEN) updateCell(currentPos, ALIEN)
                    else if (nextCellgameObj === null) updateCell(currentPos)
                }

            }
        }
    } else {
        clearInterval(gIntervalAliens)
        shiftBoardDown(board, gAliensTopRowIdx, gAliensBottomRowIdx)

        // console.log('cleared')
    }

}



function shiftBoardDown(board, fromI, toI) {
    if (gIsAlienFreeze) return
    if (gAliensBottomRowIdx === gBoard.length - 3) {
        console.log('you lost')
        gIsAlienFreeze = true
        clearInterval(gIntervalAliens)
        gIntervalAliens = null
        gameOverChanges(LOSE)
        return
    } else {
        for (var i = toI + 1; i >= fromI; i--) {
            for (var j = 0; j < board[0].length; j++) {
                if (i === 0 || i === fromI) updateCell({ i, j })//שורה ראשונה
                else {
                    var cellAboveGameObj = board[i - 1][j].gameObject
                    if (cellAboveGameObj === ALIEN) updateCell({ i, j }, ALIEN)
                    else if (cellAboveGameObj === null) updateCell({ i, j })
                }
            }
        }
        updateAlienRowIdxs()
        var func = (checkAliensReachedRightWall(gBoard)) ? shiftBoardLeft : shiftBoardRight //בדיקה לאיזה צד להמשיך אחרי הורדה למטה
        gIntervalAliens = setInterval(func, ALIEN_SPEED, gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)
    }
}


function moveAliens() {
    console.log('move aliens')
    gIntervalAliens = setInterval(shiftBoardLeft, ALIEN_SPEED, gBoard, gAliensTopRowIdx, gAliensBottomRowIdx)
}


function updateAlienRowIdxs() {
    for (var i = 0; i < gBoard.length; i++) { //בודק מה השורה הכי עליונה שיש בה חייזר
        if (checkIfRowHasAlien(gBoard[i])) {
            gAliensTopRowIdx = i
            break
        }
    }
    for (var i = gBoard.length - 1; i >= 0; i--) { //בודק מה השורה הכי תחתונה שיש בה חייזר
        if (checkIfRowHasAlien(gBoard[i])) {
            gAliensBottomRowIdx = i
            break
        }
    }
}


function checkIfRowHasAlien(row) {
    var rowObjects = []
    for (var j = 0; j < row.length; j++) {
        rowObjects.push(row[j].gameObject)
    }
    if (rowObjects.includes(ALIEN)) return true
    else return false
}

function checkAliensReachedRightWall(board) {
    for (var i = 0; i < board.length; i++) {
        if (board[i][board.length - 1].gameObject === ALIEN) return true
    }
    return false
}

function checkAliensReachedLeftWall(board) {
    for (var i = 0; i < board.length; i++) {
        if (board[i][0].gameObject === ALIEN) return true
    }
    return false
}

function blinkRock(pos) {
    updateCell(pos, ROCK)
    setTimeout(() => {
        updateCell(pos)

    }, ROCK_SPEED);
}

function throwRock() {
    console.log('throw rock')
    var randomRockPos = getRandomEmptyPosition(ROCK)
    var row = randomRockPos.i
    var col = randomRockPos.j
    gRockInterval = setInterval(() => {
        var gRockPos = { i: row + 2, j: col }
        // console.log('gRockPos', gRockPos)
        if (gBoard[gRockPos.i][gRockPos.j].gameObject === HERO ||
            gBoard[gRockPos.i][gRockPos.j].gameObject === SHIELD) {
            if (!gHero.shieldOn) {
                gHero.lives--
                updateLivesText() //activates gameOver function if ghero.lives === 0
            }
            stopRock()
            return
        } else if (gBoard[gRockPos.i][gRockPos.j].gameObject === BUNKER) {
            console.log('bunker hit')
            blinkRock(gRockPos)
            stopRock()
            return
        } else if (gRockPos.i === gBoard.length - 1) {
            stopRock()
            return
        }
        blinkRock(gRockPos)
        row++
    }, ROCK_SPEED)

}

function stopRock() {
    clearInterval(gRockInterval)
    gRockPos = { i: null, j: null }
}

function getAllAliensPos(board) {
    var aliensPos = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].gameObject === ALIEN) {
                var pos = { i: i, j: j }
                aliensPos.push(pos)
            }
        }
    }
    return aliensPos
}

