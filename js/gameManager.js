"use strict";

var Game = require("./game.js");

module.exports = class GameManager {
    constructor() {
        this.game = null;
    }

    newGame() {
        this.game = new Game(8, 8, 10);
    }


}