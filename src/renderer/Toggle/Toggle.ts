import eventDispatcher from '../../common/Event'
import Entry from '../Entry/Entry'
import TasksList from '../TasksList/TasksList'
import Utils from '../Utils'
const Mousetrap = require('mousetrap')
//@see https://github.com/electron-userland/electron-webpack/issues/172
declare const __static: string
class Toggle {
  private toggleInput: HTMLInputElement
  private toggleSubmit: HTMLButtonElement
  private currentInput: HTMLInputElement
  private form: HTMLFormElement
  private formShadow: HTMLDivElement = document.createElement('div')
  private currentEntry: Entry | null
  private description: HTMLTextAreaElement

  public constructor() {
    this.currentEntry = null
    this.toggleInput = this.getToggleInput()
    this.currentInput = this.getCurrentInput()
    this.toggleSubmit = this.getToggleSubmit()
    this.description = this.getCurrentDescription()
    this.form = this.getForm()
    eventDispatcher.on('windowLoaded', () => {
      this.attachEvents()
      this.render()
      eventDispatcher.emit('toggleLoaded')
      this.toggleInput.focus()
    })
  }
  private attachEvents() {
    eventDispatcher.on('entrySelectedInList', (entryTask: string) => {
      this.toggleInput.value = entryTask
      this.toggleInput.focus()
    })
    eventDispatcher.on('taskAutocompleteSelected', (entryTask: string) => {
      this.toggleInput.value = entryTask
      this.toggleInput.focus()
      TasksList.disable()
    })
    this.toggleInput.addEventListener('input', () => {
      TasksList.populateDatalist(this.toggleInput.value)
      this.toggleSubmitText()
    })
    this.toggleSubmit.addEventListener('click', (event) => {
      this.toggle()
      event.preventDefault()
    })

    Mousetrap(document.body).bind(['tab'], () => {
      // Last of our elements, release nav.
      if (this.description === document.activeElement) {
        this.description.blur()
        eventDispatcher.emit('toggleFocusReleased')
        return false
      }
      // Move to submit, or release if no running task.
      if (this.toggleInput === document.activeElement) {
        if (this.currentEntry instanceof Entry) {
          this.toggleSubmit.focus()
          return false
        }
        // No other component we can select, release.
        this.toggleInput.blur()
        eventDispatcher.emit('toggleFocusReleased')
        return false
      }
      // Move to input. 
      if (this.toggleSubmit === document.activeElement) {
        this.toggleSubmit.blur()
        this.description.focus()
        return false
      }
      // Grab focus on input.
      this.toggleInput.value = ''
      this.toggleInput.focus()
      eventDispatcher.emit('toggleFocusGrabbed')
      return false
    })
    Mousetrap(document.body).bind(['shift+tab'], () => {
      // First of our elements, release nav.
      if (this.toggleInput === document.activeElement) {
        this.toggleInput.blur()
        eventDispatcher.emit('toggleFocusReleased')
        return false
      }
      // Move to submit, or release if no running task.
      if (this.description === document.activeElement) {
        this.toggleSubmit.focus()
        this.description.blur()
        return false
      }
      // Move to input. 
      if (this.toggleSubmit === document.activeElement) {
        this.toggleSubmit.blur()
        this.toggleInput.focus()
        return false
      }
      if (this.currentEntry instanceof Entry) {
        this.description.focus()
        eventDispatcher.emit('toggleFocusGrabbed')
        return false
      }
      // Grab focus on input.
      this.toggleInput.focus()
      eventDispatcher.emit('toggleFocusGrabbed')
      return false
    })
    Mousetrap(document.body).bind('mod+s', () => {
      this.toggle()
      eventDispatcher.emit('toggleFocusGrabbed')
    })
    Mousetrap(this.toggleInput).bind('down', () => {
      TasksList.selectNext()
    })
    Mousetrap(this.toggleInput).bind('up', () => {
      TasksList.selectPrevious()
    })
    Mousetrap(this.toggleInput).bind('esc', () => {
      TasksList.disable()
    })
    Mousetrap(this.toggleInput).bind('enter', () => {
      let selection = TasksList.getSelection()
      if(selection.length > 0){
        this.toggleInput.value = selection
        TasksList.disable()
        return false
      }
      return true
    })
  }
  private render() {
    document.body.prepend(this.formShadow)
    document.body.prepend(this.form)
    TasksList.render(this.toggleInput)
    setTimeout(this.makeSticky.bind(this), 0)
  }

