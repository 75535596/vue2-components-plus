function parseBindingValue(binding) {
  const defaultConfig = { maxLength: 50, pattern: null, min: null, max: null, int: false }
  const value = binding.value

  if (typeof value === 'number') {
    return { ...defaultConfig, maxLength: value }
  }
  if (value && typeof value === 'object') {
    return {
      maxLength: value.maxLength || defaultConfig.maxLength,
      pattern: value.pattern || null,
      min: typeof value.min === 'number' ? value.min : null,
      max: typeof value.max === 'number' ? value.max : null,
      int: !!value.int,
    }
  }
  return defaultConfig
}

function formatNumberInput(value, maxLength, allowNegative = true) {
  let result = ''
  let hasMinus = false
  let hasDot = false

  String(value || '').split('').forEach((char, index) => {
    if (char === '-') {
      if (allowNegative && index === 0 && !hasMinus) {
        result += char
        hasMinus = true
      }
      return
    }
    if (char === '.') {
      if (index !== 0 && !hasDot && result[result.length - 1] !== '-') {
        result += char
        hasDot = true
      }
      return
    }
    if (/^\d$/.test(char)) {
      const current = hasMinus ? result.slice(1) : result
      if (current === '0' && char !== '0' && !hasDot) {
        result = hasMinus ? '-' : ''
      }
      result += char
    }
  })

  return result.slice(0, maxLength)
}

function formatIntegerInput(value, maxLength, config) {
  let result = ''
  let hasMinus = false
  const allowNegative = config.min !== null && config.min < 0

  String(value || '').split('').forEach((char, index) => {
    if (char === '-') {
      if (allowNegative && index === 0 && !hasMinus) {
        result += char
        hasMinus = true
      }
      return
    }
    if (/^\d$/.test(char)) {
      const current = hasMinus ? result.slice(1) : result
      if (current === '0' && char !== '0') {
        result = hasMinus ? '-' : ''
      }
      result += char
    }
  })

  return result.slice(0, maxLength)
}

function formatRangeInput(value, config) {
  if (config.int) {
    const result = formatIntegerInput(value, config.maxLength || 50, config)
    if (result === '' || result === '-') return result
    const numberValue = parseInt(result, 10)
    if (Number.isNaN(numberValue)) return ''
    if (config.min !== null && numberValue < config.min) return String(Math.ceil(config.min))
    if (config.max !== null && numberValue > config.max) return String(Math.floor(config.max))
    return result
  }

  const allowNegative = config.min !== null && config.min < 0
  const result = formatNumberInput(value, config.maxLength || 50, allowNegative)
  if (result === '' || result === '-' || result === '.') return result
  const numberValue = parseFloat(result)
  if (Number.isNaN(numberValue)) return ''
  if (config.min !== null && numberValue < config.min) return String(config.min)
  if (config.max !== null && numberValue > config.max) return String(config.max)
  return result
}

function formatRegexInput(value, maxLength, pattern) {
  let result = ''
  String(value || '').split('').forEach((char) => {
    if (result.length >= maxLength) return
    const nextValue = result + char
    if (pattern.test(nextValue)) {
      result = nextValue
    }
  })
  return result
}

function getInputElement(el) {
  if (!el) return null
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    return el
  }
  return el.querySelector('input, textarea')
}

function updateInputValue(inputEl, binding) {
  if (!inputEl) return
  const config = parseBindingValue(binding)
  let nextValue = inputEl.value || ''

  if (binding.modifiers.range) {
    nextValue = formatRangeInput(nextValue, config)
  } else if (binding.modifiers.number) {
    nextValue = formatNumberInput(nextValue, config.maxLength)
  } else if (binding.modifiers.regex && config.pattern) {
    nextValue = formatRegexInput(nextValue, config.maxLength, config.pattern)
  } else {
    nextValue = String(nextValue).slice(0, config.maxLength)
  }

  if (nextValue !== inputEl.value) {
    inputEl.value = nextValue
    inputEl.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

function bindLengthDirective(el, binding) {
  const inputEl = getInputElement(el)
  if (!inputEl) return

  let composing = false
  const handleCompositionStart = () => {
    composing = true
  }
  const handleCompositionEnd = () => {
    composing = false
    updateInputValue(inputEl, binding)
  }
  const handleInput = () => {
    if (!composing) {
      updateInputValue(inputEl, binding)
    }
  }

  inputEl.addEventListener('compositionstart', handleCompositionStart)
  inputEl.addEventListener('compositionend', handleCompositionEnd)
  inputEl.addEventListener('input', handleInput)
  updateInputValue(inputEl, binding)

  el.__nsLengthHandlers = {
    inputEl,
    handleCompositionStart,
    handleCompositionEnd,
    handleInput,
  }
}

function unbindLengthDirective(el) {
  const handlers = el.__nsLengthHandlers
  if (!handlers) return
  handlers.inputEl.removeEventListener('compositionstart', handlers.handleCompositionStart)
  handlers.inputEl.removeEventListener('compositionend', handlers.handleCompositionEnd)
  handlers.inputEl.removeEventListener('input', handlers.handleInput)
  delete el.__nsLengthHandlers
}

export function registerDirective(Vue) {
  Vue.directive('sline', {
    inserted(el) {
      el.style.whiteSpace = 'nowrap'
      el.style.overflow = 'hidden'
      el.style.textOverflow = 'ellipsis'
      el.style.display = 'inline-block'
      el.style.maxWidth = '100%'
    },
  })

  Vue.directive('permission', {
    inserted(el, binding) {
      let permissionList = []
      try {
        permissionList = JSON.parse(sessionStorage.getItem('btnsPermission') || localStorage.getItem('btnsPermission') || '[]')
      } catch (error) {
        permissionList = []
      }

      if (!Array.isArray(permissionList)) {
        permissionList = []
      }

      const selector = binding.modifiers.class ? 'class' : 'id'
      const isDisplayNone = !!binding.modifiers.display
      const matched = selector === 'class'
        ? permissionList.some((item) => el.classList.contains(item))
        : permissionList.includes(el.getAttribute('id'))

      if (!matched) {
        if (isDisplayNone) {
          el.style.display = 'none'
        } else {
          el.style.visibility = 'hidden'
          el.style.pointerEvents = 'none'
        }
      }
    },
  })

  Vue.directive('length', {
    inserted(el, binding) {
      bindLengthDirective(el, binding)
    },
    componentUpdated(el, binding) {
      const inputEl = getInputElement(el)
      updateInputValue(inputEl, binding)
    },
    unbind(el) {
      unbindLengthDirective(el)
    },
  })

  Vue.directive('event-unuse', {
    inserted(el) {
      el.style.pointerEvents = 'none'
    },
  })

  Vue.directive('event-use', {
    inserted(el) {
      el.style.pointerEvents = 'auto'
    },
  })
}
