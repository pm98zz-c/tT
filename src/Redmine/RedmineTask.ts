import eventDispatcher from '../Event'
import Storage from './Storage'
import RedmineProject from './RedmineProject'
class RedmineTask {
  
  protected name: string = ''
  protected updated: Date = new Date()
  protected id: number
  protected parent_id: number
  public constructor(id: number) {
    this.parent_id = 0
    this.load(id)
  }
  public setParent(id: number) {
    this.parent_id = id
  }
  public setName(name: string) {
    this.name = ''
    if (this.parent_id > 0) {
      let parent = new RedmineProject(this.parent_id)
      if (parent.getName() === '') {
        return
      }
      this.name = parent.getName()
    }
    this.name += ' > #'
    this.name += this.id.toString()
    this.name += ' '
    this.name += name
  }
  public getName(): string {
    return this.name
  }

  public save() {
    if (this.name === '') {
      return false
    }
    this.updated = new Date()
    Storage.set('t-' + this.id, this)
    eventDispatcher.broadcast('redmineTaskSaved', this.id)
    return true
  }

  public load(id: number): boolean {
    this.id = id
    if (Storage.has('t-' + id)) {
      let task = Storage.get('t-' + id)
      this.name = task.name
      this.parent_id = task.parent_id
      this.updated = new Date(task.updated)
      return true
    }
    return false
  }
  public delete() {
    if (Storage.has(this.id)) {
      Storage.delete(this.id)
    }
    eventDispatcher.broadcast('RedmineTaskDeleted', this.id)
  }
  public getId() {
    return this.id
  }
  public getUpdated(): Date {
    return this.updated
  }
}

export default RedmineTask