import NsForm from './DynamicForm.vue'
import NsFormTitle from './DynamicFormTitle.vue'
import { registerDirective } from '../../directives'
import { useFileUpload } from './uploadHook'

function installComponent(component) {
  component.install = function install(Vue) {
    Vue.component(component.name, component)
  }
}

installComponent(NsForm)
installComponent(NsFormTitle)

const originalNsFormInstall = NsForm.install
NsForm.install = function install(Vue) {
  registerDirective(Vue)
  originalNsFormInstall(Vue)
}

export function getAllFormKvData(rows) {
  const result = {}
  ;(rows || []).forEach((row) => {
    ;(row || []).forEach((item) => {
      if (item && item.key) {
        result[item.key] = Array.isArray(item.value) && Array.isArray(item.delValue)
          ? item.value.concat(item.delValue)
          : item.value
      }
      ;(item.children || []).forEach((child) => {
        if (child && child.key) {
          result[child.key] = Array.isArray(child.value) && Array.isArray(child.delValue)
            ? child.value.concat(child.delValue)
            : child.value
        }
      })
    })
  })
  return result
}

export function getAllFormNodeByKey(rows, key) {
  for (let rowIndex = 0; rowIndex < (rows || []).length; rowIndex += 1) {
    const row = rows[rowIndex] || []
    for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
      const item = row[colIndex]
      if (item && item.key === key) {
        return item
      }
      const children = (item && item.children) || []
      for (let childIndex = 0; childIndex < children.length; childIndex += 1) {
        if (children[childIndex] && children[childIndex].key === key) {
          return children[childIndex]
        }
      }
    }
  }
  return null
}

export function getAllFormNodeRefByKey(rows, key) {
  const node = getAllFormNodeByKey(rows, key)
  return node ? node.ref || null : null
}

if (typeof globalThis !== 'undefined') {
  globalThis.getAllFormKvData = getAllFormKvData
  globalThis.getAllFormNodeByKey = getAllFormNodeByKey
  globalThis.getAllFormNodeRefByKey = getAllFormNodeRefByKey
}

export { NsForm, NsFormTitle, useFileUpload }
export default NsForm
