const project = {
    name: 'Template',
    onload: init,
    "Test button": () => { console.log('do something') },
}

function init() {
    window.main = new Main();
}

class Main {
    canvas = window.canvas;
    ctx = window.ctx;

    constructor() {
        console.log('Hello World')
    }
}