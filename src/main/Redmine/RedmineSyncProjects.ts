import RedmineSyncBase from './RedmineSyncBase'
import eventDispatcher from '../../common/Event'
import Task from '../../common/Task/Task'
import RedmineProject from './RedmineProject'

interface redmineProjectsResponse {
  projects?: Array<redmineProjectItem>
  limit?: number
  offset?: number
  total_count?: number
}
interface redmineProjectItem {
  id: string
  name: string
  parent?: redmineProjectItem
  updated_on: string
}
class RedmineSyncProjects extends RedmineSyncBase {
  protected lastRunName: string = 'redmineSyncIssues'
  protected attachEvents() {
    eventDispatcher.addListener('redmineProjectSaved', (id: number) => {
      let project = new RedmineProject(id)
      let task = new Task('')
      task.loadByName(project.getName())
      task.setName(project.getName())
      task.save()
    })
  }

  protected fetch() {
    let url = this.redmineServer + '/projects.json?limit=100&offset=' + this.pass * 100 + '&key=' + this.apiKey
    this.request(url).then((data: redmineProjectsResponse) => {
      if (data.hasOwnProperty('projects')) {
        data.projects!.forEach(element => {
          this.syncProject(element)
        })
        if (data.projects?.length == 0) {
          eventDispatcher.broadcast('redmineProjectsSyncronized')
        } else {
          this.pass = this.pass + 1
          this.fetch()
        }
      }
    })
  }
  protected syncProject(element: redmineProjectItem) {
    let id = parseInt(element.id)
    let project = new RedmineProject(id)
    if (element.hasOwnProperty('parent')) {
      let parent_id = parseInt(element.parent!.id)
      project.setParent(parent_id)
    } else {
      project.setParent(0)
    }
    if (project.setName(element.name) && project.save()) {
      project.save()
    }
  }

}

export default RedmineSyncProjects