import eventDispatcher from './Event'

// Centralize Keyboard navigation globally.
class Keyboard {
  public constructor() {
    eventDispatcher.on('windowLoaded', () => {
      document.addEventListener('keydown', (event) => {
        if(event.ctrlKey){
          return
        }
      })
    })
  }
}
export default Keyboard