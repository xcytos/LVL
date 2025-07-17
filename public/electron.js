const { app, BrowserWindow, screen } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const os = require('os');

// Set app user data path to avoid permission issues
const userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'LVL-Widget');
app.setPath('userData', userDataPath);

let mainWindow;

function createWindow() {
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  // Create the browser window (widget-like)
  mainWindow = new BrowserWindow({
    width: 350,
    height: 500,
    x: width - 370, // Position on right side of screen
    y: 20,
    frame: false, // Remove window frame for widget look
    alwaysOnTop: true, // Keep always on top
    resizable: false,
    transparent: true, // Allow transparency
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    skipTaskbar: true, // Don't show in taskbar
    show: false, // Don't show until ready
  });

  // Load the app
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // DevTools disabled for cleaner widget experience
  // if (isDev) {
  //   mainWindow.webContents.openDevTools();
  // }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
