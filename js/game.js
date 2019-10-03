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
        this.bombsCount = 10;
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
    }
    
    _setGameLost() {
        this._status = settings.gameStatus.lost;
        this._showAllCells(true);
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
                    cell.toggleMarking();
                    this.ctx.flipTo(r, c, cell.front);
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

    _setFlagToCell(row, col) {
        let cell = this.cells[row][col];
        cell.toggleMarking();
        this.ctx.flipTo(row, col, cell.front);
    }
}