import eventDispatcher from '../Event'
import RedmineTask from './RedmineTask'
import RedmineProject from './RedmineProject';
import Task from '../Task/Task';
import RedmineStorage from './Storage'
import Prefs from '../Preferences/Preferences'
interface redmineIssuesResponse {
  issues?: Array<redmineIssueItem>
  limit?: number
  offset?: number
  total_count?: number
}
interface redmineProjectResponse {
  project?: redmineProjectItem
  limit?: number
  offset?: number
  total_count?: number
}
interface redmineIssueItem {
  id: string
  subject: string
  project: redmineProjectItem
  updated_on: string
}
interface redmineProjectItem {
  id: string
  name: string
  parent?: redmineProjectItem
}
class Redmine {
  protected redmineServer: string = Prefs.get('redmineUrl')
  protected apiKey: string = Prefs.get('redmineToken')
  protected lastRun: string = ''
  protected lastRunNeedsReset: boolean = false
  protected deferred: Array<NodeJS.Timeout> = []
  public constructor() {
    if (this.redmineServer.length > 0 && this.apiKey.length > 0) {
      this.lastRunReset()
      this.attachEvents()
      this.syncTasks()
      window.setInterval(this.syncTasks.bind(this), 1 * 60000)
      window.setInterval(this.cleanOldTasks.bind(this), 30 * 60000)
    }
  }
  protected lastRunReset() {
    if (localStorage.getItem('redmineLastRun') !== null) {
      this.lastRun = <string>localStorage.getItem('redmineLastRun')
    } else {
      let date = new Date()
      date.setMonth(date.getMonth() - 1)
      this.lastRun = date.toISOString().substring(0, 10)
    }
    this.lastRunNeedsReset = false
  }
  
  protected attachEvents() {
    eventDispatcher.addListener('redmineProjectSaved', (id: number) => {
      let project = new RedmineProject(id)
      let task = new Task('')
      task.loadByName(project.getName())
      task.setName(project.getName())
      task.save()
    })
    eventDispatcher.addListener('redmineTaskSaved', (id: number) => {
      let issue = new RedmineTask(id)
      let task = new Task('')
      task.loadByName(issue.getName())
      task.setName(issue.getName())
      task.save()
    })
  }
  protected syncTasks() {
    if (this.lastRunNeedsReset) {
      this.lastRunReset()
    } else {
      localStorage.setItem('redmineLastRun', this.lastRun)
    }
    let url = this.redmineServer + '/issues.json?sort=updated_on&updated_on=%3E%3D' + this.lastRun + '&key=' + this.apiKey
    this.request(url).then((data: redmineIssuesResponse) => {
      if (data.hasOwnProperty('issues')) {
        data.issues!.forEach(element => {
          this.syncTask(element)
        })
      }
    })
  }
  /**
   * Remove tasks older than a month.
   */
  protected cleanOldTasks(){
    let before = new Date()
    before.setMonth(before.getMonth() - 1)
    Object.values(RedmineStorage.store).forEach((issue: any) => {
      let task = new RedmineTask(issue.id)
      // Delete old entries.
      if (task.getUpdated() < before) {
        task.delete()
      }
    })
  }
  protected syncTask(element: redmineIssueItem) {
    let task = new RedmineTask(parseInt(element.id))
    this.deferSyncProject(parseInt(element.project.id))
    task.setParent(parseInt(element.project.id))
    task.setName(element.subject)
    if (task.save()) {
      this.lastRun = this.increment(element.updated_on)
    } else {
      // Need to re-run same query again.
      this.lastRunNeedsReset = true
    }
  }
  /**
   * Ugly way to increment Redmine "weird" format.
   */
  protected increment(datestring:string): string{
    let run = new Date(datestring)
    run.setSeconds(run.getSeconds()+1)
    return run.toJSON().replace('.000Z', 'Z')
  }
  protected deferSyncProject(id: number){
    clearTimeout(this.deferred[id])
    this.deferred[id] = setTimeout(this.syncProject.bind(this, id), 10000)
  }
  protected syncProject(id: number) {
    let url = this.redmineServer + '/projects/' + id + '.json?key=' + this.apiKey
    this.request(url).then((data: redmineProjectResponse) => {
      if (data.hasOwnProperty('project')) {
        let element = <redmineProjectItem>data.project
        let id = parseInt(data.project!.id)
        let project = new RedmineProject(id)
        if (element.hasOwnProperty('parent')) {
          let parent_id = parseInt(element.parent!.id)
          this.deferSyncProject(parent_id)
          project.setParent(parent_id)
        } else {
          project.setParent(0)
        }
        project.setName(element.name)
        project.save()
      }
    })
  }
  protected request(uri: string): Promise<Object> {
    return new Promise((resolve, reject) => {
      let options = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
      let request = new Request(uri, options)
      fetch(request)
        .then((response) => {
          if (response.ok) {
            return response.json()
          }
        })
        .then((data) => {
          resolve(data)
        })
        .catch(function (error) {
          reject(error)
        })
    })
  }
}

export default Redmine