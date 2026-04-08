export class ThemeVar {}
ThemeVar.VARS = {}

export function loadCssVars() {
  if (typeof document === 'undefined') {
    return ThemeVar.VARS
  }
  if (Object.keys(ThemeVar.VARS).length > 0) {
    return ThemeVar.VARS
  }

  const variables = {}
  Array.from(document.styleSheets || []).forEach((sheet) => {
    let cssRules = []
    try {
      cssRules = Array.from(sheet.cssRules || [])
    } catch (error) {
      cssRules = []
    }

    cssRules.forEach((rule) => {
      if (rule.selectorText !== ':root') {
        return
      }
      Array.from(rule.style || [])
        .filter((name) => name.indexOf('--matrix-') === 0)
        .forEach((name) => {
          variables[name] = rule.style.getPropertyValue(name).trim()
        })
    })
  })

  ThemeVar.VARS = variables
  return variables
}
