import Vue from 'vue'
import NsDialogComponent from './NsDialog.vue'
import '../../assets/main.css'

const dialogInstances = typeof window !== 'undefined' ? (window.__dialogInstances = window.__dialogInstances || []) : []
let externalVue = Vue
let dialogSeed = 0

export function setExternalApp(app) {
  if (!app) return
  if (app.extend) {
    externalVue = app
    return
  }
  if (app.constructor && app.constructor.extend) {
    externalVue = app.constructor
  }
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

  const id = data.id || `ns-dialog-${Date.now()}-${dialogSeed++}`
  const container = document.createElement('div')
  container.id = id
  mountTarget.appendChild(container)

  const instance = {
    id,
    class: data.class || '',
    element: container,
    vm: null,
    domRef: null,
    updateOption: () => {},
    callMethod: () => {},
    close: () => {},
  }

  const DialogConstructor = (externalVue || Vue).extend(NsDialogComponent)
  const propsData = {
    ...data,
    className: data.class || '',
    modal,
    containerId: id,
    dialogInstance: instance,
    close: () => {
      if (typeof data.close === 'function') {
        data.close()
      }
    },
    closed: () => {
      try {
        if (typeof data.closed === 'function') {
          data.closed()
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

  const vm = new DialogConstructor({ propsData })
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
