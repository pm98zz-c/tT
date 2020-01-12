import Entry from '../Entry/Entry'
class EntryExport {

  protected entry: Entry
  public constructor(id: string) {
   this.entry = new Entry()
   this.entry.load(id) 
  }

  public getOutput(): string{
    let output = ''
    output += this.entry.getTask()
    let description = this.entry.getDescription().split('\n')
    if(description.length && description[0].length){
      output += "\n\t"
      output += description.join("\n\t")
    }
    output += "\n"
    return output
  }
}
  
export default EntryExport