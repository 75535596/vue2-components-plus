function toKebabCase(value) {
  if (typeof value !== 'string') return value
  if (value.indexOf('-') > -1) return value.toLowerCase()
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function normalizeComponent(component) {
  if (!component) return 'span'
  if (typeof component === 'string') {
    return toKebabCase(component)
  }
  return component
}

function cloneVNodeWithSlot(vnode, slotName) {
  if (!vnode || slotName === 'default') {
    return vnode
  }
  const data = vnode.data || (vnode.data = {})
  data.slot = slotName
  return vnode
}

function normalizeChildren(result, slotName) {
  if (!result) return []
  const list = Array.isArray(result) ? result : [result]
  return list.map((item) => cloneVNodeWithSlot(item, slotName)).filter(Boolean)
}

function isComponentName(component, names) {
  const name = String(typeof component === 'string' ? component : component && component.name ? component.name : '')
    .replace(/-/g, '')
    .toLowerCase()
  return names.some((item) => name === item.toLowerCase())
}

export default {
  name: 'NsFormFieldRenderer',
  inheritAttrs: false,
  props: {
    field: {
      type: Object,
      required: true,
    },
    value: {
      default: undefined,
    },
  },
  mounted() {
    this.emitRef()
  },
  updated() {
    this.emitRef()
  },
  methods: {
    emitRef() {
      this.$emit('ref', this.$refs.control || null)
    },
    getComponent() {
      return normalizeComponent(this.field.component)
    },
    isUpload() {
      return isComponentName(this.field.component, ['elupload'])
    },
    rendersOptionsByChildren() {
      return isComponentName(this.field.component, ['elselect', 'elradiogroup', 'elcheckboxgroup'])
    },
    isFullWidthComponent() {
      return isComponentName(this.field.component, [
        'elinput',
        'elselect',
        'elcascader',
        'eldatepicker',
        'eltimepicker',
        'elinputnumber',
        'elautocomplete',
      ])
    },
    buildProps() {
      const params = this.field.params || {}
      const result = {}
      Object.keys(params).forEach((key) => {
        if (key.indexOf('v-') === 0) return
        if (key === 'rules' || key === 'style') return
        if (key === 'options' && this.rendersOptionsByChildren()) return
        result[key] = params[key]
      })
      if (!this.isUpload()) {
        result.value = this.value
      }
      return result
    },
    buildStyle() {
      const params = this.field.params || {}
      const style = {
        ...(this.field.style || {}),
        ...(params.style || {}),
      }
      if (this.isFullWidthComponent() && style.width === undefined) {
        style.width = '100%'
      }
      return style
    },


    buildDirectives() {
      const params = this.field.params || {}
      return Object.keys(params)
        .filter((key) => key.indexOf('v-') === 0)
        .map((key) => {
          const [, definition] = key.split('v-')
          const [name, ...modifiers] = definition.split('.')
          const modifierObject = {}
          modifiers.forEach((item) => {
            modifierObject[item] = true
          })
          return {
            name,
            value: params[key],
            modifiers: modifierObject,
          }
        })
    },
    buildEvents() {
      const userEvents = this.field.events || {}
      const listeners = {}
      Object.keys(userEvents).forEach((name) => {
        listeners[name] = (...args) => {
          userEvents[name](...args)
        }
      })

      if (!this.isUpload()) {
        const originalInput = listeners.input
        listeners.input = (val, ...args) => {
          this.$emit('input', val)
          if (originalInput) {
            originalInput(val, ...args)
          }
        }
      }

      return listeners
    },
    buildScopedSlots() {
      const slots = this.field.slots || {}
      const scopedSlots = {}
      Object.keys(slots).forEach((name) => {
        if (typeof slots[name] === 'function') {
          scopedSlots[name] = (scope) => slots[name](scope)
        }
      })
      return scopedSlots
    },
    renderOptionNodes(h) {
      const params = this.field.params || {}
      const options = params.options || []
      const component = this.getComponent()
      if (!Array.isArray(options) || options.length === 0) {
        return []
      }

      if (isComponentName(component, ['elselect'])) {
        return options.map((option, index) =>
          h('el-option', {
            key: option.value !== undefined ? option.value : index,
            props: {
              label: option.label,
              value: option.value,
              disabled: option.disabled,
            },
          }),
        )
      }

      if (isComponentName(component, ['elradiogroup'])) {
        return options.map((option, index) =>
          h(
            'el-radio',
            {
              key: option.value !== undefined ? option.value : index,
              props: {
                label: option.value,
                disabled: option.disabled,
              },
            },
            [option.label],
          ),
        )
      }

      if (isComponentName(component, ['elcheckboxgroup'])) {
        return options.map((option, index) =>
          h(
            'el-checkbox',
            {
              key: option.value !== undefined ? option.value : index,
              props: {
                label: option.value,
                disabled: option.disabled,
              },
            },
            [option.label],
          ),
        )
      }

      return []
    },
  },
  render(h) {
    const component = this.getComponent()
    const slotNodes = []
    const slots = this.field.slots || {}
    Object.keys(slots).forEach((name) => {
      if (typeof slots[name] === 'function') {
        slotNodes.push(...normalizeChildren(slots[name]({ field: this.field, value: this.value }), name))
      }
    })

    return h(
      component,
      {
        ref: 'control',
        props: this.buildProps(),
        style: this.buildStyle(),
        on: this.buildEvents(),
        directives: this.buildDirectives(),
        scopedSlots: this.buildScopedSlots(),
      },

      [...this.renderOptionNodes(h), ...slotNodes],
    )
  },
}
