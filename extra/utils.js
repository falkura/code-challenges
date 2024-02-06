window.cc = {};

cc.settings = {
    canvasWidth: 1200,
    canvasHeight: 900,
}

function initPage() {
    window.canvas = cc.canvas = document.getElementById('canvas');
    window.ctx = cc.ctx = cc.canvas.getContext('2d');

    let projectData = {
        name: 'Unnamed',
        info: undefined,
        buttons: {}
    }

    try {
        projectData = project;
    } catch {
        console.error('%cNo project data!', 'font-size:15px; padding:10px');
    }

    document.getElementById('title').textContent = document.title = projectData.name;

    const tint = document.getElementById('tint');
    const infoButton = document.getElementsByClassName('showinfo')[0];

    const changeTintVisibility = (show = true) => {
        tint.style.visibility = show ? 'visible' : 'hidden';
    }

    if (projectData.info) {
        const infoTitle = document.createElement('h1');
        const infoText = document.createElement('h2');
        const hideText = document.createElement('h2');

        infoTitle.textContent = projectData.name;
        infoText.textContent = projectData.info;

        hideText.textContent = 'Click anywhere to continue';

        tint.appendChild(infoTitle);
        tint.appendChild(infoText);
        tint.appendChild(hideText);

        tint.addEventListener('pointerdown', () => { changeTintVisibility(false) });
        infoButton.addEventListener('pointerdown', () => { changeTintVisibility(true) });
    } else {
        changeTintVisibility(false);
        infoButton.style.visibility = 'hidden';
    }

    const menu = document.getElementById('menu');

    for (let key in projectData.buttons) {
        const button = document.createElement('button');

        button.textContent = key;
        button.onclick = projectData.buttons[key];

        menu.appendChild(document.createElement('li').appendChild(button))
    }

    projectData?.onload();
}

function ticker(_cb, context, currentTime = 0, lastTime = 0) {
    // if (context.fps === undefined) return console.error('NO FPS PROPERTY IN CONTEXT', context);

    // if (currentTime - lastTime > 1000 / context.fps) {
    _cb.call(context);
    // lastTime = currentTime;
    // }
    requestAnimationFrame(t => ticker(_cb, context, t, lastTime));
}

function getCanvasRelativePos(mouseX, mouseY) {
    if (!canvas) return;

    const { width, height, x, y } = canvas.getBoundingClientRect();

    return {
        x: (cc.settings.canvasWidth / width) * (mouseX - x),
        y: (cc.settings.canvasHeight / height) * (mouseY - y)
    }
}

function getGridCell(e, gridX, gridY, cellSize, gridSizeX, gridSizeY, canCrossBorder = false) {
    const relativePos = getCanvasRelativePos(e.clientX, e.clientY);
    const x = Math.floor((relativePos.x - gridX) / cellSize);
    const y = Math.floor((relativePos.y - gridY) / cellSize);

    if (!canCrossBorder) {
        if (x < 0 || y < 0 || x > gridSizeX - 1 || y > gridSizeY - 1) return undefined;
    }

    return { x, y };
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}