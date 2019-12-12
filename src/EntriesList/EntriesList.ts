import eventDispatcher from '../Event'
import EntryStorage from '../Entry/Storage'
import Entry from '../Entry/Entry'
import EntryUI from './EntryUI'
const Mousetrap = require('mousetrap')
class EntriesList {

  protected entries: Array<EntryUI> = []
  public constructor() {
    // We'll delete entries older than a month.
    let before = new Date()
    before.setMonth(before.getMonth() - 1)
    Object.keys(EntryStorage.store).forEach(uuid => {
      let entry = new Entry()
      // Delete old entries.
      entry.load(uuid)
      if(entry.getEnd() < before){
        entry.delete()
      } else {
        this.entries[uuid] = new EntryUI(entry)
      }
    })
    eventDispatcher.on('windowLoaded', () => {
      this.render()
      this.attachEvents()

    })
  }

  protected render() {
    Object.values(this.entries).forEach(ui => {
      ui.render()
    })
  }
  protected attachEvents() {
    eventDispatcher.addListener('entrySaved', (uuid) => {
      let entry = new Entry()
      entry.load(uuid)
      this.entries[uuid] = new EntryUI(entry)
      this.entries[uuid].render()
    })
    eventDispatcher.addListener('entryDeleted', (uuid) => {
      this.entries[uuid].remove()
      delete (this.entries[uuid])
    })
    eventDispatcher.addListener('toggleFocusReleased', () => {
      this.selectNext()
    })
    eventDispatcher.addListener('toggleFocusGrabbed', () => {
      this.unSelect()
    })
    Mousetrap.bind(['down', 'j'], () => {
      this.selectNext()
    })
    Mousetrap.bind(['up', 'k'], () => {
      this.selectPrevious()
    })
    Mousetrap.bind('space', () => {
      this.triggerEdit()
    })
    Mousetrap.bind('ctrl+o', () => {
      let link: HTMLAnchorElement | null = document.body.querySelector('.entry.selected a')
      if (null !== link) {
        link.click()
      }
    })
  }
  protected triggerEdit() {
    let selected: HTMLDivElement | null = document.querySelector('.entry.selected')
    if (selected === null) {
      return;
    }
    this.unSelect()
    selected.click()
  }
  protected unSelect() {
    Mousetrap.unbind('enter')
    let selected = document.querySelector('.entry.selected')
    if (selected === null) {
      return
    }
    selected.classList.remove('selected')
  }
  protected hasSelectedEntry(): boolean {
    let selected = document.querySelector('.entry.selected')
    if (selected === null) {
      return false
    }
    return true
  }
  protected selectNext() {
    let entries = document.getElementsByClassName('entry')
    if (entries.length < 1) {
      return
    }
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].classList.contains('selected')) {
        entries[i].classList.remove('selected')
        if (entries[i + 1] instanceof Element) {
          return this.selectEntry(entries[i + 1])
        }
      }
    }
    return this.selectEntry(entries[0])
  }
  protected selectEntry(entry: Element) {
    entry.classList.add('selected')
    Mousetrap.bind('enter', () => {
      this.triggerStartTask()
      return false
    })
  }
  protected selectPrevious() {
    let entries = document.getElementsByClassName('entry')
    if (entries.length < 1) {
      return
    }
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].classList.contains('selected')) {
        entries[i].classList.remove('selected')
        if (entries[i - 1] instanceof Element) {
          return this.selectEntry(entries[i - 1])
        }
      }
    }
    return this.selectEntry(entries[entries.length - 1])
  }
  protected triggerStartTask() {
    let selected = document.querySelector('.entry.selected')
    if (null !== selected) {
      let task: HTMLParagraphElement | null = selected.querySelector('p.entry-task')
      if (null !== task) {
        eventDispatcher.broadcast('entrySelectedInList', task.innerText)
      }
    }
    this.unSelect()
  }
}

export default EntriesList