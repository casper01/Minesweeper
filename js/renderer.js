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
            
            if (!cell.hidden || !this.game.isRunning()) {
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


    window.onload = function () {
        new Renderer();
    }

})();
