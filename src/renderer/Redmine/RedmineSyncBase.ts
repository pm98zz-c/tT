import Prefs from '../Preferences/Preferences'
import StorageIssue from './StorageIssue'
import StorageProject from './StorageProject'
import Utils from '../Utils'
const https = require('https')

abstract class RedmineSyncBase {
  protected redmineServer: string = Utils.rtrim(Prefs.get('redmineUrl'), '/')
  protected apiKey: string = Prefs.get('redmineToken')
  protected lastRun: string = ''
  protected lastRunName: string = ''
  protected pass: number = 0
  protected display = {
    redmineDisplayMyIssues: true,
    redmineDisplayAllIssues: false,
    redmineDisplayProjects: true
  }
  constructor(){
    this.initPrefs()
    this.attachEvents()
  }
  public sync() {
    this.pass = 0
    if (localStorage.getItem(this.lastRunName)) {
      this.lastRun = <string>localStorage.getItem(this.lastRunName)
    } else {
      let date = new Date()
      date.setMonth(date.getMonth() - 1)
      this.lastRun = date.toISOString().substring(0, 10)
    }
    this.fetch()
  }

  protected initPrefs(){
    this.display = Prefs.get('redmineDisplay')
  }

  public reset(){
    this.lastRun = ''
    localStorage.removeItem(this.lastRunName)
    StorageIssue.clear()
    StorageProject.clear()
    this.initPrefs()
  }

  protected attachEvents() {
    
  }
  protected fetch() {
    
  }
  /**
   * Remove tasks older than a month.
   */
  public clean() {
    
  }
  /**
   * Ugly way to increment Redmine "weird" format.
   */
  protected increment(datestring: string): string {
    let run = new Date(datestring)
    run.setSeconds(run.getSeconds() + 1)
    return run.toJSON().replace('.000Z', 'Z')
  }
  protected request(uri: string): Promise<Object> {
    return new Promise((resolve, reject) => {
      let options = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
      let request = https.request(uri, options, (response:any) => {
        let body: Array<Buffer> = []
        response.on('data', (data:any) => {
          body.push(data)
        })
        response.on('end', () => {
          try {
            let parsed = JSON.parse(Buffer.concat(body).toString())
            resolve(parsed)
          } catch (e) {
            // this.credentialsError()
            reject(e)
          }
        })
      })
      request.on('error', (error:any) =>{
        // this.credentialsError()
        reject(error)
      })
      request.end()
    })
  }
  // protected credentialsError(){
  //   // this won't work.
  //   alert('Invalid parameters for Redmine integration. Please check the Settings in Preferences.')
  //   localStorage.setItem(this.lastRunName, 'disabled')
  // }
}

export default RedmineSyncBase