import eventDispatcher from '../Event'
import TaskStorage from '../Task/Storage'
import Entry from '../Entry/Entry'
import Task from '../Task/Task'
import Storage from './Storage'
class TasksListBuilder {
  protected deferred: NodeJS.Timeout
  public constructor() {
    eventDispatcher.addListener('appLaunched', () => {
      this.buildList()
      this.attachEvents()
      setTimeout(this.cleanUpTasks.bind(this), 100000)
    })
  }
  protected async cleanUpTasks() {
    // We'll delete entries older than a month.
    let before = new Date()
    before.setMonth(before.getMonth() - 1)
    Object.keys(TaskStorage.store).forEach(uuid => {
      let task = new Task('')
      // Delete old entries.
      task.load(uuid)
      if (task.getUpdated() < before) {
        task.delete()
      }
    })
  }
  protected attachEvents() {
    eventDispatcher.on('entrySaved', (event:Event, id: string) => {
      let entry = new Entry()
      entry.load(id)
      let task = new Task('')
      if (!task.loadByName(entry.getTask())) {
        task.setName(entry.getTask())
        task.save()
      }
    })
    // Defer the rebuild to avoid UI freeze.
    eventDispatcher.addListener('taskSaved', () => {
      clearTimeout(this.deferred)
      this.deferred = setTimeout(this.buildList.bind(this), 1000 * 10)
    })
  }
  protected buildList(): void {
    let list: Array<string> = []
    Object.values(TaskStorage.store).forEach(task => {
      list.push(task.name)
    })
    list.sort((a, b) => a.localeCompare(b))
    Storage.store = {
      tasks: list
    }
    eventDispatcher.broadcast('taskListRebuilt')
  }

}

export default TasksListBuilder