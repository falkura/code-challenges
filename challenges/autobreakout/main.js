const project = {
    name: 'Auto Breakout',
    onload: init,
    "Restart": () => { window.main.restart() },
}

function init() {
    window.main = new Main();
}

class Main {
    fps = 60
    cellSize = 60;
    ballSize = 30;
    cells = [];
    _cellsCount;
    colors = ['#DCDCF5', '#F5F5DC'];
    balls = [];

    constructor() {
        this.init();
        ticker(this.mainLoop, this);
    }

    init() {
        for (let i = 0; i < this.cellsCount.x; i++) {
            this.cells[i] = [];
            for (let j = 0; j < this.cellsCount.y; j++) {
                this.cells[i][j] = new Cell(i, j, this.cellSize, this.colors);
            }
        }

        for (let i = 0; i < this.colors.length; i++) {
            const ball = new Ball(this.ballSize, this.colors, i);
            this.balls.push(ball);
        }

        this.restart();
    }

    restart() {
        this.cells.forEach((row, index) => {
            if (index < this.cells.length / 2) {
                row.forEach(cell => {
                    cell.state = 1;
                })
            } else {
                row.forEach(cell => {
                    cell.state = 0;
                })
            }
        })

        this.balls[1].x = 1100
        this.balls[1].y = 100

        this.balls[0].x = 42
        this.balls[0].y = 40
    }

    mainLoop() {
        ctx.clearRect(0, 0, cc.settings.canvasWidth, cc.settings.canvasHeight);
        this.updateCells();

        this.balls.forEach(b => {
            b.update();
            this.checkCollision(b);
        });

    }

    checkCollision(ball) {
        const { x, y, r } = ball.getBounds();
        const cells = this.getCircleCollisionCells(x, y, r, ball.state);
        const collided = [];

        cells.forEach(cell => {
            const _intersection = this.checkIntersection(
                x, y, r,
                cell.x * this.cellSize,
                cell.y * this.cellSize,
                this.cellSize
            );

            if (_intersection[0]) {
                cell.state = this.colors.length - 1 - cell.state;

                collided.push([cell, _intersection[1]]);
            }
        });

        if (collided.length > 0) {
            const closest = collided.reduce((prev, current) => {
                if (current[1] < prev.distance) {
                    prev.distance = current[1];
                    prev.cell = current[0];
                }

                return prev;
            }, {
                distance: Infinity,
                cell: undefined
            })

            ball.onCollide(closest.cell.center);
        }
    }


    getCircleCollisionCells(x, y, r, state) {
        const left = Math.floor((x - r) / this.cellSize);
        const right = Math.floor((x + r) / this.cellSize); // Math.ceil - 1
        const top = Math.floor((y - r) / this.cellSize);
        const bottom = Math.floor((y + r) / this.cellSize);

        const result = [];

        for (let i = left; i <= right; i++) {
            for (let j = top; j <= bottom; j++) {
                const targetCell = this.cells[i]?.[j];
                if (targetCell?.state === state) {
                    result.push(targetCell);
                }
            }
        }

        return result;
    }

    checkIntersection(cX, cY, cR, rX, rY, rS) {
        const closest = {
            x: clamp(cX, rX, rX + rS),
            y: clamp(cY, rY, rY + rS),
        }

        const distance = {
            x: cX - closest.x,
            y: cY - closest.y,
        }

        const distanceSquared = (distance.x * distance.x) + (distance.y * distance.y);

        return [distanceSquared < (cR * cR), distanceSquared];
    }

    updateCells() {
        this.cells.forEach(row => {
            row.forEach(cell => {
                cell.update();
            })
        })
    }

    get cellsCount() {
        return this._cellsCount || (this._cellsCount = {
            x: cc.settings.canvasWidth / this.cellSize,
            y: cc.settings.canvasHeight / this.cellSize
        });
    }

}

class Ball {
    size;
    colors;
    state;

    velRandIndex = 0.3;
    minVelocity = 0.4;
    maxVelocity = 1;

    x = 100;
    y = 50;

    speed = 10;

    velocity = {
        x: 0,
        y: 0
    }

    constructor(_size, _colors, _state) {
        this.size = _size;
        this.colors = _colors;
        this.state = _state;

        this.setInitialVelocity();
    }

    setInitialVelocity() {
        this.velocity.x = (1 - 2 * Math.random());
        this.velocity.y = (1 - 2 * Math.random());

        this.updateVelocity();
    }

    update() {
        this.move();

        ctx.fillStyle = this.colors[this.state];
        ctx.beginPath();
        const { x, y, r } = this.getBounds();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            r: this.size
        }
    }

    move() {
        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;

        if (this.x - this.size < 0 || this.x + this.size > cc.settings.canvasWidth) {
            this.x = this.x < this.size ? this.size : cc.settings.canvasWidth - this.size

            this.bounce(true);
        }

        if (this.y - this.size < 0 || this.y + this.size > cc.settings.canvasHeight) {
            this.y = this.y < this.size ? this.size : cc.settings.canvasHeight - this.size

            this.bounce(false);
        }
    }

    onCollide({ x, y }) {
        const diff = {
            x: this.x - x,
            y: this.y - y
        };

        this.bounce((diff.x * diff.x) > (diff.y * diff.y))
    }

    bounce(horizontal) {
        if (horizontal) {
            this.velocity.x *= -1;
        } else {
            this.velocity.y *= -1;
        }

        this.updateVelocity();
    }

    updateVelocity() {
        let minVelX = this.minVelocity;
        let maxVelX = this.maxVelocity;
        let minVelY = this.minVelocity;
        let maxVelY = this.maxVelocity;

        if (this.velocity.x < 0) {
            minVelX = -this.maxVelocity;
            maxVelX = -this.minVelocity;
        }

        if (this.velocity.y < 0) {
            minVelY = -this.maxVelocity;
            maxVelY = -this.minVelocity;
        }

        this.velocity.x = clamp(this.velocity.x + (1 - 2 * Math.random()) * this.velRandIndex, minVelX, maxVelX);
        this.velocity.y = clamp(this.velocity.y + (1 - 2 * Math.random()) * this.velRandIndex, minVelY, maxVelY);
    }
}

class Cell {
    x;
    y;
    size;
    colors;
    _state = 0;

    constructor(_x, _y, _size, _colors) {
        this.x = _x;
        this.y = _y;
        this.size = _size;
        this.colors = _colors;
    }

    update() {
        ctx.fillStyle = this.colors[this.state];
        ctx.fillRect(this.x * this.size, this.y * this.size, this.size, this.size);
    }

    _center
    get center() {
        return this._center || (this._center = {
            x: (this.x + 0.5) * this.size,
            y: (this.y + 0.5) * this.size,
        })
    }

    set state(v) {
        this._state = v;
        this.update();
    }

    get state() {
        return this._state;
    }
}