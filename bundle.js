(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

module.exports = class Cell {
    constructor(containsBomb) {
        this.width = 100;
        this.height = 100;
        this.hidden = true;
        this.marked = false;
        this.type = containsBomb ? "bomb" : "empty";
    }

    showContent(showMarked = false) {
        if (this.marked && !showMarked) {
            return;
        }
        this.hidden = false;
    }

    setFlag() {
        if (!this.hidden) {
            return;
        }
        this.marked = !this.marked;
    }
}
},{}],2:[function(require,module,exports){
var Cell = require("./cell.js");

module.exports = class Game {
    constructor(rows, cols, bombsCount, timerCallback = null) {
        this.rows = rows;
        this.cols = cols;
        this.bombsCount = bombsCount;
        this.cells = [];
        this.generateRandomMap();
        this.secondsPassed = 0;
        let self = this;
        this.timer = setInterval(function() {
            self.secondsPassed++;
            if (timerCallback) {
                timerCallback(self.secondsPassed);
            }
        }, 1000);
    }

    generateRandomMap() {
        let bombs = this._randomizeBombPos();
        let b = 0;
        this.cells = [];

        for (let i = 0; i < this.rows; i++) {
            let row = [];
            for (let j = 0; j < this.cols; j++) {
                row.push(new Cell(bombs[b]));
                b++;
            }
            this.cells.push(row);
        }
        this._makeCellsNumbers(this.cells);
    }

    showCell(row, col) {
        let cell = this.cells[row][col];
        
        if (cell.marked) {
            return;
        }
        
        cell.showContent();

        if (cell.type == "empty") {
            this._showNeighbouringEmptyCells(row, col);
        }
        if (cell.type == "bomb") {
            this._showAllCells();
        }

    }

    _showNeighbouringEmptyCells(row, col) {
        let neighbours = this._getNeighbours(row, col);
        for (let n of neighbours) {
            if (n.cell.hidden && !n.cell.marked) {
                n.cell.showContent();
                if (n.cell.type == "empty") {
                    this._showNeighbouringEmptyCells(n.row, n.col);
                }
            }
        }
    }

    _showAllCells() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.cells[r][c].showContent(true);
            }
        }
    }

    setFlagToCell(row, col) {
        this.cells[row][col].setFlag();
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
     * @param {Number} x 
     * @param {Number} y 
     */
    _getNeighbours(x, y) {
        let neighbours = []

        for (let i = x - 1; i < x + 2; i++) {
            for (let j = y - 1; j < y + 2; j++) {
                if (i < 0 || j < 0 || i >= this.cells.length || j >= this.cells[x].length) {
                    continue;
                }
                if (i == x && j == y) {
                    continue;
                }
                neighbours.push({
                    cell: this.cells[i][j],
                    row: i,
                    col: j
                });
            }
        }
        return neighbours;
    }

    /**
     * Count bombs in neighbourhood of point (x, y) in array cells. Neighbourhood are cells that are 8-connected.
     * @param {Array} cells 
     * @param {Number} x 
     * @param {Number} y 
     */
    _countBombsInNeighbourhood(cells, x, y) {
        let bombs = 0;
        let neighbours = this._getNeighbours(x, y);
        for (let n of neighbours) {
            if (n.cell.type == "bomb") {
                bombs++;
            }
        }
        return bombs;
    }

    /**
     * Assign a number for every cell, indicating number of bombs in their neighbourhood
     * @param {Array} cells - game board
     */
    _makeCellsNumbers(cells) {
        for (let x = 0; x < cells.length; x++) {
            for (let y = 0; y < cells[x].length; y++) {
                if (cells[x][y].type != "empty") {
                    continue;
                }
                let bombs = this._countBombsInNeighbourhood(cells, x, y);
                if (bombs == 0) {
                    continue;
                }
                cells[x][y].type = String(bombs);
            }
        }
    }
}
},{"./cell.js":1}],3:[function(require,module,exports){
"use strict";

var Game = require("./game.js");

module.exports = class GameManager {
    constructor() {
        this.game = null;
    }

    newGame() {
        this.game = new Game(8, 8, 10);
    }


}
},{"./game.js":2}],4:[function(require,module,exports){
"use strict";

(function () {
    var Cell = require("./cell.js");
    var Game = require("./game.js");

    class Renderer {
        constructor() {
            let rows = 8;
            let cols = 8;
            this.bombsCount = 10;
            this.timer = document.getElementById("timer");
            this.bombsLeft = document.getElementById("bombs-left");
            
            this.game = new Game(rows, cols, this.bombsCount, this._updateTimer);
            this.cellsObjects = this.game.cells;
            this.cellsDivs = this.generateMap(this.cellsObjects);
            this._resetTimer();
            this._resetBombsLeft();
        }

        get rows() {
            return this.cellsObjects.length;
        }

        get cols() {
            return this.cellsObjects.length > 0 ? this.cellsObjects[0].length : 0;
        }

        _resetTimer() {
            this.timer.innerHTML = 0;
        }

        _resetBombsLeft() {
            this.bombsCount = this.game.bombsCount;
            this.bombsLeft.innerHTML = this.game.bombsCount;
        }

        _updateTimer(secondsPassed) {
            // TODO: ujednolicic this.timer i to ponizej. Kontekst nie pozwala uzyc pola. Moze utworzyc stala.
            document.getElementById("timer").innerHTML = secondsPassed;
        }

        _updateBombsLeft() {
            this.bombsLeft.innerHTML = this.bombsCount;
        } 

        generateMap() {
            let rows = this.cellsObjects.length;
            if (rows == undefined || rows === 0) {
                throw "Invalid input data";
            }
            let cols = this.cellsObjects[0].length;

            let table = document.createElement("table");
            let divsTable = [];

            for (let r = 0; r < rows; r++) {
                let row = table.insertRow(-1);
                let rowDivs = [];
                for (let c = 0; c < cols; c++) {
                    let td = row.insertCell(-1);
                    if (this.cellsObjects[r][c] == undefined) {
                        throw "Undefined value of cellsObjects[" + r + "][" + c + "]" + this.cellsObjects[r][c];
                    }
                    let cellDiv = this.createDivCell(r, c);
                    td.appendChild(cellDiv);
                    rowDivs.push(cellDiv);
                }
                divsTable.push(rowDivs);
            }

            document.body.appendChild(table);
            return divsTable;
        }

        /**
         * @param {Number} row - row of processed cell on the board
         * @param {Number} col - col of processed cell on the board
         */
        createDivCell(row, col) {
            let div = document.createElement("div");
            let cell = this.cellsObjects[row][col];
            this.updateDivCell(cell, div);
            
            // set handlers
            let self = this;
            div.onclick = function () {
                self._unhideCell(self, row, col, div);
            };
            div.addEventListener('contextmenu', function (ev) {
                ev.preventDefault();
                self._setCellMarked(self, row, col, div);
                return false;
            }, false);

            return div;
        }

        _setCellMarked(rendererContext, row, col, div) {
            let cell = rendererContext.cellsObjects[row][col];
            
            if (!cell.hidden) {
                return;
            }
            
            rendererContext.bombsCount = cell.marked ? rendererContext.bombsCount + 1 : rendererContext.bombsCount - 1;
            rendererContext._updateBombsLeft();

            rendererContext.game.setFlagToCell(row, col);
            rendererContext.updateDivCell(cell, div);
        }

        _unhideCell(rendererContext, row, col, div) {
            let cell = rendererContext.cellsObjects[row][col];
            rendererContext.game.showCell(row, col);
            rendererContext.updateDivCell(cell, div);
            if (cell.marked) {
                return;
            }
            if (cell.type == "empty" || cell.type == "bomb") {
                rendererContext.updateAllDivCells();
            }
            else {
                rendererContext.updateDivCell(cell, div);
            }
        }

        /**
         * @param {Cell} cell - cell converted to div
         * @param div - div that represents the cell
         */
        updateDivCell(cell, div) {
            div.style.width = cell.width + "px";
            div.style.height = cell.height + "px";

            if (cell.hidden) {
                div.style.background = cell.marked ? "blue" : "gray";
            }
            else {
                switch (cell.type) {
                    case "bomb":
                        div.style.background = "red";
                        break;
                    case "empty":
                        div.style.background = "white";
                        break;
                    default:
                        div.style.background = "white";
                        div.innerHTML = cell.type;
                }
            }
        }

        updateAllDivCells() {
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    this.updateDivCell(this.cellsObjects[r][c], this.cellsDivs[r][c]);
                }
            }
        }

    }

    function printTimer(secondsPassed) {
        document.getElementById("timer").innerHTML = secondsPassed;
    }


    window.onload = function () {
        new Renderer();
    }

})();

},{"./cell.js":1,"./game.js":2}]},{},[1,2,3,4]);
