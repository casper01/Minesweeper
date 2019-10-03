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

    }

    setBombsLeft(val) {

    }

    showVictoryScreen() {

    }

    showFailureScreen() {

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