import eventDispatcher from '../../common/Event'
import Storage from './StorageIssue'
import RedmineProject from './RedmineProject'
class RedmineIssue {
  
  protected name: string = ''
  protected updated: Date = new Date()
  protected id: number = 0
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
        return false
      }
      this.name = parent.getName()
    }
    this.name += ' > #'
    this.name += this.id.toString()
    this.name += ' '
    this.name += name
    return true
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
    eventDispatcher.emit('RedmineIssueSaved', this.id)
    return true
  }

  public load(id: number): boolean {
    this.id = id
    if (Storage.has('t-' + id)) {
      let issue = Storage.get('t-' + id)
      this.name = issue.name
      this.parent_id = issue.parent_id
      this.updated = new Date(issue.updated)
      return true
    }
    return false
  }
  public delete() {
    if (Storage.has(this.id)) {
      Storage.delete(this.id)
    }
    eventDispatcher.emit('RedmineIssueDeleted', this.id)
  }
  public getId() {
    return this.id
  }
  public getUpdated(): Date {
    return this.updated
  }
}

export default RedmineIssue