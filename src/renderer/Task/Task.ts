import eventDispatcher from '../../common/Event'
import Storage from './Storage'
const uuid = require('uuid/v1')
class Task {

  protected name: string = ''
  protected updated: Date = new Date()
  protected id: string = uuid()
  public constructor(name: string) {
    if (name.length > 0) {
      this.loadByName(name)
      this.name = name
    }
  }

  public setName(name: string) {
    this.name = name
  }
  public getName(): string {
    return this.name
  }

  public save() {
    //@todo this should not happen.
    if(this.name.length < 0){
      this.delete()
      return
    } 
    this.updated = new Date()
    Storage.set(this.id, this)
    eventDispatcher.emit('taskSaved', this.id)
  }

  public load(id: string): boolean {
    this.id = id
    if (Storage.has(id)) {
      let task = Storage.get(id)
      this.name = task.name
      this.updated = new Date(task.updated)
      return true
    }
    return false
  }
  public loadByName(name: string): boolean {
    let store: any = Object.values(Storage.store)
    for(let i= 0; i < store.length; i++){
      if (name === store[i].name) {
        return this.load(store[i].id)
      }
    }
    return false
  }
  public delete() {
    if (Storage.has(this.id)) {
      Storage.delete(this.id)
    }
    eventDispatcher.emit('taskDeleted', this.id)
  }
  public getId() {
    return this.id
  }
  public getUpdated(): Date {
    return this.updated
  }
}

export default Task