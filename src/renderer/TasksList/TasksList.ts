import eventDispatcher from '../../common/Event'
import Storage from '../../common/TasksList/Storage'
class TasksList {
  protected datalist: HTMLDataListElement
  protected list: Array<string> = []
  public constructor() {
    this.datalist = this.getDatalist()
    this.list = Storage.store.tasks
    eventDispatcher.addListener('taskListRebuilt', () => {
      this.list = Storage.store.tasks
    })
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
const List = new TasksList()
export default List