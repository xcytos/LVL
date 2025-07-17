const { app, BrowserWindow, screen, Tray, Menu, nativeImage } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const os = require('os');

// Set app user data path to avoid permission issues
const userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'LVL-Widget');
app.setPath('userData', userDataPath);

let mainWindow;
let tray = null;
let isQuiting = false;

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
    frame: false, // No window frame - pure widget
    alwaysOnTop: true, // Keep always on top
    resizable: false, // Fixed size widget
    transparent: true, // Allow transparency
    backgroundColor: 'rgba(0,0,0,0)', // Transparent background
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      backgroundThrottling: false,
    },
    skipTaskbar: true, // Don't show in taskbar
    show: false, // Hidden by default - only show via tray
    minimizable: false,
    maximizable: false,
    hasShadow: false, // No shadow for cleaner look
  });

  // Load the app
  const loadURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  console.log('Loading URL:', loadURL);
  mainWindow.loadURL(loadURL);
  
  // Add error handling
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });
  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Content loaded successfully');
  });

  // Show window when ready for debugging
  mainWindow.once('ready-to-show', () => {
    console.log('LVL Widget ready - showing for debugging');
    mainWindow.show(); // Force show for debugging
    mainWindow.focus();
    
    // Add drag functionality
    mainWindow.webContents.executeJavaScript(`
      document.addEventListener('DOMContentLoaded', function() {
        const widget = document.querySelector('.w-full.max-w-md.mx-auto') || document.body;
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        widget.style.cursor = 'move';
        widget.style.userSelect = 'none';
        widget.style.webkitAppRegion = 'drag';
        
        // Make buttons and interactive elements non-draggable
        const buttons = widget.querySelectorAll('button, input, select, textarea');
        buttons.forEach(button => {
          button.style.webkitAppRegion = 'no-drag';
        });
      });
    `);
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Add system tray icon
  tray = new Tray(path.join(__dirname, 'icon.ico'));
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Show Widget', 
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { 
      label: 'Hide Widget', 
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => {
        isQuiting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip('LVL Widget - Click to toggle');
  tray.setContextMenu(contextMenu);

  // Single click to toggle visibility
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
  
  mainWindow.on('close', (e) => {
    if (!isQuiting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
});

app.on('window-all-closed', () => {
  // Don't quit when window is closed - keep running in system tray
  if (process.platform !== 'darwin') {
    // Only quit if explicitly requested from tray
    if (isQuiting) {
      app.quit();
    }
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle SIGINT and other signals properly
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  app.quit();
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  app.quit();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  app.quit();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

