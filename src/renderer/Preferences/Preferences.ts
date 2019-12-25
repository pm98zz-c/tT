import Storage from './Storage'
const ipc = require('electron').ipcRenderer


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
          type: 'password',
          default: ''
        },
        {
          key: 'redmineDisplay',
          label: 'Show',
          type: 'checkboxes',
          default: {
            redmineDisplayMyIssues: true,
            redmineDisplayAllIssues: false,
            redmineDisplayProjects: true
          },
          options: [
            { key: 'redmineDisplayMyIssues', label: 'My issues' },
            { key: 'redmineDisplayAllIssues', label: 'All issues' },
            { key: 'redmineDisplayProjects', label: 'Projects' }
          ]
        }
      ]
    },
    {
      label: 'Appearance',
      fields: [
        {
          key: 'theme',
          label: 'Theme',
          type: 'radios',
          default: 'themeLight',
          options: [
            { key: 'themeLight', label: 'Light' },
            { key: 'themeDark', label: 'Dark' }
          ]
        }
      ]
    }
  ]
  private defaultValues: Map<string, any>
  constructor() {
    this.defaultValues = new Map<string, any>()
    this.definitions.forEach((group) => {
      group.fields.forEach((field: any) => {
        this.defaultValues.set(field.key, field.default)
      })
    })
  }

  //@todo validate and default values.
  public get(key: string) {
    return Storage.get(key, this.defaultValues.get(key))
  }
  public set(key: string, value: any) {
    Storage.set(key, value)
    ipc.send('preferencesChanged', key)
  }
  public list() {
    return this.definitions
  }
}

const prefs = new Preferences()

export default prefs