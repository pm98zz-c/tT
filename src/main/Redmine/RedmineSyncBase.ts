import Prefs from '../../common/Preferences/Preferences'
const https = require('https')


//@todo we should not store last run in prefs.
abstract class RedmineSyncBase {
  protected redmineServer: string = Prefs.get('redmineUrl')
  protected apiKey: string = Prefs.get('redmineToken')
  protected lastRun: string = ''
  protected lastRunName: string = ''
  protected pass: number = 0
  constructor(){
    this.attachEvents()
  }
  public sync() {
    this.pass = 0
    if (Prefs.get(this.lastRunName)) {
      this.lastRun = <string>Prefs.get(this.lastRunName)
    } else {
      let date = new Date()
      date.setMonth(date.getMonth() - 1)
      this.lastRun = date.toISOString().substring(0, 10)
    }
    this.fetch()
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
            reject(e)
          }
        })
      })
      request.on('error', (error:any) =>{
        reject(error)
      })
      request.end()
    })
  }
}

export default RedmineSyncBase