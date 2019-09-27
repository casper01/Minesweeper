"use strict";

(function () {
    var Cell = require("./cell.js");
    var Game = require("./game.js");

    class Renderer {
        constructor(game) {
            this.game = game;
            this.cellsObjects = this.game.cells;
            this.cellsDivs = this.generateMap(this.cellsObjects);
        }

        get rows() {
            return this.cellsObjects.length;
        }

        get cols() {
            return this.cellsObjects.length > 0 ? this.cellsObjects[0].length : 0;
        }

        /**
         * @param {Array} cellsObjects - 2d array, 1st dim are rows, 2nd are columns 
         */
        generateMap(cellsObjects) {
            let rows = cellsObjects.length;
            if (rows == undefined || rows === 0) {
                throw "Invalid input data";
            }
            let cols = cellsObjects[0].length;

            let table = document.createElement("table");
            let divsTable = [];

            for (let r = 0; r < rows; r++) {
                let row = table.insertRow(-1);
                let rowDivs = [];
                for (let c = 0; c < cols; c++) {
                    let td = row.insertCell(-1);
                    if (cellsObjects[r][c] == undefined) {
                        throw "Undefined value of cellsObjects[" + r + "][" + c + "]" + cellsObjects[r][c];
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
         * @param {Cell} cell - cell object converted to div
         */
        createDivCell(row, col) {
            let self = this;
            let div = document.createElement("div");
            let cell = this.cellsObjects[row][col];
            this.updateDivCell(cell, div);

            div.onclick = function () {
                self.game.showCell(row, col);
                self.updateDivCell(cell, div);
                if (cell.type != "empty") {
                    self.updateDivCell(cell, div);
                }
                else {
                    self.updateAllDivCells();
                }
            };
            div.addEventListener('contextmenu', function (ev) {
                ev.preventDefault();
                self.game.setFlagToCell(row, col);
                self.updateDivCell(cell, div);
                return false;
            }, false);

            return div;
        }

        /**
         * @param {Cell} cell - cell converted to div
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
        let cells = [];
        let rows = 8;
        let cols = 8;
        let bombsCount = 10;

        let game = new Game(rows, cols, bombsCount);
        let renderer = new Renderer(game);
    }

})();
