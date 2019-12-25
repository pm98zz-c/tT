import eventDispatcher from '../../common/Event'
import Prefs from '../Preferences/Preferences'
class RedmineLinker{
  protected redmineServer: string = Prefs.get('redmineUrl')
  public constructor(){
    if(this.redmineServer.length > 0){
      this.attachEvents()
    }
  }
  protected attachEvents(){
    eventDispatcher.addListener('EntryUIRendered', (entry: HTMLElement) => {
      this.createLink(entry)
    })
  }
  protected createLink(entry:HTMLElement){
    let inner = entry.querySelector('.entry-task')
    if(inner === null){
      return
    }
    let match = inner.innerHTML.match(/#\d+/i)
    if(match === null || match.length !== 1){
      return
    }
    let stringId= match[0]
    let url = stringId.replace('#',this.redmineServer + '/issues/')
    let link = `<a tabindex="-1" href="${url}" title="${url} (Ctrl+O)">${stringId}</a>`
    inner.innerHTML = inner.innerHTML.replace(stringId, link)
    let redmineLink = inner.querySelector('a')
    if(redmineLink === null){
      return
    }
    redmineLink.addEventListener('click',(event)=>{
      event.stopPropagation()
    })
  }
}
export default RedmineLinker