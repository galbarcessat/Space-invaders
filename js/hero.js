'use strict'
// function activateMode(mode) - mode - superMode/BlowUpMode/shieldMode
const LASER_SPEED = 80
const SUPER_LASER_SPEED = 40
var gLaserInterval
var gHero = { pos: { i: 12, j: 5 }, isShoot: false, blowUpMode: false, superMode: false, superAttackCount: 0, lives: 3, shieldOn: false, shields: 3 }
var gLaserPos = { i: null, j: null }

// creates the hero and place it on board
function createHero(board) {
    board[gHero.pos.i][gHero.pos.j].gameObject = HERO
}

function moveHero(i, j) {
    if (!gBoard[i][j]) return

    updateCell(gHero.pos)
    var heroSymbol = getHeroSymbol()


    gHero.pos = { i: i, j: j }

    updateCell(gHero.pos, heroSymbol)

}

function handleKey(event) {
    var i = gHero.pos.i;
    var j = gHero.pos.j;

    if (gGame.isOn) {
        // console.log('event.key', event.key)
        switch (event.key) {
            case 'ArrowLeft':
                moveHero(i, j - 1);
                break;
            case 'ArrowRight':
                moveHero(i, j + 1);
                break;
            case " ":
                shoot()
                break;
            case 'n':
                activateBlowUpMode()
                break;
            case 'x':
                activateSuperMode()
                break;
            case 'z':
                activateHeroShield()
                break;

        }
    }

}

//can put these lines into a function - handleBonuses ?
// if (gHero.blowUpMode) {
//     blowUpNegs(gBoard, gLaserPos.i, gLaserPos.j)
// } else if (gHero.superMode) {
//     gHero.superMode = false
// }

// Sets an interval for shutting (blinking) the laser up towards aliens
function shoot() {
    if (gHero.isShoot) return

    gHero.isShoot = true
    var row = gBoard.length - 2
    var col = gHero.pos.j
    var laserInfo = getLaserSpeedAndSymbol()
    gLaserInterval = setInterval(() => {
        var gLaserPos = { i: row - 1, j: col }
        if (gBoard[gLaserPos.i][gLaserPos.j].gameObject === ALIEN) {
            handleAlienHit(gLaserPos)
            if (gHero.blowUpMode) {
                blowUpNegs(gBoard, gLaserPos.i, gLaserPos.j)
            } else if (gHero.superMode) {
                gHero.superMode = false
            }
            return
        } else if (gBoard[gLaserPos.i][gLaserPos.j].gameObject === SPACE_CANDY) {
            console.log('space candy hit')
            score += 50
            updateScoreText()
            freezeAliens()
            if (gHero.blowUpMode) {
                blowUpNegs(gBoard, gLaserPos.i, gLaserPos.j)
            } else if (gHero.superMode) {
                gHero.superMode = false
            }
            blinkLaser(gLaserPos)
            stopLaser()
            return
        } else if (gBoard[gLaserPos.i][gLaserPos.j].gameObject === BUNKER) {
            console.log('bunker hit')
            if (gHero.blowUpMode) {
                blowUpNegs(gBoard, gLaserPos.i, gLaserPos.j)
            } else if (gHero.superMode) {
                gHero.superMode = false
            }
            blinkLaser(gLaserPos)
            stopLaser()
            return
        } else if (gLaserPos.i === 0) {
            if (gHero.blowUpMode) {
                blowUpNegs(gBoard, gLaserPos.i, gLaserPos.j)
            } else if (gHero.superMode) {
                gHero.superMode = false
            }
            blinkLaser(gLaserPos)
            stopLaser()
            return
        }
        blinkLaser(gLaserPos)
        row--

    }, laserInfo.speed)
}

// renders a LASER at specific cell for short time and removes it
function blinkLaser(pos) {
    var laserInfo = getLaserSpeedAndSymbol()
    updateCell(pos, laserInfo.symbol)//adds laser
    setTimeout(() => {//removes laser
        updateCell(pos)

    }, laserInfo.speed);
}

function stopLaser() {
    clearInterval(gLaserInterval)
    gLaserPos = { i: null, j: null }
    gHero.isShoot = false
}

function handleAlienHit(pos) {
    updateCell(pos)
    stopLaser()
    gGame.aliensCount--
    score += 10
    updateScoreText()
    console.log('gGame.aliensCount', gGame.aliensCount)
    if (gGame.aliensCount === 0) {
        console.log('VICTORY')
        gameOverChanges(VICTORY)
    } else if (!checkIfRowHasAlien(gBoard[pos.i])) updateAlienRowIdxs()

}


function activateBlowUpMode() {
    if (!gHero.blowUpMode) {
        gHero.blowUpMode = true
        console.log('BLOW UP MODE ACTIVATED')
    }

}

function blowUpNegs(board, rowIdx, colIdx) {
    var allNegsPos = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (!gBoard[i][j]) continue
            var negPos = {
                i: i,
                j: j
            }

            allNegsPos.push(negPos)

        }
    }
    allNegsPos.forEach(negPos => {
        var currentObj = gBoard[negPos.i][negPos.j].gameObject
        if (currentObj === ALIEN) {
            handleAlienHit(negPos)
        }
    })
    gHero.blowUpMode = false

}

function activateSuperMode() {
    if (!gHero.superMode && gHero.superAttackCount < 3) {
        gHero.superMode = true
        gHero.superAttackCount++
        console.log('gHero.superAttackCount', gHero.superAttackCount)
        updateSuperModeText()
    }
}

function getLaserSpeedAndSymbol() {
    var currentLaserSpeed
    var currentLaserSymbol
    if (gHero.superMode) {
        currentLaserSpeed = SUPER_LASER_SPEED
        currentLaserSymbol = SUPER_LASER
    } else {
        currentLaserSpeed = LASER_SPEED
        currentLaserSymbol = LASER
    }
    var laserInfo = { speed: currentLaserSpeed, symbol: currentLaserSymbol }
    return laserInfo
}

function freezeAliens() {
    gIsAlienFreeze = true
    setTimeout(() => {
        gIsAlienFreeze = false
    }, 5000);
}

function getHeroSymbol() {
    var currentHeroSymbol
    currentHeroSymbol = gHero.shieldOn ? SHIELD : HERO;
    return currentHeroSymbol
}
function activateHeroShield() {
    if (gHero.shieldOn || gHero.shields === 0) return
    gHero.shieldOn = true
    gHero.shields--
    renderHeroSymbolToShield(gHero.pos)
    updateShieldsText()
    setTimeout(() => {
        gHero.shieldOn = false
    }, 5000);

}

function renderHeroSymbolToShield(pos) {
    var elHero = getElCell(pos);
    elHero.innerText = SHIELD;
}

// function handleHeroBonuses(){
//     if (gHero.blowUpMode) {
//         blowUpNegs(gBoard, gLaserPos.i, gLaserPos.j)
//     } else if (gHero.superMode) {
//         gHero.superMode = false
//     }
// }



// function activateMode(mode){
//     if(mode === 'BLOWUP'){
//         if (!gHero.blowUpMode) {
//             gHero.blowUpMode = true
//             console.log('BLOW UP MODE ACTIVATED')
//         }
//     }
// }