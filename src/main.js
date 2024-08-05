const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const settingsFile = 'settings.json';

// Set up storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const createWindow = (url = '/index.html') => {
  const win = new BrowserWindow({
    width: 200,
    height: 400,
    transparent: true,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, url));
  win.show();
};

const readSettings = () => {
  if (!fs.existsSync(settingsFile)) {
    fs.writeFileSync(settingsFile, JSON.stringify({ presets: [] }));
  }
  return JSON.parse(fs.readFileSync(settingsFile));
};

const saveSettings = (settings) => {
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
};

app.whenReady().then(() => {
  createWindow();

  const server = express();
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));

  server.use(express.static('public'));

  server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
  });

  server.post('/upload', upload.single('image'), (req, res) => {
    // Handle file upload
    res.send('File uploaded!');
  });

  server.post('/config', (req, res) => {
    const settings = readSettings();
    const config = req.body;
    settings.presets.push(config);
    saveSettings(settings);
    res.send('Configuration saved!');
    BrowserWindow.getAllWindows()[0].webContents.send('update-config', config);
  });

  server.get('/presets', (req, res) => {
    const settings = readSettings();
    res.json(settings.presets);
  });

  server.listen(3000, () => {
    console.log('Dashboard server is running on http://localhost:3000');
  });
});

ipcMain.on('get-config', (event) => {
  const settings = readSettings();
  event.sender.send('update-config', settings.presets[0] || {});
});
