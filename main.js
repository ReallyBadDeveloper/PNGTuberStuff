const electron = require('electron')
const microphone = require('node-microphone')
const path = require('path');

const createWindow = (url='/index.html') => {
    const win = new electron.BrowserWindow({
        width: 200,
        height: 400,
        transparent: true,
        resizable: false,
        titleBarStyle: 'hidden',
    })
    win.loadFile(path.join(__dirname, url))
    win.show()
}

electron.app.whenReady().then(() => {
    createWindow()
})