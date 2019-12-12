import eventDispatcher from './Event'
// import Keyboard from './Keyboard'
import Toggle from './Toggle/Toggle'
import EntriesList from './EntriesList/EntriesList'
import Redmine from './Redmine/Redmine'
import RedmineLinker from './Redmine/RedmineLinker';
new RedmineLinker()
//@todo Redmine sync should be moved out the renderer.
new Redmine()
new Toggle()
new EntriesList()
// new Keyboard()
eventDispatcher.broadcast('windowLoaded')