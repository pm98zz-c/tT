import Entry from '../../common/Entry/Entry';
import TasksList from '../TasksList/TasksList'
import Utils from '../../common/Utils'
const Mousetrap = require('mousetrap')
class EntryEdit {

  protected entry: Entry
  protected wrapper: HTMLDivElement
  protected form: HTMLFormElement
  protected taskInput: HTMLInputElement
  protected description: HTMLTextAreaElement
  protected start: HTMLInputElement
  protected end: HTMLInputElement
  protected submit: HTMLButtonElement
  protected cancel: HTMLButtonElement
  protected tz: number = new Date().getTimezoneOffset()
  public constructor(entry: Entry) {
    this.entry = entry
    this.taskInput = this.getTaskInput()
    this.description = this.getDescription()
    this.start = this.getStart()
    this.end = this.getEnd()
    this.submit = this.getSubmit()
    this.cancel = this.getCancel()
    this.form = this.getForm()
    this.wrapper = this.getWrapper()
  }
  public activate() {
    document.body.appendChild(this.wrapper)
    this.description.focus()
    this.deleteSwitch()
  }
  protected getWrapper(): HTMLDivElement {
    let wrapper = document.createElement('div')
    wrapper.classList.add('entry-edit-wrapper')
    wrapper.appendChild(this.form)
    Mousetrap(wrapper).bind('esc', () => {
      this.cancelChanges()
    })
    return wrapper
  }
  protected getForm(): HTMLFormElement {
    let form = document.createElement('form')
    form.classList.add('entry-edit-form')
    form.appendChild(this.taskInput)
    form.appendChild(this.description)
    form.appendChild(this.getTimeWrapper())
    form.appendChild(this.getButtons())
    //@todo Remove this ugly dupe.
    Mousetrap(form).bind('tab', () => {
      let elements = this.form.getElementsByClassName('navigable')
      const max = elements.length
      let next = 0
      for (let i = 0; i < max; i++) {
        let element = <HTMLElement>elements[i]
        if (element === document.activeElement && i < max -1) {
          next = i + 1
        }
      }
      let nextElement = <HTMLElement>elements[next]
      nextElement.focus()
      return false
    })
    Mousetrap(form).bind('shift+tab', () => {
      let elements = this.form.getElementsByClassName('navigable')
      const max = elements.length -1
      let previous = max
      for (let i = max; i >= 0; i--) {
        let element = <HTMLElement>elements[i]
        if (element === document.activeElement && i > 0) {
          previous = i - 1
        }
      }
      let previousElement = <HTMLElement>elements[previous]
      previousElement.focus()
      return false
    })
    return form
  }
  protected getTaskInput(): HTMLInputElement {
    let taskInput = document.createElement('input')
    taskInput.setAttribute('type', 'text')
    taskInput.classList.add('entry-edit-task')
    taskInput.classList.add('navigable')
    taskInput.setAttribute('list', TasksList.getId())
    taskInput.value = this.entry.getTask()
    taskInput.addEventListener('keyup', () => {
      TasksList.populateDatalist(this.taskInput.value)
    })
    taskInput.addEventListener('change', () => {
      this.deleteSwitch()
    })
    return taskInput
  }
  protected getDescription(): HTMLTextAreaElement {
    let description = document.createElement('textarea')
    let rows = 3;
    let current = this.entry.getDescription().split("\n")
    if (current.length > rows) {
      rows = current.length
    }
    description.classList.add('navigable')
    description.setAttribute('rows', rows.toString())
    description.setAttribute('placeholder', 'Notes...')
    description.innerHTML = this.entry.getDescription()
    description.addEventListener('keyup', () => {
      Utils.autoGrowTextArea(this.description)
    })
    return description
  }
  protected getTimeWrapper(): HTMLDivElement {
    let start = document.createElement('div')
    start.classList.add('entry-edit-time-start-wrapper')
    start.appendChild(this.getStartLabel())
    start.appendChild(this.start)
    let end = document.createElement('div')
    end.classList.add('entry-edit-time-end-wrapper')
    end.appendChild(this.getEndLabel())
    end.appendChild(this.end)
    let wrapper = document.createElement('div')
    wrapper.classList.add('entry-edit-time-wrapper')
    wrapper.appendChild(start)
    wrapper.appendChild(end)
    return wrapper
  }
  protected getStartLabel(): HTMLLabelElement {
    let label = document.createElement('label')
    label.innerText = 'Start'
    label.setAttribute('for', 'entry-edit-start-' + this.entry.getId())
    return label
  }
  protected getStart(): HTMLInputElement {
    const start = document.createElement('input')
    start.id = 'entry-edit-start-' + this.entry.getId()
    start.setAttribute('type', 'datetime-local')
    start.classList.add('navigable')
    start.value = this.getLocalTimeValue(this.entry.getStart())
    start.addEventListener('change', () => {
      this.deleteSwitch()
    })
    return start
  }
  protected getEndLabel(): HTMLLabelElement {
    let label = document.createElement('label')
    label.innerText = 'End'
    label.setAttribute('for', 'entry-edit-end-' + this.entry.getId())
    return label
  }
  protected getLocalTimeValue(date: Date): string {
    let local = new Date(date)
    local.setMinutes(local.getMinutes() - this.tz)
    return local.toISOString().split('.')[0].substring(0, 16)
  }

  protected toUTCValue(datestring: string): Date {
    return new Date(datestring)
  }

  protected getEnd(): HTMLInputElement {
    const end = document.createElement('input')
    end.id = 'entry-edit-end-' + this.entry.getId()
    end.setAttribute('type', 'datetime-local')
    end.classList.add('navigable')
    end.value = this.getLocalTimeValue(this.entry.getEnd())
    end.addEventListener('change', () => {
      this.deleteSwitch()
    })
    return end
  }
  protected getButtons(): HTMLDivElement {
    let wrapper = document.createElement('div')
    wrapper.classList.add('entry-edit-buttons-wrapper')
    wrapper.appendChild(this.submit)
    wrapper.appendChild(this.cancel)
    return wrapper
  }
  protected getSubmit(): HTMLButtonElement {
    const submit = document.createElement('button')
    submit.innerText = 'Save'
    submit.classList.add('entry-edit-save')
    submit.classList.add('navigable')
    submit.setAttribute('type', 'submit')
    submit.setAttribute('title', 'Enter')
    submit.addEventListener('click', () => {
      this.saveChanges()
    })
    return submit
  }
  protected getCancel(): HTMLButtonElement {
    const cancel = document.createElement('button')
    cancel.innerText = 'Cancel'
    cancel.classList.add('entry-edit-cancel')
    cancel.classList.add('navigable')
    cancel.setAttribute('title', 'Esc')
    cancel.addEventListener('click', () => {
      this.cancelChanges()
    })
    return cancel
  }
  protected saveChanges() {
    this.entry.setTask(this.taskInput.value)
    this.entry.setDescription(this.description.value)
    this.entry.setStart(this.toUTCValue(this.start.value))
    this.entry.setEnd(this.toUTCValue(this.end.value))
    this.entry.save()
    this.cancelChanges()
  }
  protected cancelChanges() {
    if (this.wrapper.parentNode !== null) {
      this.wrapper.parentNode.removeChild(this.wrapper)
    }
  }
  protected deleteSwitch() {
    this.submit.innerText = 'Save changes'
    if (this.taskInput.value.length < 1) {
      this.submit.innerText = 'Delete time entry'
    }
    if (this.start.value >= this.end.value) {
      this.submit.innerText = 'Delete time entry'
    }
  }
}

export default EntryEdit