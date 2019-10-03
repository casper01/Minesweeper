(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

let settings = require("./settings.js");

module.exports = class Cell {
    constructor(containsBomb) {
        this._type = containsBomb ? settings.cellType.bomb : settings.cellType.empty;
        this._front = settings.cellType.hidden;
        this.neighbours = 0;
    }

    get hiddenType() {
        return this._type;
    }

    get front() {
        if (this._front == settings.cellType.empty && this.neighbours > 0) {
            return String(this.neighbours);
        }
        return this._front;
    }

    isMarked() {
        return this._front == settings.cellType.marked;
    }

    isHidden() {
        return this._type != this._front;
    }

    isBomb() {
        return this._type == settings.cellType.bomb || this._type == settings.cellType.firstBomb;
    }

    setFalselyMarked() {
        if (!this.isMarked()) {
            console.warn("Trying to falsely mark a cell that is not marked");
            return;
        }
        this._type = settings.cellType.falselyMarked;
    }

    setFirstBomb() {
        if(this._type != settings.cellType.bomb) {
            console.warn("Trying to set first bomb a cell that is not a bomb");
            return;
        }
        this._type = settings.cellType.firstBomb;
    }

    setVisibility(visible) {
        this._front = visible ? this._type : settings.cellType.hidden;
    }

    toggleMarking() {
        if (!this.isHidden()) {
            console.warn("Trying to mark visible cell");
            return;
        }
        this._front = this._front == settings.cellType.hidden ? settings.cellType.marked : settings.cellType.hidden;
    }
}
},{"./settings.js":5}],2:[function(require,module,exports){
"use strict";

var settings = require("./settings.js");

module.exports = class Context {
    constructor(rows, cols, onCellClickHandler) {
        this.rows = rows;
        this.cols = cols;
        this.cellWidth = 100;
        this._onCellClickHandler = onCellClickHandler;
        this.divsTable = this._createTable();
    }
    
    flipTo(row, col, type) {
        let cell = this.divsTable[row][col].tableCell;
        let frontDiv = this.divsTable[row][col].frontDiv;
        let backDiv = this.divsTable[row][col].backDiv;
        if (cell.classList.contains("flip")) {
            this._setDivBackgroundImage(frontDiv, this._getCellBackImage(type));
            cell.classList.toggle("flip");  // TODO: moze jakas stala
        }
        else {
            this._setDivBackgroundImage(backDiv, this._getCellBackImage(type));
            cell.classList.toggle("flip");  // TODO: moze jakas stala
        }

    }

    setClock(val) {
        document.getElementById(settings.timerId).innerHTML = val;
    }

    setBombsLeft(val) {
        document.getElementById(settings.bombsLeftId).innerHTML = val;
    }

    showVictoryScreen() {
        document.body.classList.add("pyro");
        setTimeout(function() {
            document.body.classList.remove("pyro");
        }, settings.victoryScreenTime);
    }
    
    showFailureScreen() {
        document.body.classList.add("shake-hard");
        setTimeout(function() {
            document.body.classList.remove("shake-hard");
        }, settings.failureScreenTime);
    }

    _createTable() {
        if (this.rows == undefined || this.rows === 0) {
            throw "Invalid input data";
        }

        let table = document.createElement("table");
        this._setMainMapAttributes(table);
        let divsTable = [];

        for (let r = 0; r < this.rows; r++) {
            let row = table.insertRow(-1);
            let rowStruct = [];
            for (let c = 0; c < this.cols; c++) {
                let td = row.insertCell(-1);
                this._setMapCellAttributes(td);

                let frontCellDiv = this._createFrontDivCell(r, c);
                let backCellDiv = this._createBackDivCell(r, c);
                td.appendChild(frontCellDiv);
                td.appendChild(backCellDiv);
                
                rowStruct.push({
                    frontDiv: frontCellDiv,
                    backDiv: backCellDiv,
                    tableCell: td
                });
            }
            divsTable.push(rowStruct);
        }

        document.body.appendChild(table);
        return divsTable;
    }

    _setMainMapAttributes(table) {
        table.setAttribute("cellspacing", "0");
        table.setAttribute("cellpadding", "0");
        table.style.background = "#191716";
    }

    _setMapCellAttributes(td) {
        td.style.position = "relative";
        td.style.transition = "transform 0.4s";
        td.style.transformStyle = "preserve-3d";
        td.style.width = this.cellWidth + "px";
        td.style.height = this.cellWidth + "px";
    }

    /**
     * @param {Number} row - row of processed cell on the board
     * @param {Number} col - col of processed cell on the board
     */
    _createFrontDivCell(row, col) {
        let div = document.createElement("div");
        
        this._setDivCellStyle(div);
        div.style.background = this._setDivBackgroundImage(div, settings.images.hiddenCell);
        
        // set handlers
        let self = this;
        div.onclick = function () {
            self._onCellClickHandler("left", row, col);
        };
        div.addEventListener('contextmenu', function (ev) {
            ev.preventDefault();
            self._onCellClickHandler("right", row, col);
            return false;
        }, false);

        return div;
    }

    _createBackDivCell(row, col) {
        let div = document.createElement("div");

        this._setDivCellStyle(div);
        div.style.transform = "rotateX(180deg)";
        
        // set handlers
        let self = this;
        div.onclick = function () {
            self._onCellClickHandler("left", row, col);
        };
        div.addEventListener('contextmenu', function (ev) {
            ev.preventDefault();
            self._onCellClickHandler("right", row, col);
            return false;
        }, false);
        return div;
    }

    _setDivCellStyle(div) {
        // set dimensions
        div.style.right = "0px";
        div.style.top = "0px";
        div.style.width = this.cellWidth + "px";
        div.style.height = this.cellWidth + "px";
        div.style.backgroundSize = this.cellWidth + "px";

        // set side shades
        div.style.webkitBoxShadow = "inset 0 0 14px 0px rgba(0, 0, 0, 1)";
        div.style.boxShadow = "inset 0 0 3px 0px rgba(0, 0, 0, 1)";

        // set style that enables flipping
        div.style.backfaceVisibility = "hidden";
        div.style.position = "absolute";
    }

    /**
     * Return path to image that represents specified type of cell
     * @param {String} cellType - type of cell, ex. "bomb", "empty" or number 1-8
     */
    _getCellBackImage(cellType) {
        switch(cellType) {
            case settings.cellType.hidden:
                return settings.images.hiddenCell;
            case settings.cellType.marked:
                return settings.images.flag;
            case settings.cellType.falselyMarked:
                return settings.images.invalidFlag;
            case settings.cellType.bomb:
                return settings.images.bomb;
            case settings.cellType.firstBomb:
                return settings.images.bombClicked;
            case settings.cellType.empty:
                return settings.images.emptyCell;
            case "1":
                return settings.images.num1;
            case "2":
                return settings.images.num2;
            case "3":
                return settings.images.num3;
            case "4":
                return settings.images.num4;
            case "5":
                return settings.images.num5;
            case "6":
                return settings.images.num6;
            case "7":
                return settings.images.num7;
            case "8":
                return settings.images.num8;
            default:
                console.warn("Cannot find back image for: ", cellType);
                return settings.images.emptyCell;
        }
    }

    _setDivBackgroundImage(div, imageUrl) {
        div.style.backgroundImage = 'url("' + imageUrl + '")';
    }
}
},{"./settings.js":5}],3:[function(require,module,exports){
var Context = require("./context.js");
var Cell = require("./cell.js");
var settings = require("./settings.js");

module.exports = class Game {
    /**
     * @param {Context} ctx - context of the screen
     */
    constructor() {
        this.rows = 8;
        this.cols = 8;
        this.bombsCount = 10;
        this.ctx = new Context(this.rows, this.cols, this.onCellClicked.bind(this));
        this.reset();
    }

    /**
     * Set timer that invokes for every second.
     * Return the timer
     */
    _setTimer() {
        let self = this;
        return setInterval(function() {
            self.secondsPassed++;
            self.ctx.setClock(self.secondsPassed);
        }, 1000);
    }

    /**
     * Reset game to new, unplayed game
     */
    reset() {
        this.rows = 8;
        this.cols = 8;
        this.bombsCount = 10;   // TODO: powtorzenie
        this.cells = this._generateRandomMap();
        this.secondsPassed = 0;
        this.timer = this._setTimer();
        this.cellsLeftToUnhide = this.rows * this.cols - this.bombsCount;
        this._status = "playing";
        this.ctx.setClock(0);
        this.ctx.setBombsLeft(this.bombsCount);
    }

    _generateRandomMap() {
        let bombs = this._randomizeBombPos();
        let b = 0;
        let cells = [];

        for (let i = 0; i < this.rows; i++) {
            let row = [];
            for (let j = 0; j < this.cols; j++) {
                row.push(new Cell(bombs[b]));
                b++;
            }
            cells.push(row);
        }
        this._makeCellsNumbers(cells);
        return cells;
    }

    /**
     * Assign a number for every cell, indicating number of bombs in their neighbourhood
     * @param {Array} cells - game board
     */
    _makeCellsNumbers(cells) {
        for (let x = 0; x < cells.length; x++) {
            for (let y = 0; y < cells[x].length; y++) {
                if (cells[x][y].hiddenType != settings.cellType.empty) {
                    continue;
                }
                let bombs = this._countBombsInNeighbourhood(cells, x, y);
                if (bombs == 0) {
                    continue;
                }
                cells[x][y].neighbours = bombs;
            }
        }
    }

    /**
     * Generate 1d array representing every cell in game board.
     * - 1 in the array represents bomb
     * - 0 in the array represents empty cell 
     */
    _randomizeBombPos() {
        return _.shuffle(new Array(this.rows * this.cols).fill(0).fill(1, 0, this.bombsCount));
    }

    /**
     * Return neighbouring cells of cell in (x, y) that are 8-connected
     * @param {Array} cells 
     * @param {Number} x 
     * @param {Number} y 
     */
    _getNeighbours(cells, x, y) {
        let neighbours = []

        for (let i = x - 1; i < x + 2; i++) {
            for (let j = y - 1; j < y + 2; j++) {
                if (i < 0 || j < 0 || i >= cells.length || j >= cells[x].length) {
                    continue;
                }
                if (i == x && j == y) {
                    continue;
                }
                neighbours.push({
                    cell: cells[i][j],
                    row: i,
                    col: j
                });
            }
        }
        return neighbours;
    }

    /**
     * Count bombs in neighbourhood of point (x, y) in array cells. 
     * Neighbourhood are cells that are 8-connected.
     * @param {Array} cells 
     * @param {Number} x 
     * @param {Number} y 
     */
    _countBombsInNeighbourhood(cells, x, y) {
        let bombs = 0;
        let neighbours = this._getNeighbours(cells, x, y);
        for (let n of neighbours) {
            if (n.cell.isBomb()) {
                bombs++;
            }
        }
        return bombs;
    }

    /**
     * Invoke handler when mouse clicks one of cell
     * @param {String} mouseButton - mouse button type: "left" or "right" 
     * @param {*} row - row of clicked cell
     * @param {*} col - col of clicked cell
     */
    onCellClicked(mouseButton, row, col) {
        if (this.isOver()) {
            this._hideAllCells();
            this.reset();
            return;
        }

        if(mouseButton == "left") {
            this._leftButtonClicked(row, col);
        }
        else if (mouseButton == "right") {
            this._rightButtonClicked(row, col);
        }
        else {
            console.warn("Unexpected mouse action:", mouseButton);
            return;
        }
    }

    _leftButtonClicked(row, col) {
        let cell = this.cells[row][col];
        if (cell.isMarked() || !cell.isHidden()) {
            return;
        }
        if (cell.isBomb()) {
            cell.setFirstBomb();
        }
        this._showCells(row, col);

        if (cell.isBomb()) {
            this._setGameLost();
        }
        else if (this.cellsLeftToUnhide == 0) {
            this._setGameWon();
        }
    }

    _rightButtonClicked(row, col) {
        let cell = this.cells[row][col];
        if (!cell.isHidden()) {
            return;
        }
        this._setFlagToCell(row, col);
    }
    
    _setGameWon() {
        this._status = settings.gameStatus.won;
        this._showAllCells(false);
        clearInterval(this.timer);
        this.ctx.showVictoryScreen();
    }
    
    _setGameLost() {
        this._status = settings.gameStatus.lost;
        this._showAllCells(true);
        clearInterval(this.timer);
        this.ctx.showFailureScreen();
    }



    _showCells(row, col) {
        let cell = this.cells[row][col];
        this._showCell(row, col);
        if (cell.front == settings.cellType.empty) {
            this._showNeighbouringEmptyCells(row, col);
        }
    }

    _showCell(row, col) {
        let cell = this.cells[row][col];
        cell.setVisibility(true);
        this.ctx.flipTo(row, col, cell.front);
        
        if (!cell.isBomb()) {
            this.cellsLeftToUnhide--;
        }
    }

    isOver() {
        return this._status != settings.gameStatus.playing;
    }

    _showNeighbouringEmptyCells(row, col) {
        let neighbours = this._getNeighbours(this.cells, row, col);
        for (let n of neighbours) {
            if (n.cell.isHidden() && !n.cell.isMarked()) {
                this._showCell(n.row, n.col);
                if (n.cell.front == settings.cellType.empty) {
                    this._showNeighbouringEmptyCells(n.row, n.col);
                }
            }
        }
    }

    _showAllCells(showBombs) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let cell = this.cells[r][c];
                if (!cell.isHidden()) {
                    continue;
                }
                if (!cell.isBomb()) {
                    if (cell.isMarked()) {
                        cell.setFalselyMarked();
                    }
                    this._showCell(r, c);
                }
                else if (!cell.isMarked() && showBombs) {
                    this._showCell(r, c);
                }
                else if (!cell.isMarked() && !showBombs) {
                    this._setFlagToCell(r, c);
                }
            }
        }
    }

    _hideAllCells() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.cells[r][c].setVisibility(false);
                this.ctx.flipTo(r, c, this.cells[r][c].front);
            }
        }
    }

    _updateBombsLeft(val) {
        this.bombsCount = val;
        this.ctx.setBombsLeft(this.bombsCount);
    }

    _setFlagToCell(row, col) {
        let cell = this.cells[row][col];

        if (cell.isMarked()) {
            this._updateBombsLeft(this.bombsCount + 1);
        }
        else {
            this._updateBombsLeft(this.bombsCount - 1);
        }

        cell.toggleMarking();
        this.ctx.flipTo(row, col, cell.front);
    }
}
},{"./cell.js":1,"./context.js":2,"./settings.js":5}],4:[function(require,module,exports){
"use strict";

(function () {
    var Game = require("./game.js");

    window.onload = function () {
        new Game();
    }

})();

},{"./game.js":3}],5:[function(require,module,exports){
module.exports = {
    images: {
        num1: "./images/num1.png",
        num2: "./images/num2.png",
        num3: "./images/num3.png",
        num4: "./images/num4.png",
        num5: "./images/num5.png",
        num6: "./images/num6.png",
        num7: "./images/num7.png",
        num8: "./images/num8.png",
        flag: "./images/flag.png",
        invalidFlag: "./images/invalidFlag.png",
        hiddenCell: "./images/hidden.png",
        emptyCell: "./images/empty.png",
        bomb: "./images/bomb.png",
        bombClicked: "./images/bombClicked.png"
    },
    cellType: {
        bomb: "bomb",
        firstBomb: "firstBomb",
        empty: "empty",
        marked: "flag",
        falselyMarked: "falselyMarked",
        hidden: "hidden"
    },
    gameStatus: {
        won: "won",
        lost: "lost",
        playing: "playing"
    },
    timerId: "timer",
    bombsLeftId: "bombs-left",
    victoryScreenTime: 5000,
    failureScreenTime: 500
}


},{}]},{},[1,2,3,4,5]);
