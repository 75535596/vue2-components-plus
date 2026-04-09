import './assets/main.css'

import { registerDirective } from './directives'
import { loadCssVars } from './utils/loadCssVars'
import {
  NsForm,
  NsFormTitle,
  useFileUpload,
  getAllFormNodeByKey,
  getAllFormKvData,
  getAllFormNodeRefByKey,
} from './components/NsForm'
import {
  NsTableContainer,
  NsSearch,
  NsTable,
  createPagination,
  createPaginationWithCustomKeys,
  resetPagination,
} from './components/NsTable'
import { NsDialog, setExternalApp, closeAllNsDialog } from './components/NsDialog'

const components = [NsForm, NsFormTitle, NsTableContainer, NsSearch, NsTable]

export function install(Vue, options = {}) {
  if (install.installed) return
  install.installed = true

  registerDirective(Vue)
  components.forEach((component) => {
    if (component && component.name) {
      Vue.component(component.name, component)
    }
  })

  setExternalApp(Vue, options)
  loadCssVars()


  if (Vue && Vue.prototype) {
    Vue.prototype.$NsDialog = NsDialog
    Vue.prototype.$closeAllNsDialog = closeAllNsDialog
  }

  if (typeof window !== 'undefined') {
    window.NsDialog = NsDialog
    window.closeAllNsDialog = closeAllNsDialog
  }
}


export {
  NsForm,
  NsFormTitle,
  NsTableContainer,
  NsSearch,
  NsTable,
  NsDialog,
  closeAllNsDialog,
  setExternalApp,
  useFileUpload,
  getAllFormNodeByKey,
  getAllFormKvData,
  getAllFormNodeRefByKey,
  createPagination,
  createPaginationWithCustomKeys,
  resetPagination,
}

export default {
  install,
  NsForm,
  NsFormTitle,
  NsTableContainer,
  NsSearch,
  NsTable,
  NsDialog,
  closeAllNsDialog,
  setExternalApp,
  useFileUpload,
  getAllFormNodeByKey,
  getAllFormKvData,
  getAllFormNodeRefByKey,
  createPagination,
  createPaginationWithCustomKeys,
  resetPagination,
}
