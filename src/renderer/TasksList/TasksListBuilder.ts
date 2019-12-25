import eventDispatcher from '../../common/Event'
import TaskStorage from '../Task/Storage'
import Entry from '../Entry/Entry'
import Task from '../Task/Task'
import Storage from './Storage'
class TasksListBuilder {
  protected deferred: number
  public constructor() {
    this.deferred = window.setTimeout(this.buildList.bind(this), 1000)
    eventDispatcher.addListener('windowLoaded', () => {
      this.attachEvents()
      setTimeout(() => {
        window.requestIdleCallback(this.cleanUpTasks.bind(this))
      }, 100000)
    })
  }
  protected cleanUpTasks() {
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
    eventDispatcher.on('entrySaved', (id: string) => {
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
      this.deferred = window.setTimeout(this.buildList.bind(this), 1000 * 5)
    })
  }
  protected buildListDeferred(): void {
    window.requestIdleCallback(this.buildList.bind(this))
  }
  protected buildList(): void {
    let list: Array<string> = []
    Object.values(TaskStorage.store).forEach((task: any) => {
      list.push(task.name)
    })
    list.sort((a, b) => a.localeCompare(b))
    Storage.store = {
      tasks: list
    }
    eventDispatcher.emit('taskListRebuilt')
  }

}

export default TasksListBuilder