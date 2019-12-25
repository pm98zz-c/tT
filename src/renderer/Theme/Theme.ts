import Prefs from '../Preferences/Preferences'
//@see https://github.com/electron-userland/electron-webpack/issues/172
declare const __static: string
const ipc = require('electron').ipcRenderer
class Theme{
  public init(){
    this.apply()
    ipc.on('preferencesChanged', (event: Event, key: string) =>{
      if(key === 'theme'){
        this.apply()
      }
    })
  }
  private apply(){
    this.ensureCss('common', 'common')
    let theme = Prefs.get('theme') ? Prefs.get('theme') : 'themeLight'
    this.ensureCss('theme', theme)
  }

  private ensureCss(id: string, fileName: string){
    let style = document.getElementById('css-' + id)
    let append = false
    if(style === null){
      style = document.createElement('link')
      append = true
    }
    style.setAttribute('id', 'css-' + id)
    style.setAttribute('type', 'text/css')
    style.setAttribute('rel', 'stylesheet')
    style.setAttribute('href', 'file://' + __static + '/'+ fileName +'.css')
    if(append){
      document.head.appendChild(style)
    }
  }
}

export default Theme