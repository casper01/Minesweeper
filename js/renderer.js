"use strict";

(function () {
    var Cell = require("./cell.js");
    var Game = require("./game.js");
    var settings = require("./settings.js");

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

        _updateBombsLeft(newBombsCount) {
            this.bombsCount = newBombsCount;
            this.bombsLeft.innerHTML = this.bombsCount;
        } 

        _setMainMapAttributes(table) {
            table.setAttribute("cellspacing", "0");
            table.setAttribute("cellpadding", "0");
        }

        _setMapCellAttributes(td) {
            td.style.position = "relative";
            td.style.transition = "transform 0.4s";
            td.style.transformStyle = "preserve-3d";
            td.style.width = "100px";   // TODO: pozbyc sie hardcoded 100px
            td.style.height = "100px";
        }

        generateMap() {
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
                    if (this.cellsObjects[r][c] == undefined) {
                        throw "Undefined value of cellsObjects[" + r + "][" + c + "]" + this.cellsObjects[r][c];
                    }

                    let td = row.insertCell(-1);
                    this._setMapCellAttributes(td);

                    let frontCellDiv = this.createFrontDivCell(r, c);
                    let backCellDiv = this.createBackDivCell(r, c);
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

        /**
         * @param {Number} td - cell of the table
         * @param {Number} row - row of processed cell on the board
         * @param {Number} col - col of processed cell on the board
         */
        createFrontDivCell(row, col) {
            let div = document.createElement("div");
            let cell = this.cellsObjects[row][col];
            
            this._setDivCellStyle(div, cell);
            div.style.background = this.setDivBackgroundImage(div, settings.images.hiddenCell);
            
            // set handlers
            let self = this;
            div.onclick = function () {
                if (cell.type == "marked") {
                    return;
                }
                self._unhideCell(self, row, col);
            };
            div.addEventListener('contextmenu', function (ev) {
                ev.preventDefault();

                // TODO: jeszcze spr ze !this.game.isRunning() ale nie podoba mi sie to
                if (!cell.hidden) {
                    return false;
                }
                self._setCellMarked(self, row, col);
                return false;
            }, false);

            return div;
        }

        /**
         * Return path to image that represents specified type of cell
         * @param {String} cellType - type of cell, ex. "bomb", "empty" or number 1-8
         */
        _getCellBackImage(cellType) {
            switch(cellType) {
                case "bomb":
                    return settings.images.bomb;
                case "empty":
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
                    console.warn("cannot read number of neighbouring cells");
                    this.setDivBackgroundImage(div, settings.images.emptyCell);
                    break;
            }
        }

        createBackDivCell(row, col) {
            let div = document.createElement("div");
            let cell = this.cellsObjects[row][col];

            this._setDivCellStyle(div, cell);
            div.style.transform = "rotateX(180deg)";
            this.setDivBackgroundImage(div, this._getCellBackImage(cell.type));
            
            // set handlers
            let self = this;
            div.onclick = function () {
                // TODO: nic, bo komorka juz odslonieta. Ew. gra sie resetuje i zaczyna nowa
            };
            div.addEventListener('contextmenu', function (ev) {
                ev.preventDefault();

                if (!cell.hidden) {
                    return false;
                }

                self._setCellMarked(self, row, col);
                return false;
            }, false);
            return div;
        }

        _setDivCellStyle(div, cell) {
            // set dimensions
            // TODO: https://looka.com/blog/logo-color-combinations/
            div.style.right = "0px";
            div.style.top = "0px";
            div.style.width = cell.width + "px";
            div.style.height = cell.height + "px"; // TODO: height == width
            div.style.backgroundSize = cell.width + "px";

            // set side shades
            div.style.webkitBoxShadow = "inset 0 0 14px 0px rgba(0, 0, 0, 1)";
            div.style.boxShadow = "inset 0 0 3px 0px rgba(0, 0, 0, 1)";

            // set style that enables flipping
            div.style.backfaceVisibility = "hidden";
            div.style.position = "absolute";
        }

        _setCellMarked(rendererContext, row, col) {
            let cell = rendererContext.cellsObjects[row][col];
            let actBombsCount = rendererContext.bombsCount;
            let backDiv = rendererContext.cellsDivs[row][col].backDiv;
            
            if (!cell.marked) {
                // add marking
                rendererContext.setDivBackgroundImage(backDiv, settings.images.flag);
                rendererContext._updateBombsLeft(actBombsCount - 1);
            }
            else {
                // remove marking
                rendererContext._updateBombsLeft(actBombsCount + 1);
            }
            rendererContext.flipDivCell(row, col);
            rendererContext.game.setFlagToCell(row, col);
        }

        _unhideCell(rendererContext, row, col) {
            rendererContext.game.showCell(row, col);

            let cell = rendererContext.cellsObjects[row][col];
            let backDiv = rendererContext.cellsDivs[row][col].backDiv;
            rendererContext.setDivBackgroundImage(backDiv, rendererContext._getCellBackImage(cell.type));
            
            if (cell.type == "empty" || cell.type == "bomb") {
                rendererContext.updateAllDivCells();
            }
            else {
                rendererContext.flipDivCell(row, col);
            }
        }

        /**
         * @param {Cell} cell - cell converted to div
         * @param div - div that represents the cell
         */
        flipDivCell(row, col) {
            let cellClasses = this.cellsDivs[row][col].tableCell.classList;
            cellClasses.toggle("flip");
        }

        setDivBackgroundImage(div, imageUrl) {
            div.style.backgroundImage = 'url("' + imageUrl + '")';
        }

        updateAllDivCells() {
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (!this.cellsObjects[r][c].hidden) {
                        this.cellsDivs[r][c].tableCell.classList.add("flip"); // TODO: jakas stala czy cos??
                    }
                }
            }
        }

    }


    window.onload = function () {
        new Renderer();
    }

})();