  private getToggleInput(): HTMLInputElement {
    const toggleInput = document.createElement('input')
    toggleInput.setAttribute('type', 'text')
    toggleInput.setAttribute('name', 'activity')
    toggleInput.setAttribute('id', 'activity')
    toggleInput.setAttribute('placeholder', 'Lets get this done')
    return toggleInput
  }

  private getCurrentInput(): HTMLInputElement {
    const currentInput = document.createElement('input')
    currentInput.setAttribute('type', 'text')
    currentInput.setAttribute('name', 'current')
    currentInput.setAttribute('id', 'current')
    currentInput.setAttribute('disabled', 'true')
    return currentInput
  }
  private getCurrentAnime(): HTMLImageElement {
    const currentInput = document.createElement('img')
    currentInput.setAttribute('id', 'current-anime')
    currentInput.setAttribute('src', 'file://' + __static + '/tT.svg')
    return currentInput
  }
  private getToggleSubmit() {
    const toggleSubmit = document.createElement('button')
    toggleSubmit.innerText = 'Start'
    toggleSubmit.id = 'switch'
    toggleSubmit.setAttribute('disabled', 'true')
    toggleSubmit.setAttribute('title', 'Enter')
    return toggleSubmit
  }

  private makeSticky() {
    this.formShadow.style.height = this.form.getBoundingClientRect().height + 'px'
  }

  private getCurrentDescription() {
    let description = document.createElement('textarea')
    let rows = 1;
    description.setAttribute('disabled', 'true')
    description.setAttribute('placeholder', 'Notes...')
    description.addEventListener('input', () => {
      Utils.autoGrowTextArea(this.description)
      this.makeSticky()
    })
    if (this.currentEntry instanceof Entry) {
      let current = this.currentEntry.getDescription().split("\n")
      if (current.length > rows) {
        rows = current.length
      }
      description.innerHTML = this.currentEntry.getDescription()
      description.removeAttribute('disabled')
    }
    description.setAttribute('rows', rows.toString())
    return description
  }
  private getForm() {
    const form = document.createElement('form')
    form.id = 'toggle'
    form.classList.add('iddle')
    form.appendChild(this.toggleInput)
    form.appendChild(this.toggleSubmit)
    form.appendChild(this.getCurrentAnime())
    form.appendChild(this.currentInput)
    form.appendChild(this.description)
    return form
  }
  private toggle() {
    TasksList.disable()
    let val = this.toggleInput.value.toString()
    this.stop()
    this.description.value = ''
    this.toggleInput.value = ''
    Utils.autoGrowTextArea(this.description)
    this.makeSticky()
    if (val.length) {
      this.start(val)
    }
    this.toggleCurrent()
    this.toggleSubmitText()
  }
  private stop() {
    this.toggleInput.focus()
    if (this.currentEntry instanceof Entry) {
      this.currentEntry.setEnd(new Date())
      this.currentEntry.setDescription(this.description.value)
      this.currentEntry.save()
      this.currentEntry = null
    }
  }
  private start(val: string) {
    this.currentEntry = new Entry()
    this.currentEntry.setTask(val)
    this.toggleInput.value = ''
    this.description.value = ''
    this.description.removeAttribute('disabled')
    this.description.focus()
  }
  private toggleSubmitText() {
    let val = this.toggleInput.value
    if (val.length) {
      this.toggleSubmit.innerText = 'Start'
      this.toggleSubmit.removeAttribute('disabled')
      return
    }
    if (this.currentEntry instanceof Entry) {
      this.toggleSubmit.innerText = 'Stop'
      this.toggleSubmit.removeAttribute('disabled')
      return
    }
    this.toggleSubmit.innerText = 'Start'
    this.toggleSubmit.setAttribute('disabled', 'true')
  }
  private toggleCurrent() {
    if (this.currentEntry instanceof Entry) {
      this.currentInput.value = this.currentEntry.getTask()
      this.description.value = this.currentEntry.getDescription()
      this.description.removeAttribute('disabled')
      this.form.classList.remove('iddle')
      return
    }
    this.form.classList.add('iddle')
    this.currentInput.value = ''
  }
}


export default Toggle