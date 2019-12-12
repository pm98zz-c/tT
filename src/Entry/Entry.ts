import eventDispatcher from '../Event'
import Storage from './Storage'
import Utils from '../Utils'
const uuid = require('uuid/v1')

class Entry {

  protected task: string = ''
  protected start: Date = new Date()
  protected end: Date = new Date()
  protected id: string = uuid()
  protected description: string = ''
  public getStart(): Date {
    return this.start
  }
  public setStart(start: Date) {
    this.start = start
  }

  public getEnd(): Date {
    return this.end
  }

  public setEnd(end: Date) {
    this.end = end
  }

  public setTask(task: string) {
    this.task = Utils.trim(task)
  }
  public getTask():string {
    return this.task
  }
  public setDescription(description: string) {
    this.description = Utils.trim(description)
  }
  public getDescription():string {
    return this.description
  }
  public save() {
    if(this.task === ''){
      return this.delete()
    }
    if(this.start >= this.end){
      return this.delete()
    }
    Storage.set(this.id, this)
    eventDispatcher.broadcast('entrySaved', this.id)
  }
  public delete(){
    if(Storage.has(this.id)){
      Storage.delete(this.id)
    }
    eventDispatcher.broadcast('entryDeleted', this.id)
  }
  public load(id: string) {
    this.id = id
    let entry = Storage.get(id)
    this.task = entry.task
    this.start = new Date(entry.start)
    this.end = new Date(entry.end)
    this.description = entry.description
  }
  public getId(){
    return this.id
  }
}

export default Entry