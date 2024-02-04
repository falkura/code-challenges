const project = {
    name: 'Template',
    onload: init,
    "Reset": () => { window.main.reset && window.main.reset() },
}

function init() {
    window.main = new Main();
}

class Main {
    constructor() {
        console.log('Hello World')
    }
}