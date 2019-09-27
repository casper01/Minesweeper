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