import eventDispatcher from '../../common/Event'
import EntryStorage from '../Entry/Storage'
import Entry from '../Entry/Entry'
import EntryUI from './EntryUI'
const Mousetrap = require('mousetrap')
class EntriesList {

  private entries: Array<EntryUI> = []
  public constructor() {
    // We'll delete entries older than a month.
    let before = new Date()
    before.setMonth(before.getMonth() - 1)
    Object.keys(EntryStorage.store).forEach((uuid: any) => {
      let entry = new Entry()
      // Delete old entries.
      entry.load(uuid)
      if (entry.getEnd() < before) {
        entry.delete()
      } else {
        this.entries[uuid] = new EntryUI(entry)
      }
    })
    eventDispatcher.on('toggleLoaded', () => {
      this.render()
      this.attachEvents()
    })
  }

  private render() {
    Object.values(this.entries).forEach(ui => {
      ui.render()
    })
  }
  private attachEvents() {
    eventDispatcher.addListener('entrySaved', (uuid: any) => {
      let entry = new Entry()
      entry.load(uuid)
      this.entries[uuid] = new EntryUI(entry)
      this.entries[uuid].render()
    })
    eventDispatcher.addListener('entryDeleted', (uuid: any) => {
      this.entries[uuid].remove()
      delete (this.entries[uuid])
    })
    eventDispatcher.addListener('toggleFocusReleased', () => {
      this.selectNextEntry()
    })
    eventDispatcher.addListener('toggleFocusGrabbed', () => {
      this.unSelect()
    })
    Mousetrap.bind(['down', 'j'], () => {
      this.selectNextEntry()
    })
    Mousetrap.bind(['up', 'k'], () => {
      this.selectPreviousEntry()
    })
    Mousetrap.bind(['right', 'h'], () => {
      this.selectNextEntryDay()
    })
    Mousetrap.bind(['left', 'l'], () => {
      this.selectPreviousEntryDay()
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
    Mousetrap.bind('ctrl+c', () => {
      let selected: HTMLAnchorElement | null = document.body.querySelector('.entry.selected')
      if (null === selected || null === selected.parentElement) {
        return true
      }
      let dayHeader = selected.parentElement.querySelector('h2')
      if (null === dayHeader) {
        return true
      }
      dayHeader.click()
      return false
    })
  }
  private triggerEdit() {
    let selected: HTMLDivElement | null = document.querySelector('.entry.selected')
    if (selected === null) {
      return;
    }
    this.unSelect()
    selected.click()
  }
  private unSelect() {
    Mousetrap.unbind('enter')
    let selected = document.querySelector('.selected')
    if (selected === null) {
      return
    }
    selected.classList.remove('selected')
  }
  private hasSelectedEntry(): boolean {
    let selected = document.querySelector('.entry.selected')
    if (selected === null) {
      return false
    }
    return true
  }
  private selectNext(entries: NodeList) {
    if (entries.length < 1) {
      return
    }
    for (let i = 0; i < entries.length; i++) {
      let entry = entries[i]
      if (entry instanceof HTMLElement && entry.classList.contains('selected')) {
        entry.classList.remove('selected')
        let next = entries[i + 1]
        if (next instanceof Element) {
          return this.selectEntry(next)
        }
      }
    }
    return this.selectEntry(<Element>entries[0])
  }
  private selectNextEntry() {
    let entries = document.querySelectorAll('.entry')
    return this.selectNext(entries)
  }
  private selectNextEntryDay() {
    let entries = document.querySelectorAll('.entry:first-of-type')
    return this.selectNext(entries)
  }
  private selectPrevious(entries: NodeList) {
    if (entries.length < 1) {
      return
    }
    for (let i = 0; i < entries.length; i++) {
      let entry = entries[i]
      if (entry instanceof HTMLElement && entry.classList.contains('selected')) {
        entry.classList.remove('selected')
        let previous = entries[i - 1]
        if (previous instanceof Element) {
          return this.selectEntry(previous)
        }
      }
    }
    return this.selectEntry(<Element>entries[entries.length - 1])
  }
  private selectPreviousEntry() {
    let entries = document.querySelectorAll('.entry')
    return this.selectPrevious(entries)
  }
  private selectPreviousEntryDay() {
    let entries = document.querySelectorAll('.entry:first-of-type')
    return this.selectPrevious(entries)
  }
  private selectEntry(entry: Element) {
    this.unSelect()
    entry.classList.add('selected')
    entry.scrollIntoView({ block: "center" })
    Mousetrap.bind('enter', () => {
      this.triggerStartTask()
      return false
    })
  }

  private triggerStartTask() {
    let selected = document.querySelector('.entry.selected')
    if (null !== selected) {
      let task: HTMLParagraphElement | null = selected.querySelector('p.entry-task')
      if (null !== task) {
        eventDispatcher.emit('entrySelectedInList', task.innerText)
      }
    }
    this.unSelect()
  }
}

export default EntriesList