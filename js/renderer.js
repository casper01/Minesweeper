(function () {
    var Cell = require("./cell.js");

    class Renderer {
        constructor(cellsObjects) {
            this.cellsObjects = cellsObjects;
            this.cellsDivs = this.generateMap(this.cellsObjects);
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
                let tds = [];
                for (let c = 0; c < cols; c++) {
                    let td = row.insertCell(-1);
                    tds.push(td);
                    if (cellsObjects[r][c] == undefined) {
                        throw "Undefined value of cellsObjects[" + r + "][" + c + "]" + cellsObjects[r][c];
                    }
                    td.appendChild(this.createDivCell(cellsObjects[r][c]));
                }
                divsTable.push(tds);
            }
            document.body.appendChild(table);
            return divsTable;
        }

        /**
         * @param {Cell} cell - cell object converted to div
         */
        createDivCell(cell) {
            let div = document.createElement("div");
            this.updateDivCell(cell, div);
            let self = this;

            div.onclick = function() {
                cell.showContent();
                self.updateDivCell(cell, div);
            };
            div.addEventListener('contextmenu', function(ev) {
                ev.preventDefault();
                cell.setFlag();
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
                switch(cell.type) {
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

    }



    

    function generateBombMap(rows, cols, bombsCount) {
        return _.shuffle(new Array(rows * cols).fill(0).fill(1, 0, bombsCount));
    }

    function countBombsInNeighbourhood(cells, x, y) {
        let bombs = 0;
        for (let i = x - 1; i < x + 2; i++) {
            for (let j = y - 1; j < y + 2; j++) {
                if (i < 0 || j < 0 || i >= cells.length || j >= cells[x].length) {
                    continue;
                }
                if (cells[i][j].type == "bomb") {
                    bombs++;
                }
            }
        }
        return bombs;
    }

    function makeCellsNumbers(cells) {
        for (let x = 0; x < cells.length; x++) {
            for (let y = 0; y < cells[x].length; y++) {
                if (cells[x][y].type != "empty") {
                    continue;
                }
                let bombsCount = countBombsInNeighbourhood(cells, x, y);
                if (bombsCount == 0) {
                    continue;
                }
                cells[x][y].type = String(bombsCount);
            }
        }
    }

    window.onload = function () {
        let cells = [];
        let rows = 8;
        let cols = 8;
        let bombsCount = 10;
        let bombs = generateBombMap(rows, cols, bombsCount);
        let b = 0;

        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < cols; j++) {
                row.push(new Cell(bombs[b]));
                b++;
            }
            cells.push(row);
        }
        makeCellsNumbers(cells);
        console.log(cells);
        
        let renderer = new Renderer(cells);
    }

})();
