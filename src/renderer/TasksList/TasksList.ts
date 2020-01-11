import eventDispatcher from '../../common/Event'
import Storage from './Storage'
const fuzzysort = require('fuzzysort')
class TasksList {
  protected datalist: HTMLUListElement
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
  public render(target: HTMLElement) {
    const existing = document.getElementById(this.getId())
    if (existing instanceof HTMLDataListElement) {
      existing.replaceWith(this.datalist)
    } else {
      target.after(this.datalist)
    }
  }
  protected getDatalist() {
    const datalist = document.createElement('ul')
    datalist.id = this.getId()
    return datalist
  }
  public populateDatalist(val: string) {
    this.datalist.innerHTML = ''
    this.disable()
    if (val.length < 1) {
      for (let i = 0; i < this.list.length; i++) {
        let option = document.createElement('li')
        option.innerHTML = this.list[i]
        this.datalist.appendChild(option)
      }
      this.enable()
      return
    }
    let matches = fuzzysort.go(val, this.list)
    for (let i = 0; i < matches.length; i++) {
      let option = document.createElement('li')
      option.innerHTML = matches[i].target
      option.addEventListener('mouseenter', () => {
        this.select(option)
      })
      this.datalist.appendChild(option)
    }
    if (matches.length > 0) {
      this.enable()
    }
  }
  public disable() {
    this.datalist.classList.remove('active')
    Mousetrap.unbind('enter')
  }
  public getSelection() {
    this.datalist.querySelectorAll('.selected').forEach((selected) => {
      if (selected instanceof HTMLLIElement) {
        eventDispatcher.emit('taskAutocompleteSelected', selected.innerText)
      }
    })
  }
  public enable() {
    this.datalist.classList.add('active')
  }
  private select(elem: HTMLLIElement) {
    Mousetrap.unbind('enter')
    this.datalist.querySelectorAll('.selected').forEach((selected) => {
      selected.classList.remove('selected')
    })
    elem.classList.add('selected')
    elem.addEventListener('click', () => {
      eventDispatcher.emit('taskAutocompleteSelected', elem.innerText)
    })
  }
  public selectNext() {
    let tasks = this.datalist.children
    if (tasks.length < 1) {
      return
    }
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].classList.contains('selected')) {
        if (tasks[i + 1] instanceof HTMLLIElement) {
          return this.select(<HTMLLIElement>tasks[i + 1])
        }
      }
    }
    return this.select(<HTMLLIElement>tasks[0])
  }

  public selectPrevious() {
    let tasks = this.datalist.children
    if (tasks.length < 1) {
      return
    }
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].classList.contains('selected')) {
        if (tasks[i - 1] instanceof Element) {
          return this.select(<HTMLLIElement>tasks[i - 1])
        }
      }
    }
    return this.select(<HTMLLIElement>tasks[tasks.length - 1])
  }

}
const List = new TasksList()
export default List