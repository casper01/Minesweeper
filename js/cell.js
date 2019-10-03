"use strict";

let settings = require("./settings.js");

module.exports = class Cell {
    constructor(containsBomb) {
        this._type = containsBomb ? settings.cellType.bomb : settings.cellType.empty;
        this._front = settings.cellType.hidden;
        this.neighbours = 0;
    }

    get hiddenType() {
        return this._type;
    }

    get front() {
        if (this._front == settings.cellType.empty && this.neighbours > 0) {
            return String(this.neighbours);
        }
        return this._front;
    }

    isMarked() {
        return this._front == settings.cellType.marked;
    }

    isHidden() {
        return this._type != this._front;
    }

    isBomb() {
        return this._type == settings.cellType.bomb || this._type == settings.cellType.firstBomb;
    }

    setFalselyMarked() {
        if (!this.isMarked()) {
            console.warn("Trying to falsely mark a cell that is not marked");
            return;
        }
        this._type = settings.cellType.falselyMarked;
    }

    setFirstBomb() {
        if(this._type != settings.cellType.bomb) {
            console.warn("Trying to set first bomb a cell that is not a bomb");
            return;
        }
        this._type = settings.cellType.firstBomb;
    }

    setVisibility(visible) {
        this._front = visible ? this._type : settings.cellType.hidden;
    }

    toggleMarking() {
        if (!this.isHidden()) {
            console.warn("Trying to mark visible cell");
            return;
        }
        this._front = this._front == settings.cellType.hidden ? settings.cellType.marked : settings.cellType.hidden;
    }
}