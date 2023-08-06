'use strict'
// Returns a new cell object. e.g.: {type: SKY, gameObject: ALIEN}
function createCell(gameObject = null) {
    return {
        type: SKY,
        gameObject: gameObject
    }
}
function getElCell(pos) {
    var cellClassName = getClassName(pos)
    return document.querySelector('.' + cellClassName);
}

function updateCell(pos, gameObject = null) {
    gBoard[pos.i][pos.j].gameObject = gameObject;
    var elCell = getElCell(pos);
    elCell.innerHTML = gameObject || EMPTY_CELL;
}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }