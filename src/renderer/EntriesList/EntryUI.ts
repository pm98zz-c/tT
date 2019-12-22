import Entry from '../../common/Entry/Entry'
import EntryEdit from './EntryEdit'
import eventDispatcher from '../../common/Event'
class EntryUI {

  protected entry: Entry
  protected wrapper: HTMLDivElement
  protected entryElement: HTMLDivElement
  public constructor(entry: Entry) {
    this.entry = entry
    this.wrapper = this.getWrapperElement()
    this.entryElement = this.getEntryElement()
  }

  public render() {
    this.removeEntry()
    this.appendEntry()
  }
  public remove() {
    this.removeEntry()
  }
  protected getEntryElement(): HTMLDivElement {
    let entryElement = document.createElement('div')
    entryElement.id = this.entry.getId()
    entryElement.classList.add('entry')
    entryElement.setAttribute('data-sort', this.entry.getEnd().getTime().toString())
    entryElement.appendChild(this.getEntryTaskElement())
    entryElement.appendChild(this.getEntryDurationElement())
    entryElement.appendChild(this.getEntryDescriptionElement())
    entryElement.addEventListener('click', () => {
      this.editActivate()
    })
    return entryElement
  }
  protected editActivate() {
    let edit = new EntryEdit(this.entry)
    edit.activate()
  }
  protected getEntryTaskElement(): HTMLParagraphElement {
    let taskElement = document.createElement('p')
    taskElement.classList.add('entry-task')
    taskElement.innerText = this.entry.getTask()
    return taskElement
  }
  protected getEntryDescriptionElement(): HTMLDivElement {
    let element = document.createElement('div')
    element.classList.add('entry-description')
    element.innerHTML = this.entry.getDescription()
    return element
  }
  protected getWrapperElement(): HTMLDivElement {
    let dayElement = document.createElement('div')
    dayElement.classList.add('entry-day')
    dayElement.id = this.getDayId()
    dayElement.setAttribute('data-sort', this.getDaySortId())
    dayElement.appendChild(this.getDayHeaderElement())
    return dayElement
  }
  protected getDayHeaderElement(): HTMLHeadingElement {
    let header = document.createElement('h2')
    header.innerText = this.entry.getEnd().toLocaleDateString()
    return header
  }
  protected getEntryDurationElement(): HTMLParagraphElement {
    let duration = this.entry.getEnd().getTime() - this.entry.getStart().getTime()
    let durationElement = document.createElement('p')
    durationElement.classList.add('entry-duration')
    durationElement.innerText = this.formatDuration(duration)
    return durationElement
  }
  protected formatDuration(duration: number): string {
    let minutes: number = Math.floor(duration / 1000 / 60)
    let hours: number = 0
    if (minutes > 59) {
      hours = Math.floor(minutes / 60)
      minutes = Math.floor(minutes - hours * 60)
    }
    let durationString: string = minutes.toString()
    durationString = durationString.padStart(2, '0')
    durationString = hours.toString() + 'h' + durationString

    return durationString
  }
  protected removeEntry() {
    let existing = document.getElementById(this.entryElement.id)
    if (existing instanceof HTMLElement) {
      existing.remove()
    }
    this.removeEmptyWrapper()
  }
  protected removeEmptyWrapper(): void {
    let wrapper = document.getElementById(this.getDayId())
    if (wrapper instanceof HTMLDivElement) {
      if (wrapper.childElementCount < 2) {
        this.wrapper.remove()
      }
    }
  }
  protected ensureWrapper() {
    let wrapper = document.getElementById(this.getDayId())
    if (wrapper instanceof HTMLDivElement) {
      this.wrapper = wrapper
      return
    }
    this.appendWrapper()
  }
  protected getDayId(): string {
    return 'day-' + this.getDaySortId()
  }
  protected getDaySortId(): string {
    let end = this.entry.getEnd()
    let dayId = end.getFullYear().toString()
    dayId += this.pad(end.getMonth().toString())
    dayId += this.pad(end.getDate().toString())
    return dayId
  }
  protected appendWrapper() {
    // Try first to order.
    if (this.appendWrapperAbove()) {
      return
    }
    document.body.appendChild(this.wrapper)
  }
  protected appendWrapperAbove(): boolean {
    let existingWrappers = document.body.getElementsByClassName('entry-day')
    if (!existingWrappers.length) {
      return false
    }
    for (let i = 0; i < existingWrappers.length; i++) {
      if (this.isMoreRecent(this.wrapper, existingWrappers[i])) {
        document.body.insertBefore(this.wrapper, existingWrappers[i])
        return true
      }
    }
    return false
  }
  protected appendEntry() {
    this.ensureWrapper()
    // Try first to order.
    if (this.appendEntryAbove()) {
      eventDispatcher.broadcast('EntryUIRendered', this.entryElement)
      return
    }
    this.wrapper.appendChild(this.entryElement)
    eventDispatcher.broadcast('EntryUIRendered', this.entryElement)
  }
  protected appendEntryAbove(): boolean {
    let existingEntries = this.wrapper.getElementsByClassName('entry')
    if (!existingEntries.length) {
      return false
    }
    for (let i = 0; i < existingEntries.length; i++) {
      if (this.isMoreRecent(this.entryElement, existingEntries[i])) {
        this.wrapper.insertBefore(this.entryElement, existingEntries[i])
        return true
      }
    }
    return false
  }
  protected isMoreRecent(a: Element, b: Element): boolean {
    let timeA = parseInt(<string>a.getAttribute('data-sort'))
    let timeB = parseInt(<string>b.getAttribute('data-sort'))
    return timeA > timeB
  }
  protected pad(string: string): string {
    return string.padStart(2, '0')
  }
}

export default EntryUI