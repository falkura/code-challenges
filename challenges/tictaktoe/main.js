const project = {
    name: 'Tic Tak Toe',
    onload: init,
    info: 'Simple tic tak toe game, nothing special',
    buttons: {
        "Restart": () => { window.main.reset && window.main.reset() },
        "Turn Back": () => { window.main.turnBack() },
    }
}

function init() {
    window.main = new Main();
}

class Main {
    gridWidth = 750;
    gridBorderWidth = 10;
    gridColor = '#777777';
    gridSize = 3;
    cells = [];
    symbolPadding = 0.3;
    symbolBorderWidth = 14;
    colors = ['#ffffff', '#FF5733'];
    turn = 0;
    winLines;
    winner = undefined;
    history = [];
    fontPos;

    constructor() {
        ctx.font = "40px Verdana";

        this.fontPos = {
            x: (cc.settings.canvasWidth + this.gridWidth) / 2 + 30,
            y: (cc.settings.canvasHeight - this.gridWidth) / 2
        }

        this.reset();
        this.init();
    }

    reset() {
        this.cells = new Array(this.gridSize).fill(undefined).map(_ => new Array(this.gridSize).fill(-1));

        /**
         * My project - my rules
         * 
         * We have 8 winlines: 
         * 3 horizontal, 3 vertical, 2 diagonal
         * 
         * If first player have value - 0, the second - 1 and the win can only be
         * possible if whole line of 3 symbols is full, we can get a simple rule:
         * 
         * If win line is full (count === 3) we can check it for win:
         * value === 0 - first player is winner
         * value === 3 - second player is winner
         * 
         * otherwise - no winner
         */
        this.winLines = {
            hor: new Array(3).fill(undefined).map(_ => ({
                value: 0,
                count: 0
            })),
            vert: new Array(3).fill(undefined).map(_ => ({
                value: 0,
                count: 0
            })),
            diag: new Array(2).fill(undefined).map(_ => ({
                value: 0,
                count: 0
            })),
        }
        ctx.beginPath();
        ctx.clearRect(0, 0, cc.settings.canvasWidth, cc.settings.canvasHeight);
        ctx.closePath();

        this.history = [];
        this.turn = 0;
        this.winner = undefined;
        this.createGrid();
    }

    init() {
        const handleClick = (e) => {
            if (this.winner !== undefined) return;

            const { x: xStart, y: yStart, cellWidth } = this.gridParams;
            const gridPos = getGridCell(e, xStart, yStart, cellWidth, this.gridSize, this.gridSize, false);

            if (!gridPos) return;

            if (this.cells[gridPos.x][gridPos.y] !== -1) return;

            this.doTurn(gridPos);
        };

        canvas.addEventListener('pointerdown', handleClick);
    }

    addText(x, y) {
        if (this.winner === undefined) {
            ctx.fillStyle = "#ffffff";
        } else {
            ctx.fillStyle = "#ff44ff";
        }

        const prefix = this.turn % 2 === 0 ? 'O' : 'X';
        const text = prefix + ' [' + (x + 1) + ', ' + (y + 1) + ']'
        ctx.fillText(text, this.fontPos.x, this.fontPos.y + this.turn * 50);

    }

    turnBack() {
        // Not the best, but okay :)    
        const _history = this.history.slice(0, -1);
        this.reset();
        _history.forEach(this.doTurn.bind(this));
    }

    doTurn(pos) {
        this.history.push(pos);

        const { x, y } = pos;

        this.cells[x][y] = this.turn % 2;

        if (this.turn % 2 === 0) {
            this.drawCross(x, y, 1);
        } else {
            this.drawCircle(x, y, 0);
        }

        this.turn++;

        this.addToWinLines(x, y, this.turn % 2);
        this.checkWinner();

        this.addText(x, y);

        // Wait for draw
        setTimeout(() => {
            if (this.winner !== undefined) {
                alert(`Winner is ${this.winner === 0 ? 'O' : 'X'} !`);
            } else if (this.turn === 9) {
                alert("Tie!");
            }
        })
    }

