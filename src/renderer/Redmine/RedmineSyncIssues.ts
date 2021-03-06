import RedmineSyncBase from './RedmineSyncBase'
import eventDispatcher from '../../common/Event'
import Task from '../Task/Task';
import RedmineStorage from './StorageProject'
import RedmineIssue from './RedmineIssue';

interface redmineIssuesResponse {
  issues?: Array<redmineIssueItem>
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
  updated_on: string
}
class RedmineSyncIssues extends RedmineSyncBase {
  protected lastRunName: string = 'redmineSyncIssues'

  protected attachEvents() {
    eventDispatcher.addListener('RedmineIssueSaved', (id: number) => {
      let issue = new RedmineIssue(id)
      let task = new Task(issue.getName())
      task.setName(issue.getName())
      task.save()
    })
  }

  protected fetch() {
    let url = this.redmineServer + '/issues.json?limit=100&offset=' + this.pass * 100 + '&sort=updated_on&updated_on=%3E%3D' + this.lastRun + '&key=' + this.apiKey
    if(this.display.redmineDisplayAllIssues === false){
      url += '&assigned_to_id=me'
    }
    this.request(url).then((data: redmineIssuesResponse) => {
      if (data.hasOwnProperty('issues')) {
        data.issues!.forEach(element => {
          this.syncIssue(element)
        })
        if (data.issues?.length == 0) {
          eventDispatcher.emit('redmineIssuesSyncronized')
        } else {
          this.pass = this.pass + 1
          this.fetch()
        }
      }
    })
  }
  protected syncIssue(element: redmineIssueItem) {
    let task = new RedmineIssue(parseInt(element.id))
    task.setParent(parseInt(element.project.id))
    task.setName(element.subject)
    if (task.setName(element.subject) && task.save()) {
      this.lastRun = this.increment(element.updated_on)
      localStorage.setItem(this.lastRunName, this.lastRun)
      return true
    } else {
      // Retrigger a project sync.
      eventDispatcher.emit('redmineProjectsNeedSync')
      return false
    }
  }



  /**
 * Remove tasks older than a month.
 */
  protected cleanOldTasks() {
    let before = new Date()
    before.setMonth(before.getMonth() - 1)
    Object.values(RedmineStorage.store).forEach((issue: any) => {
      let task = new RedmineIssue(issue.id)
      // Delete old entries.
      if (task.getUpdated() < before) {
        task.delete()
      }
    })
  }

}

export default RedmineSyncIssues