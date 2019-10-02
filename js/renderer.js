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
            table.setAttribute("cellspacing", "0");
            table.setAttribute("cellpadding", "0");
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

            // set layout
            div.style.webkitBoxShadow = "inset 0 0 14px 0px rgba(0, 0, 0, 1)";
            div.style.boxShadow = "inset 0 0 3px 0px rgba(0, 0, 0, 1)";
            
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
            // TODO: https://looka.com/blog/logo-color-combinations/
            div.style.width = cell.width + "px";
            div.style.height = cell.height + "px"; // TODO: height == width
            div.style.backgroundSize = cell.width + "px";

            if (cell.hidden) {
                div.style.background = cell.marked ? this.setDivBackgroundImage(div, settings.images.flag) : this.setDivBackgroundImage(div, settings.images.hiddenCell);
            }
            else {
                switch (cell.type) {
                    case "bomb":
                        this.setDivBackgroundImage(div, settings.images.bomb);
                        break;
                    case "empty":
                        this.setDivBackgroundImage(div, settings.images.emptyCell);
                        break;
                    default:
                        switch(parseInt(cell.type)) {
                            case 1:
                                this.setDivBackgroundImage(div, settings.images.num1);
                                break;
                            case 2:
                                this.setDivBackgroundImage(div, settings.images.num2);
                                break;
                            case 3:
                                this.setDivBackgroundImage(div, settings.images.num3);
                                break;
                            case 4:
                                this.setDivBackgroundImage(div, settings.images.num4);
                                break;
                            case 5:
                                this.setDivBackgroundImage(div, settings.images.num5);
                                break;
                            case 6:
                                this.setDivBackgroundImage(div, settings.images.num6);
                                break;
                            case 7:
                                this.setDivBackgroundImage(div, settings.images.num7);
                                break;
                            case 8:
                                this.setDivBackgroundImage(div, settings.images.num8);
                                break;
                            default:
                                console.warn("cannot read number of neighbouring cells");
                                this.setDivBackgroundImage(div, settings.images.emptyCell);
                                break;
                        }
                }
            }
        }

        setDivBackgroundImage(div, imageUrl) {
            div.style.backgroundImage = 'url("' + imageUrl + '")';
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
