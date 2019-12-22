import eventDispatcher from '../../common/Event'
import TaskStorage from '../../common/Task/Storage'
import Entry from '../../common/Entry/Entry'
import Task from '../../common/Task/Task'
import Storage from '../../common/TasksList/Storage'
class TasksListBuilder {
  protected deferred: NodeJS.Timeout
  public constructor() {
    this.deferred = setTimeout(this.buildList.bind(this), 1000)
    eventDispatcher.addListener('windowLoaded', () => {
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
    eventDispatcher.on('entrySaved', (event: Event, id: string) => {
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
      this.deferred = setTimeout(this.buildList.bind(this), 1000 * 2)
    })
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
    eventDispatcher.broadcast('taskListRebuilt')
  }

}

export default TasksListBuilder