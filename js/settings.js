module.exports = {
    images: {
        num1: "./images/num1.png",
        num2: "./images/num2.png",
        num3: "./images/num3.png",
        num4: "./images/num4.png",
        num5: "./images/num5.png",
        num6: "./images/num6.png",
        num7: "./images/num7.png",
        num8: "./images/num8.png",
        flag: "./images/flag.png",
        invalidFlag: "./images/invalidFlag.png",
        hiddenCell: "./images/hidden.png",
        emptyCell: "./images/empty.png",
        bomb: "./images/bomb.png",
        bombClicked: "./images/bombClicked.png"
    },
    cellType: {
        bomb: "bomb",
        firstBomb: "firstBomb",
        empty: "empty",
        marked: "flag",
        falselyMarked: "falselyMarked",
        hidden: "hidden"
    },
    gameStatus: {
        won: "won",
        lost: "lost",
        playing: "playing"
    },
    levels: [
        { 
            rows: 8,
            cols: 8,
            bombs: 10
        },
        { 
            rows: 7,
            cols: 12,
            bombs: 17
        },
        { 
            rows: 16,
            cols: 16,
            bombs: 40
        },
        { 
            rows: 16,
            cols: 30,
            bombs: 99
        }
    ],
    timerId: "timer",
    bombsLeftId: "bombs-left",
    victoryScreenTime: 5000,
    failureScreenTime: 500
}

