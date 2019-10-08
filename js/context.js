"use strict";

var settings = require("./settings.js");

module.exports = class Context {
    constructor(rows, cols, levelInd, onCellClickHandler, onLevelChangeHandler, onMousebuttonsChangeHandler) {
        this._initHTML();
        this.rows = rows;
        this.cols = cols;
        this.cellWidth = Math.min(this.boardAreaWidth() / this.cols, this.boardAreaHeight() / this.rows);
        this._onCellClickHandler = onCellClickHandler;
        this._onLevelChangeHandler = onLevelChangeHandler;
        this._onMousebuttonsChangeHandler = onMousebuttonsChangeHandler;
        this._initSelectBox();
        this._initChoiceBox();
        this.divsTable = this._createTable();
        this.setLevel(levelInd);
    }

    boardAreaWidth() {
        return document.body.clientWidth;
    }

    boardAreaHeight() {
        return document.body.clientHeight - document.getElementById("top-menu").offsetHeight - 18;
    }

    flipTo(row, col, type) {
        let cell = this.divsTable[row][col].tableCell;
        let frontDiv = this.divsTable[row][col].frontDiv;
        let backDiv = this.divsTable[row][col].backDiv;
        if (cell.classList.contains("flip")) {
            this._setDivBackgroundImage(frontDiv, this._getCellBackImage(type));
            cell.classList.toggle("flip");
        }
        else {
            this._setDivBackgroundImage(backDiv, this._getCellBackImage(type));
            cell.classList.toggle("flip");
        }

    }

    resetMouseButtons() {
        document.getElementById("loupeChoice").click();
    }

    setLevel(levelInd) {
        let select = document.getElementById("levelSelector");
        let levelGraphics = select.options[levelInd].innerHTML;
        document.getElementsByClassName("select-selected")[0].innerHTML = levelGraphics;
    }

    setClock(val) {
        document.getElementById(settings.timerId).innerHTML = val;
    }

    setBombsLeft(val) {
        document.getElementById(settings.bombsLeftId).innerHTML = val;
    }

    showVictoryScreen() {
        document.body.classList.add("pyro");
        setTimeout(function () {
            document.body.classList.remove("pyro");
        }, settings.victoryScreenTime);
    }

    showFailureScreen() {
        document.body.classList.add("shake-hard");
        setTimeout(function () {
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
        table.style.margin = "auto";
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
        switch (cellType) {
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

    _initChoiceBox() {
        document.getElementById("loupeChoice").classList.add("active-choice");
        let self = this;
        function click(clickedChoiceId, releasedChoiceId) {
            if (document.getElementById(clickedChoiceId).classList.contains("active-choice")) {
                return;
            }
            document.getElementById(clickedChoiceId).classList.add("active-choice");
            document.getElementById(releasedChoiceId).classList.remove("active-choice");
            self._onMousebuttonsChangeHandler();
        }

        document.getElementById("loupeChoice").onclick = function() {
            click("loupeChoice", "flagChoice");
        };
        document.getElementById("flagChoice").onclick = function() {
            click("flagChoice", "loupeChoice");
        };
        
    }

    _initSelectBox() {
        let self = this;
        var x, i, j, selElmnt, a, b, c;
        
        /* Look for any elements with the class "custom-select": */
        x = document.getElementsByClassName("custom-select");
        for (i = 0; i < x.length; i++) {
            selElmnt = x[i].getElementsByTagName("select")[0];
            /* For each element, create a new DIV that will act as the selected item: */
            a = document.createElement("DIV");
            a.setAttribute("class", "select-selected");
            a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
            x[i].appendChild(a);
            /* For each element, create a new DIV that will contain the option list: */
            b = document.createElement("DIV");
            b.setAttribute("class", "select-items select-hide");
            for (j = 0; j < selElmnt.length; j++) {
                /* For each option in the original select element,
                create a new DIV that will act as an option item: */
                c = document.createElement("DIV");
                c.innerHTML = selElmnt.options[j].innerHTML;
                c.addEventListener("click", function (e) {
                    /* When an item is clicked, update the original select box,
                    and the selected item: */
                    var y, i, k, s, h;
                    s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                    h = this.parentNode.previousSibling;
                    for (i = 0; i < s.length; i++) {
                        if (s.options[i].innerHTML == this.innerHTML) {
                            s.selectedIndex = i;
                            h.innerHTML = this.innerHTML;
                            y = this.parentNode.getElementsByClassName("same-as-selected");
                            for (k = 0; k < y.length; k++) {
                                y[k].removeAttribute("class");
                            }
                            this.setAttribute("class", "same-as-selected");
                            break;
                        }
                    }
                    h.click();
                    self._onLevelChangeHandler(selElmnt.options[selElmnt.selectedIndex].value);
                });
                b.appendChild(c);
            }
            x[i].appendChild(b);
            a.addEventListener("click", function (e) {
                /* When the select box is clicked, close any other select boxes,
                and open/close the current select box: */
                e.stopPropagation();
                closeAllSelect(this);
                this.nextSibling.classList.toggle("select-hide");
                this.classList.toggle("select-arrow-active");
            });
        }

        function closeAllSelect(elmnt) {
            /* A function that will close all select boxes in the document,
            except the current select box: */
            var x, y, i, arrNo = [];
            x = document.getElementsByClassName("select-items");
            y = document.getElementsByClassName("select-selected");
            for (i = 0; i < y.length; i++) {
                if (elmnt == y[i]) {
                    arrNo.push(i)
                } else {
                    y[i].classList.remove("select-arrow-active");
                }
            }
            for (i = 0; i < x.length; i++) {
                if (arrNo.indexOf(i)) {
                    x[i].classList.add("select-hide");
                }
            }
        }

        /* If the user clicks anywhere outside the select box,
        then close all select boxes: */
        document.addEventListener("click", closeAllSelect);
    }

    _initHTML() {
        document.body.innerHTML = `<div id="top-menu" class="infobox">
        Level:
        <div class="custom-select">
            <select id="levelSelector">
                <option value="0" selected="selected">&#9733;</option>
                <option value="1">&#9733;&#9733;</option>
                <option value="2">&#9733;&#9733;&#9733;</option>
                <option value="3">&#9733;&#9733;&#9733;&#9733;</option>
            </select>
        </div>
        
        <div class="info-element">
            <div class="image">
                <img src="images/clockIcon.png" />
            </div>
            <div id="timer" class="text"></div>
        </div>
        <div class="info-element">
            <div class="image">
                <img src="images/bombIcon.png" />
            </div>
            <div id="bombs-left" class="text"></div>
        </div>
        <div class="info-element">
            <div class="choices">
                <div id="loupeChoice" class="image choice">
                    <img src="images/loupeIcon.png" />
                </div>
                <div id="flagChoice" class="image choice">
                    <img src="images/flagIcon.png" />
                </div>
            </div>
        </div>
    </div>
    <div class="before"></div>
    <div class="after"></div>`;
    }
}