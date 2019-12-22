import PreferencesWindow from './Preferences/PreferencesWindow'
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
      this.getWindowMenuTemplate(),
      this.getHelpMenuTemplate()
    ]
    if (process.platform === 'darwin') {
      template.unshift({ label: 'tT', role: 'appMenu' })
    }
    return template
  }
  protected getWindowMenuTemplate() {
    return {
      label: '&Window',
      role: 'windowMenu'
    }
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
            let prefs = new PreferencesWindow()
            prefs.trigger()
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