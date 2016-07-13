const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const shortcut = require('electron-localshortcut');  

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  // {width: 500, height: 245, frame: false}
  mainWindow = new BrowserWindow({width: 500, height: 245, frame: false})

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/app.html`)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  // global shortcut events 
  shortcut.register(mainWindow, 'Ctrl+D', () => {
    mainWindow.webContents.send('global-shortcut', 'jump');
  });

  shortcut.register(mainWindow, 'Ctrl+N', () => {
    mainWindow.webContents.send('global-shortcut', 'next');
  });

  shortcut.register(mainWindow, 'Ctrl+L', () => {
    mainWindow.webContents.send('global-shortcut', 'login');
  });

  shortcut.register(mainWindow, 'Ctrl+U', () => {
    mainWindow.webContents.send('global-shortcut', 'heart');
  });  

  shortcut.register(mainWindow, 'Ctrl+S', () => {
    mainWindow.webContents.send('global-shortcut', 'lrc');
  });  

  shortcut.register(mainWindow, 'Ctrl+Q', () => {
    mainWindow.webContents.send('global-shortcut', 'quit');
  });  

  shortcut.register(mainWindow, 'Ctrl+Shift+M', () => {
    mainWindow.webContents.send('global-shortcut', 'menu');
  });  

  shortcut.register(mainWindow, 'Space', () => {
    mainWindow.webContents.send('global-shortcut', 'play');
  });  
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
