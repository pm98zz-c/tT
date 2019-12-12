import Storage from './Storage'
class Preferences {
  /**
   * @todo defer to components/plugins.
   */
  private definitions = [
    {
      label: 'Redmine',
      fields: [
        {
          key: 'redmineUrl',
          label: 'Redmine server URL',
          type: 'url',
          default: ''
        },
        {
          key: 'redmineToken',
          label: 'Redmine API token',
          type: 'text',
          default: ''
        }
      ]
    }
  ]
  //@todo validate and default values.
  public get(key: string) {
    return Storage.get(key, '')
  }
  public set(key: string, value: any) {
    return Storage.set(key, value)
  }
  public list() {
    return this.definitions
  }
}

const prefs = new Preferences()

export default prefs