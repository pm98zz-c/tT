import eventDispatcher from '../../common/Event'
import RedmineSyncProjects from './RedmineSyncProjects'
import RedmineSyncIssues from './RedmineSyncIssues'

class Redmine {

  private projects: RedmineSyncProjects
  private issues: RedmineSyncIssues
  public constructor() {
    this.projects = new RedmineSyncProjects()
    this.issues = new RedmineSyncIssues()
    eventDispatcher.on('appLaunched', () => {
      eventDispatcher.on('redmineProjectsNeedSync', () => {
        this.syncProjects()
      })
      setInterval(this.syncIssues.bind(this), 1 * 30000)
      // setInterval(this.cleanProjects.bind(this), 30 * 60000)
    })
  }
  private syncProjects() {
    this.projects.sync()
  }
  // private cleanProjects(){

  // }
  private syncIssues() {
    this.issues.sync()
  }
  // private cleanIssues(){

  // }
}

export default Redmine