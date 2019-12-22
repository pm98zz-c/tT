import Storage from './Storage'
import eventDispatcher from '../../common/Event'
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
  //@todo validate and default values.
  public get(key: string) {
    return Storage.get(key)
  }
  public set(key: string, value: any) {
    Storage.set(key, value)
    eventDispatcher.broadcast('preferencesChanged', key)
  }
  public list() {
    return this.definitions
  }
}

const prefs = new Preferences()

export default prefs