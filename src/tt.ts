import MainMenu from './MainMenu'
import Storage from './Storage'
import eventDispatcher from './Event'
const BrowserWindow = require('electron').BrowserWindow
const shell = require('electron').shell


class tT {
  // Can't properly type, electron known issue.
  protected mainWindow: any
  // protected mainWindow: BrowserWindow
  protected app = require('electron').app
  public constructor() {
    this.appInit()
  }
  protected appInit() {
    this.app.on('ready', () => {
      this.windowInit()
      MainMenu.init()
    }
    )
    this.app.on('window-all-closed', () => {
      this.quit()
    })
    this.app.on('activate', () => {
      this.activate()
    })
  }
  protected quit() {
    if (process.platform !== 'darwin') {
      this.app.quit()
    }
  }
  protected activate() {
    this.app.requestSingleInstanceLock()
    this.app.on('second-instance', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) this.mainWindow.restore()
        this.mainWindow.focus()
      }
    })
    if (this.mainWindow === null) {
      this.windowInit()
    }
  }
  protected windowInit() {
    let { x, y, width, height } = Storage.get('windowBounds', { x: 0, y: 0, width: 800, height: 600 });
    this.mainWindow = new BrowserWindow({ "x": x, "y": y, "width": width, "height": height, backgroundColor: '#eee' })
    this.mainWindow.loadFile('src/index.html')
    this.windowEvents()
    eventDispatcher.on('preferencesChanged', () =>{
      this.mainWindow.reload()
    })
  }
  protected windowEvents() {
    this.mainWindow.on('resize', () => {
      let { x, y, width, height } = this.mainWindow.getBounds();
      Storage.set('windowBounds', { x, y, width, height });
    })
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
    this.mainWindow.webContents.on('will-navigate', (event: Event, url: string) => {
      event.preventDefault()
      shell.openExternal(url)
    });

  }
}
new tT()
