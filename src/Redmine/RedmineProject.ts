import eventDispatcher from '../Event'
import Storage from './Storage'
class RedmineProject {

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
      this.name += ' > '
    }
    this.name += name
  }
  public getName(): string {
    return this.name
  }

  public save() {
    if (this.name === '') {
      return false
    }
    Storage.set('p-' + this.id, this)
    eventDispatcher.broadcast('redmineProjectSaved', this.id)
    return true
  }

  public load(id: number): boolean {
    this.id = id
    if (Storage.has('p-' + id)) {
      let project = Storage.get('p-' + id)
      this.name = project.name
      this.parent_id = project.parent_id
      return true
    }
    return false
  }
}

export default RedmineProject