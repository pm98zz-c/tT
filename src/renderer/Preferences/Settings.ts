import Prefs from './Preferences'
class Settings {
  public render() {
    Prefs.list().forEach((group) => {
      // Can't use a proper fieldset, no grid support.
      let fieldset = document.createElement('fieldset')
      let legend = document.createElement('legend')
      legend.innerText = group.label
      fieldset.appendChild(legend)
      let inner = document.createElement('div')
      inner.classList.add('fieldset')
      fieldset.appendChild(inner)
      group.fields.forEach((field: any) => {
        switch (field.type) {
          case 'radios':
            inner.appendChild(this.generateRadios(field))
            break
          case 'checkboxes':
            inner.appendChild(this.generateCheckboxes(field))
            break
          default:
            inner.appendChild(this.generateInput(field))
        }
      })
      document.body.appendChild(fieldset)
    })
  }
  //@todo make interface/types.
  private generateInput(field: any): HTMLDivElement {
    let wrapper = document.createElement('div')
    wrapper.classList.add('input')
    let label = document.createElement('label')
    label.setAttribute('for', field.key)
    label.innerText = field.label
    let input = document.createElement('input')
    input.setAttribute('type', field.type)
    input.setAttribute('name', field.key)
    input.setAttribute('id', field.key)
    input.value = Prefs.get(field.key) ? Prefs.get(field.key) : field.default
    input.addEventListener('change', () => {
      Prefs.set(<string>input.getAttribute('name'), input.value)
    })
    wrapper.appendChild(label)
    wrapper.appendChild(input)
    return wrapper
  }
  //@todo make interface/types.
  private generateRadios(field: any): HTMLDivElement {
    let wrapper = document.createElement('div')
    wrapper.classList.add('radios')
    let label = document.createElement('legend')
    label.innerText = field.label
    wrapper.appendChild(label)
    let initialValue = Prefs.get(field.key) ? Prefs.get(field.key) : field.default
    field.options.forEach((option: any) => {
      let inner = document.createElement('div')
      let radio = document.createElement('input')
      radio.setAttribute('type', 'radio')
      radio.setAttribute('name', field.key)
      radio.setAttribute('id', option.key)
      radio.value = option.key
      if (initialValue === option.key) {
        radio.setAttribute('checked', 'true')
      }
      radio.addEventListener('change', () => {
        Prefs.set(field.key, radio.value)
      })
      inner.appendChild(radio)
      let radioLabel = document.createElement('label')
      radioLabel.setAttribute('for', option.key)
      radioLabel.innerText = option.label
      inner.appendChild(radioLabel)
      wrapper.appendChild(inner)
    })

    return wrapper
  }
  private generateCheckboxes(field: any): HTMLDivElement {
    const checkboxes: Array<HTMLInputElement> = []
    let wrapper = document.createElement('div')
    wrapper.classList.add('checkboxes')
    let label = document.createElement('legend')
    label.innerText = field.label
    wrapper.appendChild(label)
    let initialValue = Prefs.get(field.key) ? Prefs.get(field.key) : field.default
    console.log(initialValue)
    field.options.forEach((option: any) => {
      let inner = document.createElement('div')
      let checkbox = document.createElement('input')
      checkbox.setAttribute('type', 'checkbox')
      checkbox.setAttribute('name', field.key)
      checkbox.setAttribute('id', option.key)
      if(initialValue[option.key]){
        checkbox.setAttribute('checked', 'true')
      }
      checkbox.value = option.key
      checkbox.addEventListener('change', () => {
        let settings = new Map<string, boolean>()
        checkboxes.forEach((element) => {
          settings.set(element.value, element.checked)
        })
        Prefs.set(field.key, Object.fromEntries(settings.entries()))
      })
      checkboxes.push(checkbox)
      inner.appendChild(checkbox)
      let checkboxLabel = document.createElement('label')
      checkboxLabel.setAttribute('for', option.key)
      checkboxLabel.innerText = option.label
      inner.appendChild(checkboxLabel)
      wrapper.appendChild(inner)
    })

    return wrapper
  }
}

export default Settings