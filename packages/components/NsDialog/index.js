import Vue from 'vue'
import NsDialogComponent from './NsDialog.vue'
import '../../assets/main.css'

const dialogInstances = typeof window !== 'undefined' ? (window.__dialogInstances = window.__dialogInstances || []) : []
let externalVue = Vue
let externalStore = null
let externalPinia = null
let dialogSeed = 0

function resolveContextValue(primaryValue, fallbackValues = []) {
  if (primaryValue) {
    return primaryValue
  }
  return fallbackValues.find(Boolean) || null
}

function resolveVueConstructor(app) {
  if (!app) return null
  if (app.extend) {
    return app
  }
  if (app.constructor && app.constructor.extend) {
    return app.constructor
  }
  return null
}

function resolveStore(app, options = {}) {
  return resolveContextValue(options.store, [app && app.$store, app && app.$options && app.$options.store, app && app.store, externalStore])
}

function resolvePinia(app, options = {}) {
  return resolveContextValue(options.pinia, [app && app.$pinia, app && app.$options && app.$options.pinia, app && app.pinia, externalPinia])
}

export function setExternalApp(app, options = {}) {
  if (!app) return
  const resolvedVue = resolveVueConstructor(app)
  if (resolvedVue) {
    externalVue = resolvedVue
  }
  externalStore = resolveStore(app, options)
  externalPinia = resolvePinia(app, options)
}

function resolveMountTarget(selector) {
  if (typeof document === 'undefined') {
    return null
  }
  return document.querySelector(selector) || document.body
}

function removeDialogInstance(instance) {
  const index = dialogInstances.findIndex((item) => item.id === instance.id)
  if (index > -1) {
    dialogInstances.splice(index, 1)
  }
}

function destroyDialog(instance) {
  if (!instance || instance.destroyed) {
    return
  }
  instance.destroyed = true

  const vm = instance.vm
  if (vm && !vm._isDestroyed) {
    vm.$destroy()
  }

  const rootEl = instance.rootEl || (vm && vm.$el)
  if (rootEl && instance.element && rootEl.parentNode === instance.element) {
    instance.element.removeChild(rootEl)
  }

  if (instance.element && instance.element.parentNode) {
    instance.element.parentNode.removeChild(instance.element)
  }

  instance.vm = null
  instance.domRef = null
  instance.rootEl = null
  instance.updateOption = () => {}
  instance.callMethod = () => {}
  instance.close = () => {}
  removeDialogInstance(instance)
}

export function closeAllNsDialog() {
  dialogInstances.slice().forEach((instance) => {
    if (instance && typeof instance.close === 'function') {
      instance.close()
    }
  })
}

export function NsDialog(data, modal = true, appendTo = '#app') {
  if (!data || !data.dom) {
    return false
  }

  const mountTarget = resolveMountTarget(appendTo)
  if (!mountTarget) {
    return false
  }

  const callerVm = this && this._isVue ? this : null
  const { store: dataStore, pinia: dataPinia, ...dialogData } = data
  const store = resolveStore(callerVm, { store: dataStore })
  const pinia = resolvePinia(callerVm, { pinia: dataPinia })

  const id = dialogData.id || `ns-dialog-${Date.now()}-${dialogSeed++}`
  const container = document.createElement('div')
  container.id = id
  mountTarget.appendChild(container)

  const instance = {
    id,
    class: dialogData.class || '',
    element: container,
    vm: null,
    rootEl: null,
    destroyed: false,
    domRef: null,
    updateOption: () => {},
    callMethod: () => {},
    close: () => {},
  }

  const DialogConstructor = (externalVue || Vue).extend(NsDialogComponent)
  const propsData = {
    ...dialogData,
    className: dialogData.class || '',
    modal,
    footerButtonReverse:true,
    containerId: id,
    dialogInstance: instance,
    close: () => {
      if (typeof dialogData.close === 'function') {
        dialogData.close()
      }
    },
    closed: () => {
      try {
        if (typeof dialogData.closed === 'function') {
          dialogData.closed()
        }
      } finally {
        destroyDialog(instance)
      }
    },
  }

  const vmOptions = { propsData }
  if (store) {
    vmOptions.store = store
  }
  if (pinia) {
    vmOptions.pinia = pinia
  }

  const vm = new DialogConstructor(vmOptions)
  instance.vm = vm
  instance.close = () => {
    if (instance.destroyed) {
      return
    }
    if (vm && typeof vm.closeDialog === 'function') {
      vm.closeDialog()
    }
  }

  dialogInstances.push(instance)
  vm.$mount()
  if (vm.$el) {
    instance.rootEl = vm.$el
    container.appendChild(vm.$el)
  }
  return instance
}

export default NsDialog
