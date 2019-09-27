"use strict";

module.exports = class Cell {
    constructor(containsBomb) {
        this.width = 100;
        this.height = 100;
        this.hidden = true;
        this.marked = false;
        this.type = containsBomb ? "bomb" : "empty";
    }

    showContent() {
        if (!this.hidden || this.marked) {
            return;
        }
        this.hidden = false;
    }

    setFlag() {
        if (!this.hidden) {
            return;
        }
        this.marked = !this.marked;
    }
}