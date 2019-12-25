import eventDispatcher from '../common/Event'
import Toggle from './Toggle/Toggle'
import EntriesList from './EntriesList/EntriesList'
import RedmineLinker from './Redmine/RedmineLinker'
import RedmineManager from './Redmine/Redmine'
import Settings from './Preferences/Settings'
import Theme from './Theme/Theme'
import TasksListBuilder from './TasksList/TasksListBuilder'
const ipc = require('electron').ipcRenderer
// Remove default markup.
document.body.innerHTML = ''
//Inject our styling.
const theme = new Theme()
theme.init()
ipc.on('appLaunched', (event: Event, type: string) => {
  if (type === 'preferences') {
    const settings = new Settings()
    settings.render()
  }
  else {
    new RedmineManager()
    new RedmineLinker()
    new Toggle()
    new EntriesList()
    new TasksListBuilder
    eventDispatcher.emit('windowLoaded')
  }
})
