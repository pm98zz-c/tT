import Prefs from './Preferences'

Prefs.list().forEach((group) => {
  // Can't use a proper fieldset, no grid support.
  let fieldset = document.createElement('fieldset')
  let legend = document.createElement('legend')
  legend.innerText = group.label
  fieldset.appendChild(legend)
  let inner = document.createElement('div')
  inner.classList.add('fieldset')
  fieldset.appendChild(inner)
  group.fields.forEach((field) => {
    let label = document.createElement('label')
    label.setAttribute('for', field.key)
    label.innerText = field.label
    let input = document.createElement('input')
    input.setAttribute('type', field.type)
    input.setAttribute('name', field.key)
    input.setAttribute('id', field.key)
    input.value = Prefs.get(field.key) ? Prefs.get(field.key) : field.default
    input.addEventListener('change', () => {
      Prefs.set(input.getAttribute('name'), input.value)
    })
    inner.appendChild(label)
    inner.appendChild(input)
  })
  document.body.appendChild(fieldset)

})