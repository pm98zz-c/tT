import eventDispatcher from '../Event'
import Entry from '../Entry/Entry'
import TasksList from '../TasksList/TasksList'
const Mousetrap = require('mousetrap')
class Toggle {
  toggleInput: HTMLInputElement
  toggleSubmit: HTMLButtonElement
  currentInput: HTMLInputElement
  form: HTMLFormElement
  currentEntry: Entry | null

  public constructor() {
    this.toggleInput = this.getToggleInput()
    this.currentInput = this.getCurrentInput()
    this.toggleSubmit = this.getToggleSubmit()
    this.form = this.getForm()
    eventDispatcher.on('windowLoaded', () => {
      this.render()
      this.attachEvents()
    })
  }
  protected attachEvents() {
    eventDispatcher.on('entrySelectedInList', (entryTask: string) => {
      this.toggleInput.value = entryTask
      this.toggleInput.focus()
    })
    this.toggleInput.addEventListener('keyup', () => {
      TasksList.populateDatalist(this.toggleInput.value)
      this.toggleSubmitText()
    })
    this.toggleSubmit.addEventListener('click', (event) => {
      this.toggle()
      event.preventDefault()
    })
    Mousetrap(document.body).bind(['tab', 'shift+tab'], () => {
      // Move to submit.
      if (this.toggleInput === document.activeElement) {
        if (this.toggleSubmit.hasAttribute('disabled')) {
          this.toggleInput.blur()
          eventDispatcher.broadcast('toggleFocusReleased')
          return false
        }
        this.toggleSubmit.focus()
        return false
      }
      // Release nav.
      if (this.toggleSubmit === document.activeElement) {
        this.toggleSubmit.blur()
        eventDispatcher.broadcast('toggleFocusReleased')
        return false
      }
      // We're not active, grab focus.
      this.toggleInput.value = ''
      this.toggleInput.focus()
      eventDispatcher.broadcast('toggleFocusGrabbed')
      return false
    })
  }
  protected render() {
    document.body.prepend(this.form)
    this.toggleInput.focus()
  }
  protected getToggleInput(): HTMLInputElement {
    const toggleInput = document.createElement('input')
    toggleInput.setAttribute('type', 'text')
    toggleInput.setAttribute('name', 'activity')
    toggleInput.setAttribute('id', 'activity')
    toggleInput.setAttribute('list', TasksList.getId())
    toggleInput.setAttribute('placeholder', 'Lets get this done')
    TasksList.render()
    return toggleInput
  }

  protected getCurrentInput(): HTMLInputElement {
    const currentInput = document.createElement('input')
    currentInput.setAttribute('type', 'text')
    currentInput.setAttribute('name', 'current')
    currentInput.setAttribute('id', 'current')
    currentInput.setAttribute('disabled', 'true')
    return currentInput
  }
  protected getCurrentAnime(): HTMLImageElement {
    const currentInput = document.createElement('img')
    currentInput.setAttribute('id', 'current-anime')
    currentInput.setAttribute('src', './assets/tT.svg')
    return currentInput
  }
  protected getToggleSubmit() {
    const toggleSubmit = document.createElement('button')
    toggleSubmit.innerText = 'Start'
    toggleSubmit.id = 'switch'
    toggleSubmit.setAttribute('disabled', 'true')
    toggleSubmit.setAttribute('title', 'Enter')
    return toggleSubmit
  }
  protected getForm() {
    const form = document.createElement('form')
    form.id = 'toggle'
    form.classList.add('iddle')
    form.appendChild(this.toggleInput)
    form.appendChild(this.currentInput)
    form.appendChild(this.getCurrentAnime())
    form.appendChild(this.toggleSubmit)
    return form
  }
  protected toggle() {
    let val = this.toggleInput.value
    this.stop()
    if (val.length) {
      this.start(val)
    }
    this.toggleInput.value = ''
    this.toggleCurrent()
    this.toggleSubmitText()
    this.toggleInput.focus()
  }
  protected stop() {
    if (this.currentEntry instanceof Entry) {
      this.currentEntry.setEnd(new Date())
      this.currentEntry.save()
      this.currentEntry = null
    }
  }
  protected start(val: string) {
    this.currentEntry = new Entry()
    this.currentEntry.setTask(val)
    this.toggleInput.value = ''
  }
  protected toggleSubmitText() {
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
  protected toggleCurrent() {
    if (this.currentEntry instanceof Entry) {
      this.currentInput.value = this.currentEntry.getTask()
      this.form.classList.remove('iddle')
      return
    }
    this.form.classList.add('iddle')
    this.currentInput.value = ''
  }
}


export default Toggle