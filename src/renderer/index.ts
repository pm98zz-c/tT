import eventDispatcher from '../common/Event'
import Toggle from './Toggle/Toggle'
import EntriesList from './EntriesList/EntriesList'
import RedmineLinker from './Redmine/RedmineLinker'
import Settings from './Preferences/Settings'
import Theme from './Theme/Theme'
// Remove default markup.
document.body.innerHTML = ''
//Inject our styling.
const theme = new Theme()
theme.init()
eventDispatcher.addListener('appLaunched', (event: Event, type: string) => {
  if (type === 'preferences') {
    const settings = new Settings()
    settings.render()
  }
  else{
    new RedmineLinker()
    new Toggle()
    new EntriesList()
    eventDispatcher.broadcast('windowLoaded')
  }
})
