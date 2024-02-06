const project = {
    name: 'Falling Sand',
    onload: init,
    info: "Falling sand simulator. Click and drag.",
    buttons: {
        "Reset": () => { main.reset() },
    }
}

function init() {
    window.main = new Main();
}

class Main {
    fps = 60;

    settings = {
        cellSize: 5,
        showGrid: false
    }

    cells;

    mousePos = { x: 0, y: 0 };

    STATES = {
        EMPTY: 0,
        TOFILL: 1,
        TOCLEAR: 2,
        FILLED: 3,
        ACTIVE: 4
    }

    _randomArray = [];
    _randomIndex = 0;
    _cellsCount;
    _isClick = false;
    _colorMin = 100;
    _colorMax = 220;

    color = { r: this._colorMax, g: this._colorMin, b: this._colorMin };

    constructor() {
        this.init();
        ticker(this.mainLoop, this);
        this.addListener();
    }

    addListener() {
        const handleClick = (e) => {
            const relativePos = getCanvasRelativePos(e.clientX, e.clientY);

            let x = Math.floor(relativePos.x / this.settings.cellSize);
            let y = Math.floor(relativePos.y / this.settings.cellSize);

            x = x < 0 ? 0 : x < this.cellsCount.x ? x : this.cellsCount.x - 1;
            y = y < 0 ? 0 : y < this.cellsCount.y ? y : this.cellsCount.y - 1;

            this.mousePos = { x, y };
        };

        canvas.addEventListener('pointerdown', e => {
            this._isClick = true
            handleClick(e);
        });

        canvas.addEventListener('pointerup', () => this._isClick = false);
        canvas.addEventListener('pointerout', () => this._isClick = false);

        canvas.addEventListener('pointermove', e => {
            handleClick(e);
        });

        // document.addEventListener('keydown', ({ code }) => code === 'Space' && this.mainLoop());

        setInterval(this.clickUpdate.bind(this), 10);
    }

    init() {
        this.cells = new Array(this.cellsCount.x).fill(0).map(_ => new Array(this.cellsCount.y).fill(this.STATES.EMPTY));

        for (let i = 1e6; i--;) {
            this._randomArray.push(Math.random() > 0.5);
        }
    }

    callCellsCb(cb) {
        for (let y = this.cells[0].length - 1; y >= 0; y--) {
            for (let x = this.cells.length - 1; x >= 0; x--) {
                cb(x, y);
            }
        }
    }

    clickUpdate() {
        if (this._isClick) {
            const matrix = 5;
            const extent = Math.floor(matrix / 2);

            for (let i = -extent; i <= extent; i++) {
                for (let j = -extent; j <= extent; j++) {
                    if (this.randomBoolen && this.randomBoolen && this.randomBoolen) {
                        if (
                            this.cells[this.mousePos.x + i]?.[this.mousePos.y + j - 1] !== undefined
                        ) {
                            this.cells[this.mousePos.x + i][this.mousePos.y + j] = this.STATES.ACTIVE;
                        }
                    }
                }
            }
        }
    }

    reset() {
        const clearCb = (x, y) => {
            this.cells[x][y] = this.STATES.TOCLEAR;
        }

        this.callCellsCb(clearCb)
    }

    mainLoop() {
        const moveCb = (x, y) => {
            if (this.cells[x][y] === this.STATES.ACTIVE) {
                this.moveCell(x, y);
            }
        }

        this.callCellsCb(moveCb)

        this.updateColor();
        this.draw();

        const updateCellsCb = (x, y) => {
            if (this.cells[x][y] === this.STATES.FILLED) {
                this.cells[x][y] = this.STATES.ACTIVE;
            }
        }

        this.callCellsCb(updateCellsCb)
    }

    draw() {
        ctx.fillStyle = `rgb(${this.color.r} ${this.color.g} ${this.color.b})`;

        const drawCellsCb = (x, y) => {
            if (this.cells[x][y] === this.STATES.TOFILL) {
                ctx.fillRect(
                    x * this.settings.cellSize,
                    y * this.settings.cellSize,
                    this.settings.cellSize,
                    this.settings.cellSize
                );

                this.cells[x][y] = this.STATES.FILLED;

            } else if (this.cells[x][y] === this.STATES.TOCLEAR) {
                ctx.clearRect(
                    x * this.settings.cellSize,
                    y * this.settings.cellSize,
                    this.settings.cellSize,
                    this.settings.cellSize
                );

                this.cells[x][y] = this.STATES.EMPTY;
            }
        }

        this.callCellsCb(drawCellsCb)

        if (this.settings.showGrid) {
            this.drawGrid();
        }
    }

    moveCell(x, y) {
        if (y === this.cellsCount.y - 1) return;

        let targetX = x;

        if (this.cells[x][y + 1] === this.STATES.ACTIVE) {
            const limit = this.cellsCount.x - 1

            const lx = x - 1 < 0 ? limit : x - 1;
            const rx = x + 1 > limit ? 0 : x + 1;

            const canL = this.cells[lx][y + 1] === this.STATES.EMPTY || this.cells[lx][y + 1] === this.STATES.TOCLEAR;
            const canR = this.cells[rx][y + 1] === this.STATES.EMPTY || this.cells[rx][y + 1] === this.STATES.TOCLEAR;

            if (!canL && !canR) return;

            if (!canR) {
                targetX = lx;
            } else if (!canL) {
                targetX = rx;
            } else {
                targetX = this.randomBoolen ? lx : rx;
            }
        }

        this.cells[x][y] = this.STATES.TOCLEAR;
        this.cells[targetX][y + 1] = this.STATES.TOFILL;
    }

    updateColor() {
        if (this.color.b === this._colorMin && this.color.r !== this._colorMin) {
            this.color.r--;
            this.color.g++;
        } else if (this.color.r === this._colorMin && this.color.g !== this._colorMin) {
            this.color.g--;
            this.color.b++;
        } else if (this.color.g === this._colorMin && this.color.b !== this._colorMin) {
            this.color.b--;
            this.color.r++;
        }
    }

    drawGrid() {
        for (let i = 0; i <= cc.settings.canvasWidth; i += this.settings.cellSize) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, cc.settings.canvasHeight);
        }

        for (let i = 0; i <= cc.settings.canvasHeight; i += this.settings.cellSize) {
            ctx.moveTo(0, i);
            ctx.lineTo(cc.settings.canvasWidth, i);
        }

        ctx.strokeStyle = "black";
        ctx.lineWidth = cc.settings.cellSize / 10;

        ctx.stroke();
    }

    get randomBoolen() {
        return ++this._randomIndex >= this._randomArray.length ?
            this._randomArray[this._randomIndex = 0] :
            this._randomArray[this._randomIndex];
    }

    get cellsCount() {
        return this._cellsCount || (this._cellsCount = {
            x: cc.settings.canvasWidth / this.settings.cellSize,
            y: cc.settings.canvasHeight / this.settings.cellSize
        });
    }

}
