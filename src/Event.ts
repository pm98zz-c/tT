import EventEmitter = require('events')
class Event extends EventEmitter {
  protected isRenderer = require('is-electron-renderer')
  protected ipc
  protected remote
  public constructor() {
    super()
    this.ipc = this.isRenderer ? require('electron').ipcRenderer : require('electron').ipcMain
    this.on('newListener', (eventName, listener)=>{
      this.ipc.on(eventName, listener)
    })
    this.remote = this.isRenderer ? require('electron').remote : null
  }

  public broadcast(eventName: string, ...args: any){
    this.emit(eventName, ...args)
    if(!this.isRenderer){
      let window = require('electron').BrowserWindow;
      window.getAllWindows()[0].webContents.send(eventName, ...args)
    } else {
      this.ipc.send(eventName, ...args)
    }
  }
}

const eventDispatcher = new Event()
export default eventDispatcher