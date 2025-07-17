const { app, BrowserWindow, screen, Tray, Menu, nativeImage } = require('electron');
// Force production mode
process.env.NODE_ENV = 'production';
const isDev = false; // Force production mode
const path = require('path');
const os = require('os');

// Set app user data path to avoid permission issues
const userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'LVL-Widget');
app.setPath('userData', userDataPath);

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('Another instance is already running. Exiting...');
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      mainWindow.show();
    }
  });
}

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
    alwaysOnTop: false, // Start on desktop level, not always on top
    resizable: false, // Fixed size widget
    transparent: true, // Allow transparency
    backgroundColor: 'rgba(0,0,0,0)', // Fully transparent background
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      backgroundThrottling: false,
    },
    skipTaskbar: true, // Don't show in taskbar
    show: false, // Will show after ready
    minimizable: false,
    maximizable: false,
    hasShadow: false, // No shadow for cleaner look
    icon: path.join(__dirname, 'favicon.ico'), // Set window icon
  });

  // Load the app
  const loadURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'index.html')}`;
  
  console.log('Loading URL:', loadURL);
  mainWindow.loadURL(loadURL);
  
  // Add error handling
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });
  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Content loaded successfully');
  });

  // Window ready - show on desktop by default
  mainWindow.once('ready-to-show', () => {
    console.log('LVL Widget ready - showing on desktop');
    mainWindow.show(); // Show on desktop by default
    
    // Add drag functionality and transparent background
    mainWindow.webContents.executeJavaScript(`
      document.addEventListener('DOMContentLoaded', function() {
        // Make body and root completely transparent
        document.body.style.backgroundColor = 'transparent';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        
        const root = document.getElementById('root');
        if (root) {
          root.style.backgroundColor = 'transparent';
          root.style.margin = '0';
          root.style.padding = '0';
          root.style.minHeight = 'auto';
        }
        
        // Find and setup the widget
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

function createTray() {
  // Try to create tray with favicon.ico, fallback to icon.ico
  let trayIconPath = path.join(__dirname, 'favicon.ico');
  
  try {
    // Check if favicon.ico exists and is valid
    if (require('fs').existsSync(trayIconPath)) {
      tray = new Tray(trayIconPath);
    } else {
      // Fallback to icon.ico
      trayIconPath = path.join(__dirname, 'icon.ico');
      if (require('fs').existsSync(trayIconPath)) {
        tray = new Tray(trayIconPath);
      } else {
        // Use default Electron icon
        tray = new Tray(nativeImage.createEmpty());
      }
    }
  } catch (error) {
    console.error('Error creating tray icon:', error);
    tray = new Tray(nativeImage.createEmpty());
  }

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
      label: 'Toggle Overlay Mode', 
      click: () => {
        if (mainWindow) {
          const isOnTop = mainWindow.isAlwaysOnTop();
          mainWindow.setAlwaysOnTop(!isOnTop);
          if (!isOnTop) {
            mainWindow.focus();
          }
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
  
  tray.setToolTip('LVL Widget by syedmuzamil - Click to toggle overlay mode');
  tray.setContextMenu(contextMenu);

  // Single click to toggle overlay mode (always on top)
  tray.on('click', () => {
    if (mainWindow) {
      const isOnTop = mainWindow.isAlwaysOnTop();
      mainWindow.setAlwaysOnTop(!isOnTop);
      if (!isOnTop) {
        mainWindow.focus();
      }
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  
  mainWindow.on('close', (e) => {
    if (!isQuiting) {
      e.preventDefault();
      // Don't hide - just set to desktop level
      mainWindow.setAlwaysOnTop(false);
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

// Handle SIGINT and other signals - don't quit, just log
process.on('SIGINT', () => {
  console.log('Received SIGINT, but continuing to run in system tray...');
  // Don't quit - keep running in system tray
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, but continuing to run in system tray...');
  // Don't quit - keep running in system tray
});

// Handle uncaught exceptions - log but don't quit
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't quit - keep running in system tray
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't quit - keep running in system tray
});

// Prevent multiple instances
app.on('before-quit', () => {
  isQuiting = true;
});
