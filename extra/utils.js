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
        options: []
    }

    try {
        projectData = project;
    } catch {
        console.error('%cNo project data!', 'font-size:15px; padding:10px');
    }

    document.getElementById('title').textContent = document.title = projectData.name;

    const menu = document.getElementById('menu');

    for (let key in projectData) {
        if (key === 'name' || key === 'onload') continue;
        const button = document.createElement('button');

        button.textContent = key;
        button.onclick = projectData[key];

        menu.appendChild(document.createElement('li').appendChild(button))
    }

    projectData?.onload();
}

function ticker(_cb, context, currentTime = 0, lastTime = 0) {
    if (context.fps === undefined) return console.error('NO FPS PROPERTY IN CONTEXT', context);

    if (currentTime - lastTime > 1000 / context.fps) {
        _cb.call(context);
        lastTime = currentTime;
    }
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