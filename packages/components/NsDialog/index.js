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
        if (instance.vm) {
          instance.vm.$destroy()
        }
        if (container.parentNode) {
          container.parentNode.removeChild(container)
        }
        removeDialogInstance(instance)
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
    if (vm && typeof vm.closeDialog === 'function') {
      vm.closeDialog()
    }
  }

  dialogInstances.push(instance)
  vm.$mount(container)
  return instance
}

export default NsDialog
