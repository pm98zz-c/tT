import eventDispatcher from '../../common/Event'
import RedmineSyncProjects from './RedmineSyncProjects'
import RedmineSyncIssues from './RedmineSyncIssues'
import Prefs from '../Preferences/Preferences'
const ipc = require('electron').ipcRenderer

class Redmine {
  private projects: RedmineSyncProjects
  private issues: RedmineSyncIssues
  private interval: number | null = null
  private deferred: number | null = null
  public constructor() {
    this.projects = new RedmineSyncProjects()
    this.issues = new RedmineSyncIssues()
    ipc.on('preferencesChanged', (event: Event, key: string) => {
      if(key.indexOf('redmine') === 0){
        this.projects.reset()
        this.issues.reset()
        window.setTimeout(this.syncCheck.bind(this), 1000)
      }
    })
    eventDispatcher.on('windowLoaded', () => {
      this.syncCheck()
      eventDispatcher.on('redmineProjectsNeedSync', () => {
        if (this.deferred !== null) {
          window.clearTimeout(this.deferred)
        }
        this.deferred = window.setTimeout(this.syncProjectsDeferred.bind(this), 1000)
      })
      // setInterval(this.cleanProjects.bind(this), 30 * 60000)
    })
  }

  private syncCheck(){
    if (this.interval !== null){
      clearInterval(this.interval)
    }
    let redmineServer: string = Prefs.get('redmineUrl')
    let apiKey: string = Prefs.get('redmineToken')
    if(redmineServer.length && apiKey.length){
      this.projects = new RedmineSyncProjects()
      this.issues = new RedmineSyncIssues()
      this.interval = window.setInterval(this.syncIssuesDeferred.bind(this), 1 * 30000)
    }
  }
  private syncProjectsDeferred() {
    window.requestIdleCallback(this.syncProjects.bind(this))
  }
  private syncProjects() {
    this.projects.sync()
  }
  private syncIssuesDeferred() {
    window.requestIdleCallback(this.syncIssues.bind(this))
  }
  protected syncIssues(){
    this.issues.sync()
  }
}

export default Redmine