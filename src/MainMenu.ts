const BrowserWindow = require('electron').BrowserWindow
import eventDispatcher from './Event'
class MenuBuilder {
  protected shell = require('electron').shell
  protected Menu = require('electron').Menu
  public init() {
    this.Menu.setApplicationMenu(this.getMenu())
  }
  protected getMenu() {
    return this.Menu.buildFromTemplate(this.getMenuTemplate())
  }
  protected getMenuTemplate() {
    let template = [
      this.getFileMenuTemplate(),
      this.getEditMenuTemplate(),
      this.getViewMenuTemplate(),
      { role: 'windowMenu' },
      this.getHelpMenuTemplate()
    ]
    if (process.platform === 'darwin') {
      template.unshift({ role: 'appMenu' })
    }
    return template
  }
  protected getFileMenuTemplate() {
    return {
      label: '&File',
      role: 'fileMenu',
      submenu: [
        {
          label: '&Quit',
          role: 'quit',
          accelerator: 'CommandOrControl+Q'
        }
      ]
    }
  }
  protected getEditMenuTemplate() {
    return {
      label: '&Edit',
      submenu: [
        {
          label: '&Preferences',
          accelerator: 'CommandOrControl+P',
          click: () => {
            let prefsWindow = new BrowserWindow({ width: 800, height: 500, titleBarStyle: 'hidden', backgroundColor: '#eee' })
            prefsWindow.setMenuBarVisibility(false)
            prefsWindow.loadFile('src/Preferences/preferences.html')
            prefsWindow.show()
            prefsWindow.on('closed', () => {
              eventDispatcher.broadcast('preferencesChanged')
            })
          }
        }
      ]
    }
  }
  
  protected getViewMenuTemplate() {
    return {
      label: '&View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  }
  
  protected getHelpMenuTemplate() {
    return {
      label: '&Help',
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/pm98zz-c/tT/blob/master/README.md')
          }
        }
      ]
    }
  }
}
const MainMenu = new MenuBuilder()
export default MainMenu