    addToWinLines(x, y, turn) {
        // Optimization
        const addToLine = (type, index) => {
            this.winLines[type][index].count++;
            this.winLines[type][index].value += turn;
        }
        // Every symbols is in vertical and horizontal lines
        addToLine('vert', x);
        addToLine('hor', y);

        if (x === y && x !== 1) {
            // Add symbol of top left - bottom right line
            addToLine('diag', 0);
        } else if (x === y && x === 1) {
            // Add symbol of both diagonal lines
            addToLine('diag', 0);
            addToLine('diag', 1);
        } else if (x !== y && x !== 1 && y !== 1) {
            // Add symbol of bottom left - top right line
            addToLine('diag', 1);
        }
    }

    checkWinner() {
        for (const type in this.winLines) {
            this.winLines[type].forEach((line, index) => {
                if (line.count === 3 && this.winner === undefined) {
                    line.count = -1; //remove line from checker

                    if (line.value === 0) {
                        this.winner = 0;
                    }

                    if (line.value === 3) {
                        this.winner = 1;
                    }

                    if (this.winner !== undefined) {
                        this.showWin(type, index);
                    }
                }
            })
        }
    }

    showWin(type, index) {
        ctx.strokeStyle = '#FF8000';
        ctx.lineWidth = this.gridBorderWidth;
        ctx.beginPath();

        const { x: xStart, y: yStart, cellWidth } = this.gridParams;
        const lineStep = cellWidth * (0.5 + index);

        switch (type) {
            case 'hor':
                ctx.moveTo(xStart, yStart + lineStep);
                ctx.lineTo(xStart + this.gridWidth, yStart + lineStep);
                break;

            case 'vert':
                ctx.moveTo(xStart + lineStep, yStart);
                ctx.lineTo(xStart + lineStep, yStart + this.gridWidth);
                break;

            default:
                ctx.moveTo(xStart + this.gridWidth * index, yStart);
                ctx.lineTo(xStart + this.gridWidth * (1 - index), yStart + this.gridWidth);
                break;
        }

        ctx.stroke();
        ctx.closePath();
    }

    get gridParams() {
        return {
            x: (cc.settings.canvasWidth - this.gridWidth) / 2,
            y: (cc.settings.canvasHeight - this.gridWidth) / 2,
            cellWidth: this.gridWidth / this.gridSize
        }
    }

    createGrid() {
        const { x: xStart, y: yStart, cellWidth } = this.gridParams;

        ctx.strokeStyle = this.gridColor;
        ctx.lineWidth = this.gridBorderWidth;

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < this.gridSize + 1; j++) {
                ctx.beginPath();
                ctx.moveTo(
                    xStart + j * cellWidth * i,
                    yStart + j * cellWidth * (1 - i)
                );
                ctx.lineTo(
                    xStart + j * cellWidth * i + this.gridWidth * (1 - i),
                    yStart + j * cellWidth * (1 - i) + this.gridWidth * i
                );
                ctx.stroke();
                ctx.closePath();
            }
        }
    }

    drawCircle(x, y, cell = 0) {
        const { x: xStart, y: yStart, cellWidth } = this.gridParams;

        ctx.strokeStyle = this.colors[cell];
        ctx.lineWidth = this.symbolBorderWidth;

        ctx.beginPath();
        ctx.arc(
            xStart + (x + 0.5) * cellWidth,
            yStart + (y + 0.5) * cellWidth,
            cellWidth * (1 - this.symbolPadding) / 2,
            0, 2 * Math.PI
        );
        ctx.stroke();
        ctx.closePath();
    }

    drawCross(x, y, cell = 1) {
        const { x: xStart, y: yStart, cellWidth } = this.gridParams;
        const lineWidthMultiplier = 1.5;

        ctx.strokeStyle = this.colors[cell];
        ctx.lineWidth = this.symbolBorderWidth;

        ctx.beginPath();

        const line = {
            x: xStart + (x + this.symbolPadding * lineWidthMultiplier / 2) * cellWidth,
            y: yStart + (y + this.symbolPadding * lineWidthMultiplier / 2) * cellWidth
        }
        const lineStep = cellWidth * (1 - this.symbolPadding * lineWidthMultiplier);

        ctx.moveTo(line.x, line.y);

        line.x += lineStep;
        line.y += lineStep;

        ctx.lineTo(line.x, line.y);
        ctx.stroke();

        line.y -= lineStep;

        ctx.moveTo(line.x, line.y);

        line.x -= lineStep;
        line.y += lineStep;

        ctx.lineTo(line.x, line.y);
        ctx.stroke();

        ctx.closePath();
    }

}