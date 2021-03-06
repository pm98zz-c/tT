const BrowserWindow = require('electron').BrowserWindow
import Storage from './Storage'
import * as path from 'path'
import { format as formatUrl } from 'url'
const ipc = require('electron').ipcMain
const isDevelopment = process.env.NODE_ENV !== 'production'
class PreferencesWindow {
  public trigger() {
    let { x, y, width, height } = Storage.get('windowBounds', { x: 0, y: 0, width: 800, height: 600 })
    const options = {
      "x": x,
      "y": y,
      "width": width / 2,
      "height": height / 2,
      backgroundColor: '#eee',
      webPreferences:
      {
        nodeIntegration: true,
        webSecurity: !isDevelopment
      }
    }
    let prefsWindow = new BrowserWindow(options)
    if (isDevelopment) {
      prefsWindow.webContents.openDevTools()
    }
    if (isDevelopment) {
      prefsWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    }
    else {
      prefsWindow.loadURL(formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      }))
    }
    prefsWindow.setMenuBarVisibility(false)
    prefsWindow.show()
    // prefsWindow.on('closed', () => {
    //   eventDispatcher.emit('preferencesWindowClosed')
    // })
    ipc.on('preferencesChanged', (event: Event, key: string) => {
      BrowserWindow.getAllWindows().forEach((window: any) => {
        window.webContents.send('preferencesChanged', key)
      })
    })
    prefsWindow.webContents.on('dom-ready', () => {
      prefsWindow.webContents.send('appLaunched', 'preferences')
    })
  }
}
export default PreferencesWindow