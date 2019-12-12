import eventDispatcher from '../Event'
import TaskStorage from '../Task/Storage'
import Entry from '../Entry/Entry'
import Task from '../Task/Task'
class TasksList {
  protected deferred: NodeJS.Timeout
  protected list: Array<string>
  protected datalist: HTMLDataListElement
  public constructor() {
    this.datalist = this.getDatalist()
    this.attachEvents()
    setTimeout(this.buildList.bind(this), 1000)
    setTimeout(this.cleanUpTasks.bind(this), 10000)
  }
  protected async cleanUpTasks(){
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
    eventDispatcher.addListener('entrySaved', (id) => {
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
    this.list = list
  }
  public getId() {
    return 'task-list'
  }
  public render() {
    const existing = document.getElementById(this.getId())
    if (existing instanceof HTMLDataListElement) {
      existing.replaceWith(this.datalist)
    } else {
      document.body.appendChild(this.datalist)
    }
  }
  protected getDatalist() {
    const datalist = document.createElement('datalist')
    datalist.id = this.getId()
    return datalist
  }
  public populateDatalist(val: string) {
    this.datalist.innerHTML = ''
    if (val.length < 1) {
      return
    }
    let matches = 0;
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].toLowerCase().includes(val.toLowerCase())) {
        let option = document.createElement('option')
        option.value = this.list[i]
        option.innerText = this.list[i]
        this.datalist.appendChild(option)
        matches++
      }
      if (matches > 50) {
        return
      }
    }
  }

}
const List = new TasksList
export default List